package com.smartcampus.admin.service;

import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.facility.repository.ResourceRepository;
import com.smartcampus.notification.repository.NotificationRepository;
import com.smartcampus.ticket.model.TicketStatus;
import com.smartcampus.ticket.repository.TicketRepository;
import com.smartcampus.visitor.model.VisitorRequestStatus;
import com.smartcampus.visitor.repository.VisitorRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final TicketRepository ticketRepository;
    private final VisitorRequestRepository visitorRequestRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Users
        stats.put("totalUsers", userRepository.count());

        // Resources
        stats.put("totalResources", resourceRepository.count());

        // Tickets
        stats.put("totalTickets", ticketRepository.count());
        stats.put("openTickets", ticketRepository.findByStatus(TicketStatus.OPEN).size());
        stats.put("inProgressTickets", ticketRepository.findByStatus(TicketStatus.IN_PROGRESS).size());
        stats.put("resolvedTickets", ticketRepository.findByStatus(TicketStatus.RESOLVED).size());
        stats.put("closedTickets", ticketRepository.findByStatus(TicketStatus.CLOSED).size());
        stats.put("rejectedTickets", ticketRepository.findByStatus(TicketStatus.REJECTED).size());

        // Visitors
        stats.put("totalVisitors", visitorRequestRepository.count());
        stats.put("pendingVisitors", visitorRequestRepository.findByStatus(VisitorRequestStatus.PENDING).size());
        stats.put("approvedVisitors", visitorRequestRepository.findByStatus(VisitorRequestStatus.APPROVED).size());
        stats.put("rejectedVisitors", visitorRequestRepository.findByStatus(VisitorRequestStatus.REJECTED).size());

        return stats;
    }
}
