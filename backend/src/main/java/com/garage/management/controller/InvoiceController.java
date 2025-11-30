package com.garage.management.controller;

import com.garage.management.entity.Invoice;
import com.garage.management.entity.InvoiceLine;
import com.garage.management.enums.InvoiceStatus;
import com.garage.management.repository.InvoiceLineRepository;
import com.garage.management.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceLineRepository invoiceLineRepository;

    @GetMapping
    public List<Invoice> getAll() {
        return invoiceRepository.findAll();
    }

    @GetMapping("/unpaid")
    public List<Invoice> getUnpaid() {
        return invoiceRepository.findByStatusNot(InvoiceStatus.PAID);
    }

    @GetMapping("/outstanding-total")
    public BigDecimal getOutstandingTotal() {
        BigDecimal total = invoiceRepository.getTotalOutstandingAmount();
        return total != null ? total : BigDecimal.ZERO;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getById(@PathVariable Long id) {
        return invoiceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/lines")
    public List<InvoiceLine> getLines(@PathVariable Long id) {
        return invoiceLineRepository.findByInvoiceId(id);
    }

    @PostMapping
    public Invoice create(@RequestBody Invoice invoice) {
        invoice.setRemainingBalance(invoice.getTotalAmount());
        return invoiceRepository.save(invoice);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Invoice> update(@PathVariable Long id, @RequestBody Invoice invoice) {
        return invoiceRepository.findById(id)
                .map(existing -> {
                    if (existing.getStatus() == InvoiceStatus.ISSUED || 
                        existing.getStatus() == InvoiceStatus.PAID) {
                        return ResponseEntity.badRequest().<Invoice>build();
                    }
                    existing.setClient(invoice.getClient());
                    existing.setCompany(invoice.getCompany());
                    existing.setDate(invoice.getDate());
                    existing.setStatus(invoice.getStatus());
                    existing.setTotalAmount(invoice.getTotalAmount());
                    existing.setRemainingBalance(invoice.getTotalAmount());
                    return ResponseEntity.ok(invoiceRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/issue")
    public ResponseEntity<Invoice> issueInvoice(@PathVariable Long id) {
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    if (invoice.getStatus() != InvoiceStatus.DRAFT) {
                        return ResponseEntity.badRequest().<Invoice>build();
                    }
                    invoice.setStatus(InvoiceStatus.ISSUED);
                    invoice.setRemainingBalance(invoice.getTotalAmount());
                    return ResponseEntity.ok(invoiceRepository.save(invoice));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Invoice> cancelInvoice(@PathVariable Long id) {
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    invoice.setStatus(InvoiceStatus.CANCELLED);
                    return ResponseEntity.ok(invoiceRepository.save(invoice));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    if (invoice.getStatus() != InvoiceStatus.DRAFT) {
                        return ResponseEntity.badRequest().<Void>build();
                    }
                    invoiceRepository.delete(invoice);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/lines")
    public ResponseEntity<InvoiceLine> addLine(@PathVariable Long id, @RequestBody InvoiceLine line) {
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    if (invoice.getStatus() != InvoiceStatus.DRAFT) {
                        return ResponseEntity.badRequest().<InvoiceLine>build();
                    }
                    line.setInvoice(invoice);
                    InvoiceLine saved = invoiceLineRepository.save(line);
                    recalculateInvoiceTotal(id);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/lines/{lineId}")
    public ResponseEntity<Void> deleteLine(@PathVariable Long lineId) {
        return invoiceLineRepository.findById(lineId)
                .map(line -> {
                    if (line.getInvoice().getStatus() != InvoiceStatus.DRAFT) {
                        return ResponseEntity.badRequest().<Void>build();
                    }
                    Long invoiceId = line.getInvoice().getId();
                    invoiceLineRepository.delete(line);
                    recalculateInvoiceTotal(invoiceId);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private void recalculateInvoiceTotal(Long invoiceId) {
        invoiceRepository.findById(invoiceId).ifPresent(invoice -> {
            List<InvoiceLine> lines = invoiceLineRepository.findByInvoiceId(invoiceId);
            BigDecimal total = lines.stream()
                    .map(InvoiceLine::getLineTotal)
                    .filter(t -> t != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            invoice.setTotalAmount(total);
            invoice.setRemainingBalance(total);
            invoiceRepository.save(invoice);
        });
    }
}
