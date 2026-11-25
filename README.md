# Student Record Management System

A student record mini-project with a Java console app and a responsive, browser-based dashboard. Both provide add, view, search, update, and delete operations.

## Web interface

Run the local preview with Node.js (no packages required):

```text
node serve.js
```

Then visit `http://localhost:8000`.

The web app stores records in the current browser's local storage. Records are not uploaded or synchronized between browsers or devices. Duplicate roll numbers are allowed; editing or deleting a row applies to all records with that roll number. The table can be searched and exported to CSV.

### Deploy

The static website is ready for Netlify: connect the project repository and use the included `netlify.toml`, or manually deploy the contents of `web` as the publish directory. The hosting account and repository connection are not configured in this workspace, so the site still needs to be published from an account you control.

## Java console app

## Requirements

- Java Development Kit (JDK) 8 or later

## Compile and run

From the project directory:

```powershell
New-Item -ItemType Directory -Force out
javac -d out src/model/Person.java src/model/Student.java src/exception/StudentNotFoundException.java src/service/RecordService.java src/service/StudentService.java src/util/InputHelper.java src/main/Main.java
java -cp out main.Main
```

Records are held in memory and are cleared when the application exits. Duplicate roll numbers are allowed. Searching returns every match; updating or deleting operates on all records with the selected roll number. Roll numbers cannot be changed during an update.

The application validates numeric input and required text fields. Searching, updating, or deleting a roll number that does not exist reports a `StudentNotFoundException`.

## Packages

- `model` — `Person` and `Student`
- `service` — the record interface and student record operations
- `exception` — the missing-student exception
- `util` — validated console input
- `main` — the interactive menu and program entry point
