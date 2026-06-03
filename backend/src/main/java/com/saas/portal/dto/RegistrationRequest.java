package com.saas.portal.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegistrationRequest {
    private Long studentId; // Can be optional and resolved from JWT

    @NotNull(message = "Course ID is required")
    private Long courseId;
}
