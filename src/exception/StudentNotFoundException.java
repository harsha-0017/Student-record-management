package exception;

public class StudentNotFoundException extends Exception {
    public StudentNotFoundException(int rollNo) {
        super("No student found with roll number " + rollNo + ".");
    }
}
