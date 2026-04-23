package com.smartcampus.visitor.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "visitor_requests")
public class VisitorRequest {

    @Id
    private String id;

    @NotBlank(message = "Visitor name is required")
    private String visitorName;

    @NotBlank(message = "NIC or Passport number is required")
    private String nicOrPassport;

    @NotBlank(message = "Host person is required")
    private String hostPerson;

    private String hostDepartment;

    @NotBlank(message = "Purpose of visit is required")
    private String purpose;

    @NotNull(message = "Visit date is required")
    private LocalDate visitDate;

    @NotNull(message = "Visit time is required")
    private LocalTime visitTime;

    @NotBlank(message = "Location is required")
    private String location;

    @Min(value = 1, message = "Number of visitors must be at least 1")
    @Builder.Default
    private int numberOfVisitors = 1;

    @Builder.Default
    private VisitorRequestStatus status = VisitorRequestStatus.PENDING;

    private String rejectionReason;

    private String qrCode;

    private String createdBy;

    private LocalDateTime checkInTime;

    private LocalDateTime checkOutTime;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
