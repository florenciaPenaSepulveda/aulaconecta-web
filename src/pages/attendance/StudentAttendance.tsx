import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import PageHeader from "../../components/PageHeader";
import AttendanceMeter, { attendanceProgressClass, formatPercentage } from "../../components/AttendanceMeter";
import { EmptyState, ErrorState, Spinner } from "../../components/States";
import { ATTENDANCE_BY_STUDENT, GET_ALL_STUDENTS, UserDto } from "../../graphql/operations";

interface Row {
  totalAsist: number;
  totalAbsences: number;
  subject: { id: string; name: string; numberOfClasses: number; course: { nameCourse: string } };
}

const percentageOf = (present: number, absent: number): number =>
  present + absent ? Math.round((present / (present + absent)) * 1000) / 10 : 0;

const StudentAttendance = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const id = Number(studentId);

  const students = useQuery<{ getAllStudents: UserDto[] }>(GET_ALL_STUDENTS);
  const attendance = useQuery<{ attendanceByStudent: Row[] }>(ATTENDANCE_BY_STUDENT, {
    variables: { studentId: id },
    fetchPolicy: "network-only",
  });

  const student = students.data?.getAllStudents.find((item) => Number(item.id) === id);
  const rows = attendance.data?.attendanceByStudent ?? [];

  if (attendance.error || students.error) {
    return <ErrorState message="No se pudo cargar la asistencia del estudiante." />;
  }
  if ((students.loading && !students.data) || (attendance.loading && !attendance.data)) {
    return <Spinner />;
  }
  if (!student) {
    return <ErrorState message="El estudiante no existe o no está disponible." />;
  }

  const present = rows.reduce((sum, row) => sum + row.totalAsist, 0);
  const absent = rows.reduce((sum, row) => sum + row.totalAbsences, 0);
  const overall = percentageOf(present, absent);
  const courseName = rows[0]?.subject.course.nameCourse;

  return (
    <>
      <div className="mb-2 text-sm">
        <Link to="/asistencia" className="link link-hover text-base-content/70">
          Asistencia
        </Link>
        <span className="mx-2 text-base-content/40">/</span>
        <span className="text-neutral">
          {student.firstName} {student.lastName}
        </span>
      </div>
      <PageHeader
        title={`${student.firstName} ${student.lastName}`}
        subtitle={`RUT ${student.rut}${courseName ? ` · ${courseName}` : ""}`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="surface">
          <p className="text-sm text-base-content/70">Asistencia global</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{present + absent ? formatPercentage(overall) : "-"}</p>
          <progress className={`progress mt-2 w-full ${attendanceProgressClass(overall)}`} value={overall} max={100} />
        </div>
        <div className="surface">
          <p className="text-sm text-base-content/70">Asignaturas</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{rows.length}</p>
        </div>
        <div className="surface">
          <p className="text-sm text-base-content/70">Asistencias</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{present}</p>
        </div>
        <div className="surface">
          <p className="text-sm text-base-content/70">Ausencias</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{absent}</p>
        </div>
      </div>

      <section className="surface">
        <h2 className="section-title mb-3">Detalle por asignatura</h2>
        {rows.length === 0 ? (
          <EmptyState title="Sin asignaturas" description="El estudiante aún no está inscrito en ninguna asignatura." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-xs uppercase text-base-content/60">
                  <th>Asignatura</th>
                  <th className="text-center">Clases</th>
                  <th className="text-center">Asistencias</th>
                  <th className="text-center">Ausencias</th>
                  <th>Asistencia</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.subject.id} className="hover">
                    <td className="font-medium text-neutral">{row.subject.name}</td>
                    <td className="text-center">{row.totalAsist + row.totalAbsences}</td>
                    <td className="text-center">{row.totalAsist}</td>
                    <td className="text-center">{row.totalAbsences}</td>
                    <td>
                      <AttendanceMeter
                        percentage={percentageOf(row.totalAsist, row.totalAbsences)}
                        empty={!(row.totalAsist + row.totalAbsences)}
                      />
                    </td>
                    <td className="text-right">
                      <Link to={`/asignaturas/${row.subject.id}`} className="btn btn-ghost btn-xs whitespace-nowrap">
                        Ver asignatura
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
};

export default StudentAttendance;
