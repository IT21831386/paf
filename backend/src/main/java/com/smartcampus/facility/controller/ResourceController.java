package com.smartcampus.facility.controller;

import com.smartcampus.facility.model.Resource;
import com.smartcampus.facility.model.ResourceStatus;
import com.smartcampus.facility.model.ResourceType;
import com.smartcampus.facility.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    // GET /api/resources - List all resources (with optional filters)
    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity) {

        // If any filter is provided, use search
        if (name != null || type != null || status != null || location != null || minCapacity != null) {
            List<Resource> results = resourceService.searchResources(name, type, status, location, minCapacity);
            return ResponseEntity.ok(results);
        }

        return ResponseEntity.ok(resourceService.getAllResources());
    }

    // GET /api/resources/{id} - Get single resource
    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable String id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // POST /api/resources - Create new resource
    @PostMapping
    public ResponseEntity<Resource> createResource(@Valid @RequestBody Resource resource) {
        Resource created = resourceService.createResource(resource);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // PUT /api/resources/{id} - Update resource
    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable String id,
                                                    @Valid @RequestBody Resource resource) {
        return ResponseEntity.ok(resourceService.updateResource(id, resource));
    }

    // DELETE /api/resources/{id} - Delete resource
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable String id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
