import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import PageHeader from "../../components/PageHeader";
import { formatPercentage } from "../../components/AttendanceMeter";
import { EmptyState, ErrorState, Spinner } from "../../components/States";
import { SUBJECT_ATTENDANCE_CALENDAR, SubjectCalendarDto } from "../../graphql/operations";
import { formatDay } from "../../lib/format";

const AttendanceCalendar = () => {
  const { id } = useParams<{ id: string }>();
  const subjectId = Number(id);
  const { data, loading, error } = useQuery<{ subjectAttendanceCalendar: SubjectCalendarDto }>(
    SUBJECT_ATTENDANCE_CALENDAR,
    { variables: { subjectId }, fetchPolicy: "network-only" },
  );
  const calendar = data?.subjectAttendanceCalendar;

  if (error) {
    return <ErrorState message="No se pudo cargar el calendario de asistencia." />;
  }
  if (loading && !calendar) {
    return <Spinner />;
  }
  if (!calendar) {
    return <ErrorState message="La asignatura no existe o no está disponible." />;
  }

  const months = calendar.days.reduce<{ label: string; span: number }[]>((groups, day) => {
    const label = formatDay(day.date).month;
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.span += 1;
    } else {
      groups.push({ label, span: 1 });
    }
    return groups;
  }, []);

  return (
    <>
      <div className="mb-2 text-sm">
        <Link to="/asignaturas" className="link link-hover text-base-content/70">
          Asignaturas
        </Link>
        <span className="mx-2 text-base-content/40">/</span>
        <Link to={`/asignaturas/${subjectId}`} className="link link-hover text-base-content/70">
          {calendar.subject.name}
        </Link>
        <span className="mx-2 text-base-content/40">/</span>
        <span className="text-neutral">Calendario</span>
      </div>
      <PageHeader
        title={`Calendario · ${calendar.subject.name}`}
        subtitle={`${calendar.subject.course.nameCourse} · ${calendar.days.length} días con asistencia registrada`}
        actions={
          <Link to={`/asignaturas/${subjectId}`} className="btn btn-primary btn-sm">
            Registrar asistencia
          </Link>
        }
      />

      <section className="surface">
        <div className="mb-4 flex flex-wrap items-center gap-4 text-xs text-base-content/70">
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-success" /> Presente
          </span>
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-error" /> Ausente
          </span>
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded bg-base-300" /> Sin registro
          </span>
          <span>Solo aparecen los días en que se registró asistencia. Haz clic en una fecha para corregirla.</span>
        </div>

        {calendar.days.length === 0 ? (
          <EmptyState
            title="Aún no hay días registrados"
            description="El primer día aparecerá cuando registres la asistencia de al menos un estudiante."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-xs text-base-content/60">
                  <th className="sticky left-0 z-10 bg-base-100" />
                  {months.map((group) => (
                    <th key={group.label} colSpan={group.span} className="border-l border-base-300 text-left">
                      {group.label.charAt(0).toUpperCase() + group.label.slice(1)}
                    </th>
                  ))}
                  <th colSpan={3} className="border-l border-base-300" />
                </tr>
                <tr className="text-xs">
                  <th className="sticky left-0 z-10 bg-base-100 text-left uppercase text-base-content/60">Estudiante</th>
                  {calendar.days.map((day) => {
                    const label = formatDay(day.date);
                    return (
                      <th key={day.date} className="px-1 text-center font-medium">
                        <Link
                          to={`/asignaturas/${subjectId}?fecha=${day.date}`}
                          className="flex flex-col items-center leading-tight hover:text-primary"
                          title={`Corregir asistencia del ${day.date}`}
                        >
                          <span className="uppercase text-base-content/60">{label.weekday}</span>
                          <span className="text-sm text-neutral">{label.day}</span>
                        </Link>
                      </th>
                    );
                  })}
                  <th className="border-l border-base-300 text-center uppercase text-base-content/60">Asist.</th>
                  <th className="text-center uppercase text-base-content/60">Aus.</th>
                  <th className="text-center uppercase text-base-content/60">%</th>
                </tr>
                <tr className="text-xs">
                  <th className="sticky left-0 z-10 bg-base-100 text-left font-normal text-base-content/60">% del día</th>
                  {calendar.days.map((day) => (
                    <th key={day.date} className="px-1 text-center font-normal text-base-content/70">
                      {Math.round(day.percentage)}%
                    </th>
                  ))}
                  <th colSpan={3} className="border-l border-base-300" />
                </tr>
              </thead>
              <tbody>
                {calendar.students.map((student) => {
                  const marks = new Map(student.marks.map((mark) => [mark.date, mark.present]));
                  return (
                    <tr key={student.user.id} className="hover">
                      <td className="sticky left-0 z-10 whitespace-nowrap bg-base-100 font-medium text-neutral">
                        <Link to={`/asistencia/estudiantes/${student.user.id}`} className="link link-hover">
                          {student.user.firstName} {student.user.lastName}
                        </Link>
                      </td>
                      {calendar.days.map((day) => {
                        const mark = marks.get(day.date);
                        const tone = mark === undefined ? "bg-base-300" : mark ? "bg-success" : "bg-error";
                        const text = mark === undefined ? "Sin registro" : mark ? "Presente" : "Ausente";
                        return (
                          <td key={day.date} className="px-1 text-center">
                            <span
                              className={`mx-auto block h-6 w-6 rounded ${tone}`}
                              title={`${student.user.firstName} · ${day.date}: ${text}`}
                              aria-label={`${student.user.firstName} ${day.date}: ${text}`}
                            />
                          </td>
                        );
                      })}
                      <td className="border-l border-base-300 text-center">{student.totalAsist}</td>
                      <td className="text-center">{student.totalAbsences}</td>
                      <td className="text-center font-semibold text-neutral">
                        {student.marks.length ? formatPercentage(student.percentage) : "-"}
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

export default AttendanceCalendar;
