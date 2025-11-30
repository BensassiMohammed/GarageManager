package com.garage.management.config;

import com.garage.management.entity.AppUser;
import com.garage.management.entity.ModulePermission;
import com.garage.management.entity.Role;
import com.garage.management.repository.AppUserRepository;
import com.garage.management.repository.ModulePermissionRepository;
import com.garage.management.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ModulePermissionRepository moduleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(AppUserRepository userRepository, RoleRepository roleRepository,
                          ModulePermissionRepository moduleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.moduleRepository = moduleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        initializeModules();
        initializeRoles();
        initializeDefaultAdmin();
    }

    private void initializeModules() {
        createModuleIfNotExists("dashboard", "Dashboard", "Main dashboard with KPIs");
        createModuleIfNotExists("customers", "Customers", "Companies, clients, and vehicles");
        createModuleIfNotExists("inventory", "Inventory", "Products, services, categories, and suppliers");
        createModuleIfNotExists("operations", "Operations", "Work orders, supplier orders, and stock management");
        createModuleIfNotExists("finance", "Finance", "Invoices, payments, and expenses");
        createModuleIfNotExists("users", "User Management", "User and role administration");
    }

    private void createModuleIfNotExists(String code, String name, String description) {
        if (moduleRepository.findByCode(code).isEmpty()) {
            ModulePermission module = new ModulePermission();
            module.setCode(code);
            module.setName(name);
            module.setDescription(description);
            moduleRepository.save(module);
        }
    }

    private void initializeRoles() {
        if (roleRepository.findByName("ADMIN").isEmpty()) {
            Set<ModulePermission> allModules = new HashSet<>(moduleRepository.findAll());
            Role adminRole = new Role();
            adminRole.setName("ADMIN");
            adminRole.setDescription("Administrator with full access");
            adminRole.setAllowedModules(allModules);
            roleRepository.save(adminRole);
        }

        if (roleRepository.findByName("MANAGER").isEmpty()) {
            Set<ModulePermission> managerModules = new HashSet<>();
            moduleRepository.findByCode("dashboard").ifPresent(managerModules::add);
            moduleRepository.findByCode("customers").ifPresent(managerModules::add);
            moduleRepository.findByCode("inventory").ifPresent(managerModules::add);
            moduleRepository.findByCode("operations").ifPresent(managerModules::add);
            moduleRepository.findByCode("finance").ifPresent(managerModules::add);
            
            Role managerRole = new Role();
            managerRole.setName("MANAGER");
            managerRole.setDescription("Manager with access to business operations");
            managerRole.setAllowedModules(managerModules);
            roleRepository.save(managerRole);
        }

        if (roleRepository.findByName("STAFF").isEmpty()) {
            Set<ModulePermission> staffModules = new HashSet<>();
            moduleRepository.findByCode("dashboard").ifPresent(staffModules::add);
            moduleRepository.findByCode("customers").ifPresent(staffModules::add);
            moduleRepository.findByCode("operations").ifPresent(staffModules::add);
            
            Role staffRole = new Role();
            staffRole.setName("STAFF");
            staffRole.setDescription("Staff with limited access");
            staffRole.setAllowedModules(staffModules);
            roleRepository.save(staffRole);
        }
    }

    private void initializeDefaultAdmin() {
        if (userRepository.count() == 0) {
            AppUser admin = new AppUser();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("123456"));
            admin.setActive(true);
            admin.setMustChangePassword(true);
            
            Set<Role> adminRoles = new HashSet<>();
            roleRepository.findByName("ADMIN").ifPresent(adminRoles::add);
            admin.setRoles(adminRoles);
            
            userRepository.save(admin);
        }
    }
}
