package com.garage.management.controller;

import com.garage.management.dto.UserDto;
import com.garage.management.dto.UserListResponse;
import com.garage.management.entity.AppUser;
import com.garage.management.entity.ModulePermission;
import com.garage.management.entity.Role;
import com.garage.management.repository.AppUserRepository;
import com.garage.management.repository.RoleRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final AppUserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(AppUserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<UserListResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserListResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserListResponse> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(toUserListResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserDto userDto) {
        if (userRepository.existsByUsername(userDto.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username already exists");
        }

        if (userDto.getPassword() == null || userDto.getPassword().length() < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password must be at least 6 characters");
        }

        AppUser user = new AppUser();
        user.setUsername(userDto.getUsername());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        user.setActive(userDto.getActive() != null ? userDto.getActive() : true);
        user.setMustChangePassword(userDto.getMustChangePassword() != null ? userDto.getMustChangePassword() : true);

        if (userDto.getRoleNames() != null && !userDto.getRoleNames().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : userDto.getRoleNames()) {
                roleRepository.findByName(roleName).ifPresent(roles::add);
            }
            user.setRoles(roles);
        }

        AppUser savedUser = userRepository.save(user);
        return ResponseEntity.ok(toUserListResponse(savedUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        return userRepository.findById(id)
                .map(user -> {
                    if (userDto.getUsername() != null && !userDto.getUsername().equals(user.getUsername())) {
                        if (userRepository.existsByUsername(userDto.getUsername())) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Username already exists");
                        }
                        user.setUsername(userDto.getUsername());
                    }

                    if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
                        if (userDto.getPassword().length() < 6) {
                            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Password must be at least 6 characters");
                        }
                        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
                    }

                    if (userDto.getActive() != null) {
                        user.setActive(userDto.getActive());
                    }

                    if (userDto.getMustChangePassword() != null) {
                        user.setMustChangePassword(userDto.getMustChangePassword());
                    }

                    if (userDto.getRoleNames() != null) {
                        Set<Role> roles = new HashSet<>();
                        for (String roleName : userDto.getRoleNames()) {
                            roleRepository.findByName(roleName).ifPresent(roles::add);
                        }
                        user.setRoles(roles);
                    }

                    AppUser savedUser = userRepository.save(user);
                    return ResponseEntity.ok(toUserListResponse(savedUser));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    userRepository.delete(user);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    private UserListResponse toUserListResponse(AppUser user) {
        UserListResponse response = new UserListResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setActive(user.getActive());
        response.setMustChangePassword(user.getMustChangePassword());
        response.setCreatedAt(user.getCreatedAt());

        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());
        response.setRoles(roleNames);

        Set<String> modules = new HashSet<>();
        for (Role role : user.getRoles()) {
            for (ModulePermission module : role.getAllowedModules()) {
                modules.add(module.getCode());
            }
        }
        response.setAllowedModules(new ArrayList<>(modules));

        return response;
    }
}
