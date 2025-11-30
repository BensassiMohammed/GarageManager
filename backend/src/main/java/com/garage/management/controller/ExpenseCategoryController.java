package com.garage.management.controller;

import com.garage.management.entity.ExpenseCategory;
import com.garage.management.repository.ExpenseCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expense-categories")
public class ExpenseCategoryController {

    @Autowired
    private ExpenseCategoryRepository expenseCategoryRepository;

    @GetMapping
    public List<ExpenseCategory> getAll() {
        return expenseCategoryRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseCategory> getById(@PathVariable Long id) {
        return expenseCategoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ExpenseCategory create(@RequestBody ExpenseCategory category) {
        return expenseCategoryRepository.save(category);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseCategory> update(@PathVariable Long id, @RequestBody ExpenseCategory category) {
        return expenseCategoryRepository.findById(id)
                .map(existing -> {
                    existing.setName(category.getName());
                    existing.setDescription(category.getDescription());
                    existing.setActive(category.getActive());
                    return ResponseEntity.ok(expenseCategoryRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return expenseCategoryRepository.findById(id)
                .map(category -> {
                    category.setActive(false);
                    expenseCategoryRepository.save(category);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
