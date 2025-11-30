package com.garage.management.repository;

import com.garage.management.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByActiveTrue();
    Long countByActiveTrue();
}
