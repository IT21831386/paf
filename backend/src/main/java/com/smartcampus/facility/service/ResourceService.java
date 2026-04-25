package com.smartcampus.facility.service;

import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.facility.model.Resource;
import com.smartcampus.facility.model.ResourceStatus;
import com.smartcampus.facility.model.ResourceType;
import com.smartcampus.facility.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final MongoTemplate mongoTemplate;

    // Get all resources
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    // Get resource by ID
    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    // Create a new resource
    public Resource createResource(Resource resource) {
        if (resource.getStatus() == null) {
            resource.setStatus(ResourceStatus.ACTIVE);
        }
        return resourceRepository.save(resource);
    }

    // Update an existing resource
    public Resource updateResource(String id, Resource updatedResource) {
        Resource existing = getResourceById(id);

        existing.setName(updatedResource.getName());
        existing.setType(updatedResource.getType());
        existing.setCapacity(updatedResource.getCapacity());
        existing.setLocation(updatedResource.getLocation());
        existing.setAvailabilityWindows(updatedResource.getAvailabilityWindows());
        existing.setStatus(updatedResource.getStatus());
        existing.setDescription(updatedResource.getDescription());

        return resourceRepository.save(existing);
    }

    // Delete a resource
    public void deleteResource(String id) {
        Resource existing = getResourceById(id);
        resourceRepository.delete(existing);
    }

    // Search and filter resources with multiple optional criteria
    public List<Resource> searchResources(String name, ResourceType type, ResourceStatus status,
                                          String location, Integer minCapacity) {
        Query query = new Query();

        if (name != null && !name.isBlank()) {
            query.addCriteria(Criteria.where("name").regex(name, "i"));
        }
        if (type != null) {
            query.addCriteria(Criteria.where("type").is(type));
        }
        if (status != null) {
            query.addCriteria(Criteria.where("status").is(status));
        }
        if (location != null && !location.isBlank()) {
            query.addCriteria(Criteria.where("location").regex(location, "i"));
        }
        if (minCapacity != null) {
            query.addCriteria(Criteria.where("capacity").gte(minCapacity));
        }

        return mongoTemplate.find(query, Resource.class);
    }
}
