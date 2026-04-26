package com.smartcampus.ticket.service;

import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.ticket.model.Comment;
import com.smartcampus.ticket.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final com.smartcampus.ticket.repository.TicketRepository ticketRepository;
    private final com.smartcampus.notification.service.NotificationService notificationService;

    // Get all comments for a ticket
    public List<Comment> getCommentsByTicketId(String ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    // Add a comment
    public Comment addComment(Comment comment) {
        Comment saved = commentRepository.save(comment);

        // Notify ticket owner about new comment
        try {
            var ticket = ticketRepository.findById(comment.getTicketId()).orElse(null);
            if (ticket != null && !ticket.getUserId().equals(comment.getUserId())) {
                String ticketId = comment.getTicketId();
                notificationService.createNotification(
                        ticket.getUserId(),
                        "New Comment",
                        "Someone commented on your ticket #" + ticketId.substring(Math.max(0, ticketId.length() - 6)),
                        com.smartcampus.notification.model.NotificationType.NEW_COMMENT,
                        ticketId
                );
            }
        } catch (Exception ignored) {}

        return saved;
    }

    // Update a comment (only by the owner)
    public Comment updateComment(String commentId, String userId, String newContent) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getUserId().equals(userId)) {
            throw new BadRequestException("You can only edit your own comments");
        }

        comment.setContent(newContent);
        return commentRepository.save(comment);
    }

    // Delete a comment (only by the owner)
    public void deleteComment(String commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!comment.getUserId().equals(userId)) {
            throw new BadRequestException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }
}
