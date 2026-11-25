"use strict";

const STORAGE_KEY = "campusdesk-student-records-v1";

const elements = {
  totalStudents: document.querySelector("#total-students"),
  totalCourses: document.querySelector("#total-courses"),
  averageMarks: document.querySelector("#average-marks"),
  navCount: document.querySelector("#nav-count"),
  recordCount: document.querySelector("#record-count"),
  tableFooter: document.querySelector("#table-footer-copy"),
  studentRows: document.querySelector("#student-rows"),
  emptyState: document.querySelector("#empty-state"),
  emptyTitle: document.querySelector("#empty-title"),
  emptyDescription: document.querySelector("#empty-description"),
  search: document.querySelector("#search-input"),
  dialog: document.querySelector("#student-dialog"),
  form: document.querySelector("#student-form"),
  dialogTitle: document.querySelector("#dialog-title"),
  dialogKicker: document.querySelector("#dialog-kicker"),
  dialogDescription: document.querySelector("#dialog-description"),
  dialogNote: document.querySelector("#dialog-note"),
  rollHint: document.querySelector("#roll-hint"),
  saveLabel: document.querySelector("#save-student-button span"),
  toastRegion: document.querySelector("#toast-region"),
  storageWarning: document.querySelector("#storage-warning")
};

let storageIsValid = true;
let students = readStudents();
let activeRollNo = null;
let toastTimeout;

function readStudents() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === null) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Saved student records are not a list.");
    return parsed.map(validateStudent);
  } catch (error) {
    storageIsValid = false;
    console.error("Could not read saved student records:", error);
    return [];
  }
}

function validateStudent(student) {
  if (!student || typeof student !== "object") throw new Error("A saved student record is invalid.");

  const rollNo = Number(student.rollNo);
  const age = Number(student.age);
  const marks = Number(student.marks);
  const name = typeof student.name === "string" ? student.name.trim() : "";
  const email = typeof student.email === "string" ? student.email.trim() : "";
  const course = typeof student.course === "string" ? student.course.trim() : "";

  if (!Number.isSafeInteger(rollNo) || rollNo < 1
      || !Number.isInteger(age) || age < 1 || age > 120
      || !Number.isFinite(marks) || marks < 0 || marks > 100
      || !name || !isValidEmail(email) || !course) {
    throw new Error("A saved student record contains invalid details.");
  }

  return { rollNo, name, age, email, course, marks };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function persist(nextStudents) {
  if (!storageIsValid) {
    showToast("Clear invalid saved data before making changes.", true);
    return false;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStudents));
    students = nextStudents;
    render();
    return true;
  } catch (error) {
    console.error("Could not save student records:", error);
    showToast("Could not save changes in this browser. Check available storage.", true);
    return false;
  }
}

function render() {
  const query = elements.search.value.trim().toLocaleLowerCase();
  const filtered = students
    .filter((student) => {
      const searchable = `${student.name} ${student.email} ${student.course} ${student.rollNo}`.toLocaleLowerCase();
      return searchable.includes(query);
    })
    .slice()
    .sort((a, b) => a.rollNo - b.rollNo || a.name.localeCompare(b.name));

  elements.totalStudents.textContent = String(students.length);
  elements.navCount.textContent = String(students.length);
  elements.recordCount.textContent = `${students.length} ${students.length === 1 ? "record" : "records"}`;

  const courses = new Set(students.map((student) => student.course.toLocaleLowerCase()));
  elements.totalCourses.textContent = String(courses.size);
  const average = students.length === 0
    ? 0
    : students.reduce((sum, student) => sum + student.marks, 0) / students.length;
  elements.averageMarks.textContent = average.toFixed(1);
  elements.tableFooter.textContent = query
    ? `Showing ${filtered.length} of ${students.length} students`
    : `Showing ${students.length} ${students.length === 1 ? "student" : "students"}`;

  const rollCounts = new Map();
  for (const student of students) {
    rollCounts.set(student.rollNo, (rollCounts.get(student.rollNo) || 0) + 1);
  }

  elements.studentRows.replaceChildren(...filtered.map((student) => createStudentRow(student, rollCounts)));
  const shouldShowEmpty = filtered.length === 0;
  elements.emptyState.hidden = !shouldShowEmpty;
  if (students.length > 0 && query && shouldShowEmpty) {
    elements.emptyTitle.textContent = "No matching students";
    elements.emptyDescription.textContent = "Try another name, email, course, or roll number.";
  } else {
    elements.emptyTitle.textContent = "Your student list starts here";
    elements.emptyDescription.textContent = "Add your first student to start organizing your records.";
  }
  elements.storageWarning.hidden = storageIsValid;
  document.querySelector("#add-student-button").disabled = !storageIsValid;
  document.querySelector("#empty-add-button").disabled = !storageIsValid;
  document.querySelector("#export-button").disabled = students.length === 0;
}

