package com.smartcampus.auth.service;

import com.smartcampus.auth.model.*;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    // Register a new user
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(request.getPassword()) // In production, hash with BCrypt
                .role(UserRole.USER)
                .build();

        User saved = userRepository.save(user);
        return mapToResponse(saved, "Registration successful");
    }

    // Login
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        // In production, use BCrypt.matches()
        if (!user.getPassword().equals(request.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        return mapToResponse(user, "Login successful");
    }

    // Get current user profile
    public AuthResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return mapToResponse(user, null);
    }

    // Get all users (Admin)
    public List<AuthResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> mapToResponse(u, null))
                .toList();
    }

    // Update user role (Admin)
    public AuthResponse updateUserRole(String id, UserRole newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        user.setRole(newRole);
        User saved = userRepository.save(user);
        return mapToResponse(saved, "Role updated to " + newRole);
    }

    // Update user profile
    public AuthResponse updateProfile(String id, String name, String avatarUrl) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        if (name != null && !name.isBlank()) user.setName(name);
        if (avatarUrl != null) user.setAvatarUrl(avatarUrl);
        User saved = userRepository.save(user);
        return mapToResponse(saved, "Profile updated");
    }

    // Change password
    public AuthResponse changePassword(String id, String oldPassword, String newPassword) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        if (!user.getPassword().equals(oldPassword)) {
            throw new BadRequestException("Current password is incorrect");
        }

        if (newPassword == null || newPassword.length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters");
        }

        user.setPassword(newPassword);
        User saved = userRepository.save(user);
        return mapToResponse(saved, "Password changed successfully");
    }

    // Delete user (Admin)
    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found: " + id);
        }
        userRepository.deleteById(id);
    }

    private AuthResponse mapToResponse(User user, String message) {
        return AuthResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .message(message)
                .build();
    }
}
