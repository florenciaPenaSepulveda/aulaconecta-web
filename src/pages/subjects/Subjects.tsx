import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "../../auth/AuthContext";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { EmptyState, ErrorState, Spinner } from "../../components/States";
import {
  CREATE_SUBJECT,
  CREATE_SUBJECT_ADMIN,
  CourseDto,
  DELETE_SUBJECT,
  GET_ALL_USERS,
  LIST_COURSES,
  LIST_SUBJECTS,
  SUBJECTS_BY_TEACHER,
  SubjectDto,
  UserDto,
} from "../../graphql/operations";
import { confirmAction, errorMessage, notifyError, notifySuccess, notifyWarning } from "../../lib/alerts";

const emptyForm = { name: "", numberOfClasses: "", courseId: "", idTeacher: "" };

const Subjects = () => {
  const { session } = useAuth();
  const isAdmin = session?.role === "admin";
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const teacherQuery = useQuery<{ getAllSubjectByIdTeacher: SubjectDto[] }>(SUBJECTS_BY_TEACHER, {
    variables: { idTeacher: session?.id },
    skip: isAdmin || !session,
  });
  const adminQuery = useQuery<{ listSubject: SubjectDto[] }>(LIST_SUBJECTS, { skip: !isAdmin });
  const courses = useQuery<{ listCourses: CourseDto[] }>(LIST_COURSES);
  const users = useQuery<{ getAllUser: UserDto[] }>(GET_ALL_USERS, { skip: !isAdmin });

  const refetchQueries = [LIST_SUBJECTS, SUBJECTS_BY_TEACHER, LIST_COURSES];
  const [createSubject, createState] = useMutation(CREATE_SUBJECT, { refetchQueries });
  const [createSubjectAdmin, createAdminState] = useMutation(CREATE_SUBJECT_ADMIN, { refetchQueries });
  const [deleteSubject] = useMutation(DELETE_SUBJECT, { refetchQueries });

  const subjects = (isAdmin ? adminQuery.data?.listSubject : teacherQuery.data?.getAllSubjectByIdTeacher) ?? [];
  const loading = isAdmin ? adminQuery.loading : teacherQuery.loading;
  const error = isAdmin ? adminQuery.error : teacherQuery.error;
  const teachers = (users.data?.getAllUser ?? []).filter((u) => u.role === "Teacher");
  const courseList = courses.data?.listCourses ?? [];
  const teacherName = (id: number) => {
    const teacher = teachers.find((t) => Number(t.id) === id);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : null;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const classes = Number(form.numberOfClasses);
    if (!form.name.trim() || !form.courseId || !Number.isInteger(classes) || classes <= 0) {
      notifyWarning("Completa el nombre, el curso y una cantidad de clases mayor a cero.");
      return;
    }
    if (isAdmin && !form.idTeacher) {
      notifyWarning("Selecciona el profesor responsable.");
      return;
    }
    try {
      const result = isAdmin
        ? await createSubjectAdmin({
            variables: {
              createSubjectAdminInput: {
                name: form.name.trim(),
                numberOfClasses: classes,
                courseId: Number(form.courseId),
                idTeacher: Number(form.idTeacher),
              },
            },
          })
        : await createSubject({
            variables: {
              createSubjectInput: {
                name: form.name.trim(),
                numberOfClasses: classes,
                courseId: Number(form.courseId),
              },
            },
          });
      const created = isAdmin
        ? (result.data as { addNewSubjectAdmin: { isCreateSubject: boolean } }).addNewSubjectAdmin.isCreateSubject
        : (result.data as { createSubject: { isCreateSubject: boolean } }).createSubject.isCreateSubject;
      if (!created) {
        throw new Error("No se pudo crear la asignatura");
      }
      notifySuccess("Asignatura creada");
      setForm(emptyForm);
      setOpen(false);
    } catch (err) {
      notifyError(errorMessage(err));
    }
  };

  const handleDelete = async (subject: SubjectDto) => {
    const confirmed = await confirmAction(
      "Eliminar asignatura",
      `Se eliminará "${subject.name}" junto con su asistencia y notas. Esta acción no se puede deshacer.`,
      "Eliminar",
    );
    if (!confirmed) {
      return;
    }
    try {
      await deleteSubject({ variables: { id: Number(subject.id) } });
      notifySuccess("Asignatura eliminada");
    } catch (err) {
      notifyError(errorMessage(err));
    }
  };

  return (
    <>
      <PageHeader
        title="Asignaturas"
        subtitle={isAdmin ? "Todas las asignaturas del colegio" : "Gestiona la asistencia y las notas de tus asignaturas"}
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
            Nueva asignatura
          </button>
        }
      />

      {error ? (
        <ErrorState message="No se pudieron cargar las asignaturas." />
      ) : loading && subjects.length === 0 ? (
        <Spinner />
      ) : subjects.length === 0 ? (
        <EmptyState
          title="No hay asignaturas registradas"
          description={courseList.length === 0 ? "Primero debe existir al menos un curso." : "Crea la primera asignatura para comenzar."}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => (
            <article key={subject.id} className="surface flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-neutral">{subject.name}</h2>
                  <p className="text-sm text-base-content/70">{subject.course?.nameCourse}</p>
                </div>
                <span className="badge badge-ghost">{subject.numberOfClasses} clases</span>
              </div>
              {isAdmin && (
                <p className="text-xs text-base-content/60">Profesor: {teacherName(subject.idTeacher) ?? "Sin asignar"}</p>
              )}
              <div className="mt-auto flex flex-wrap gap-2">
                <Link to={`/asignaturas/${subject.id}`} className="btn btn-primary btn-sm">
                  Asistencia
                </Link>
                <Link to={`/asignaturas/${subject.id}/notas`} className="btn btn-outline btn-primary btn-sm">
                  Notas
                </Link>
                <button className="btn btn-ghost btn-sm text-error" onClick={() => handleDelete(subject)}>
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={open} title="Nueva asignatura" onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="form-control">
            <span className="label py-1">
              <span className="field-label">Nombre</span>
            </span>
            <input
              className="input input-bordered w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label className="form-control">
            <span className="label py-1">
              <span className="field-label">Curso</span>
            </span>
            <select
              className="select select-bordered w-full"
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              required
            >
              <option value="">Selecciona un curso</option>
              {courseList.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.nameCourse}
                </option>
              ))}
            </select>
          </label>
          {isAdmin && (
            <label className="form-control">
              <span className="label py-1">
                <span className="field-label">Profesor responsable</span>
              </span>
              <select
                className="select select-bordered w-full"
                value={form.idTeacher}
                onChange={(e) => setForm({ ...form, idTeacher: e.target.value })}
                required
              >
                <option value="">Selecciona un profesor</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="form-control">
            <span className="label py-1">
              <span className="field-label">Cantidad de clases</span>
            </span>
            <input
              type="number"
              min={1}
              className="input input-bordered w-full"
              value={form.numberOfClasses}
              onChange={(e) => setForm({ ...form, numberOfClasses: e.target.value })}
              required
            />
          </label>
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={createState.loading || createAdminState.loading}>
              Crear asignatura
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Subjects;
