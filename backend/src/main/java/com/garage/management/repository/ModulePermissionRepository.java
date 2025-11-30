package com.garage.management.repository;

import com.garage.management.entity.ModulePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ModulePermissionRepository extends JpaRepository<ModulePermission, Long> {
    Optional<ModulePermission> findByCode(String code);
}
