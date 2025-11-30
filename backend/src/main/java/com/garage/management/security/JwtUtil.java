package com.garage.management.security;

import com.garage.management.entity.AppUser;
import com.garage.management.entity.ModulePermission;
import com.garage.management.entity.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class JwtUtil {

    @Value("${jwt.secret:garage-management-secret-key-that-is-at-least-256-bits-long}")
    private String secretKey;

    @Value("${jwt.expiration:900000}")
    private long expirationMs;

    @Value("${jwt.renewal-threshold:300000}")
    private long renewalThresholdMs;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(AppUser user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", user.getId());
        claims.put("roles", user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList()));
        claims.put("mustChangePassword", user.getMustChangePassword());
        
        Set<String> modules = new HashSet<>();
        for (Role role : user.getRoles()) {
            for (ModulePermission module : role.getAllowedModules()) {
                modules.add(module.getCode());
            }
        }
        claims.put("allowedModules", new ArrayList<>(modules));

        return Jwts.builder()
                .claims(claims)
                .subject(user.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getUsername(String token) {
        return getClaims(token).getSubject();
    }

    public Long getUserId(String token) {
        return getClaims(token).get("userId", Long.class);
    }

    @SuppressWarnings("unchecked")
    public List<String> getRoles(String token) {
        return getClaims(token).get("roles", List.class);
    }

    @SuppressWarnings("unchecked")
    public List<String> getAllowedModules(String token) {
        return getClaims(token).get("allowedModules", List.class);
    }

    public Boolean getMustChangePassword(String token) {
        return getClaims(token).get("mustChangePassword", Boolean.class);
    }

    public boolean shouldRenewToken(String token) {
        try {
            Date expiration = getClaims(token).getExpiration();
            long timeUntilExpiry = expiration.getTime() - System.currentTimeMillis();
            return timeUntilExpiry > 0 && timeUntilExpiry < renewalThresholdMs;
        } catch (Exception e) {
            return false;
        }
    }

    public long getExpirationSeconds() {
        return expirationMs / 1000;
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
