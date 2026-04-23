package com.smartcampus.booking.repository;

import com.smartcampus.booking.model.Booking;
import com.smartcampus.booking.model.BookingStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByResourceId(String resourceId);

    List<Booking> findByBookedBy(String bookedBy);

    List<Booking> findByDate(LocalDate date);

    List<Booking> findByResourceIdAndDate(String resourceId, LocalDate date);

    List<Booking> findByResourceIdAndDateAndStatusNot(String resourceId, LocalDate date, BookingStatus status);

    List<Booking> findByRoomNameContainingIgnoreCase(String roomName);
}
