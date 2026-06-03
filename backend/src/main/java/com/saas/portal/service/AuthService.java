package com.saas.portal.service;

import com.saas.portal.dto.*;
import com.saas.portal.exception.BusinessException;
import com.saas.portal.exception.ResourceNotFoundException;
import com.saas.portal.mapper.StudentMapper;
import com.saas.portal.model.Student;
import com.saas.portal.repository.StudentRepository;
import com.saas.portal.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private StudentMapper studentMapper;

    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        if (studentRepository.existsByEmail(registerRequest.getEmail())) {
            throw new BusinessException("Email address already in use.");
        }

        Student student = Student.builder()
                .name(registerRequest.getName())
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .totalCredits(0)
                .build();

        Student savedStudent = studentRepository.save(student);

        // Auto authenticate after registration
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registerRequest.getEmail(),
                        registerRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(token)
                .student(studentMapper.toResponse(savedStudent))
                .build();
    }

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        Student student = studentRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return AuthResponse.builder()
                .token(token)
                .student(studentMapper.toResponse(student))
                .build();
    }

    @Transactional(readOnly = true)
    public StudentResponse getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
        return studentMapper.toResponse(student);
    }

    @Transactional
    public StudentResponse updateStudentProfile(Long id, String name, String email) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));

        if (!student.getEmail().equalsIgnoreCase(email) && studentRepository.existsByEmail(email)) {
            throw new BusinessException("Email address already in use.");
        }

        student.setName(name);
        student.setEmail(email);
        Student updated = studentRepository.save(student);
        return studentMapper.toResponse(updated);
    }
}
