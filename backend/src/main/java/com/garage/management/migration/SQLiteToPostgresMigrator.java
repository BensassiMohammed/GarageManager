package com.garage.management.migration;

import java.sql.*;
import java.util.*;

public class SQLiteToPostgresMigrator {

    private static final String SQLITE_DB_PATH = "garage.db";

    private static final String[] MIGRATION_ORDER = {
        "module_permissions",
        "roles",
        "role_modules",
        "app_users",
        "user_roles",
        "companies",
        "clients",
        "vehicles",
        "categories",
        "products",
        "services",
        "suppliers",
        "product_price_history",
        "product_buying_price_history",
        "service_price_history",
        "stock_movements",
        "supplier_orders",
        "supplier_order_lines",
        "work_orders",
        "work_order_service_lines",
        "work_order_product_lines",
        "invoices",
        "invoice_lines",
        "payments",
        "payment_allocations",
        "expense_categories",
        "expenses"
    };

    private static final String[] TABLES_WITH_SEQUENCES = {
        "module_permissions", "roles", "app_users", "companies", "clients",
        "vehicles", "categories", "products", "services", "suppliers",
        "product_price_history", "product_buying_price_history", "service_price_history",
        "stock_movements", "supplier_orders", "supplier_order_lines",
        "work_orders", "work_order_service_lines", "work_order_product_lines",
        "invoices", "invoice_lines", "payments", "payment_allocations",
        "expense_categories", "expenses"
    };

    private static final Set<String> TIMESTAMP_COLUMNS = Set.of(
        "created_at", "updated_at", "effective_date", "order_date", "expected_delivery_date",
        "received_date", "invoice_date", "due_date", "paid_date", "payment_date",
        "expense_date", "movement_date", "expiration_date", "start_date", "end_date", "date"
    );

    private static final Set<String> BOOLEAN_COLUMNS = Set.of(
        "active", "must_change_password"
    );

    private static final Set<String> DATE_ONLY_COLUMNS = Set.of(
        "order_date", "expected_delivery_date", "received_date", "invoice_date", 
        "due_date", "paid_date", "payment_date", "expense_date", "effective_date",
        "expiration_date", "start_date", "end_date"
    );

    private static Map<String, Map<String, String>> pgColumnTypes = new HashMap<>();

