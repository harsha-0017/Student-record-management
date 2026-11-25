package model;

public class Student extends Person {
    private int rollNo;
    private String course;
    private double marks;

    public Student(String name, int age, String email, int rollNo, String course, double marks) {
        super(name, age, email);
        setRollNo(rollNo);
        setCourse(course);
        setMarks(marks);
    }

    public int getRollNo() {
        return rollNo;
    }

    public void setRollNo(int rollNo) {
        if (rollNo <= 0) {
            throw new IllegalArgumentException("Roll number must be greater than zero.");
        }
        this.rollNo = rollNo;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        if (course == null || course.trim().isEmpty()) {
            throw new IllegalArgumentException("Course cannot be empty.");
        }
        this.course = course.trim();
    }

    public double getMarks() {
        return marks;
    }

    public void setMarks(double marks) {
        if (Double.isNaN(marks) || Double.isInfinite(marks) || marks < 0 || marks > 100) {
            throw new IllegalArgumentException("Marks must be between 0 and 100.");
        }
        this.marks = marks;
    }

    @Override
    public void displayDetails() {
        super.displayDetails();
        System.out.println("Roll No: " + rollNo);
        System.out.println("Course: " + course);
        System.out.println("Marks: " + marks);
    }
}
