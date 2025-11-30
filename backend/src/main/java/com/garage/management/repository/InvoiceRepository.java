package com.garage.management.repository;

import com.garage.management.entity.Invoice;
import com.garage.management.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByClientId(Long clientId);
    List<Invoice> findByCompanyId(Long companyId);
    List<Invoice> findByStatus(InvoiceStatus status);
    List<Invoice> findByStatusNot(InvoiceStatus status);
    
    List<Invoice> findByClientIdAndStatusNotOrderByDateAsc(Long clientId, InvoiceStatus status);
    List<Invoice> findByCompanyIdAndStatusNotOrderByDateAsc(Long companyId, InvoiceStatus status);
    
    @Query("SELECT SUM(i.remainingBalance) FROM Invoice i WHERE i.status != 'PAID' AND i.status != 'CANCELLED'")
    BigDecimal getTotalOutstandingAmount();
    
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status != 'PAID' AND i.status != 'CANCELLED' AND i.remainingBalance > 0")
    Long countUnpaidInvoices();
}
