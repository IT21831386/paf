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

    // Get all comments for a ticket
    public List<Comment> getCommentsByTicketId(String ticketId) {
        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    // Add a comment
    public Comment addComment(Comment comment) {
        return commentRepository.save(comment);
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
