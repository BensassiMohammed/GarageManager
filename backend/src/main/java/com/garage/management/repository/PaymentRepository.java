package com.garage.management.repository;

import com.garage.management.entity.Payment;
import com.garage.management.enums.PayerType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByPayerTypeAndPayerId(PayerType payerType, Long payerId);
}
