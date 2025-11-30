package com.garage.management.dto;

import java.util.List;

public class UserInfoResponse {
    private Long id;
    private String username;
    private List<String> roles;
    private List<String> allowedModules;
    private Boolean mustChangePassword;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
    public List<String> getAllowedModules() { return allowedModules; }
    public void setAllowedModules(List<String> allowedModules) { this.allowedModules = allowedModules; }
    public Boolean getMustChangePassword() { return mustChangePassword; }
    public void setMustChangePassword(Boolean mustChangePassword) { this.mustChangePassword = mustChangePassword; }
}
