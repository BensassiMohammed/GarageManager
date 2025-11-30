package com.garage.management.controller;

import com.garage.management.entity.Expense;
import com.garage.management.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @GetMapping
    public List<Expense> getAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount) {
        
        List<Expense> expenses = expenseRepository.findAll();
        
        if (startDate != null && endDate != null) {
            expenses = expenses.stream()
                    .filter(e -> !e.getDate().isBefore(startDate) && !e.getDate().isAfter(endDate))
                    .collect(Collectors.toList());
        }
        
        if (categoryId != null) {
            expenses = expenses.stream()
                    .filter(e -> e.getExpenseCategory() != null && categoryId.equals(e.getExpenseCategory().getId()))
                    .collect(Collectors.toList());
        }
        
        if (minAmount != null) {
            expenses = expenses.stream()
                    .filter(e -> e.getAmount().compareTo(minAmount) >= 0)
                    .collect(Collectors.toList());
        }
        
        if (maxAmount != null) {
            expenses = expenses.stream()
                    .filter(e -> e.getAmount().compareTo(maxAmount) <= 0)
                    .collect(Collectors.toList());
        }
        
        return expenses;
    }

    @GetMapping("/current-month")
    public List<Expense> getCurrentMonth() {
        YearMonth currentMonth = YearMonth.now();
        LocalDate start = currentMonth.atDay(1);
        LocalDate end = currentMonth.atEndOfMonth();
        return expenseRepository.findByDateBetween(start, end);
    }

    @GetMapping("/total")
    public BigDecimal getTotal(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        BigDecimal total = expenseRepository.getTotalExpensesBetween(startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Expense> getById(@PathVariable Long id) {
        return expenseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Expense create(@RequestBody Expense expense) {
        return expenseRepository.save(expense);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> update(@PathVariable Long id, @RequestBody Expense expense) {
        return expenseRepository.findById(id)
                .map(existing -> {
                    existing.setDate(expense.getDate());
                    existing.setExpenseCategory(expense.getExpenseCategory());
                    existing.setLabel(expense.getLabel());
                    existing.setAmount(expense.getAmount());
                    existing.setPaymentMethod(expense.getPaymentMethod());
                    existing.setNotes(expense.getNotes());
                    return ResponseEntity.ok(expenseRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return expenseRepository.findById(id)
                .map(expense -> {
                    expenseRepository.delete(expense);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
