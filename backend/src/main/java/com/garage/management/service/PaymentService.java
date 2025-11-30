package com.garage.management.service;

import com.garage.management.entity.Invoice;
import com.garage.management.entity.Payment;
import com.garage.management.entity.PaymentAllocation;
import com.garage.management.enums.InvoiceStatus;
import com.garage.management.enums.PayerType;
import com.garage.management.enums.PaymentMethod;
import com.garage.management.repository.InvoiceRepository;
import com.garage.management.repository.PaymentAllocationRepository;
import com.garage.management.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final PaymentAllocationRepository allocationRepository;
    private final InvoiceRepository invoiceRepository;
    
    public PaymentService(PaymentRepository paymentRepository,
                          PaymentAllocationRepository allocationRepository,
                          InvoiceRepository invoiceRepository) {
        this.paymentRepository = paymentRepository;
        this.allocationRepository = allocationRepository;
        this.invoiceRepository = invoiceRepository;
    }
    
    public List<Invoice> getUnpaidInvoicesForPayer(PayerType payerType, Long payerId) {
        if (payerType == PayerType.CLIENT) {
            return invoiceRepository.findByClientIdAndStatusNotOrderByDateAsc(payerId, InvoiceStatus.PAID);
        } else {
            return invoiceRepository.findByCompanyIdAndStatusNotOrderByDateAsc(payerId, InvoiceStatus.PAID);
        }
    }
    
    @Transactional
    public Payment applyPayment(PayerType payerType, Long payerId, BigDecimal totalAmount,
                                PaymentMethod method, LocalDate date, String notes,
                                List<AllocationRequest> manualAllocations) {
        Payment payment = new Payment();
        payment.setPayerType(payerType);
        payment.setPayerId(payerId);
        payment.setTotalAmount(totalAmount);
        payment.setMethod(method);
        payment.setDate(date != null ? date : LocalDate.now());
        payment.setNotes(notes);
        
        Payment savedPayment = paymentRepository.save(payment);
        
        List<PaymentAllocation> allocations = new ArrayList<>();
        
        if (manualAllocations != null && !manualAllocations.isEmpty()) {
            for (AllocationRequest req : manualAllocations) {
                Invoice invoice = invoiceRepository.findById(req.invoiceId)
                        .orElseThrow(() -> new RuntimeException("Invoice not found: " + req.invoiceId));
                
                PaymentAllocation allocation = new PaymentAllocation();
                allocation.setPayment(savedPayment);
                allocation.setInvoice(invoice);
                allocation.setAllocatedAmount(req.amount);
                allocations.add(allocationRepository.save(allocation));
                
                updateInvoiceStatus(invoice);
            }
        } else {
            List<Invoice> unpaidInvoices = getUnpaidInvoicesForPayer(payerType, payerId);
            BigDecimal remainingAmount = totalAmount;
            
            for (Invoice invoice : unpaidInvoices) {
                if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
                    break;
                }
                
                BigDecimal remainingBalance = getRemainingBalance(invoice);
                if (remainingBalance.compareTo(BigDecimal.ZERO) <= 0) {
                    continue;
                }
                
                BigDecimal allocationAmount = remainingAmount.min(remainingBalance);
                
                PaymentAllocation allocation = new PaymentAllocation();
                allocation.setPayment(savedPayment);
                allocation.setInvoice(invoice);
                allocation.setAllocatedAmount(allocationAmount);
                allocations.add(allocationRepository.save(allocation));
                
                remainingAmount = remainingAmount.subtract(allocationAmount);
                
                updateInvoiceStatus(invoice);
            }
        }
        
        return savedPayment;
    }
    
    public BigDecimal getRemainingBalance(Invoice invoice) {
        BigDecimal totalPaid = allocationRepository.findByInvoiceId(invoice.getId())
                .stream()
                .map(PaymentAllocation::getAllocatedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return invoice.getTotalAmount().subtract(totalPaid);
    }
    
    private void updateInvoiceStatus(Invoice invoice) {
        BigDecimal remaining = getRemainingBalance(invoice);
        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
            invoiceRepository.save(invoice);
        } else if (invoice.getStatus() != InvoiceStatus.ISSUED) {
            invoice.setStatus(InvoiceStatus.ISSUED);
            invoiceRepository.save(invoice);
        }
    }
    
    public static class AllocationRequest {
        public Long invoiceId;
        public BigDecimal amount;
        
        public AllocationRequest() {}
        
        public AllocationRequest(Long invoiceId, BigDecimal amount) {
            this.invoiceId = invoiceId;
            this.amount = amount;
        }
    }
}
