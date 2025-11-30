package com.garage.management.repository;

import com.garage.management.entity.ServicePriceHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServicePriceHistoryRepository extends JpaRepository<ServicePriceHistory, Long> {
    List<ServicePriceHistory> findByServiceIdOrderByStartDateDesc(Long serviceId);
    
    @Query("SELECT sph FROM ServicePriceHistory sph WHERE sph.service.id = :serviceId " +
           "AND sph.startDate <= :date AND (sph.endDate IS NULL OR sph.endDate >= :date) " +
           "ORDER BY sph.startDate DESC")
    Optional<ServicePriceHistory> findCurrentPriceForService(@Param("serviceId") Long serviceId, @Param("date") LocalDate date);
    
    @Query("SELECT sph FROM ServicePriceHistory sph WHERE sph.service.id = :serviceId " +
           "AND sph.endDate IS NULL ORDER BY sph.startDate DESC")
    Optional<ServicePriceHistory> findActiveForService(@Param("serviceId") Long serviceId);
}
