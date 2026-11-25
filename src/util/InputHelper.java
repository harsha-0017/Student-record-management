package util;

import java.util.Scanner;

public class InputHelper {
    private final Scanner scanner;

    public InputHelper(Scanner scanner) {
        if (scanner == null) {
            throw new IllegalArgumentException("Scanner cannot be null.");
        }
        this.scanner = scanner;
    }

    public int readInt(String prompt) {
        while (true) {
            System.out.print(prompt);
            String input = readLine();
            try {
                return Integer.parseInt(input.trim());
            } catch (NumberFormatException exception) {
                System.out.println("Please enter a valid whole number.");
            }
        }
    }

    public int readIntInRange(String prompt, int minimum, int maximum) {
        while (true) {
            int value = readInt(prompt);
            if (value >= minimum && value <= maximum) {
                return value;
            }
            System.out.println("Enter a number between " + minimum + " and " + maximum + ".");
        }
    }

    public double readDoubleInRange(String prompt, double minimum, double maximum) {
        while (true) {
            System.out.print(prompt);
            String input = readLine();
            try {
                double value = Double.parseDouble(input.trim());
                if (!Double.isNaN(value) && !Double.isInfinite(value)
                        && value >= minimum && value <= maximum) {
                    return value;
                }
            } catch (NumberFormatException exception) {
                // Report invalid numeric input below.
            }
            System.out.println("Enter a number between " + minimum + " and " + maximum + ".");
        }
    }

    public String readText(String prompt) {
        while (true) {
            System.out.print(prompt);
            String value = readLine().trim();
            if (!value.isEmpty()) {
                return value;
            }
            System.out.println("Input cannot be empty.");
        }
    }

    private String readLine() {
        if (!scanner.hasNextLine()) {
            throw new IllegalStateException("No more input is available.");
        }
        return scanner.nextLine();
    }
}
