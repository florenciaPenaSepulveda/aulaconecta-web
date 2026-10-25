import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import PageHeader from "../../components/PageHeader";
import AttendanceMeter, { attendanceProgressClass, formatPercentage } from "../../components/AttendanceMeter";
import { EmptyState, ErrorState, Spinner } from "../../components/States";
import {
  ENROLL_STUDENT,
  GET_ALL_STUDENTS,
  LIST_USERS_BY_SUBJECT,
  SUBJECT_ATTENDANCE_CALENDAR,
  SUBJECT_ATTENDANCE_SUMMARY,
  SUBJECT_BY_ID,
  SubjectCalendarDto,
  SubjectDto,
  SubjectSummaryDto,
  TAKE_ASIST,
  UNENROLL_STUDENT,
  UserDto,
} from "../../graphql/operations";
import { todayLocal } from "../../lib/format";
import { confirmAction, errorMessage, notifyError, notifySuccess, notifyWarning } from "../../lib/alerts";

interface Enrolled {
  user: Pick<UserDto, "id" | "firstName" | "lastName" | "rut" | "email">;
  totalAsist: number;
  totalAbsences: number;
}

const SubjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const subjectId = Number(id);
  const [present, setPresent] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState("");
  const [searchParams] = useSearchParams();
  const [date, setDate] = useState(searchParams.get("fecha") ?? todayLocal());

  const subjectQuery = useQuery<{ subjectById: SubjectDto | null }>(SUBJECT_BY_ID, { variables: { id: subjectId } });
  const enrolledQuery = useQuery<{ listUsersBySubject: Enrolled[] }>(LIST_USERS_BY_SUBJECT, {
    variables: { idSubject: subjectId },
    fetchPolicy: "network-only",
  });
  const studentsQuery = useQuery<{ getAllStudents: UserDto[] }>(GET_ALL_STUDENTS);
  const summaryQuery = useQuery<{ subjectAttendanceSummary: SubjectSummaryDto }>(SUBJECT_ATTENDANCE_SUMMARY, {
    variables: { subjectId },
    fetchPolicy: "network-only",
  });

  const calendarQuery = useQuery<{ subjectAttendanceCalendar: SubjectCalendarDto }>(SUBJECT_ATTENDANCE_CALENDAR, {
    variables: { subjectId },
    fetchPolicy: "network-only",
  });
  const refetchQueries = [
    { query: LIST_USERS_BY_SUBJECT, variables: { idSubject: subjectId } },
    { query: SUBJECT_ATTENDANCE_SUMMARY, variables: { subjectId } },
    { query: SUBJECT_ATTENDANCE_CALENDAR, variables: { subjectId } },
  ];
  const [takeAsist, takeState] = useMutation(TAKE_ASIST, { refetchQueries });
  const [enroll, enrollState] = useMutation(ENROLL_STUDENT, { refetchQueries });
  const [unenroll] = useMutation(UNENROLL_STUDENT, { refetchQueries });

  const enrolled = useMemo(() => enrolledQuery.data?.listUsersBySubject ?? [], [enrolledQuery.data]);
  const subject = subjectQuery.data?.subjectById;

  const calendar = calendarQuery.data?.subjectAttendanceCalendar;
  const savedMarks = useMemo(() => {
    const marks: Record<string, boolean> = {};
    calendar?.students.forEach((student) => {
      const mark = student.marks.find((item) => item.date === date);
      if (mark) {
        marks[student.user.id] = mark.present;
      }
    });
    return marks;
  }, [calendar, date]);
  const alreadyRegistered = Object.keys(savedMarks).length > 0;

  useEffect(() => {
    setPresent(() => {
      const next: Record<string, boolean> = {};
      enrolled.forEach((item) => {
        next[item.user.id] = savedMarks[item.user.id] ?? true;
      });
      return next;
    });
  }, [enrolled, savedMarks]);

  const available = (studentsQuery.data?.getAllStudents ?? []).filter(
    (student) => !enrolled.some((item) => item.user.id === student.id),
  );
  const classesHeld = enrolled.reduce((max, item) => Math.max(max, item.totalAsist + item.totalAbsences), 0);
  const summary = summaryQuery.data?.subjectAttendanceSummary;
  const presentCount = Object.values(present).filter(Boolean).length;

  const handleEnroll = async () => {
    if (!selected) {
      notifyWarning("Selecciona un estudiante para inscribir.");
      return;
    }
    try {
      await enroll({ variables: { idUser: Number(selected), idSubject: subjectId } });
      setSelected("");
      notifySuccess("Estudiante inscrito");
    } catch (error) {
      notifyError(errorMessage(error));
    }
  };

  const handleUnenroll = async (item: Enrolled) => {
    const confirmed = await confirmAction(
      "Quitar estudiante",
      `${item.user.firstName} ${item.user.lastName} dejará de estar inscrito en esta asignatura.`,
      "Quitar",
    );
    if (!confirmed) {
      return;
    }
    try {
      await unenroll({ variables: { idUser: Number(item.user.id), idSubject: subjectId } });
      notifySuccess("Estudiante retirado");
    } catch (error) {
      notifyError(errorMessage(error));
    }
  };

  const handleSave = async () => {
    if (enrolled.length === 0) {
      notifyWarning("No hay estudiantes inscritos.");
      return;
    }
    if (!date || date > todayLocal()) {
      notifyWarning("Elige una fecha válida que no sea futura.");
      return;
    }
    if (subject && !alreadyRegistered && classesHeld >= subject.numberOfClasses) {
      const proceed = await confirmAction(
        "Clases completadas",
        "Ya se registraron todas las clases planificadas. ¿Deseas registrar una más?",
        "Registrar",
      );
      if (!proceed) {
        return;
      }
    }
    try {
      await takeAsist({
        variables: {
          createAsistInput: {
            date,
            asistencias: enrolled.map((item) => ({
              idUser: Number(item.user.id),
              idSubject: subjectId,
              asist: present[item.user.id] ? 1 : 0,
              absences: present[item.user.id] ? 0 : 1,
            })),
          },
        },
      });
      notifySuccess("Asistencia registrada");
    } catch (error) {
      notifyError(errorMessage(error));
    }
  };

  if (subjectQuery.loading && !subject) {
    return <Spinner />;
  }
  if (!subject) {
    return <ErrorState message="La asignatura no existe o no está disponible." />;
  }

  return (
    <>
      <div className="mb-2 text-sm">
        <Link to="/asignaturas" className="link link-hover text-base-content/70">
          Asignaturas
        </Link>
        <span className="mx-2 text-base-content/40">/</span>
        <span className="text-neutral">{subject.name}</span>
      </div>
      <PageHeader
        title={subject.name}
        subtitle={`${subject.course?.nameCourse} · ${classesHeld} de ${subject.numberOfClasses} clases registradas`}
        actions={
          <>
            <Link to={`/asignaturas/${subject.id}/calendario`} className="btn btn-outline btn-primary btn-sm">
              Ver calendario
            </Link>
            <Link to={`/asignaturas/${subject.id}/notas`} className="btn btn-outline btn-primary btn-sm">
              Ir a notas
            </Link>
          </>
        }
      />

      {summary && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="surface">
            <p className="text-sm text-base-content/70">Asistencia global</p>
            <p className="mt-1 text-2xl font-semibold text-primary">
              {summary.totalAsist + summary.totalAbsences ? formatPercentage(summary.percentage) : "-"}
            </p>
            <progress
              className={`progress mt-2 w-full ${attendanceProgressClass(summary.percentage)}`}
              value={summary.percentage}
              max={100}
            />
          </div>
          <div className="surface">
            <p className="text-sm text-base-content/70">Clases registradas</p>
            <p className="mt-1 text-2xl font-semibold text-primary">
              {summary.classesHeld} <span className="text-sm font-normal text-base-content/60">de {subject.numberOfClasses}</span>
            </p>
          </div>
          <div className="surface">
            <p className="text-sm text-base-content/70">Asistencias totales</p>
            <p className="mt-1 text-2xl font-semibold text-primary">{summary.totalAsist}</p>
          </div>
          <div className="surface">
            <p className="text-sm text-base-content/70">Ausencias totales</p>
            <p className="mt-1 text-2xl font-semibold text-primary">{summary.totalAbsences}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="surface xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="section-title">Registro de asistencia</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={date}
                  max={todayLocal()}
                  onChange={(e) => setDate(e.target.value)}
                  aria-label="Fecha de la clase"
                />
                {alreadyRegistered && <span className="badge badge-info badge-sm">Ya registrada: se actualizará</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPresent(Object.fromEntries(enrolled.map((i) => [i.user.id, true])))}
              >
                Todos presentes
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPresent(Object.fromEntries(enrolled.map((i) => [i.user.id, false])))}
              >
                Todos ausentes
              </button>
            </div>
          </div>

          {enrolledQuery.error ? (
            <ErrorState message="No se pudo cargar la lista de estudiantes." />
          ) : enrolledQuery.loading && enrolled.length === 0 ? (
            <Spinner />
          ) : enrolled.length === 0 ? (
            <EmptyState
              title="Sin estudiantes inscritos"
              description="Inscribe estudiantes desde el panel de la derecha para tomar asistencia."
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table table-sm">
                  <thead>
                    <tr className="text-xs uppercase text-base-content/60">
                      <th>Estudiante</th>
                      <th className="text-center">Asistencias</th>
                      <th className="text-center">Ausencias</th>
                      <th>% asistencia</th>
                      <th className="text-center">Presente</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {enrolled.map((item) => (
                      <tr key={item.user.id} className="hover">
                        <td>
                          <Link to={`/asistencia/estudiantes/${item.user.id}`} className="link link-hover font-medium text-neutral">
                            {item.user.firstName} {item.user.lastName}
                          </Link>
                          <p className="text-xs text-base-content/60">{item.user.rut}</p>
                        </td>
                        <td className="text-center">{item.totalAsist}</td>
                        <td className="text-center">{item.totalAbsences}</td>
                        <td>
                          <AttendanceMeter
                            percentage={
                              item.totalAsist + item.totalAbsences
                                ? (item.totalAsist / (item.totalAsist + item.totalAbsences)) * 100
                                : 0
                            }
                            empty={!(item.totalAsist + item.totalAbsences)}
                          />
                        </td>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            className="toggle toggle-success toggle-sm"
                            checked={present[item.user.id] ?? true}
                            onChange={(e) => setPresent({ ...present, [item.user.id]: e.target.checked })}
                            aria-label={`Presente: ${item.user.firstName} ${item.user.lastName}`}
                          />
                        </td>
                        <td className="text-right">
                          <button className="btn btn-ghost btn-xs text-error" onClick={() => handleUnenroll(item)}>
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-base-content/70">
                  {presentCount} presentes · {enrolled.length - presentCount} ausentes
                </p>
                <button className="btn btn-primary" onClick={handleSave} disabled={takeState.loading}>
                  {takeState.loading && <span className="loading loading-spinner loading-sm" />}
                  Registrar asistencia
                </button>
              </div>
            </>
          )}
        </section>

        <section className="surface h-fit">
          <h2 className="section-title mb-1">Inscribir estudiante</h2>
          <p className="mb-3 text-sm text-base-content/70">Agrega estudiantes a esta asignatura.</p>
          {available.length === 0 ? (
            <p className="text-sm text-base-content/60">No hay más estudiantes disponibles para inscribir.</p>
          ) : (
            <div className="space-y-3">
              <select
                className="select select-bordered w-full"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="">Selecciona un estudiante</option>
                {available.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} · {student.rut}
                  </option>
                ))}
              </select>
              <button className="btn btn-primary w-full" onClick={handleEnroll} disabled={enrollState.loading}>
                Inscribir
              </button>
            </div>
          )}
          <p className="mt-4 text-xs text-base-content/60">
            ¿Falta un estudiante? Regístralo en la sección{" "}
            <Link className="link link-primary" to="/usuarios">
              Estudiantes
            </Link>
            .
          </p>
        </section>
      </div>
    </>
  );
};

export default SubjectDetail;
