package com.saas.portal.config;

import com.saas.portal.model.Course;
import com.saas.portal.model.Student;
import com.saas.portal.repository.CourseRepository;
import com.saas.portal.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        seedCourses();
        seedStudents();
    }

    private void seedCourses() {
        if (courseRepository.count() > 0) {
            logger.info("Courses database already seeded.");
            return;
        }

        List<Course> courses = Arrays.asList(
                Course.builder()
                        .name("Introduction to Computer Science")
                        .code("CS-101")
                        .department("Computer Science")
                        .instructor("Dr. Alan Turing")
                        .credits(4)
                        .capacity(30)
                        .enrolledStudents(0)
                        .day("MONDAY")
                        .startTime(LocalTime.of(10, 0))
                        .endTime(LocalTime.of(12, 0))
                        .build(),
                Course.builder()
                        .name("Data Structures and Algorithms")
                        .code("CS-201")
                        .department("Computer Science")
                        .instructor("Dr. Grace Hopper")
                        .credits(4)
                        .capacity(25)
                        .enrolledStudents(0)
                        .day("TUESDAY")
                        .startTime(LocalTime.of(13, 0))
                        .endTime(LocalTime.of(15, 0))
                        .build(),
                Course.builder()
                        .name("Advanced Software Architecture")
                        .code("CS-301")
                        .department("Computer Science")
                        .instructor("Dr. Martin Fowler")
                        .credits(3)
                        .capacity(20)
                        .enrolledStudents(0)
                        .day("MONDAY")
                        .startTime(LocalTime.of(11, 0)) // Overlaps with CS-101 (10:00-12:00) on Monday!
                        .endTime(LocalTime.of(13, 0))
                        .build(),
                Course.builder()
                        .name("User Experience & UI Design")
                        .code("DES-102")
                        .department("Design")
                        .instructor("Prof. Dieter Rams")
                        .credits(3)
                        .capacity(15)
                        .enrolledStudents(0)
                        .day("WEDNESDAY")
                        .startTime(LocalTime.of(9, 0))
                        .endTime(LocalTime.of(11, 30))
                        .build(),
                Course.builder()
                        .name("SaaS Entrepreneurship & Strategy")
                        .code("BUS-210")
                        .department("Business")
                        .instructor("Prof. Peter Drucker")
                        .credits(3)
                        .capacity(40)
                        .enrolledStudents(0)
                        .day("THURSDAY")
                        .startTime(LocalTime.of(14, 0))
                        .endTime(LocalTime.of(16, 0))
                        .build(),
                Course.builder()
                        .name("Quantum Computing Foundations")
                        .code("PHY-350")
                        .department("Physics")
                        .instructor("Dr. Richard Feynman")
                        .credits(4)
                        .capacity(12)
                        .enrolledStudents(0)
                        .day("FRIDAY")
                        .startTime(LocalTime.of(10, 0))
                        .endTime(LocalTime.of(12, 30))
                        .build(),
                Course.builder()
                        .name("Linear Algebra for AI")
                        .code("MATH-202")
                        .department("Mathematics")
                        .instructor("Dr. Gilbert Strang")
                        .credits(3)
                        .capacity(50)
                        .enrolledStudents(0)
                        .day("TUESDAY")
                        .startTime(LocalTime.of(10, 0))
                        .endTime(LocalTime.of(12, 0))
                        .build(),
                Course.builder()
                        .name("Artificial Intelligence & Neural Networks")
                        .code("CS-420")
                        .department("Computer Science")
                        .instructor("Dr. Yann LeCun")
                        .credits(4)
                        .capacity(30)
                        .enrolledStudents(0)
                        .day("THURSDAY")
                        .startTime(LocalTime.of(10, 0))
                        .endTime(LocalTime.of(12, 0))
                        .build(),
                Course.builder()
                        .name("Interactive Motion & Prototyping")
                        .code("DES-301")
                        .department("Design")
                        .instructor("Prof. John Maeda")
                        .credits(3)
                        .capacity(18)
                        .enrolledStudents(0)
                        .day("WEDNESDAY")
                        .startTime(LocalTime.of(14, 0))
                        .endTime(LocalTime.of(16, 0))
                        .build(),
                Course.builder()
                        .name("Modern Product Management")
                        .code("BUS-101")
                        .department("Business")
                        .instructor("Prof. Clay Christensen")
                        .credits(3)
                        .capacity(35)
                        .enrolledStudents(0)
                        .day("FRIDAY")
                        .startTime(LocalTime.of(14, 0))
                        .endTime(LocalTime.of(16, 0))
                        .build()
        );

        courseRepository.saveAll(courses);
        logger.info("Successfully seeded 10 premium courses.");
    }

    private void seedStudents() {
        if (studentRepository.count() > 0) {
            logger.info("Students database already seeded.");
            return;
        }

        Student admin = Student.builder()
                .name("Admin")
                .email("admin@portal.edu")
                .password(passwordEncoder.encode("admin123"))
                .totalCredits(0)
                .role("ADMIN")
                .build();

        Student student1 = Student.builder()
                .name("Lesela")
                .email("lesela@university.edu")
                .password(passwordEncoder.encode("password"))
                .totalCredits(0)
                .role("STUDENT")
                .build();

        studentRepository.save(admin);
        studentRepository.save(student1);
        logger.info("Seeded admin account: admin@portal.edu / admin123");
        logger.info("Seeded student account: lesela@university.edu / password");
    }
}
