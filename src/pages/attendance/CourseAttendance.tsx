import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import PageHeader from "../../components/PageHeader";
import AttendanceMeter from "../../components/AttendanceMeter";
import { EmptyState, ErrorState, Spinner } from "../../components/States";
import { COURSE_ATTENDANCE_SUMMARIES, CourseSummaryDto } from "../../graphql/operations";

const CourseAttendance = () => {
  const { data, loading, error } = useQuery<{ courseAttendanceSummaries: CourseSummaryDto[] }>(
    COURSE_ATTENDANCE_SUMMARIES,
    { fetchPolicy: "network-only" },
  );
  const courses = data?.courseAttendanceSummaries ?? [];

  return (
    <>
      <PageHeader
        title="Asistencia por curso"
        subtitle="Elige un curso para ver su detalle por asignatura y por estudiante"
      />

      {error ? (
        <ErrorState message="No se pudo cargar el resumen de asistencia." />
      ) : loading && courses.length === 0 ? (
        <Spinner />
      ) : courses.length === 0 ? (
        <EmptyState title="No hay cursos registrados" description="Crea un curso para ver su asistencia." />
      ) : (
        <section className="surface">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-xs uppercase text-base-content/60">
                  <th>Curso</th>
                  <th className="text-center">Estudiantes</th>
                  <th className="text-center">Asignaturas</th>
                  <th className="text-center">Clases registradas</th>
                  <th>Asistencia global</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {courses.map((item) => (
                  <tr key={item.course.id} className="hover">
                    <td className="font-medium text-neutral">{item.course.nameCourse}</td>
                    <td className="text-center">{item.students}</td>
                    <td className="text-center">{item.subjects.length}</td>
                    <td className="text-center">{item.classesHeld}</td>
                    <td>
                      <AttendanceMeter percentage={item.percentage} empty={!(item.totalAsist + item.totalAbsences)} />
                    </td>
                    <td className="text-right">
                      <Link to={`/asistencia/cursos/${item.course.id}`} className="btn btn-outline btn-primary btn-sm">
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
};

export default CourseAttendance;