function createStudentRow(student, rollCounts) {
  const row = document.createElement("tr");
  const studentCell = document.createElement("td");
  const profile = document.createElement("div");
  profile.className = "student-cell";

  const avatar = document.createElement("span");
  avatar.className = "student-avatar";
  avatar.textContent = initials(student.name);

  const copy = document.createElement("span");
  copy.className = "student-copy";
  const name = document.createElement("strong");
  name.className = "student-name";
  name.textContent = student.name;
  const email = document.createElement("span");
  email.className = "student-email";
  email.textContent = student.email;
  copy.append(name, email);
  profile.append(avatar, copy);
  studentCell.append(profile);

  const rollCell = document.createElement("td");
  const rollPill = document.createElement("span");
  rollPill.className = "roll-pill";
  rollPill.textContent = `#${student.rollNo}`;
  if (rollCounts.get(student.rollNo) > 1) {
    const duplicate = document.createElement("span");
    duplicate.className = "duplicate-indicator";
    duplicate.textContent = `×${rollCounts.get(student.rollNo)}`;
    duplicate.title = "Multiple records share this roll number";
    rollPill.append(duplicate);
  }
  rollCell.append(rollPill);

  const courseCell = document.createElement("td");
  const course = document.createElement("span");
  course.className = "course-pill";
  course.textContent = student.course;
  course.title = student.course;
  courseCell.append(course);

  const ageCell = document.createElement("td");
  ageCell.textContent = String(student.age);

  const marksCell = document.createElement("td");
  marksCell.className = "marks-cell";
  const marksTop = document.createElement("div");
  marksTop.className = "marks-top";
  const marksText = document.createElement("span");
  marksText.textContent = `${student.marks.toFixed(1)}%`;
  const bar = document.createElement("span");
  bar.className = "marks-bar";
  const barFill = document.createElement("span");
  barFill.style.width = `${student.marks}%`;
  if (student.marks < 40) barFill.classList.add("marks-low");
  else if (student.marks < 60) barFill.classList.add("marks-mid");
  bar.append(barFill);
  marksTop.append(marksText, bar);
  marksCell.append(marksTop);

  const actionsCell = document.createElement("td");
  const actions = document.createElement("div");
  actions.className = "row-actions";
  const edit = createActionButton("Edit all with this roll number", "edit", student.rollNo, editIcon());
  edit.disabled = !storageIsValid;
  const remove = createActionButton("Delete all with this roll number", "delete", student.rollNo, deleteIcon());
  remove.disabled = !storageIsValid;
  actions.append(edit, remove);
  actionsCell.append(actions);

  row.append(studentCell, rollCell, courseCell, ageCell, marksCell, actionsCell);
  return row;
}

function createActionButton(label, action, rollNo, icon) {
  const button = document.createElement("button");
  button.className = `icon-button${action === "delete" ? " delete-button" : ""}`;
  button.type = "button";
  button.setAttribute("aria-label", label);
  button.title = label;
  button.dataset.action = action;
  button.dataset.rollNo = String(rollNo);
  button.innerHTML = icon;
  return button;
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toLocaleUpperCase()).join("");
}

function editIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.3-.9L19 8.4a2.1 2.1 0 0 0-3-3L5.3 16.1 4 20Z"/></svg>';
}

function deleteIcon() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M10 11v6m4-6v6M6.5 7l.8 13h9.4l.8-13M9 7V4h6v3"/></svg>';
}

function openDialog(student) {
  if (!storageIsValid) {
    showToast("Clear invalid saved data before making changes.", true);
    return;
  }

  elements.form.reset();
  clearFormErrors();
  activeRollNo = student ? student.rollNo : null;
  const editing = student !== null;

  elements.dialogTitle.textContent = editing ? "Update students" : "Add a student";
  elements.dialogKicker.textContent = editing ? "UPDATE RECORDS" : "NEW RECORD";
  elements.dialogDescription.textContent = editing
    ? "Update every record that uses this roll number."
    : "Enter the student details below.";
  elements.saveLabel.textContent = editing ? "Update matching records" : "Save student";
  elements.rollHint.textContent = editing ? "Roll number stays the same during an update." : "Duplicates are allowed.";
  elements.dialogNote.hidden = !editing;
  elements.dialogNote.textContent = editing
    ? `${students.filter((item) => item.rollNo === student.rollNo).length} record(s) share roll number ${student.rollNo}; all will be updated.`
    : "";

  const form = elements.form.elements;
  if (editing) {
    form.namedItem("rollNo").value = String(student.rollNo);
    form.namedItem("rollNo").readOnly = true;
    form.namedItem("name").value = student.name;
    form.namedItem("age").value = String(student.age);
    form.namedItem("email").value = student.email;
    form.namedItem("course").value = student.course;
    form.namedItem("marks").value = String(student.marks);
  } else {
    form.namedItem("rollNo").readOnly = false;
  }

  elements.dialog.showModal();
  form.namedItem("name").focus();
}

function clearFormErrors() {
  for (const error of elements.form.querySelectorAll(".field-error")) error.textContent = "";
  for (const input of elements.form.querySelectorAll("input")) input.removeAttribute("aria-invalid");
}

function setFormError(fieldName, message) {
  const input = elements.form.elements.namedItem(fieldName);
  const error = elements.form.querySelector(`[data-error="${fieldName}"]`);
  input.setAttribute("aria-invalid", "true");
  error.textContent = message;
  input.focus();
}

