import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import PageHeader from "../../components/PageHeader";
import { EmptyState, ErrorState, Spinner } from "../../components/States";
import { ATTENDANCE_BY_STUDENT, GRADES_BY_STUDENT, GradeDto, MY_CHILDREN, UserDto } from "../../graphql/operations";
import { average, formatGrade, gradeTone } from "../../lib/format";

interface AttendanceRow {
  totalAsist: number;
  totalAbsences: number;
  subject: { id: string; name: string; numberOfClasses: number; course: { nameCourse: string } };
}

const ChildDetail = () => {
  const { id } = useParams<{ id: string }>();
  const studentId = Number(id);

  const children = useQuery<{ myChildren: UserDto[] }>(MY_CHILDREN);
  const grades = useQuery<{ gradesByStudentId: GradeDto[] }>(GRADES_BY_STUDENT, { variables: { studentId } });
  const attendance = useQuery<{ attendanceByStudent: AttendanceRow[] }>(ATTENDANCE_BY_STUDENT, {
    variables: { studentId },
  });

  const child = children.data?.myChildren.find((item) => Number(item.id) === studentId);
  const rows = attendance.data?.attendanceByStudent ?? [];
  const gradeList = grades.data?.gradesByStudentId ?? [];
  const overall = average(gradeList.map((g) => g.grade));
  const present = rows.reduce((sum, r) => sum + r.totalAsist, 0);
  const total = present + rows.reduce((sum, r) => sum + r.totalAbsences, 0);
  const attendancePct = total ? Math.round((present / total) * 100) : null;

  if ((children.loading && !children.data) || (attendance.loading && !attendance.data)) {
    return <Spinner />;
  }
  if (children.error || attendance.error || grades.error || !child) {
    return <ErrorState message="No se pudo cargar la información del estudiante." />;
  }

  return (
    <>
      <div className="mb-2 text-sm">
        <Link to="/pupilos" className="link link-hover text-base-content/70">
          Mis pupilos
        </Link>
        <span className="mx-2 text-base-content/40">/</span>
        <span className="text-neutral">
          {child.firstName} {child.lastName}
        </span>
      </div>
      <PageHeader title={`${child.firstName} ${child.lastName}`} subtitle={`RUT ${child.rut}`} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="surface">
          <p className="text-sm text-base-content/70">Promedio general</p>
          <p className="mt-2">
            <span className={`badge badge-lg ${gradeTone(overall)} font-semibold`}>{formatGrade(overall)}</span>
          </p>
        </div>
        <div className="surface">
          <p className="text-sm text-base-content/70">Asistencia global</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{attendancePct === null ? "-" : `${attendancePct}%`}</p>
        </div>
        <div className="surface">
          <p className="text-sm text-base-content/70">Asignaturas</p>
          <p className="mt-1 text-2xl font-semibold text-primary">{rows.length}</p>
        </div>
      </div>

      <section className="surface">
        <h2 className="section-title mb-4">Detalle por asignatura</h2>
        {rows.length === 0 ? (
          <EmptyState title="Sin asignaturas" description="El estudiante aún no está inscrito en ninguna asignatura." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-xs uppercase text-base-content/60">
                  <th>Asignatura</th>
                  <th>Notas</th>
                  <th className="text-center">Promedio</th>
                  <th className="min-w-40">Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const list = gradeList.filter((g) => String(g.subjectId) === String(row.subject.id));
                  const avg = average(list.map((g) => g.grade));
                  const held = row.totalAsist + row.totalAbsences;
                  const pct = held ? Math.round((row.totalAsist / held) * 100) : null;
                  return (
                    <tr key={row.subject.id} className="hover">
                      <td>
                        <p className="font-medium text-neutral">{row.subject.name}</p>
                        <p className="text-xs text-base-content/60">{row.subject.course.nameCourse}</p>
                      </td>
                      <td>
                        {list.length === 0 ? (
                          <span className="text-base-content/50">Sin notas</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {list.map((g) => (
                              <span key={g.id} className={`badge ${gradeTone(Number(g.grade))}`}>
                                {formatGrade(Number(g.grade))}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="text-center">
                        <span className={`badge ${gradeTone(avg)} font-semibold`}>{formatGrade(avg)}</span>
                      </td>
                      <td>
                        {pct === null ? (
                          <span className="text-base-content/50">Sin registros</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <progress
                              className={`progress w-24 ${pct >= 85 ? "progress-success" : pct >= 70 ? "progress-warning" : "progress-error"}`}
                              value={pct}
                              max={100}
                            />
                            <span className="text-xs">
                              {pct}% ({row.totalAbsences} aus.)
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
};

export default ChildDetail;
