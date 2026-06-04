package com.saas.portal.controller;

import com.saas.portal.dto.RegistrationRequest;
import com.saas.portal.dto.RegistrationResponse;
import com.saas.portal.exception.BusinessException;
import com.saas.portal.security.UserPrincipal;
import com.saas.portal.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    @PostMapping
    public ResponseEntity<RegistrationResponse> registerCourse(
            @Valid @RequestBody RegistrationRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        if (request.getStudentId() == null) {
            if (currentUser == null) {
                throw new BusinessException("Student ID is missing and user is not authenticated.");
            }
            request.setStudentId(currentUser.getId());
        } else {
            boolean isAdmin = currentUser != null && currentUser.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin && currentUser != null && !currentUser.getId().equals(request.getStudentId())) {
                throw new BusinessException("Unauthorized: Cannot register courses for another student.");
            }
        }

        RegistrationResponse response = registrationService.registerCourse(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<RegistrationResponse>> getRegistrations(
            @PathVariable Long studentId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        boolean isAdmin = currentUser != null && currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && currentUser != null && !currentUser.getId().equals(studentId)) {
            throw new BusinessException("Unauthorized: Cannot view registrations for another student.");
        }

        List<RegistrationResponse> registrations = registrationService.getRegistrationsForStudent(studentId);
        return ResponseEntity.ok(registrations);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<RegistrationResponse>> getAllRegistrations() {
        List<RegistrationResponse> registrations = registrationService.getAllRegistrations();
        return ResponseEntity.ok(registrations);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> unregisterCourse(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        boolean isAdmin = currentUser != null && currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            // Students can only delete their own registrations — service will validate
        }
        registrationService.unregisterCourse(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/student/{studentId}/course/{courseId}")
    public ResponseEntity<Void> unregisterByCourse(
            @PathVariable Long studentId,
            @PathVariable Long courseId,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        boolean isAdmin = currentUser != null && currentUser.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && currentUser != null && !currentUser.getId().equals(studentId)) {
            throw new BusinessException("Unauthorized: Cannot modify registrations for another student.");
        }

        registrationService.unregisterByStudentAndCourse(studentId, courseId);
        return ResponseEntity.noContent().build();
    }
}
