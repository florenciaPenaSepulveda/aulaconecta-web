import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPass from "./pages/auth/ForgotPass";
import ChangePassword from "./pages/auth/ChangePassword";
import Dashboard from "./pages/Dashboard";
import Subjects from "./pages/subjects/Subjects";
import SubjectDetail from "./pages/subjects/SubjectDetail";
import Grades from "./pages/subjects/Grades";
import CourseAttendance from "./pages/attendance/CourseAttendance";
import AttendanceCalendar from "./pages/attendance/AttendanceCalendar";
import CourseDetail from "./pages/attendance/CourseDetail";
import StudentAttendance from "./pages/attendance/StudentAttendance";
import Users from "./pages/students/Users";
import Courses from "./pages/courses/Courses";
import Notices from "./pages/notices/Notices";
import Chat from "./pages/chat/Chat";
import Children from "./pages/children/Children";
import ChildDetail from "./pages/children/ChildDetail";

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/recuperar" element={<ForgotPass />} />
        <Route path="/cambiar-clave" element={<ChangePassword />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/inicio" element={<Dashboard />} />
          <Route path="/anuncios" element={<Notices />} />
          <Route path="/mensajes" element={<Chat />} />
        </Route>

        <Route element={<ProtectedRoute roles={["teacher", "admin"]} />}>
          <Route path="/asignaturas" element={<Subjects />} />
          <Route path="/asignaturas/:id" element={<SubjectDetail />} />
          <Route path="/asignaturas/:id/notas" element={<Grades />} />
          <Route path="/asignaturas/:id/calendario" element={<AttendanceCalendar />} />
          <Route path="/asistencia" element={<CourseAttendance />} />
          <Route path="/asistencia/cursos/:courseId" element={<CourseDetail />} />
          <Route path="/asistencia/estudiantes/:studentId" element={<StudentAttendance />} />
          <Route path="/usuarios" element={<Users />} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/cursos" element={<Courses />} />
        </Route>

        <Route element={<ProtectedRoute roles={["parents"]} />}>
          <Route path="/pupilos" element={<Children />} />
          <Route path="/pupilos/:id" element={<ChildDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
