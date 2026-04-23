package com.smartcampus.ticket.service;

import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.ticket.model.Ticket;
import com.smartcampus.ticket.model.TicketPriority;
import com.smartcampus.ticket.model.TicketStatus;
import com.smartcampus.ticket.repository.CommentRepository;
import com.smartcampus.ticket.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final MongoTemplate mongoTemplate;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    // Get all tickets
    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    // Get ticket by ID
    public Ticket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    // Get tickets by user
    public List<Ticket> getTicketsByUser(String userId) {
        return ticketRepository.findByUserId(userId);
    }

    // Create a new ticket
    public Ticket createTicket(Ticket ticket, List<MultipartFile> files) {
        ticket.setStatus(TicketStatus.OPEN);
        ticket.setAssignedTo(null);
        ticket.setResolutionNotes(null);
        ticket.setRejectionReason(null);

        // Handle file uploads
        if (files != null && !files.isEmpty()) {
            if (files.size() > 3) {
                throw new BadRequestException("Maximum 3 attachments allowed");
            }
            List<String> filePaths = uploadFiles(files);
            ticket.setAttachments(filePaths);
        }

        return ticketRepository.save(ticket);
    }

    // Update a ticket (only basic fields, only if OPEN)
    public Ticket updateTicket(String id, Ticket updatedTicket) {
        Ticket existing = getTicketById(id);

        if (existing.getStatus() != TicketStatus.OPEN) {
            throw new BadRequestException("Can only edit tickets in OPEN status. Current: " + existing.getStatus());
        }

        existing.setCategory(updatedTicket.getCategory());
        existing.setDescription(updatedTicket.getDescription());
        existing.setPriority(updatedTicket.getPriority());
        existing.setContactDetails(updatedTicket.getContactDetails());
        existing.setResourceId(updatedTicket.getResourceId());

        return ticketRepository.save(existing);
    }

    // Delete a ticket
    public void deleteTicket(String id) {
        Ticket existing = getTicketById(id);
        // Also delete all related comments
        commentRepository.deleteAllByTicketId(id);
        ticketRepository.delete(existing);
    }

    // Assign a technician to a ticket
    public Ticket assignTicket(String id, String technicianId) {
        Ticket ticket = getTicketById(id);

        if (ticket.getStatus() == TicketStatus.CLOSED || ticket.getStatus() == TicketStatus.REJECTED) {
            throw new BadRequestException("Cannot assign a technician to a " + ticket.getStatus() + " ticket");
        }

        ticket.setAssignedTo(technicianId);
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }

        return ticketRepository.save(ticket);
    }

    // Update ticket status (with optional resolution notes or rejection reason)
    public Ticket updateTicketStatus(String id, TicketStatus newStatus, String notes) {
        Ticket ticket = getTicketById(id);
        TicketStatus currentStatus = ticket.getStatus();

        // Validate transitions
        validateStatusTransition(currentStatus, newStatus);

        ticket.setStatus(newStatus);

        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolutionNotes(notes);
        } else if (newStatus == TicketStatus.REJECTED) {
            if (notes == null || notes.isBlank()) {
                throw new BadRequestException("Rejection reason is required");
            }
            ticket.setRejectionReason(notes);
        }

        return ticketRepository.save(ticket);
    }

    // Search/filter tickets
    public List<Ticket> searchTickets(TicketStatus status, TicketPriority priority,
                                       String category, String assignedTo) {
        Query query = new Query();

        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }
        if (priority != null) {
            query.addCriteria(Criteria.where("priority").is(priority));
        }
        if (category != null && !category.isBlank()) {
            query.addCriteria(Criteria.where("category").regex(category, "i"));
        }
        if (assignedTo != null && !assignedTo.isBlank()) {
            query.addCriteria(Criteria.where("assignedTo").is(assignedTo));
        }

        return mongoTemplate.find(query, Ticket.class);
    }

    // ---- Helper methods ----

    private void validateStatusTransition(TicketStatus current, TicketStatus next) {
        boolean valid = switch (current) {
            case OPEN -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED || next == TicketStatus.REJECTED;
            case RESOLVED -> next == TicketStatus.CLOSED;
            case CLOSED, REJECTED -> false;
        };

        if (!valid) {
            throw new BadRequestException(
                    String.format("Invalid status transition: %s → %s", current, next));
        }
    }

    private List<String> uploadFiles(List<MultipartFile> files) {
        List<String> paths = new ArrayList<>();
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            for (MultipartFile file : files) {
                if (file.isEmpty()) continue;

                String originalName = file.getOriginalFilename();
                String extension = originalName != null && originalName.contains(".")
                        ? originalName.substring(originalName.lastIndexOf("."))
                        : "";
                String fileName = UUID.randomUUID().toString() + extension;

                Path filePath = uploadPath.resolve(fileName);
                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                paths.add("/uploads/" + fileName);
            }
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload file: " + e.getMessage());
        }
        return paths;
    }
}
