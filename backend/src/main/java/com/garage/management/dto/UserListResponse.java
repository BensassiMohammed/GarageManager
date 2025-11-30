package com.garage.management.dto;

import java.time.LocalDateTime;
import java.util.List;

public class UserListResponse {
    private Long id;
    private String username;
    private Boolean active;
    private Boolean mustChangePassword;
    private List<String> roles;
    private List<String> allowedModules;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public Boolean getMustChangePassword() { return mustChangePassword; }
    public void setMustChangePassword(Boolean mustChangePassword) { this.mustChangePassword = mustChangePassword; }
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
    public List<String> getAllowedModules() { return allowedModules; }
    public void setAllowedModules(List<String> allowedModules) { this.allowedModules = allowedModules; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
