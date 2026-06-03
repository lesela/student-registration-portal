package com.saas.portal.controller;

import com.saas.portal.dto.RegisterRequest;
import com.saas.portal.dto.StudentResponse;
import com.saas.portal.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private AuthService authService;

    @PostMapping
    public ResponseEntity<StudentResponse> createStudent(@Valid @RequestBody RegisterRequest registerRequest) {
        // Allows creating a student directly
        StudentResponse student = authService.register(registerRequest).getStudent();
        return ResponseEntity.ok(student);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable Long id) {
        StudentResponse student = authService.getStudentById(id);
        return ResponseEntity.ok(student);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody RegisterRequest updateRequest) {
        StudentResponse updated = authService.updateStudentProfile(id, updateRequest.getName(), updateRequest.getEmail());
        return ResponseEntity.ok(updated);
    }
}
