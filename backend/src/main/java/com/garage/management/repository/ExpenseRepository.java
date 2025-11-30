package com.garage.management.repository;

import com.garage.management.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByExpenseCategoryId(Long categoryId);
    List<Expense> findByDateBetween(LocalDate startDate, LocalDate endDate);
}
