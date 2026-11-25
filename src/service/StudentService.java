package service;

import exception.StudentNotFoundException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import model.Student;

public class StudentService implements RecordService {
    private final List<Student> students = new ArrayList<Student>();

    @Override
    public void addStudent(Student student) {
        if (student == null) {
            throw new IllegalArgumentException("Student cannot be null.");
        }
        students.add(student);
    }

    @Override
    public List<Student> viewAll() {
        return new ArrayList<Student>(students);
    }

    @Override
    public List<Student> searchByRoll(int rollNo) throws StudentNotFoundException {
        List<Student> matches = new ArrayList<Student>();
        for (Student student : students) {
            if (student.getRollNo() == rollNo) {
                matches.add(student);
            }
        }
        if (matches.isEmpty()) {
            throw new StudentNotFoundException(rollNo);
        }
        return matches;
    }

    @Override
    public int updateStudent(int rollNo, Student updatedStudent) throws StudentNotFoundException {
        if (updatedStudent == null) {
            throw new IllegalArgumentException("Updated student cannot be null.");
        }
        if (updatedStudent.getRollNo() != rollNo) {
            throw new IllegalArgumentException("The roll number cannot be changed during an update.");
        }

        int updatedCount = 0;
        for (Student existingStudent : students) {
            if (existingStudent.getRollNo() == rollNo) {
                existingStudent.setName(updatedStudent.getName());
                existingStudent.setAge(updatedStudent.getAge());
                existingStudent.setEmail(updatedStudent.getEmail());
                existingStudent.setCourse(updatedStudent.getCourse());
                existingStudent.setMarks(updatedStudent.getMarks());
                updatedCount++;
            }
        }
        if (updatedCount == 0) {
            throw new StudentNotFoundException(rollNo);
        }
        return updatedCount;
    }

    @Override
    public int deleteStudent(int rollNo) throws StudentNotFoundException {
        int deletedCount = 0;
        Iterator<Student> iterator = students.iterator();
        while (iterator.hasNext()) {
            if (iterator.next().getRollNo() == rollNo) {
                iterator.remove();
                deletedCount++;
            }
        }
        if (deletedCount == 0) {
            throw new StudentNotFoundException(rollNo);
        }
        return deletedCount;
    }
}
