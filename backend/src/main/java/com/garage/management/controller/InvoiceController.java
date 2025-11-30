package com.garage.management.controller;

import com.garage.management.entity.Invoice;
import com.garage.management.entity.InvoiceLine;
import com.garage.management.repository.InvoiceLineRepository;
import com.garage.management.repository.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoiceLineRepository invoiceLineRepository;

    @GetMapping
    public List<Invoice> getAll() {
        return invoiceRepository.findAll();
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
        return invoiceRepository.save(invoice);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Invoice> update(@PathVariable Long id, @RequestBody Invoice invoice) {
        return invoiceRepository.findById(id)
                .map(existing -> {
                    existing.setClient(invoice.getClient());
                    existing.setCompany(invoice.getCompany());
                    existing.setDate(invoice.getDate());
                    existing.setStatus(invoice.getStatus());
                    existing.setTotalAmount(invoice.getTotalAmount());
                    return ResponseEntity.ok(invoiceRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    invoiceRepository.delete(invoice);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/lines")
    public InvoiceLine addLine(@PathVariable Long id, @RequestBody InvoiceLine line) {
        return invoiceRepository.findById(id)
                .map(invoice -> {
                    line.setInvoice(invoice);
                    return invoiceLineRepository.save(line);
                })
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
    }

    @DeleteMapping("/lines/{lineId}")
    public ResponseEntity<Void> deleteLine(@PathVariable Long lineId) {
        return invoiceLineRepository.findById(lineId)
                .map(line -> {
                    invoiceLineRepository.delete(line);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