    public static void main(String[] args) {
        System.out.println("=".repeat(70));
        System.out.println("SQLite to PostgreSQL Data Migration Tool");
        System.out.println("=".repeat(70));

        String sqliteUrl = "jdbc:sqlite:" + SQLITE_DB_PATH;
        String pgHost = System.getenv("PGHOST");
        String pgPort = System.getenv("PGPORT");
        String pgDatabase = System.getenv("PGDATABASE");
        String pgUser = System.getenv("PGUSER");
        String pgPassword = System.getenv("PGPASSWORD");

        if (pgHost == null || pgDatabase == null || pgUser == null || pgPassword == null) {
            System.err.println("ERROR: PostgreSQL environment variables not set.");
            System.err.println("Required: PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD");
            System.exit(1);
        }

        String pgUrl = String.format("jdbc:postgresql://%s:%s/%s", 
            pgHost, pgPort != null ? pgPort : "5432", pgDatabase);

        System.out.println("SQLite DB: " + SQLITE_DB_PATH);
        System.out.println("PostgreSQL: " + pgUrl);
        System.out.println("-".repeat(70));

        try {
            Class.forName("org.sqlite.JDBC");
            Class.forName("org.postgresql.Driver");
        } catch (ClassNotFoundException e) {
            System.err.println("ERROR: JDBC driver not found: " + e.getMessage());
            System.exit(1);
        }

        try (Connection sqliteConn = DriverManager.getConnection(sqliteUrl);
             Connection pgConn = DriverManager.getConnection(pgUrl, pgUser, pgPassword)) {

            pgConn.setAutoCommit(false);

            System.out.println("\nChecking if PostgreSQL tables are empty...");
            if (!areTablesEmpty(pgConn)) {
                System.out.println("\nWARNING: Some PostgreSQL tables contain data.");
                System.out.println("This migration tool is designed to run on an empty database.");
                System.out.println("Proceeding will attempt to INSERT data, which may fail due to");
                System.out.println("duplicate keys or constraint violations.");
                System.out.println("\nTo proceed anyway, pass --force as an argument.");
                
                if (args.length == 0 || !args[0].equals("--force")) {
                    System.out.println("\nAborting migration. Use --force to override.");
                    System.exit(1);
                }
                System.out.println("\n--force flag detected. Proceeding with migration...");
            }

            int totalMigrated = 0;
            Map<String, Integer> migrationStats = new LinkedHashMap<>();

            System.out.println("\nDisabling foreign key constraints...");
            try (Statement stmt = pgConn.createStatement()) {
                stmt.execute("SET session_replication_role = 'replica'");
            }

            for (String table : MIGRATION_ORDER) {
                int count = migrateTable(sqliteConn, pgConn, table);
                migrationStats.put(table, count);
                totalMigrated += count;
            }

            System.out.println("\n" + "-".repeat(70));
            System.out.println("Re-enabling foreign key constraints...");
            try (Statement stmt = pgConn.createStatement()) {
                stmt.execute("SET session_replication_role = 'origin'");
            }

            System.out.println("Cleaning up orphaned records...");
            cleanupOrphanedRecords(pgConn);

            System.out.println("\nUpdating PostgreSQL sequences...");
            updateSequences(pgConn);

            pgConn.commit();

            System.out.println("\n" + "=".repeat(70));
            System.out.println("MIGRATION COMPLETED SUCCESSFULLY");
            System.out.println("=".repeat(70));
            System.out.println("\nMigration Statistics:");
            System.out.println("-".repeat(40));
            for (Map.Entry<String, Integer> entry : migrationStats.entrySet()) {
                System.out.printf("  %-35s: %d rows%n", entry.getKey(), entry.getValue());
            }
            System.out.println("-".repeat(40));
            System.out.printf("  %-35s: %d rows%n", "TOTAL", totalMigrated);

        } catch (SQLException e) {
            System.err.println("\nERROR: Migration failed!");
            System.err.println("SQL State: " + e.getSQLState());
            System.err.println("Error Code: " + e.getErrorCode());
            System.err.println("Message: " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }

    private static boolean areTablesEmpty(Connection pgConn) throws SQLException {
        for (String table : MIGRATION_ORDER) {
            String sql = "SELECT COUNT(*) FROM " + table;
            try (Statement stmt = pgConn.createStatement();
                 ResultSet rs = stmt.executeQuery(sql)) {
                if (rs.next() && rs.getInt(1) > 0) {
                    System.out.println("  Table '" + table + "' has " + rs.getInt(1) + " rows");
                    return false;
                }
            }
        }
        return true;
    }

    private static int migrateTable(Connection sqliteConn, Connection pgConn, String tableName) 
            throws SQLException {
        System.out.println("\nMigrating table: " + tableName);

        List<String> sqliteColumns = getTableColumns(sqliteConn, tableName);
        if (sqliteColumns.isEmpty()) {
            System.out.println("  No columns found or table doesn't exist in SQLite. Skipping.");
            return 0;
        }

        Set<String> pgColumns = getPgTableColumns(pgConn, tableName);
        List<String> columns = new ArrayList<>();
        for (String col : sqliteColumns) {
            if (pgColumns.contains(col.toLowerCase())) {
                columns.add(col);
            } else {
                System.out.println("  Skipping column '" + col + "' (not in PostgreSQL schema)");
            }
        }

        if (columns.isEmpty()) {
            System.out.println("  No matching columns found. Skipping.");
            return 0;
        }

        String columnList = String.join(", ", columns);
        String placeholders = String.join(", ", Collections.nCopies(columns.size(), "?"));

        String selectSql = "SELECT " + columnList + " FROM " + tableName;
        String insertSql = "INSERT INTO " + tableName + " (" + columnList + ") VALUES (" + placeholders + ")";

        int count = 0;
        try (Statement selectStmt = sqliteConn.createStatement();
             ResultSet rs = selectStmt.executeQuery(selectSql);
             PreparedStatement insertStmt = pgConn.prepareStatement(insertSql)) {

            int columnCount = columns.size();

            while (rs.next()) {
                for (int i = 1; i <= columnCount; i++) {
                    String colName = columns.get(i - 1).toLowerCase();
                    Object value = rs.getObject(i);
                    
                    if (value == null) {
                        insertStmt.setNull(i, Types.NULL);
                    } else if (isTimestampColumn(colName)) {
                        long epochMillis = rs.getLong(i);
                        if (epochMillis > 0) {
                            Timestamp ts = new Timestamp(epochMillis);
                            if (isDateOnlyColumn(colName)) {
                                insertStmt.setDate(i, new java.sql.Date(epochMillis));
                            } else {
                                insertStmt.setTimestamp(i, ts);
                            }
                        } else {
                            insertStmt.setNull(i, Types.TIMESTAMP);
                        }
                    } else if (isBooleanColumn(colName)) {
                        if (value instanceof Number) {
                            insertStmt.setBoolean(i, ((Number) value).intValue() == 1);
                        } else if (value instanceof String) {
                            String strVal = ((String) value).toLowerCase();
                            insertStmt.setBoolean(i, strVal.equals("true") || strVal.equals("1"));
                        } else if (value instanceof Boolean) {
                            insertStmt.setBoolean(i, (Boolean) value);
                        } else {
                            insertStmt.setBoolean(i, false);
                        }
                    } else {
                        insertStmt.setObject(i, value);
                    }
                }
                insertStmt.addBatch();
                count++;

                if (count % 100 == 0) {
                    insertStmt.executeBatch();
                }
            }

            if (count % 100 != 0) {
                insertStmt.executeBatch();
            }
        }

        System.out.println("  Migrated " + count + " rows");
        return count;
    }

    private static List<String> getTableColumns(Connection conn, String tableName) throws SQLException {
        List<String> columns = new ArrayList<>();
        String sql = "PRAGMA table_info(" + tableName + ")";
        
        try (Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(sql)) {
            while (rs.next()) {
                columns.add(rs.getString("name"));
            }
        }
        return columns;
    }

    private static Set<String> getPgTableColumns(Connection pgConn, String tableName) throws SQLException {
        Set<String> columns = new HashSet<>();
        String sql = "SELECT column_name FROM information_schema.columns WHERE table_name = ? AND table_schema = 'public'";
        
        try (PreparedStatement stmt = pgConn.prepareStatement(sql)) {
            stmt.setString(1, tableName);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    columns.add(rs.getString("column_name").toLowerCase());
                }
            }
        }
        return columns;
    }

