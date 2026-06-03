package com.saas.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegistrationResponse {
    private Long id;
    private Long studentId;
    private Long courseId;
    private String courseCode;
    private String courseName;
    private LocalDateTime registeredAt;
    private CourseResponse course;
}
