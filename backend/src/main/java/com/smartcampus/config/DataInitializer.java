package com.smartcampus.config;

import com.smartcampus.facility.model.Resource;
import com.smartcampus.facility.model.ResourceStatus;
import com.smartcampus.facility.model.ResourceType;
import com.smartcampus.facility.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final ResourceRepository resourceRepository;

    @Override
    public void run(String... args) throws Exception {
        seedMissingResources();
    }

    private void seedMissingResources() {
        List<Resource> defaultResources = Arrays.asList(
            Resource.builder().id("c201").name("Conference Room 201").type(ResourceType.MEETING_ROOM).capacity(12).location("Level 2").status(ResourceStatus.ACTIVE).description("Modern conference room with presentation facilities.").build(),
            Resource.builder().id("c202").name("Focus Room 202").type(ResourceType.MEETING_ROOM).capacity(4).location("Level 2").status(ResourceStatus.ACTIVE).description("Small room for deep work or 1-on-1 meetings.").build(),
            Resource.builder().id("room-d4").name("Boardroom D4").type(ResourceType.MEETING_ROOM).capacity(15).location("Building D, Floor 4").status(ResourceStatus.ACTIVE).description("Executive boardroom with high-end audio/visual setup.").build(),
            Resource.builder().id("room-e2").name("Innovation Studio E2").type(ResourceType.MEETING_ROOM).capacity(25).location("Innovation Hub, Floor 2").status(ResourceStatus.ACTIVE).description("Collaborative space for creative thinking and brainstorming.").build(),
            Resource.builder().id("c203").name("Main Lab 203").type(ResourceType.LAB).capacity(45).location("Level 2").status(ResourceStatus.ACTIVE).description("High-performance computing lab for computer science students.").build(),
            Resource.builder().id("lab-102").name("Electronics Lab 102").type(ResourceType.LAB).capacity(35).location("Building B, Floor 1").status(ResourceStatus.ACTIVE).description("Specialized lab for electronics and robotics.").build(),
            Resource.builder().id("lab-202").name("Research Lab 202").type(ResourceType.LAB).capacity(25).location("Science Block, Floor 2").status(ResourceStatus.ACTIVE).description("Advanced research facility for post-graduate students.").build(),
            Resource.builder().id("c204").name("Study Booth A").type(ResourceType.MEETING_ROOM).capacity(1).location("Level 2").status(ResourceStatus.ACTIVE).description("Private soundproof study booth.").build(),
            Resource.builder().id("c205").name("Study Booth B").type(ResourceType.MEETING_ROOM).capacity(1).location("Level 2").status(ResourceStatus.ACTIVE).description("Private soundproof study booth.").build(),
            Resource.builder().id("c206").name("Lecture Hall 206").type(ResourceType.LECTURE_HALL).capacity(120).location("Level 2").status(ResourceStatus.ACTIVE).description("Large auditorium with tiered seating.").build(),
            Resource.builder().id("lh-a1").name("Lecture Hall A1").type(ResourceType.LECTURE_HALL).capacity(200).location("Building A, Floor 1").status(ResourceStatus.ACTIVE).description("Modern large lecture hall in Building A.").build(),
            Resource.builder().id("lh-a2").name("Lecture Hall A2").type(ResourceType.LECTURE_HALL).capacity(180).location("Building A, Floor 1").status(ResourceStatus.ACTIVE).description("Medium sized lecture hall with advanced acoustics.").build(),
            Resource.builder().id("lh-b1").name("Lecture Hall B1").type(ResourceType.LECTURE_HALL).capacity(150).location("Building B, Floor 1").status(ResourceStatus.ACTIVE).description("Comfortable lecture hall in Building B.").build(),
            Resource.builder().id("lh-b2").name("Lecture Hall B2").type(ResourceType.LECTURE_HALL).capacity(100).location("Building B, Floor 1").status(ResourceStatus.ACTIVE).description("Interactive lecture hall for smaller groups.").build(),
            Resource.builder().id("canteen").name("Student Canteen").type(ResourceType.MEETING_ROOM).capacity(300).location("Science Block, Floor 1").status(ResourceStatus.ACTIVE).description("Food court and social space.").build(),
            Resource.builder().id("main-gate").name("Main Entrance").type(ResourceType.MEETING_ROOM).capacity(1).location("Campus Gate").status(ResourceStatus.ACTIVE).description("Security and entry point.").build()
        );

        for (Resource res : defaultResources) {
            if (!resourceRepository.existsById(res.getId())) {
                resourceRepository.save(res);
                System.out.println("Seeded missing resource: " + res.getId() + " - " + res.getName());
            }
        }
    }
}
