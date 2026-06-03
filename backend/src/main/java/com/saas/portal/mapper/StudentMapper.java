package com.saas.portal.mapper;

import com.saas.portal.dto.StudentResponse;
import com.saas.portal.model.Student;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface StudentMapper {
    StudentResponse toResponse(Student student);
    Student toEntity(StudentResponse response);
}
