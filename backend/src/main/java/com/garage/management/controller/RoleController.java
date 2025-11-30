package com.garage.management.controller;

import com.garage.management.entity.Role;
import com.garage.management.entity.ModulePermission;
import com.garage.management.repository.RoleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/roles")
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {

    private final RoleRepository roleRepository;

    public RoleController(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @GetMapping
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::toRoleResponse)
                .collect(Collectors.toList());
    }

    private RoleResponse toRoleResponse(Role role) {
        RoleResponse response = new RoleResponse();
        response.setId(role.getId());
        response.setName(role.getName());
        response.setDescription(role.getDescription());
        response.setAllowedModules(
            role.getAllowedModules().stream()
                .map(ModulePermission::getCode)
                .collect(Collectors.toList())
        );
        return response;
    }

    public static class RoleResponse {
        private Long id;
        private String name;
        private String description;
        private List<String> allowedModules;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public List<String> getAllowedModules() { return allowedModules; }
        public void setAllowedModules(List<String> allowedModules) { this.allowedModules = allowedModules; }
    }
}
