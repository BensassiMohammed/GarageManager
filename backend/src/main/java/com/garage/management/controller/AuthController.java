package com.garage.management.controller;

import com.garage.management.dto.ChangePasswordRequest;
import com.garage.management.dto.LoginRequest;
import com.garage.management.dto.LoginResponse;
import com.garage.management.dto.UserInfoResponse;
import com.garage.management.entity.AppUser;
import com.garage.management.entity.ModulePermission;
import com.garage.management.entity.Role;
import com.garage.management.repository.AppUserRepository;
import com.garage.management.security.CustomUserDetailsService;
import com.garage.management.security.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager,
                         CustomUserDetailsService userDetailsService,
                         JwtUtil jwtUtil,
                         AppUserRepository userRepository,
                         PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            AppUser user = userDetailsService.getAppUser(request.getUsername());
            String token = jwtUtil.generateToken(user);

            return ResponseEntity.ok(new LoginResponse(token, jwtUtil.getExpirationSeconds()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request, HttpServletResponse response) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        String username = auth.getName();
        AppUser user = userDetailsService.getAppUser(username);

        UserInfoResponse userInfo = new UserInfoResponse();
        userInfo.setId(user.getId());
        userInfo.setUsername(user.getUsername());
        userInfo.setMustChangePassword(user.getMustChangePassword());

        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());
        userInfo.setRoles(roleNames);

        Set<String> modules = new HashSet<>();
        for (Role role : user.getRoles()) {
            for (ModulePermission module : role.getAllowedModules()) {
                modules.add(module.getCode());
            }
        }
        userInfo.setAllowedModules(new ArrayList<>(modules));

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.shouldRenewToken(token)) {
                String newToken = jwtUtil.generateToken(user);
                response.setHeader("X-New-Access-Token", newToken);
            }
        }

        return ResponseEntity.ok(userInfo);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request,
                                            HttpServletRequest httpRequest,
                                            HttpServletResponse httpResponse) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        String username = auth.getName();
        AppUser user = userDetailsService.getAppUser(username);

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Current password is incorrect");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("New password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);

        String newToken = jwtUtil.generateToken(user);
        httpResponse.setHeader("X-New-Access-Token", newToken);

        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("message", "Password changed successfully");
        response.put("accessToken", newToken);
        response.put("expiresInSeconds", jwtUtil.getExpirationSeconds());
        return ResponseEntity.ok(response);
    }
}
