package com.garage.management.controller;

import com.garage.management.entity.Company;
import com.garage.management.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    @Autowired
    private CompanyRepository companyRepository;

    @GetMapping
    public List<Company> getAll() {
        return companyRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getById(@PathVariable Long id) {
        return companyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Company create(@RequestBody Company company) {
        return companyRepository.save(company);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Company> update(@PathVariable Long id, @RequestBody Company company) {
        return companyRepository.findById(id)
                .map(existing -> {
                    existing.setName(company.getName());
                    existing.setAddress(company.getAddress());
                    existing.setPhone(company.getPhone());
                    existing.setEmail(company.getEmail());
                    existing.setNotes(company.getNotes());
                    existing.setActive(company.getActive());
                    return ResponseEntity.ok(companyRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return companyRepository.findById(id)
                .map(company -> {
                    company.setActive(false);
                    companyRepository.save(company);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
