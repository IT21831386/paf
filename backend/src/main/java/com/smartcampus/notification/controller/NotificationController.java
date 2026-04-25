package com.smartcampus.notification.controller;

import com.smartcampus.notification.model.Notification;
import com.smartcampus.notification.model.NotificationType;
import com.smartcampus.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // GET /api/notifications/{userId} - Get user's notifications
    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    // GET /api/notifications/{userId}/unread - Get unread only
    @GetMapping("/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable String userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    // GET /api/notifications/{userId}/unread-count - Get unread count
    @GetMapping("/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable String userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    // POST /api/notifications - Create notification (for testing / cross-module use)
    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Map<String, String> body) {
        Notification notification = notificationService.createNotification(
                body.get("userId"),
                body.get("title"),
                body.get("message"),
                NotificationType.valueOf(body.getOrDefault("type", "GENERAL")),
                body.get("referenceId")
        );
        return new ResponseEntity<>(notification, HttpStatus.CREATED);
    }

    // PUT /api/notifications/{id}/read - Mark as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(@PathVariable String id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    // PUT /api/notifications/{userId}/read-all - Mark all as read
    @PutMapping("/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable String userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    // DELETE /api/notifications/{id} - Delete notification
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
}
