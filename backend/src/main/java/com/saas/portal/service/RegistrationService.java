package com.saas.portal.service;

import com.saas.portal.dto.RegistrationRequest;
import com.saas.portal.dto.RegistrationResponse;
import com.saas.portal.exception.BusinessException;
import com.saas.portal.exception.ResourceNotFoundException;
import com.saas.portal.mapper.RegistrationMapper;
import com.saas.portal.model.Course;
import com.saas.portal.model.Registration;
import com.saas.portal.model.Student;
import com.saas.portal.repository.CourseRepository;
import com.saas.portal.repository.RegistrationRepository;
import com.saas.portal.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RegistrationService {

    public static final int MAX_CREDITS = 18;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private RegistrationMapper registrationMapper;

    @Transactional
    public RegistrationResponse registerCourse(RegistrationRequest request) {
        Long studentId = request.getStudentId();
        Long courseId = request.getCourseId();

        // 1. Check missing student/course
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + courseId));

        // 2. Check duplicate registrations
        if (registrationRepository.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw new BusinessException("You are already registered for this course (" + course.getCode() + ").");
        }

        // 3. Check course capacity
        if (course.getEnrolledStudents() >= course.getCapacity()) {
            throw new BusinessException("Registration failed. The course '" + course.getName() + "' is full.");
        }

        // 4. Check credit limit violation (disabled)
        int newTotalCredits = student.getTotalCredits() + course.getCredits();
        // if (newTotalCredits > MAX_CREDITS) {
        //     throw new BusinessException("Credit limit violation. Enrolling in '" + course.getName() + 
        //             "' (" + course.getCredits() + " credits) would bring your total to " + newTotalCredits + 
        //             " credits, exceeding the maximum limit of " + MAX_CREDITS + " credits.");
        // }

        // 5. Detect schedule conflicts
        List<Registration> currentRegistrations = registrationRepository.findByStudentId(studentId);
        for (Registration reg : currentRegistrations) {
            Course enrolledCourse = reg.getCourse();
            if (enrolledCourse.getDay().equalsIgnoreCase(course.getDay())) {
                // Check time overlap: max(start1, start2) < min(end1, end2)
                boolean overlap = course.getStartTime().isBefore(enrolledCourse.getEndTime()) && 
                                  course.getEndTime().isAfter(enrolledCourse.getStartTime());
                if (overlap) {
                    throw new BusinessException("Schedule conflict detected. '" + course.getName() + "' overlaps with '" + 
                            enrolledCourse.getName() + "' on " + course.getDay() + " (" + enrolledCourse.getStartTime() + " - " + enrolledCourse.getEndTime() + ").");
                }
            }
        }

        // 6. Complete registration
        course.setEnrolledStudents(course.getEnrolledStudents() + 1);
        student.setTotalCredits(newTotalCredits);
        courseRepository.save(course);
        studentRepository.save(student);

        Registration registration = Registration.builder()
                .student(student)
                .course(course)
                .registeredAt(LocalDateTime.now())
                .build();

        Registration saved = registrationRepository.save(registration);
        return registrationMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getRegistrationsForStudent(Long studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student not found with id: " + studentId);
        }
        List<Registration> registrations = registrationRepository.findByStudentId(studentId);
        return registrationMapper.toResponseList(registrations);
    }

    @Transactional
    public void unregisterCourse(Long registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found with id: " + registrationId));

        Student student = registration.getStudent();
        Course course = registration.getCourse();

        // Update counts
        student.setTotalCredits(Math.max(0, student.getTotalCredits() - course.getCredits()));
        course.setEnrolledStudents(Math.max(0, course.getEnrolledStudents() - 1));

        studentRepository.save(student);
        courseRepository.save(course);
        registrationRepository.delete(registration);
    }

    @Transactional
    public void unregisterByStudentAndCourse(Long studentId, Long courseId) {
        Registration registration = registrationRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("No registration found for student " + studentId + " in course " + courseId));

        Student student = registration.getStudent();
        Course course = registration.getCourse();

        student.setTotalCredits(Math.max(0, student.getTotalCredits() - course.getCredits()));
        course.setEnrolledStudents(Math.max(0, course.getEnrolledStudents() - 1));

        studentRepository.save(student);
        courseRepository.save(course);
        registrationRepository.delete(registration);
    }
}
