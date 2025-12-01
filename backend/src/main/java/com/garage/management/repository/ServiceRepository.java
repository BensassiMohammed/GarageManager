package com.garage.management.repository;

import com.garage.management.entity.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, Long> {
    List<ServiceEntity> findByActiveTrue();
    Long countByActiveTrue();
    List<ServiceEntity> findByCategoryId(Long categoryId);
}
