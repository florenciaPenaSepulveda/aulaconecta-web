export const course = { id: "1", nameCourse: "1° Básico A", level: "Basica" };

export const subject = {
  id: "10",
  name: "Matemática",
  numberOfClasses: 40,
  idTeacher: 1,
  course,
};

export const student = {
  id: "5",
  firstName: "Juan",
  lastName: "Pérez",
  rut: "44.444.444-4",
  email: "juan@test.cl",
  role: "Student",
  guardianId: 4,
};

export const guardian = {
  id: "4",
  firstName: "Paula",
  lastName: "Apoderada",
  rut: "33.333.333-3",
  email: "paula@test.cl",
  role: "Parents",
  guardianId: null,
};

export const teacherUser = {
  id: "1",
  firstName: "Carlos",
  lastName: "Muñoz",
  rut: "22.222.222-2",
  email: "carlos@test.cl",
  role: "Teacher",
  guardianId: null,
};

export const notice = {
  id: 1,
  title: "Reunión de apoderados",
  description: "Viernes a las 18:30",
  imageUrl: null,
  createdAt: "2026-10-20T12:00:00.000Z",
};

export const studentSummary = {
  totalAsist: 18,
  totalAbsences: 2,
  percentage: 90,
  user: { id: "5", firstName: "Juan", lastName: "Pérez", rut: "44.444.444-4" },
};

export const lowStudentSummary = {
  totalAsist: 10,
  totalAbsences: 10,
  percentage: 50,
  user: { id: "6", firstName: "Sofía", lastName: "Rojas", rut: "55.555.555-5" },
};

export const subjectSummary = {
  subject: { id: "10", name: "Matemática", numberOfClasses: 40, course: { id: "1", nameCourse: "1° Básico A" } },
  students: 2,
  classesHeld: 20,
  totalAsist: 28,
  totalAbsences: 12,
  percentage: 70,
  studentsSummary: [studentSummary, lowStudentSummary],
};

export const courseSummary = {
  course: { id: "1", nameCourse: "1° Básico A", level: "Basica" },
  students: 2,
  classesHeld: 20,
  totalAsist: 28,
  totalAbsences: 12,
  percentage: 70,
  subjects: [subjectSummary],
  studentsSummary: [studentSummary, lowStudentSummary],
};

export const emptyCourseSummary = {
  course: { id: "2", nameCourse: "3° Básico B", level: "Basica" },
  students: 0,
  classesHeld: 0,
  totalAsist: 0,
  totalAbsences: 0,
  percentage: 0,
  subjects: [],
  studentsSummary: [],
};

export const calendar = {
  subject: { id: "10", name: "Matemática", numberOfClasses: 40, course: { id: "1", nameCourse: "1° Básico A" } },
  days: [
    { date: "2026-10-01", present: 1, absent: 1, percentage: 50 },
    { date: "2026-10-02", present: 1, absent: 0, percentage: 100 },
    { date: "2026-11-03", present: 1, absent: 0, percentage: 100 },
  ],
  students: [
    {
      totalAsist: 2,
      totalAbsences: 1,
      percentage: 66.7,
      marks: [
        { date: "2026-10-01", present: true },
        { date: "2026-10-02", present: false },
        { date: "2026-11-03", present: true },
      ],
      user: { id: "5", firstName: "Juan", lastName: "Pérez", rut: "44.444.444-4" },
    },
    {
      totalAsist: 0,
      totalAbsences: 1,
      percentage: 0,
      marks: [{ date: "2026-10-01", present: false }],
      user: { id: "6", firstName: "Sofía", lastName: "Rojas", rut: "55.555.555-5" },
    },
    {
      totalAsist: 0,
      totalAbsences: 0,
      percentage: 0,
      marks: [],
      user: { id: "7", firstName: "Diego", lastName: "Soto", rut: "66.666.666-6" },
    },
  ],
};
