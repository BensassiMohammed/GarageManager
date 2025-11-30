package com.garage.management.repository;

import com.garage.management.entity.Invoice;
import com.garage.management.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByClientId(Long clientId);
    List<Invoice> findByCompanyId(Long companyId);
    List<Invoice> findByStatus(InvoiceStatus status);
}
