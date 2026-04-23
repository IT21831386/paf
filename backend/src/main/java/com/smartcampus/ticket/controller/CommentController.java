package com.smartcampus.ticket.controller;

import com.smartcampus.ticket.model.Comment;
import com.smartcampus.ticket.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // GET /api/tickets/{ticketId}/comments - Get all comments for a ticket
    @GetMapping
    public ResponseEntity<List<Comment>> getComments(@PathVariable String ticketId) {
        return ResponseEntity.ok(commentService.getCommentsByTicketId(ticketId));
    }

    // POST /api/tickets/{ticketId}/comments - Add comment
    @PostMapping
    public ResponseEntity<Comment> addComment(@PathVariable String ticketId,
                                               @Valid @RequestBody Comment comment) {
        comment.setTicketId(ticketId);
        Comment created = commentService.addComment(comment);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // PUT /api/tickets/{ticketId}/comments/{commentId} - Edit own comment
    @PutMapping("/{commentId}")
    public ResponseEntity<Comment> updateComment(@PathVariable String ticketId,
                                                  @PathVariable String commentId,
                                                  @RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        String content = body.get("content");
        return ResponseEntity.ok(commentService.updateComment(commentId, userId, content));
    }

    // DELETE /api/tickets/{ticketId}/comments/{commentId} - Delete own comment
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable String ticketId,
                                               @PathVariable String commentId,
                                               @RequestParam String userId) {
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}
