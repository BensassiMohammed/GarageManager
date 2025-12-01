package com.garage.management.service;

import com.garage.management.entity.Product;
import com.garage.management.entity.StockMovement;
import com.garage.management.repository.ProductRepository;
import com.garage.management.repository.StockMovementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class StockMovementService {

    @Autowired
    private StockMovementRepository stockMovementRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<StockMovement> findAll() {
        return stockMovementRepository.findAll();
    }

    public List<StockMovement> findAllOrdered() {
        return stockMovementRepository.findAllByOrderByDateDesc();
    }

    public Optional<StockMovement> findById(Long id) {
        return stockMovementRepository.findById(id);
    }

    public List<StockMovement> findByProductId(Long productId) {
        return stockMovementRepository.findByProductId(productId);
    }

    public List<StockMovement> findByCategoryId(Long categoryId) {
        return stockMovementRepository.findByCategoryId(categoryId);
    }

    @Transactional
    public StockMovement createMovement(StockMovement movement) {
        Product product = movement.getProduct();
        if (product == null || product.getId() == null) {
            throw new IllegalArgumentException("Product is required for stock movement");
        }

        Product existingProduct = productRepository.findById(product.getId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + product.getId()));

        Integer currentStock = existingProduct.getCurrentStock();
        if (currentStock == null) {
            currentStock = 0;
        }

        Integer quantityDelta = movement.getQuantityDelta();
        if (quantityDelta == null) {
            quantityDelta = 0;
        }

        int newStock = currentStock + quantityDelta;
        existingProduct.setCurrentStock(newStock);
        productRepository.save(existingProduct);

        movement.setProduct(existingProduct);
        return stockMovementRepository.save(movement);
    }

    @Transactional
    public void deleteMovement(Long id) {
        StockMovement movement = stockMovementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Stock movement not found with id: " + id));

        Product product = movement.getProduct();
        if (product != null) {
            Integer currentStock = product.getCurrentStock();
            if (currentStock == null) {
                currentStock = 0;
            }

            Integer quantityDelta = movement.getQuantityDelta();
            if (quantityDelta == null) {
                quantityDelta = 0;
            }

            int newStock = currentStock - quantityDelta;
            product.setCurrentStock(newStock);
            productRepository.save(product);
        }

        stockMovementRepository.delete(movement);
    }
}
