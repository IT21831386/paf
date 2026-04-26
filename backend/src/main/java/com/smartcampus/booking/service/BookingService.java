package com.smartcampus.booking.service;

import com.smartcampus.booking.model.Booking;
import com.smartcampus.booking.model.BookingStatus;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.facility.model.Resource;
import com.smartcampus.facility.model.ResourceType;
import com.smartcampus.facility.service.ResourceService;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final MongoTemplate mongoTemplate;
    private final ResourceService resourceService;

    public BookingService(BookingRepository bookingRepository, MongoTemplate mongoTemplate, ResourceService resourceService) {
        this.bookingRepository = bookingRepository;
        this.mongoTemplate = mongoTemplate;
        this.resourceService = resourceService;
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
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

        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        return mongoTemplate.find(query, Booking.class);
    }

    public Booking createBooking(Booking booking) {
        validateTimeRange(booking.getStartTime(), booking.getEndTime());
        checkForOverlap(booking.getResourceId(), booking.getDate(),
                booking.getStartTime(), booking.getEndTime(), null);

        // Update availability for equipment
        Resource resource = resourceService.getResourceById(booking.getResourceId());
        if (resource.getType() == ResourceType.EQUIPMENT) {
            int quantity = (booking.getAttendees() != null) ? booking.getAttendees() : 1;
            resourceService.updateAvailableUnits(booking.getResourceId(), -quantity);
        }

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

        // Handle equipment availability changes
        Resource oldResource = resourceService.getResourceById(existing.getResourceId());
        Resource newResource = resourceService.getResourceById(updated.getResourceId());

        if (oldResource.getType() == ResourceType.EQUIPMENT || newResource.getType() == ResourceType.EQUIPMENT) {
            // Restore old quantity
            if (oldResource.getType() == ResourceType.EQUIPMENT) {
                int oldQty = (existing.getAttendees() != null) ? existing.getAttendees() : 1;
                resourceService.updateAvailableUnits(existing.getResourceId(), oldQty);
            }
            
            // Deduct new quantity (if new is equipment)
            if (newResource.getType() == ResourceType.EQUIPMENT) {
                int newQty = (updated.getAttendees() != null) ? updated.getAttendees() : 1;
                resourceService.updateAvailableUnits(updated.getResourceId(), -newQty);
            }
        }

        existing.setResourceId(updated.getResourceId());
        existing.setRoomName(updated.getRoomName());
        existing.setDate(updated.getDate());
        existing.setStartTime(updated.getStartTime());
        existing.setEndTime(updated.getEndTime());
        existing.setPurpose(updated.getPurpose());
        existing.setAttendees(updated.getAttendees());
        existing.setNotes(updated.getNotes());
        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setStatus(updated.getStatus());

        return bookingRepository.save(existing);
    }

    public Booking updateStatus(String id, BookingStatus status) {
        Booking existing = getBookingById(id);
        existing.setStatus(status);
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

        // Restore units if it was equipment
        Resource resource = resourceService.getResourceById(existing.getResourceId());
        if (resource.getType() == ResourceType.EQUIPMENT) {
            int quantity = (existing.getAttendees() != null) ? existing.getAttendees() : 1;
            resourceService.updateAvailableUnits(existing.getResourceId(), quantity);
        }

        existing.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(existing);
    }

    public void deleteBooking(String id) {
        Booking existing = getBookingById(id);
        
        // Restore units if it was equipment and not already cancelled
        if (existing.getStatus() != BookingStatus.CANCELLED) {
            Resource resource = resourceService.getResourceById(existing.getResourceId());
            if (resource.getType() == ResourceType.EQUIPMENT) {
                int quantity = (existing.getAttendees() != null) ? existing.getAttendees() : 1;
                resourceService.updateAvailableUnits(existing.getResourceId(), quantity);
            }
        }
        
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
