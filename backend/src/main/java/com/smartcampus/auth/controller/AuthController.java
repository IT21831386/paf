package com.smartcampus.auth.controller;

import com.smartcampus.auth.model.*;
import com.smartcampus.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/register - Register new user
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // POST /api/auth/login - Login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // GET /api/auth/me/{id} - Get current user
    @GetMapping("/me/{id}")
    public ResponseEntity<AuthResponse> getMe(@PathVariable String id) {
        return ResponseEntity.ok(authService.getUserById(id));
    }

    // GET /api/auth/users - Get all users (Admin)
    @GetMapping("/users")
    public ResponseEntity<List<AuthResponse>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }

    // PUT /api/auth/users/{id}/role - Update user role (Admin)
    @PutMapping("/users/{id}/role")
    public ResponseEntity<AuthResponse> updateRole(@PathVariable String id,
                                                    @RequestBody Map<String, String> body) {
        UserRole newRole = UserRole.valueOf(body.get("role"));
        return ResponseEntity.ok(authService.updateUserRole(id, newRole));
    }

    // PUT /api/auth/users/{id}/profile - Update profile
    @PutMapping("/users/{id}/profile")
    public ResponseEntity<AuthResponse> updateProfile(@PathVariable String id,
                                                       @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.updateProfile(id, body.get("name"), body.get("avatarUrl")));
    }

    // PUT /api/auth/users/{id}/change-password
    @PutMapping("/users/{id}/change-password")
    public ResponseEntity<AuthResponse> changePassword(@PathVariable String id,
                                                        @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.changePassword(id, body.get("oldPassword"), body.get("newPassword")));
    }

    // DELETE /api/auth/users/{id} - Delete user (Admin)
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        authService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
