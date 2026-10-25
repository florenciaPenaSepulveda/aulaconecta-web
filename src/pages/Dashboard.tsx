import { Link } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { useAuth } from "../auth/AuthContext";
import PageHeader from "../components/PageHeader";
import { EmptyState, ErrorState, Spinner } from "../components/States";
import {
  ATTENDANCE_BY_STUDENT,
  GET_ALL_NOTICES,
  GET_ALL_USERS,
  GRADES_BY_STUDENT,
  GradeDto,
  LIST_COURSES,
  LIST_SUBJECTS,
  MY_CHILDREN,
  NoticeDto,
  SUBJECTS_BY_TEACHER,
  SubjectDto,
  UserDto,
} from "../graphql/operations";
import { average, formatDate, formatGrade, gradeTone, initials } from "../lib/format";

const Stat = ({ label, value, hint }: { label: string; value: number | string; hint?: string }) => (
  <div className="surface">
    <p className="text-sm text-base-content/70">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-primary">{value}</p>
    {hint && <p className="mt-1 text-xs text-base-content/60">{hint}</p>}
  </div>
);

const RecentNotices = () => {
  const { data, loading } = useQuery<{ getAllNotices: NoticeDto[] }>(GET_ALL_NOTICES);
  const notices = (data?.getAllNotices ?? []).slice(0, 3);

  return (
    <section className="surface">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="section-title">Anuncios recientes</h2>
        <Link to="/anuncios" className="link link-primary text-sm">
          Ver todos
        </Link>
      </div>
      {loading && !data ? (
        <Spinner />
      ) : notices.length === 0 ? (
        <p className="text-sm text-base-content/70">No hay anuncios publicados.</p>
      ) : (
        <ul className="divide-y divide-base-300">
          {notices.map((notice) => (
            <li key={notice.id} className="py-3 first:pt-0 last:pb-0">
              <p className="text-sm font-semibold text-neutral">{notice.title}</p>
              <p className="mt-0.5 line-clamp-2 text-sm text-base-content/70">{notice.description}</p>
              <p className="mt-1 text-xs text-base-content/50">{formatDate(notice.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const SubjectCards = ({ subjects }: { subjects: SubjectDto[] }) =>
  subjects.length === 0 ? (
    <EmptyState
      title="Aún no tienes asignaturas"
      description="Crea una asignatura para comenzar a registrar asistencia y notas."
      action={
        <Link to="/asignaturas" className="btn btn-primary btn-sm">
          Ir a asignaturas
        </Link>
      }
    />
  ) : (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {subjects.map((subject) => (
        <article key={subject.id} className="surface flex flex-col gap-3">
          <div>
            <h3 className="text-base font-semibold text-neutral">{subject.name}</h3>
            <p className="text-sm text-base-content/70">{subject.course?.nameCourse}</p>
          </div>
          <p className="text-xs text-base-content/60">{subject.numberOfClasses} clases planificadas</p>
          <div className="mt-auto flex gap-2">
            <Link to={`/asignaturas/${subject.id}`} className="btn btn-primary btn-sm">
              Asistencia
            </Link>
            <Link to={`/asignaturas/${subject.id}/notas`} className="btn btn-outline btn-primary btn-sm">
              Notas
            </Link>
          </div>
        </article>
      ))}
    </div>
  );

const StaffDashboard = ({ isAdmin, userId }: { isAdmin: boolean; userId: number }) => {
  const teacherQuery = useQuery<{ getAllSubjectByIdTeacher: SubjectDto[] }>(SUBJECTS_BY_TEACHER, {
    variables: { idTeacher: userId },
    skip: isAdmin,
  });
  const adminQuery = useQuery<{ listSubject: SubjectDto[] }>(LIST_SUBJECTS, { skip: !isAdmin });
  const usersQuery = useQuery<{ getAllUser: UserDto[] }>(GET_ALL_USERS, { skip: !isAdmin });
  const coursesQuery = useQuery<{ listCourses: unknown[] }>(LIST_COURSES, { skip: !isAdmin });

  const subjects = isAdmin ? adminQuery.data?.listSubject : teacherQuery.data?.getAllSubjectByIdTeacher;
  const loading = isAdmin ? adminQuery.loading : teacherQuery.loading;
  const error = isAdmin ? adminQuery.error : teacherQuery.error;
  const users = usersQuery.data?.getAllUser ?? [];

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={isAdmin ? "Asignaturas" : "Mis asignaturas"} value={subjects?.length ?? 0} />
        {isAdmin ? (
          <>
            <Stat label="Estudiantes" value={users.filter((u) => u.role === "Student").length} />
            <Stat label="Profesores" value={users.filter((u) => u.role === "Teacher").length} />
            <Stat label="Cursos" value={coursesQuery.data?.listCourses.length ?? 0} />
          </>
        ) : null}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <h2 className="section-title mb-3">{isAdmin ? "Asignaturas del colegio" : "Mis asignaturas"}</h2>
          {error ? (
            <ErrorState message="No se pudieron cargar las asignaturas." />
          ) : loading && !subjects ? (
            <Spinner />
          ) : (
            <SubjectCards subjects={subjects ?? []} />
          )}
        </div>
        <RecentNotices />
      </div>
    </>
  );
};

const ChildCard = ({ child }: { child: UserDto }) => {
  const studentId = Number(child.id);
  const grades = useQuery<{ gradesByStudentId: GradeDto[] }>(GRADES_BY_STUDENT, { variables: { studentId } });
  const attendance = useQuery<{
    attendanceByStudent: { totalAsist: number; totalAbsences: number }[];
  }>(ATTENDANCE_BY_STUDENT, { variables: { studentId } });

  const gradeList = grades.data?.gradesByStudentId ?? [];
  const records = attendance.data?.attendanceByStudent ?? [];
  const avg = average(gradeList.map((g) => g.grade));
  const present = records.reduce((sum, r) => sum + r.totalAsist, 0);
  const total = present + records.reduce((sum, r) => sum + r.totalAbsences, 0);
  const attendancePct = total ? Math.round((present / total) * 100) : null;

  return (
    <article className="surface flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-content">
          {initials(child.firstName, child.lastName)}
        </span>
        <div>
          <h3 className="text-base font-semibold text-neutral">
            {child.firstName} {child.lastName}
          </h3>
          <p className="text-xs text-base-content/60">{child.rut}</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-box bg-base-200 p-3">
          <dt className="text-xs text-base-content/60">Promedio general</dt>
          <dd className="mt-1">
            <span className={`badge ${gradeTone(avg)} font-semibold`}>{formatGrade(avg)}</span>
          </dd>
        </div>
        <div className="rounded-box bg-base-200 p-3">
          <dt className="text-xs text-base-content/60">Asistencia</dt>
          <dd className="mt-1 font-semibold text-neutral">{attendancePct === null ? "-" : `${attendancePct}%`}</dd>
        </div>
      </dl>
      <Link to={`/pupilos/${child.id}`} className="btn btn-primary btn-sm mt-auto">
        Ver detalle académico
      </Link>
    </article>
  );
};

const ParentDashboard = () => {
  const { data, loading, error } = useQuery<{ myChildren: UserDto[] }>(MY_CHILDREN);
  const children = data?.myChildren ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <h2 className="section-title mb-3">Mis pupilos</h2>
        {error ? (
          <ErrorState message="No se pudo cargar la información de tus pupilos." />
        ) : loading && !data ? (
          <Spinner />
        ) : children.length === 0 ? (
          <EmptyState
            title="No tienes pupilos asociados"
            description="Solicita al colegio que asocie a tu pupilo con tu RUT de apoderado."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {children.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
        )}
      </div>
      <RecentNotices />
    </div>
  );
};

const Dashboard = () => {
  const { session } = useAuth();
  if (!session) {
    return null;
  }

  const subtitle =
    session.role === "parents"
      ? "Resumen académico de tus pupilos"
      : session.role === "admin"
        ? "Resumen general del colegio"
        : "Resumen de tus asignaturas y comunicados";

  return (
    <>
      <PageHeader title={`Hola, ${session.firstName}`} subtitle={subtitle} />
      {session.role === "parents" ? (
        <ParentDashboard />
      ) : (
        <StaffDashboard isAdmin={session.role === "admin"} userId={session.id} />
      )}
    </>
  );
};

export default Dashboard;
