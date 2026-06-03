package com.saas.portal.service;

import com.saas.portal.dto.CourseResponse;
import com.saas.portal.exception.ResourceNotFoundException;
import com.saas.portal.mapper.CourseMapper;
import com.saas.portal.model.Course;
import com.saas.portal.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CourseMapper courseMapper;

    @Transactional(readOnly = true)
    public List<CourseResponse> getAllCourses(String query, String department, Integer credits, boolean availableOnly) {
        // Normalize empty filters
        String q = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String dept = (department != null && !department.trim().isEmpty() && !department.equalsIgnoreCase("All")) ? department.trim() : null;

        List<Course> courses = courseRepository.searchCourses(q, dept, credits, availableOnly);
        return courseMapper.toResponseList(courses);
    }

    @Transactional(readOnly = true)
    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        return courseMapper.toResponse(course);
    }
}
