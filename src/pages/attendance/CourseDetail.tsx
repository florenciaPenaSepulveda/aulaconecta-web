import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import PageHeader from "../../components/PageHeader";
import AttendanceMeter, { attendanceProgressClass, formatPercentage } from "../../components/AttendanceMeter";
import { EmptyState, ErrorState, Spinner } from "../../components/States";
import { COURSE_ATTENDANCE_SUMMARIES, CourseSummaryDto } from "../../graphql/operations";

export const ALERT_THRESHOLD = 75;

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { data, loading, error } = useQuery<{ courseAttendanceSummaries: CourseSummaryDto[] }>(
    COURSE_ATTENDANCE_SUMMARIES,
    { fetchPolicy: "network-only" },
  );
  const course = data?.courseAttendanceSummaries.find((item) => item.course.id === courseId);

  if (error) {
    return <ErrorState message="No se pudo cargar el resumen de asistencia." />;
  }
  if (loading && !data) {
    return <Spinner />;
  }
  if (!course) {
    return <ErrorState message="El curso no existe o no está disponible." />;
  }

  const atRisk = course.studentsSummary.filter((student) => student.percentage < ALERT_THRESHOLD);
  const hasRecords = course.totalAsist + course.totalAbsences > 0;

  return (
    <>
      <div className="mb-2 text-sm">
        <Link to="/asistencia" className="link link-hover text-base-content/70">
          Asistencia
        </Link>
        <span className="mx-2 text-base-content/40">/</span>
        <span className="text-neutral">{course.course.nameCourse}</span>
      </div>
      <PageHeader title={course.course.nameCourse} subtitle="Asistencia global del curso, por asignatura y por estudiante" />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="surface">
          <p className="text-sm text-base-content/70">Asistencia del curso</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{hasRecords ? formatPercentage(course.percentage) : "-"}</p>
          <progress className={`progress mt-2 w-full ${attendanceProgressClass(course.percentage)}`} value={course.percentage} max={100} />
        </div>
        <div className="surface">
          <p className="text-sm text-base-content/70">Estudiantes</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{course.students}</p>
        </div>
        <div className="surface">
          <p className="text-sm text-base-content/70">Asistencias / ausencias</p>
          <p className="mt-1 text-2xl font-semibold text-primary">
            {course.totalAsist} <span className="text-base font-normal text-base-content/60">/ {course.totalAbsences}</span>
          </p>
        </div>
        <div className="surface">
          <p className="text-sm text-base-content/70">Estudiantes bajo {ALERT_THRESHOLD}%</p>
          <p className={`mt-1 text-2xl font-semibold ${atRisk.length ? "text-error" : "text-primary"}`}>{atRisk.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="surface">
          <h2 className="section-title mb-3">Por asignatura</h2>
          {course.subjects.length === 0 ? (
            <EmptyState title="Sin asignaturas" description="Este curso aún no tiene asignaturas." />
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr className="text-xs uppercase text-base-content/60">
                    <th>Asignatura</th>
                    <th className="text-center">Clases</th>
                    <th>Asistencia</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {course.subjects.map((subject) => (
                    <tr key={subject.subject.id} className="hover">
                      <td className="font-medium text-neutral">{subject.subject.name}</td>
                      <td className="text-center">{subject.classesHeld}</td>
                      <td>
                        <AttendanceMeter percentage={subject.percentage} empty={!(subject.totalAsist + subject.totalAbsences)} />
                      </td>
                      <td className="text-right">
                        <Link to={`/asignaturas/${subject.subject.id}`} className="btn btn-ghost btn-xs whitespace-nowrap">
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

        <section className="surface">
          <h2 className="section-title mb-3">Por estudiante</h2>
          {course.studentsSummary.length === 0 ? (
            <EmptyState title="Sin estudiantes" description="Aún no hay estudiantes con asistencia en este curso." />
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr className="text-xs uppercase text-base-content/60">
                    <th>Estudiante</th>
                    <th className="text-center">Aus.</th>
                    <th>Asistencia</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {[...course.studentsSummary]
                    .sort((a, b) => a.percentage - b.percentage)
                    .map((student) => (
                      <tr key={student.user.id} className="hover">
                        <td>
                          <p className="font-medium text-neutral">
                            {student.user.firstName} {student.user.lastName}
                          </p>
                          {student.percentage < ALERT_THRESHOLD && <span className="badge badge-error badge-sm">En riesgo</span>}
                        </td>
                        <td className="text-center">{student.totalAbsences}</td>
                        <td>
                          <AttendanceMeter percentage={student.percentage} />
                        </td>
                        <td className="text-right">
                          <Link to={`/asistencia/estudiantes/${student.user.id}`} className="btn btn-ghost btn-xs whitespace-nowrap">
                            Ver estudiante
                          </Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default CourseDetail;
