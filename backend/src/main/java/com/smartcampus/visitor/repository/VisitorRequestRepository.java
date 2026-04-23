package com.smartcampus.visitor.repository;

import com.smartcampus.visitor.model.VisitorRequest;
import com.smartcampus.visitor.model.VisitorRequestStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VisitorRequestRepository extends MongoRepository<VisitorRequest, String> {

    List<VisitorRequest> findByCreatedBy(String createdBy);

    List<VisitorRequest> findByStatus(VisitorRequestStatus status);

    List<VisitorRequest> findByVisitDate(LocalDate visitDate);

    List<VisitorRequest> findByLocationContainingIgnoreCase(String location);

    List<VisitorRequest> findByHostPersonContainingIgnoreCase(String hostPerson);

    List<VisitorRequest> findByHostDepartmentContainingIgnoreCase(String department);

    List<VisitorRequest> findByVisitDateAndStatus(LocalDate visitDate, VisitorRequestStatus status);
}
