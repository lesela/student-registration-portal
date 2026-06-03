package com.saas.portal.mapper;

import com.saas.portal.dto.CourseResponse;
import com.saas.portal.model.Course;
import org.mapstruct.Mapper;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CourseMapper {
    CourseResponse toResponse(Course course);
    Course toEntity(CourseResponse response);
    List<CourseResponse> toResponseList(List<Course> courses);
}
