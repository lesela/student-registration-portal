package com.saas.portal.controller;

import com.saas.portal.dto.StudentResponse;
import com.saas.portal.model.Student;
import com.saas.portal.repository.StudentRepository;
import com.saas.portal.repository.RegistrationRepository;
import com.saas.portal.mapper.StudentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private StudentMapper studentMapper;

    @GetMapping("/students")
    public ResponseEntity<List<Map<String, Object>>> getAllStudents() {
        List<Student> students = studentRepository.findAll();
        List<Map<String, Object>> result = students.stream().map(s -> {
            long regCount = registrationRepository.findByStudentId(s.getId()).size();
            return Map.<String, Object>of(
                    "id", s.getId(),
                    "name", s.getName(),
                    "email", s.getEmail(),
                    "role", s.getRole(),
                    "registrationCount", regCount
            );
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        if (!studentRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        // Remove all registrations first
        registrationRepository.deleteAll(registrationRepository.findByStudentId(id));
        studentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
