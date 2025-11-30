package com.garage.management.repository;

import com.garage.management.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByExpenseCategoryId(Long categoryId);
    List<Expense> findByDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.date BETWEEN :startDate AND :endDate")
    BigDecimal getTotalExpensesBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    List<Expense> findByDateBetweenAndExpenseCategoryId(LocalDate startDate, LocalDate endDate, Long categoryId);
    
    @Query("SELECT e FROM Expense e WHERE e.amount >= :minAmount AND e.amount <= :maxAmount")
    List<Expense> findByAmountBetween(@Param("minAmount") BigDecimal minAmount, @Param("maxAmount") BigDecimal maxAmount);
}
