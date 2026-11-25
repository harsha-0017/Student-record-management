package service;

import exception.StudentNotFoundException;
import java.util.List;
import model.Student;

public interface RecordService {
    void addStudent(Student student);

    List<Student> viewAll();

    List<Student> searchByRoll(int rollNo) throws StudentNotFoundException;

    int updateStudent(int rollNo, Student updatedStudent) throws StudentNotFoundException;

    int deleteStudent(int rollNo) throws StudentNotFoundException;
}
