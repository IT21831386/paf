package com.smartcampus.admin.controller;

import com.smartcampus.admin.service.AdminService;
import com.smartcampus.ticket.model.Ticket;
import com.smartcampus.ticket.repository.TicketRepository;
import com.smartcampus.visitor.model.VisitorRequest;
import com.smartcampus.visitor.repository.VisitorRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final TicketRepository ticketRepository;
    private final VisitorRequestRepository visitorRequestRepository;

    // GET /api/admin/stats — Dashboard stats
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // GET /api/admin/recent-tickets — Last 5 tickets
    @GetMapping("/recent-tickets")
    public ResponseEntity<List<Ticket>> getRecentTickets() {
        List<Ticket> all = ticketRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(all.stream().limit(5).toList());
    }

    // GET /api/admin/recent-visitors — Last 5 visitor requests
    @GetMapping("/recent-visitors")
    public ResponseEntity<List<VisitorRequest>> getRecentVisitors() {
        List<VisitorRequest> all = visitorRequestRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(all.stream().limit(5).toList());
    }
}
