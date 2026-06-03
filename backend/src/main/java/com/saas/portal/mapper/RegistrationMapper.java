package com.saas.portal.mapper;

import com.saas.portal.dto.RegistrationResponse;
import com.saas.portal.model.Registration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.util.List;

@Mapper(componentModel = "spring", uses = {CourseMapper.class})
public interface RegistrationMapper {

    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "courseId", source = "course.id")
    @Mapping(target = "courseCode", source = "course.code")
    @Mapping(target = "courseName", source = "course.name")
    @Mapping(target = "course", source = "course")
    RegistrationResponse toResponse(Registration registration);

    List<RegistrationResponse> toResponseList(List<Registration> registrations);
}
