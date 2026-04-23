package com.smartcampus.visitor.service;

import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.visitor.model.VisitorRequest;
import com.smartcampus.visitor.model.VisitorRequestStatus;
import com.smartcampus.visitor.repository.VisitorRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VisitorRequestService {

    private final VisitorRequestRepository visitorRequestRepository;
    private final MongoTemplate mongoTemplate;

    // Get all visitor requests
    public List<VisitorRequest> getAllRequests() {
        return visitorRequestRepository.findAll();
    }

    // Get a single request by ID
    public VisitorRequest getRequestById(String id) {
        return visitorRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visitor request not found with id: " + id));
    }

    // Get requests by a specific user
    public List<VisitorRequest> getRequestsByUser(String userId) {
        return visitorRequestRepository.findByCreatedBy(userId);
    }

    // Create a new visitor request
    public VisitorRequest createRequest(VisitorRequest request) {
        request.setStatus(VisitorRequestStatus.PENDING);
        request.setQrCode(null);
        request.setCheckInTime(null);
        request.setCheckOutTime(null);
        return visitorRequestRepository.save(request);
    }

    // Update a visitor request (only if PENDING)
    public VisitorRequest updateRequest(String id, VisitorRequest updatedRequest) {
        VisitorRequest existing = getRequestById(id);

        if (existing.getStatus() != VisitorRequestStatus.PENDING) {
            throw new BadRequestException("Can only update requests in PENDING status. Current status: " + existing.getStatus());
        }

        existing.setVisitorName(updatedRequest.getVisitorName());
        existing.setNicOrPassport(updatedRequest.getNicOrPassport());
        existing.setHostPerson(updatedRequest.getHostPerson());
        existing.setHostDepartment(updatedRequest.getHostDepartment());
        existing.setPurpose(updatedRequest.getPurpose());
        existing.setVisitDate(updatedRequest.getVisitDate());
        existing.setVisitTime(updatedRequest.getVisitTime());
        existing.setLocation(updatedRequest.getLocation());
        existing.setNumberOfVisitors(updatedRequest.getNumberOfVisitors());

        return visitorRequestRepository.save(existing);
    }

    // Delete a visitor request (only if PENDING)
    public void deleteRequest(String id) {
        VisitorRequest existing = getRequestById(id);

        if (existing.getStatus() != VisitorRequestStatus.PENDING) {
            throw new BadRequestException("Can only delete requests in PENDING status. Current status: " + existing.getStatus());
        }

        visitorRequestRepository.delete(existing);
    }

    // Approve a visitor request (Admin)
    public VisitorRequest approveRequest(String id) {
        VisitorRequest request = getRequestById(id);

        if (request.getStatus() != VisitorRequestStatus.PENDING) {
            throw new BadRequestException("Can only approve PENDING requests. Current status: " + request.getStatus());
        }

        request.setStatus(VisitorRequestStatus.APPROVED);
        // Generate a unique QR code identifier for the digital pass
        request.setQrCode(UUID.randomUUID().toString());
        request.setRejectionReason(null);

        return visitorRequestRepository.save(request);
    }

    // Reject a visitor request (Admin)
    public VisitorRequest rejectRequest(String id, String reason) {
        VisitorRequest request = getRequestById(id);

        if (request.getStatus() != VisitorRequestStatus.PENDING) {
            throw new BadRequestException("Can only reject PENDING requests. Current status: " + request.getStatus());
        }

        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("Rejection reason is required");
        }

        request.setStatus(VisitorRequestStatus.REJECTED);
        request.setRejectionReason(reason);
        request.setQrCode(null);

        return visitorRequestRepository.save(request);
    }

    // Check-in a visitor (Security)
    public VisitorRequest checkIn(String id) {
        VisitorRequest request = getRequestById(id);

        if (request.getStatus() != VisitorRequestStatus.APPROVED) {
            throw new BadRequestException("Can only check-in APPROVED requests. Current status: " + request.getStatus());
        }

        request.setStatus(VisitorRequestStatus.CHECKED_IN);
        request.setCheckInTime(LocalDateTime.now());

        return visitorRequestRepository.save(request);
    }

    // Check-out a visitor (Security)
    public VisitorRequest checkOut(String id) {
        VisitorRequest request = getRequestById(id);

        if (request.getStatus() != VisitorRequestStatus.CHECKED_IN) {
            throw new BadRequestException("Can only check-out CHECKED_IN requests. Current status: " + request.getStatus());
        }

        request.setStatus(VisitorRequestStatus.CHECKED_OUT);
        request.setCheckOutTime(LocalDateTime.now());

        return visitorRequestRepository.save(request);
    }

    // Search and filter visitor requests (Admin) with multiple optional criteria
    public List<VisitorRequest> searchRequests(LocalDate date, VisitorRequestStatus status,
                                                String location, String host) {
        Query query = new Query();

        if (date != null) {
            query.addCriteria(Criteria.where("visitDate").is(date));
        }
        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }
        if (location != null && !location.isBlank()) {
            query.addCriteria(Criteria.where("location").regex(location, "i"));
        }
        if (host != null && !host.isBlank()) {
            query.addCriteria(Criteria.where("hostPerson").regex(host, "i"));
        }

        return mongoTemplate.find(query, VisitorRequest.class);
    }
}
