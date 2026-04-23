package com.smartcampus.ticket.repository;

import com.smartcampus.ticket.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {

    List<Comment> findByTicketIdOrderByCreatedAtAsc(String ticketId);

    List<Comment> findByUserId(String userId);

    void deleteAllByTicketId(String ticketId);
}
