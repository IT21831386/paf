package com.smartcampus.booking.service;

import com.smartcampus.booking.model.Booking;
import com.smartcampus.booking.model.BookingStatus;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final MongoTemplate mongoTemplate;
    private final com.smartcampus.notification.service.NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository, MongoTemplate mongoTemplate,
                          com.smartcampus.notification.service.NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.mongoTemplate = mongoTemplate;
        this.notificationService = notificationService;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    public List<Booking> searchBookings(String roomName, BookingStatus status, String resourceId,
                                        String bookedBy, LocalDate date) {
        Query query = new Query();

        if (roomName != null && !roomName.isBlank()) {
            query.addCriteria(Criteria.where("roomName").regex(roomName, "i"));
        }
        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }
        if (resourceId != null && !resourceId.isBlank()) {
            query.addCriteria(Criteria.where("resourceId").is(resourceId));
        }
        if (bookedBy != null && !bookedBy.isBlank()) {
            query.addCriteria(Criteria.where("bookedBy").is(bookedBy));
        }
        if (date != null) {
            query.addCriteria(Criteria.where("date").is(date));
        }

        return mongoTemplate.find(query, Booking.class);
    }

    public Booking createBooking(Booking booking) {
        validateTimeRange(booking.getStartTime(), booking.getEndTime());
        checkForOverlap(booking.getResourceId(), booking.getDate(),
                booking.getStartTime(), booking.getEndTime(), null);

        booking.setStatus(BookingStatus.PENDING);
        return bookingRepository.save(booking);
    }

    public Booking updateBooking(String id, Booking updated) {
        Booking existing = getBookingById(id);

        if (existing.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cannot update a cancelled booking.");
        }

        validateTimeRange(updated.getStartTime(), updated.getEndTime());
        checkForOverlap(updated.getResourceId(), updated.getDate(),
                updated.getStartTime(), updated.getEndTime(), id);

        existing.setResourceId(updated.getResourceId());
        existing.setRoomName(updated.getRoomName());
        existing.setDate(updated.getDate());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setPurpose(updated.getPurpose());
        existing.setAttendees(updated.getAttendees());
        existing.setNotes(updated.getNotes());

        return bookingRepository.save(existing);
    }

    public Booking cancelBooking(String id) {
        Booking existing = getBookingById(id);

        if (existing.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled.");
        }
        if (existing.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed booking.");
        }

        existing.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(existing);

        // Notify the booker
        notificationService.createNotification(
                existing.getBookedBy(),
                "Booking Cancelled",
                "Your booking for " + existing.getRoomName() + " on " + existing.getDate() + " has been cancelled.",
                com.smartcampus.notification.model.NotificationType.BOOKING_REJECTED,
                id
        );

        return saved;
    }

    public void deleteBooking(String id) {
        Booking existing = getBookingById(id);
        bookingRepository.delete(existing);
    }

    private void validateTimeRange(String startTime, String endTime) {
        if (startTime.compareTo(endTime) >= 0) {
            throw new BadRequestException("End time must be after start time.");
        }
    }

    private void checkForOverlap(String resourceId, LocalDate date,
                                  String startTime, String endTime, String excludeId) {
        List<Booking> existing = bookingRepository
                .findByResourceIdAndDateAndStatusNot(resourceId, date, BookingStatus.CANCELLED);

        for (Booking b : existing) {
            if (excludeId != null && excludeId.equals(b.getId())) continue;

            boolean overlaps = startTime.compareTo(b.getEndTime()) < 0
                    && endTime.compareTo(b.getStartTime()) > 0;

            if (overlaps) {
                throw new BadRequestException(
                        "This room is already booked from " + b.getStartTime() + " to " + b.getEndTime()
                        + " on the selected date.");
            }
        }
    }
}
