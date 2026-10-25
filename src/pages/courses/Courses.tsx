import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { EmptyState, ErrorState, Spinner } from "../../components/States";
import { CREATE_COURSE, CourseDto, DELETE_COURSE, LIST_COURSES } from "../../graphql/operations";
import { confirmAction, errorMessage, notifyError, notifySuccess } from "../../lib/alerts";

const levels: { value: CourseDto["level"]; label: string }[] = [
  { value: "PreKinder", label: "Pre kínder" },
  { value: "Kinder", label: "Kínder" },
  { value: "Basica", label: "Básica" },
  { value: "Media", label: "Media" },
];

const levelLabel = (level: string) => levels.find((item) => item.value === level)?.label ?? level;

const Courses = () => {
  const [open, setOpen] = useState(false);
  const [nameCourse, setNameCourse] = useState("");
  const [level, setLevel] = useState<CourseDto["level"]>("Basica");

  const { data, loading, error } = useQuery<{ listCourses: CourseDto[] }>(LIST_COURSES);
  const [createCourse, createState] = useMutation(CREATE_COURSE, { refetchQueries: [LIST_COURSES] });
  const [deleteCourse] = useMutation(DELETE_COURSE, { refetchQueries: [LIST_COURSES] });
  const courses = data?.listCourses ?? [];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await createCourse({ variables: { createCourseDto: { nameCourse: nameCourse.trim(), level } } });
      notifySuccess("Curso creado");
      setNameCourse("");
      setOpen(false);
    } catch (err) {
      notifyError(errorMessage(err));
    }
  };

  const handleDelete = async (course: CourseDto) => {
    const confirmed = await confirmAction("Eliminar curso", `Se eliminará el curso "${course.nameCourse}".`, "Eliminar");
    if (!confirmed) {
      return;
    }
    try {
      await deleteCourse({ variables: { deleteCourseDto: { nameCourse: course.nameCourse, level: course.level } } });
      notifySuccess("Curso eliminado");
    } catch (err) {
      notifyError(errorMessage(err));
    }
  };

  return (
    <>
      <PageHeader
        title="Cursos"
        subtitle="Organiza los cursos del colegio y sus asignaturas"
        actions={
          <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
            Nuevo curso
          </button>
        }
      />

      {error ? (
        <ErrorState message="No se pudieron cargar los cursos." />
      ) : loading && courses.length === 0 ? (
        <Spinner />
      ) : courses.length === 0 ? (
        <EmptyState title="No hay cursos registrados" description="Crea el primer curso para poder agregar asignaturas." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <article key={course.id} className="surface flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-base font-semibold text-neutral">{course.nameCourse}</h2>
                <span className="badge badge-ghost">{levelLabel(course.level)}</span>
              </div>
              <div>
                <p className="mb-1 text-xs uppercase text-base-content/60">Asignaturas</p>
                {course.subjects && course.subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {course.subjects.map((subject) => (
                      <span key={subject.id} className="badge badge-outline">
                        {subject.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-base-content/60">Sin asignaturas</p>
                )}
              </div>
              <div className="mt-auto">
                <button className="btn btn-ghost btn-sm text-error" onClick={() => handleDelete(course)}>
                  Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal open={open} title="Nuevo curso" onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="form-control">
            <span className="label py-1">
              <span className="field-label">Nombre del curso</span>
            </span>
            <input
              className="input input-bordered w-full"
              placeholder="1° Básico A"
              value={nameCourse}
              onChange={(e) => setNameCourse(e.target.value)}
              required
            />
          </label>
          <label className="form-control">
            <span className="label py-1">
              <span className="field-label">Nivel</span>
            </span>
            <select
              className="select select-bordered w-full"
              value={level}
              onChange={(e) => setLevel(e.target.value as CourseDto["level"])}
            >
              {levels.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={createState.loading}>
              Crear curso
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Courses;
