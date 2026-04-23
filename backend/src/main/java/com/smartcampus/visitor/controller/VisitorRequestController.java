package com.smartcampus.visitor.controller;

import com.smartcampus.visitor.model.VisitorRequest;
import com.smartcampus.visitor.model.VisitorRequestStatus;
import com.smartcampus.visitor.service.VisitorRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/visitor-requests")
@RequiredArgsConstructor
public class VisitorRequestController {

    private final VisitorRequestService visitorRequestService;

    // GET /api/visitor-requests - List all requests (Admin: with optional filters)
    @GetMapping
    public ResponseEntity<List<VisitorRequest>> getAllRequests(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) VisitorRequestStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String host) {

        if (date != null || status != null || location != null || host != null) {
            return ResponseEntity.ok(visitorRequestService.searchRequests(date, status, location, host));
        }

        return ResponseEntity.ok(visitorRequestService.getAllRequests());
    }

    // GET /api/visitor-requests/{id} - Get single request
    @GetMapping("/{id}")
    public ResponseEntity<VisitorRequest> getRequestById(@PathVariable String id) {
        return ResponseEntity.ok(visitorRequestService.getRequestById(id));
    }

    // GET /api/visitor-requests/my/{userId} - Get current user's requests
    @GetMapping("/my/{userId}")
    public ResponseEntity<List<VisitorRequest>> getMyRequests(@PathVariable String userId) {
        return ResponseEntity.ok(visitorRequestService.getRequestsByUser(userId));
    }

    // POST /api/visitor-requests - Submit new request
    @PostMapping
    public ResponseEntity<VisitorRequest> createRequest(@Valid @RequestBody VisitorRequest request) {
        VisitorRequest created = visitorRequestService.createRequest(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // PUT /api/visitor-requests/{id} - Update request
    @PutMapping("/{id}")
    public ResponseEntity<VisitorRequest> updateRequest(@PathVariable String id,
                                                         @Valid @RequestBody VisitorRequest request) {
        return ResponseEntity.ok(visitorRequestService.updateRequest(id, request));
    }

    // DELETE /api/visitor-requests/{id} - Delete/cancel request
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable String id) {
        visitorRequestService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }

    // PUT /api/visitor-requests/{id}/approve - Approve request (Admin)
    @PutMapping("/{id}/approve")
    public ResponseEntity<VisitorRequest> approveRequest(@PathVariable String id) {
        return ResponseEntity.ok(visitorRequestService.approveRequest(id));
    }

    // PUT /api/visitor-requests/{id}/reject - Reject request with reason (Admin)
    @PutMapping("/{id}/reject")
    public ResponseEntity<VisitorRequest> rejectRequest(@PathVariable String id,
                                                         @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        return ResponseEntity.ok(visitorRequestService.rejectRequest(id, reason));
    }

    // PUT /api/visitor-requests/{id}/check-in - Mark check-in (Security)
    @PutMapping("/{id}/check-in")
    public ResponseEntity<VisitorRequest> checkIn(@PathVariable String id) {
        return ResponseEntity.ok(visitorRequestService.checkIn(id));
    }

    // PUT /api/visitor-requests/{id}/check-out - Mark check-out (Security)
    @PutMapping("/{id}/check-out")
    public ResponseEntity<VisitorRequest> checkOut(@PathVariable String id) {
        return ResponseEntity.ok(visitorRequestService.checkOut(id));
    }
}
