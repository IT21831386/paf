package com.smartcampus.facility.repository;

import com.smartcampus.facility.model.Resource;
import com.smartcampus.facility.model.ResourceStatus;
import com.smartcampus.facility.model.ResourceType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    List<Resource> findByType(ResourceType type);

    List<Resource> findByStatus(ResourceStatus status);

    List<Resource> findByLocationContainingIgnoreCase(String location);

    List<Resource> findByCapacityGreaterThanEqual(int capacity);

    List<Resource> findByNameContainingIgnoreCase(String name);

    List<Resource> findByTypeAndStatus(ResourceType type, ResourceStatus status);

    List<Resource> findByTypeAndLocationContainingIgnoreCase(ResourceType type, String location);
}