function onSubmit(event) {
  event.preventDefault();
  clearFormErrors();
  const form = elements.form.elements;
  const rollNo = Number(form.namedItem("rollNo").value);
  const age = Number(form.namedItem("age").value);
  const marks = Number(form.namedItem("marks").value);
  const student = {
    rollNo,
    name: form.namedItem("name").value.trim(),
    age,
    email: form.namedItem("email").value.trim(),
    course: form.namedItem("course").value.trim(),
    marks
  };

  if (!Number.isSafeInteger(student.rollNo) || student.rollNo < 1) {
    setFormError("rollNo", "Enter a whole number greater than zero.");
    return;
  }
  if (!student.name) {
    setFormError("name", "Enter the student's name.");
    return;
  }
  if (!Number.isInteger(student.age) || student.age < 1 || student.age > 120) {
    setFormError("age", "Age must be a whole number from 1 to 120.");
    return;
  }
  if (!isValidEmail(student.email)) {
    setFormError("email", "Enter a valid email address.");
    return;
  }
  if (!student.course) {
    setFormError("course", "Enter a course name.");
    return;
  }
  if (!Number.isFinite(student.marks) || student.marks < 0 || student.marks > 100) {
    setFormError("marks", "Marks must be a number from 0 to 100.");
    return;
  }

  let nextStudents;
  let message;
  if (activeRollNo === null) {
    nextStudents = students.concat(student);
    message = "Student added successfully.";
  } else {
    const matchCount = students.filter((item) => item.rollNo === activeRollNo).length;
    nextStudents = students.map((item) => item.rollNo === activeRollNo ? student : item);
    message = `Updated ${matchCount} matching record(s).`;
  }

  if (persist(nextStudents)) {
    elements.dialog.close();
    showToast(message);
  }
}

function deleteByRollNo(rollNo) {
  const matches = students.filter((student) => student.rollNo === rollNo);
  if (matches.length === 0) {
    showToast("No student records match that roll number.", true);
    return;
  }
  const recordWord = matches.length === 1 ? "record" : "records";
  if (!window.confirm(`Delete all ${matches.length} ${recordWord} with roll number ${rollNo}? This cannot be undone.`)) {
    return;
  }

  const nextStudents = students.filter((student) => student.rollNo !== rollNo);
  if (persist(nextStudents)) showToast(`Deleted ${matches.length} matching ${recordWord}.`);
}

function exportCsv() {
  if (students.length === 0) {
    showToast("There are no student records to export.", true);
    return;
  }

  const headers = ["Roll Number", "Name", "Age", "Email", "Course", "Marks"];
  const escapeCsv = (value) => `"${String(value).replace(/"/g, '""')}"`;
  const rows = students.map((student) => [
    student.rollNo, student.name, student.age, student.email, student.course, student.marks
  ].map(escapeCsv).join(","));
  const csv = [headers.map(escapeCsv).join(","), ...rows].join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "student-records.csv";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("Student records exported as CSV.");
}

function showToast(message, isError) {
  window.clearTimeout(toastTimeout);
  elements.toastRegion.replaceChildren();
  const toast = document.createElement("div");
  toast.className = `toast${isError ? " error" : ""}`;
  const icon = document.createElement("span");
  icon.className = "toast-icon";
  icon.textContent = isError ? "!" : "✓";
  const text = document.createElement("span");
  text.textContent = message;
  toast.append(icon, text);
  elements.toastRegion.append(toast);
  toastTimeout = window.setTimeout(() => toast.remove(), 3800);
}

function clearInvalidStorage() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    storageIsValid = true;
    students = [];
    elements.search.value = "";
    render();
    showToast("Saved data cleared. You can start fresh.");
  } catch (error) {
    console.error("Could not clear invalid saved records:", error);
    showToast("Could not clear browser data. Check your browser storage settings.", true);
  }
}

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat(undefined, {
  weekday: "short", month: "short", day: "numeric"
}).format(new Date());

document.querySelector("#add-student-button").addEventListener("click", () => openDialog(null));
document.querySelector("#empty-add-button").addEventListener("click", () => openDialog(null));
document.querySelector("#close-dialog-button").addEventListener("click", () => elements.dialog.close());
document.querySelector("#cancel-dialog-button").addEventListener("click", () => elements.dialog.close());
document.querySelector("#export-button").addEventListener("click", exportCsv);
document.querySelector("#clear-storage-button").addEventListener("click", clearInvalidStorage);
elements.form.addEventListener("submit", onSubmit);
elements.search.addEventListener("input", render);

elements.studentRows.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const rollNo = Number(button.dataset.rollNo);
  if (button.dataset.action === "delete") {
    deleteByRollNo(rollNo);
  } else {
    const student = students.find((item) => item.rollNo === rollNo);
    if (student) openDialog(student);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !elements.dialog.open && !/input|textarea/i.test(document.activeElement.tagName)) {
    event.preventDefault();
    elements.search.focus();
  }
});

render();
