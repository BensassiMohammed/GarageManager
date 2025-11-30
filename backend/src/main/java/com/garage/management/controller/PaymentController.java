package com.garage.management.controller;

import com.garage.management.entity.Invoice;
import com.garage.management.entity.Payment;
import com.garage.management.entity.PaymentAllocation;
import com.garage.management.enums.PayerType;
import com.garage.management.enums.PaymentMethod;
import com.garage.management.repository.PaymentAllocationRepository;
import com.garage.management.repository.PaymentRepository;
import com.garage.management.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PaymentAllocationRepository paymentAllocationRepository;

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public List<Payment> getAll() {
        return paymentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getById(@PathVariable Long id) {
        return paymentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/allocations")
    public List<PaymentAllocation> getAllocations(@PathVariable Long id) {
        return paymentAllocationRepository.findByPaymentId(id);
    }

    @GetMapping("/unpaid-invoices")
    public List<Invoice> getUnpaidInvoices(@RequestParam PayerType payerType, @RequestParam Long payerId) {
        return paymentService.getUnpaidInvoicesForPayer(payerType, payerId);
    }

    @PostMapping
    public Payment create(@RequestBody Payment payment) {
        return paymentRepository.save(payment);
    }

    @PostMapping("/apply")
    public ResponseEntity<Payment> applyPayment(@RequestBody ApplyPaymentRequest request) {
        try {
            Payment payment = paymentService.applyPayment(
                request.payerType,
                request.payerId,
                request.totalAmount,
                request.method,
                request.date,
                request.notes,
                request.allocations
            );
            return ResponseEntity.ok(payment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Payment> update(@PathVariable Long id, @RequestBody Payment payment) {
        return paymentRepository.findById(id)
                .map(existing -> {
                    existing.setPayerType(payment.getPayerType());
                    existing.setPayerId(payment.getPayerId());
                    existing.setDate(payment.getDate());
                    existing.setMethod(payment.getMethod());
                    existing.setTotalAmount(payment.getTotalAmount());
                    existing.setNotes(payment.getNotes());
                    return ResponseEntity.ok(paymentRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return paymentRepository.findById(id)
                .map(payment -> {
                    paymentRepository.delete(payment);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/allocations")
    public PaymentAllocation addAllocation(@PathVariable Long id, @RequestBody PaymentAllocation allocation) {
        return paymentRepository.findById(id)
                .map(payment -> {
                    allocation.setPayment(payment);
                    return paymentAllocationRepository.save(allocation);
                })
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    @DeleteMapping("/allocations/{allocationId}")
    public ResponseEntity<Void> deleteAllocation(@PathVariable Long allocationId) {
        return paymentAllocationRepository.findById(allocationId)
                .map(allocation -> {
                    paymentAllocationRepository.delete(allocation);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    public static class ApplyPaymentRequest {
        public PayerType payerType;
        public Long payerId;
        public BigDecimal totalAmount;
        public PaymentMethod method;
        public LocalDate date;
        public String notes;
        public List<PaymentService.AllocationRequest> allocations;
    }
}
