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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

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

    // GET /api/admin/analytics — Charts data
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("MMM dd");

        // 1. Ticket Trends — last 7 days
        List<Ticket> allTickets = ticketRepository.findAll();
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> ticketTrends = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            String label = day.format(dayFmt);
            long count = allTickets.stream()
                    .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().toLocalDate().equals(day))
                    .count();
            long resolved = allTickets.stream()
                    .filter(t -> t.getCreatedAt() != null && t.getCreatedAt().toLocalDate().equals(day)
                            && ("RESOLVED".equals(t.getStatus().name()) || "CLOSED".equals(t.getStatus().name())))
                    .count();
            ticketTrends.add(Map.of("day", label, "created", count, "resolved", resolved));
        }
        analytics.put("ticketTrends", ticketTrends);

        // 2. Tickets by Category — pie chart
        Map<String, Long> byCat = allTickets.stream()
                .filter(t -> t.getCategory() != null)
                .collect(Collectors.groupingBy(Ticket::getCategory, Collectors.counting()));
        List<Map<String, Object>> categoryData = byCat.entrySet().stream()
                .map(e -> Map.<String, Object>of("name", e.getKey(), "value", e.getValue()))
                .toList();
        analytics.put("ticketsByCategory", categoryData);

        // 3. Tickets by Priority — bar chart
        Map<String, Long> byPriority = allTickets.stream()
                .filter(t -> t.getPriority() != null)
                .collect(Collectors.groupingBy(t -> t.getPriority().name(), Collectors.counting()));
        List<Map<String, Object>> priorityData = List.of("LOW", "MEDIUM", "HIGH", "CRITICAL").stream()
                .map(p -> Map.<String, Object>of("priority", p, "count", byPriority.getOrDefault(p, 0L)))
                .toList();
        analytics.put("ticketsByPriority", priorityData);

        // 4. Visitor Traffic — last 7 days
        List<VisitorRequest> allVisitors = visitorRequestRepository.findAll();
        List<Map<String, Object>> visitorTraffic = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            String label = day.format(dayFmt);
            long count = allVisitors.stream()
                    .filter(v -> v.getVisitDate() != null && v.getVisitDate().equals(day))
                    .count();
            visitorTraffic.add(Map.of("day", label, "visitors", count));
        }
        analytics.put("visitorTraffic", visitorTraffic);

        return ResponseEntity.ok(analytics);
    }
}

