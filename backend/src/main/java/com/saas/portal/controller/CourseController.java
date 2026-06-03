package com.saas.portal.controller;

import com.saas.portal.dto.CourseResponse;
import com.saas.portal.service.CourseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getCourses(
            @RequestParam(value = "query", required = false) String query,
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "credits", required = false) Integer credits,
            @RequestParam(value = "availableOnly", required = false, defaultValue = "false") boolean availableOnly) {
        List<CourseResponse> courses = courseService.getAllCourses(query, department, credits, availableOnly);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        CourseResponse course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }
}