    private static boolean isTimestampColumn(String columnName) {
        return TIMESTAMP_COLUMNS.contains(columnName.toLowerCase());
    }

    private static boolean isBooleanColumn(String columnName) {
        return BOOLEAN_COLUMNS.contains(columnName.toLowerCase());
    }

    private static boolean isDateOnlyColumn(String columnName) {
        return DATE_ONLY_COLUMNS.contains(columnName.toLowerCase());
    }

    private static void updateSequences(Connection pgConn) throws SQLException {
        for (String table : TABLES_WITH_SEQUENCES) {
            String sequenceName = table + "_id_seq";
            String sql = String.format(
                "SELECT setval('%s', COALESCE((SELECT MAX(id) FROM %s), 0) + 1, false)",
                sequenceName, table
            );
            
            try (Statement stmt = pgConn.createStatement()) {
                stmt.execute(sql);
                System.out.println("  Updated sequence: " + sequenceName);
            } catch (SQLException e) {
                System.out.println("  Note: Sequence " + sequenceName + " not found (table may be empty or use different PK)");
            }
        }
    }

    private static void cleanupOrphanedRecords(Connection pgConn) throws SQLException {
        String[][] orphanCleanups = {
            {"work_order_service_lines", "work_order_id", "work_orders", "id"},
            {"work_order_product_lines", "work_order_id", "work_orders", "id"},
            {"invoice_lines", "invoice_id", "invoices", "id"},
            {"payment_allocations", "payment_id", "payments", "id"},
            {"payment_allocations", "invoice_id", "invoices", "id"},
            {"stock_movements", "product_id", "products", "id"},
            {"product_price_history", "product_id", "products", "id"},
            {"product_buying_price_history", "product_id", "products", "id"},
            {"service_price_history", "service_id", "services", "id"},
        };

        for (String[] cleanup : orphanCleanups) {
            String childTable = cleanup[0];
            String fkColumn = cleanup[1];
            String parentTable = cleanup[2];
            String pkColumn = cleanup[3];

            try {
                String checkSql = String.format(
                    "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = '%s' AND column_name = '%s'",
                    childTable, fkColumn
                );
                try (Statement checkStmt = pgConn.createStatement();
                     ResultSet rs = checkStmt.executeQuery(checkSql)) {
                    if (rs.next() && rs.getInt(1) == 0) {
                        continue;
                    }
                }

                String deleteSql = String.format(
                    "DELETE FROM %s WHERE %s IS NOT NULL AND %s NOT IN (SELECT %s FROM %s)",
                    childTable, fkColumn, fkColumn, pkColumn, parentTable
                );

                try (Statement stmt = pgConn.createStatement()) {
                    int deleted = stmt.executeUpdate(deleteSql);
                    if (deleted > 0) {
                        System.out.println("  Cleaned up " + deleted + " orphaned records from " + childTable);
                    }
                }
            } catch (SQLException e) {
                System.out.println("  Note: Could not clean " + childTable + ": " + e.getMessage());
            }
        }
    }
}
