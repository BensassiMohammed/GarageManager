package com.garage.management.exception;

import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.jpa.JpaSystemException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.persistence.PersistenceException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        String message = extractConstraintMessage(getFullExceptionMessage(ex));
        return buildErrorResponse(HttpStatus.CONFLICT, message);
    }

    @ExceptionHandler(JpaSystemException.class)
    public ResponseEntity<Map<String, Object>> handleJpaSystemException(JpaSystemException ex) {
        String message = extractConstraintMessage(getFullExceptionMessage(ex));
        return buildErrorResponse(HttpStatus.CONFLICT, message);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(ConstraintViolationException ex) {
        String message = extractConstraintMessage(getFullExceptionMessage(ex));
        return buildErrorResponse(HttpStatus.CONFLICT, message);
    }

    @ExceptionHandler(PersistenceException.class)
    public ResponseEntity<Map<String, Object>> handlePersistenceException(PersistenceException ex) {
        String fullMessage = getFullExceptionMessage(ex);
        if (fullMessage.contains("UNIQUE constraint failed") || fullMessage.contains("FOREIGN KEY constraint failed")) {
            String message = extractConstraintMessage(fullMessage);
            return buildErrorResponse(HttpStatus.CONFLICT, message);
        }
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "DATABASE_ERROR");
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<Map<String, Object>> handleDataAccessException(DataAccessException ex) {
        String fullMessage = getFullExceptionMessage(ex);
        if (fullMessage.contains("UNIQUE constraint failed") || fullMessage.contains("FOREIGN KEY constraint failed")) {
            String message = extractConstraintMessage(fullMessage);
            return buildErrorResponse(HttpStatus.CONFLICT, message);
        }
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "DATABASE_ERROR");
    }

    private String getFullExceptionMessage(Throwable ex) {
        StringBuilder sb = new StringBuilder();
        Throwable current = ex;
        while (current != null) {
            if (current.getMessage() != null) {
                sb.append(current.getMessage()).append(" ");
            }
            current = current.getCause();
        }
        return sb.toString();
    }

    private String extractConstraintMessage(String exceptionMessage) {
        if (exceptionMessage == null) {
            return "DATABASE_CONSTRAINT_VIOLATION";
        }
        
        if (exceptionMessage.contains("UNIQUE constraint failed: products.code")) {
            return "UNIQUE_PRODUCT_CODE";
        } else if (exceptionMessage.contains("UNIQUE constraint failed: products.barcode")) {
            return "UNIQUE_PRODUCT_BARCODE";
        } else if (exceptionMessage.contains("UNIQUE constraint failed: categories.name")) {
            return "UNIQUE_CATEGORY_NAME";
        } else if (exceptionMessage.contains("UNIQUE constraint failed: services.code")) {
            return "UNIQUE_SERVICE_CODE";
        } else if (exceptionMessage.contains("UNIQUE constraint failed: suppliers.code")) {
            return "UNIQUE_SUPPLIER_CODE";
        } else if (exceptionMessage.contains("UNIQUE constraint failed: companies.ice")) {
            return "UNIQUE_COMPANY_ICE";
        } else if (exceptionMessage.contains("UNIQUE constraint failed: vehicles.registration_number")) {
            return "UNIQUE_VEHICLE_REGISTRATION";
        } else if (exceptionMessage.contains("UNIQUE constraint failed: users.username")) {
            return "UNIQUE_USERNAME";
        } else if (exceptionMessage.contains("UNIQUE constraint failed")) {
            return "UNIQUE_CONSTRAINT_VIOLATION";
        } else if (exceptionMessage.contains("FOREIGN KEY constraint failed")) {
            return "FOREIGN_KEY_VIOLATION";
        }
        
        return "DATABASE_CONSTRAINT_VIOLATION";
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("timestamp", LocalDateTime.now().toString());
        error.put("status", status.value());
        error.put("error", status.getReasonPhrase());
        error.put("message", message);
        return new ResponseEntity<>(error, status);
    }
}
