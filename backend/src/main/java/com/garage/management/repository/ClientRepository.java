package com.garage.management.repository;

import com.garage.management.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    List<Client> findByActiveTrue();
    Long countByActiveTrue();
    List<Client> findByCompanyId(Long companyId);
}
