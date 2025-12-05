package com.garage.management.migration;

import java.sql.*;
import java.util.*;

/**
 * =============================================================================
 * SQLite to PostgreSQL Data Migration Utility
 * =============================================================================
 * 
 * This is a one-time migration tool to copy data from an existing SQLite 
 * database to a PostgreSQL database.
 * 
 * PREREQUISITES:
 * 1. PostgreSQL database must exist and be accessible
 * 2. Flyway migration V1__baseline_schema.sql must be applied first
 *    (run the Spring Boot app once to create the schema)
 * 3. PostgreSQL tables should be EMPTY before running this migration
 *    (or truncate them first)
 * 4. SQLite database file must exist at the specified path
 * 
 * HOW TO RUN IN REPLIT:
 * 1. Stop the Spring Boot Backend workflow
 * 2. From the backend directory, run:
 *    cd backend && ./mvnw compile exec:java \
 *      -Dexec.mainClass="com.garage.management.migration.SQLiteToPostgresMigrator"
 * 
 * Or use the shell command:
 *    cd backend && ./mvnw compile exec:java -Dexec.mainClass="com.garage.management.migration.SQLiteToPostgresMigrator"
 * 
 * ENVIRONMENT VARIABLES REQUIRED:
 * - PGHOST: PostgreSQL host
 * - PGPORT: PostgreSQL port (default: 5432)
 * - PGDATABASE: PostgreSQL database name
 * - PGUSER: PostgreSQL username
 * - PGPASSWORD: PostgreSQL password
 * 
 * WARNING: This tool is intended to be run ONLY ONCE on an empty PostgreSQL DB.
 *          Running it multiple times may cause duplicate data or constraint violations.
 * =============================================================================
 */
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

            for (String table : MIGRATION_ORDER) {
                int count = migrateTable(sqliteConn, pgConn, table);
                migrationStats.put(table, count);
                totalMigrated += count;
            }

            System.out.println("\n" + "-".repeat(70));
            System.out.println("Updating PostgreSQL sequences...");
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

        List<String> columns = getTableColumns(sqliteConn, tableName);
        if (columns.isEmpty()) {
            System.out.println("  No columns found or table doesn't exist in SQLite. Skipping.");
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

            ResultSetMetaData metaData = rs.getMetaData();
            int columnCount = metaData.getColumnCount();

            while (rs.next()) {
                for (int i = 1; i <= columnCount; i++) {
                    Object value = rs.getObject(i);
                    
                    if (value instanceof Integer && isBooleanColumn(tableName, columns.get(i - 1))) {
                        insertStmt.setBoolean(i, ((Integer) value) == 1);
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

    private static boolean isBooleanColumn(String tableName, String columnName) {
        Set<String> booleanColumns = Set.of(
            "active", "must_change_password"
        );
        return booleanColumns.contains(columnName.toLowerCase());
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
}
