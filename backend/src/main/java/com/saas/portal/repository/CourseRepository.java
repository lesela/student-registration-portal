package com.saas.portal.repository;

import com.saas.portal.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCode(String code);

    @Query("SELECT c FROM Course c WHERE " +
           "(:query IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.code) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.instructor) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:department IS NULL OR LOWER(c.department) = LOWER(:department)) AND " +
           "(:credits IS NULL OR c.credits = :credits) AND " +
           "(:availableOnly = false OR c.enrolledStudents < c.capacity)")
    List<Course> searchCourses(
            @Param("query") String query,
            @Param("department") String department,
            @Param("credits") Integer credits,
            @Param("availableOnly") boolean availableOnly
    );
}
