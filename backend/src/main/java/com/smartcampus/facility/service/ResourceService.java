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
        List<Resource> resources = resourceRepository.findAll();
        resources.forEach(this::ensureAvailableUnits);
        return resources;
    }

    // Get resource by ID
    public Resource getResourceById(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        ensureAvailableUnits(resource);
        return resource;
    }

    // Create a new resource
    public Resource createResource(Resource resource) {
        if (resource.getStatus() == null) {
            resource.setStatus(ResourceStatus.ACTIVE);
        }
        // Initialize available units to capacity
        resource.setAvailableUnits(resource.getCapacity());
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

    // Update available units
    public void updateAvailableUnits(String id, int delta) {
        Resource resource = getResourceById(id);
        int newAvailable = resource.getAvailableUnits() + delta;
        
        if (newAvailable < 0) {
            throw new com.smartcampus.exception.BadRequestException("Not enough available units for this resource.");
        }
        
        resource.setAvailableUnits(newAvailable);
        resourceRepository.save(resource);
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

        List<Resource> resources = mongoTemplate.find(query, Resource.class);
        resources.forEach(this::ensureAvailableUnits);
        return resources;
    }

    private void ensureAvailableUnits(Resource resource) {
        if (resource.getAvailableUnits() == null) {
            resource.setAvailableUnits(resource.getCapacity());
        }
    }
}
