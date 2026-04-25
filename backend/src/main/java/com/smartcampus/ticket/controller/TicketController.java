package com.smartcampus.ticket.controller;

import com.smartcampus.ticket.model.Ticket;
import com.smartcampus.ticket.model.TicketPriority;
import com.smartcampus.ticket.model.TicketStatus;
import com.smartcampus.ticket.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    // GET /api/tickets - List all tickets (with optional filters)
    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String assignedTo) {

        if (status != null || priority != null || category != null || assignedTo != null) {
            return ResponseEntity.ok(ticketService.searchTickets(status, priority, category, assignedTo));
        }

        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    // GET /api/tickets/{id} - Get single ticket
    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    // GET /api/tickets/my/{userId} - Get user's tickets
    @GetMapping("/my/{userId}")
    public ResponseEntity<List<Ticket>> getMyTickets(@PathVariable String userId) {
        return ResponseEntity.ok(ticketService.getTicketsByUser(userId));
    }

    // POST /api/tickets - Create ticket with optional file attachments
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Ticket> createTicket(
            @RequestParam String resourceId,
            @RequestParam String userId,
            @RequestParam String category,
            @RequestParam String description,
            @RequestParam TicketPriority priority,
            @RequestParam(required = false) String contactDetails,
            @RequestParam(required = false) List<MultipartFile> files) {

        Ticket ticket = Ticket.builder()
                .resourceId(resourceId)
                .userId(userId)
                .category(category)
                .description(description)
                .priority(priority)
                .contactDetails(contactDetails)
                .build();

        Ticket created = ticketService.createTicket(ticket, files);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // PUT /api/tickets/{id} - Update ticket
    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable String id,
                                                @Valid @RequestBody Ticket ticket) {
        return ResponseEntity.ok(ticketService.updateTicket(id, ticket));
    }

    // DELETE /api/tickets/{id} - Delete ticket
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    // PUT /api/tickets/{id}/assign - Assign technician
    @PutMapping("/{id}/assign")
    public ResponseEntity<Ticket> assignTicket(@PathVariable String id,
                                                @RequestBody Map<String, String> body) {
        String technicianId = body.get("technicianId");
        return ResponseEntity.ok(ticketService.assignTicket(id, technicianId));
    }

    // PUT /api/tickets/{id}/status - Update status
    @PutMapping("/{id}/status")
    public ResponseEntity<Ticket> updateStatus(@PathVariable String id,
                                                @RequestBody Map<String, String> body) {
        TicketStatus newStatus = TicketStatus.valueOf(body.get("status"));
        String notes = body.get("notes");
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, newStatus, notes));
    }
}
