package com.saas.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseResponse {
    private Long id;
    private String name;
    private String code;
    private String department;
    private String instructor;
    private Integer credits;
    private Integer capacity;
    private Integer enrolledStudents;
    private String day;
    private LocalTime startTime;
    private LocalTime endTime;
}
