package com.garage.management.service;

import com.garage.management.entity.ServiceEntity;
import com.garage.management.entity.ServicePriceHistory;
import com.garage.management.repository.ServicePriceHistoryRepository;
import com.garage.management.repository.ServiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ServicePriceService {
    
    private final ServicePriceHistoryRepository priceHistoryRepository;
    private final ServiceRepository serviceRepository;
    
    public ServicePriceService(ServicePriceHistoryRepository priceHistoryRepository,
                               ServiceRepository serviceRepository) {
        this.priceHistoryRepository = priceHistoryRepository;
        this.serviceRepository = serviceRepository;
    }
    
    public List<ServicePriceHistory> getPriceHistory(Long serviceId) {
        return priceHistoryRepository.findByServiceIdOrderByStartDateDesc(serviceId);
    }
    
    public Optional<BigDecimal> getCurrentPrice(Long serviceId) {
        return priceHistoryRepository.findCurrentPriceForService(serviceId, LocalDate.now())
                .map(ServicePriceHistory::getPrice);
    }
    
    @Transactional
    public ServicePriceHistory addNewPrice(Long serviceId, BigDecimal price, LocalDate startDate) {
        ServiceEntity service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        
        final LocalDate effectiveStartDate = (startDate == null) ? LocalDate.now() : startDate;
        
        priceHistoryRepository.findActiveForService(serviceId)
                .ifPresent(activePrice -> {
                    activePrice.setEndDate(effectiveStartDate.minusDays(1));
                    priceHistoryRepository.save(activePrice);
                });
        
        ServicePriceHistory newPriceHistory = new ServicePriceHistory();
        newPriceHistory.setService(service);
        newPriceHistory.setPrice(price);
        newPriceHistory.setStartDate(effectiveStartDate);
        newPriceHistory.setEndDate(null);
        
        ServicePriceHistory saved = priceHistoryRepository.save(newPriceHistory);
        
        service.setSellingPrice(price);
        serviceRepository.save(service);
        
        return saved;
    }
}
