package main;

import exception.StudentNotFoundException;
import java.util.List;
import java.util.Scanner;
import model.Student;
import service.StudentService;
import util.InputHelper;

public class Main {
    public static void main(String[] args) {
        InputHelper input = new InputHelper(new Scanner(System.in));
        StudentService studentService = new StudentService();
        boolean running = true;

        while (running) {
            printMenu();
            int choice = input.readIntInRange("Enter choice: ", 1, 6);

            try {
                switch (choice) {
                    case 1:
                        addStudent(input, studentService);
                        break;
                    case 2:
                        viewAllStudents(studentService);
                        break;
                    case 3:
                        searchStudent(input, studentService);
                        break;
                    case 4:
                        updateStudent(input, studentService);
                        break;
                    case 5:
                        deleteStudent(input, studentService);
                        break;
                    case 6:
                        running = false;
                        System.out.println("Goodbye.");
                        break;
                    default:
                        break;
                }
            } catch (StudentNotFoundException | IllegalArgumentException exception) {
                System.out.println(exception.getMessage());
            }
        }
    }

    private static void printMenu() {
        System.out.println();
        System.out.println("===== Student Record Management =====");
        System.out.println("1. Add Student");
        System.out.println("2. View All Students");
        System.out.println("3. Search by Roll No");
        System.out.println("4. Update Student");
        System.out.println("5. Delete Student");
        System.out.println("6. Exit");
    }

    private static void addStudent(InputHelper input, StudentService service) {
        Student student = readStudent(input, input.readIntInRange("Roll No: ", 1, Integer.MAX_VALUE));
        service.addStudent(student);
        System.out.println("Student added successfully.");
    }

    private static void viewAllStudents(StudentService service) {
        List<Student> students = service.viewAll();
        if (students.isEmpty()) {
            System.out.println("No student records found.");
            return;
        }
        for (Student student : students) {
            System.out.println();
            student.displayDetails();
        }
    }

    private static void searchStudent(InputHelper input, StudentService service)
            throws StudentNotFoundException {
        int rollNo = input.readIntInRange("Roll No: ", 1, Integer.MAX_VALUE);
        List<Student> matches = service.searchByRoll(rollNo);
        for (Student student : matches) {
            System.out.println();
            student.displayDetails();
        }
    }

    private static void updateStudent(InputHelper input, StudentService service)
            throws StudentNotFoundException {
        int rollNo = input.readIntInRange("Roll No to update: ", 1, Integer.MAX_VALUE);
        service.searchByRoll(rollNo);
        Student updatedStudent = readStudent(input, rollNo);
        int count = service.updateStudent(rollNo, updatedStudent);
        System.out.println("Updated " + count + " matching record(s).");
    }

    private static void deleteStudent(InputHelper input, StudentService service)
            throws StudentNotFoundException {
        int rollNo = input.readIntInRange("Roll No to delete: ", 1, Integer.MAX_VALUE);
        int count = service.deleteStudent(rollNo);
        System.out.println("Deleted " + count + " matching record(s).");
    }

    private static Student readStudent(InputHelper input, int rollNo) {
        String name = input.readText("Name: ");
        int age = input.readIntInRange("Age: ", 1, 120);
        String email = input.readText("Email: ");
        String course = input.readText("Course: ");
        double marks = input.readDoubleInRange("Marks (0-100): ", 0, 100);
        return new Student(name, age, email, rollNo, course, marks);
    }
}
