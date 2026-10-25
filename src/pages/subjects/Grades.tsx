import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@apollo/client";
import PageHeader from "../../components/PageHeader";
import { EmptyState, ErrorState, Spinner } from "../../components/States";
import {
  CREATE_GRADE,
  DELETE_GRADE,
  GRADES_BY_SUBJECT,
  GradeDto,
  LIST_USERS_BY_SUBJECT,
  SUBJECT_BY_ID,
  SubjectDto,
  UPDATE_GRADE,
  UserDto,
} from "../../graphql/operations";
import { average, formatGrade, gradeTone } from "../../lib/format";
import { confirmAction, errorMessage, notifyError, notifySuccess, notifyWarning } from "../../lib/alerts";

interface Enrolled {
  user: Pick<UserDto, "id" | "firstName" | "lastName" | "rut">;
}

interface Entry {
  key: string;
  id?: string;
  original?: number;
  value: string;
}

let counter = 0;
const nextKey = () => `new-${counter++}`;

const parse = (value: string): number => Number(value.replace(",", "."));
const isValid = (value: string): boolean => {
  const n = parse(value);
  return value.trim() !== "" && !Number.isNaN(n) && n >= 1 && n <= 7;
};

const Grades = () => {
  const { id } = useParams<{ id: string }>();
  const subjectId = Number(id);
  const [entries, setEntries] = useState<Record<string, Entry[]>>({});
  const [saving, setSaving] = useState(false);

  const subjectQuery = useQuery<{ subjectById: SubjectDto | null }>(SUBJECT_BY_ID, { variables: { id: subjectId } });
  const studentsQuery = useQuery<{ listUsersBySubject: Enrolled[] }>(LIST_USERS_BY_SUBJECT, {
    variables: { idSubject: subjectId },
  });
  const gradesQuery = useQuery<{ gradesBySubjectId: GradeDto[] }>(GRADES_BY_SUBJECT, {
    variables: { subjectId },
    fetchPolicy: "network-only",
  });

  const [createGrade] = useMutation(CREATE_GRADE);
  const [updateGrade] = useMutation(UPDATE_GRADE);
  const [deleteGrade] = useMutation(DELETE_GRADE);

  const students = useMemo(() => studentsQuery.data?.listUsersBySubject ?? [], [studentsQuery.data]);
  const subject = subjectQuery.data?.subjectById;

  useEffect(() => {
    if (!gradesQuery.data) {
      return;
    }
    const grouped: Record<string, Entry[]> = {};
    gradesQuery.data.gradesBySubjectId.forEach((grade) => {
      const key = String(grade.studentId);
      grouped[key] = [
        ...(grouped[key] ?? []),
        { key: grade.id, id: grade.id, original: Number(grade.grade), value: Number(grade.grade).toFixed(1) },
      ];
    });
    setEntries(grouped);
  }, [gradesQuery.data]);

  const setValue = (studentId: string, key: string, value: string) =>
    setEntries((prev) => ({
      ...prev,
      [studentId]: (prev[studentId] ?? []).map((entry) => (entry.key === key ? { ...entry, value } : entry)),
    }));

  const addEntry = (studentId: string) =>
    setEntries((prev) => ({
      ...prev,
      [studentId]: [...(prev[studentId] ?? []), { key: nextKey(), value: "" }],
    }));

  const removeEntry = async (studentId: string, entry: Entry) => {
    if (entry.id) {
      const confirmed = await confirmAction("Eliminar nota", "La nota se eliminará de forma permanente.", "Eliminar");
      if (!confirmed) {
        return;
      }
      try {
        await deleteGrade({ variables: { id: Number(entry.id) } });
        notifySuccess("Nota eliminada");
      } catch (error) {
        notifyError(errorMessage(error));
        return;
      }
    }
    setEntries((prev) => ({
      ...prev,
      [studentId]: (prev[studentId] ?? []).filter((item) => item.key !== entry.key),
    }));
  };

  const pending = Object.values(entries)
    .flat()
    .filter((entry) => !entry.id || (entry.original !== undefined && parse(entry.value) !== entry.original));

  const handleSave = async () => {
    const all = Object.values(entries).flat();
    if (all.some((entry) => !isValid(entry.value))) {
      notifyWarning("Todas las notas deben estar entre 1,0 y 7,0.");
      return;
    }
    if (pending.length === 0) {
      notifyWarning("No hay cambios por guardar.");
      return;
    }
    setSaving(true);
    try {
      for (const [studentId, list] of Object.entries(entries)) {
        for (const entry of list) {
          const grade = Math.round(parse(entry.value) * 10) / 10;
          if (!entry.id) {
            await createGrade({
              variables: { createGradeDto: { grade, studentId: Number(studentId), subjectId } },
            });
          } else if (entry.original !== grade) {
            await updateGrade({
              variables: { id: Number(entry.id), updateGradeDto: { grade, studentId: Number(studentId), subjectId } },
            });
          }
        }
      }
      await gradesQuery.refetch();
      notifySuccess("Notas guardadas");
    } catch (error) {
      notifyError(errorMessage(error));
    } finally {
      setSaving(false);
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
        <Link to={`/asignaturas/${subject.id}`} className="link link-hover text-base-content/70">
          {subject.name}
        </Link>
        <span className="mx-2 text-base-content/40">/</span>
        <span className="text-neutral">Notas</span>
      </div>
      <PageHeader
        title={`Notas · ${subject.name}`}
        subtitle={`${subject.course?.nameCourse} · Escala de 1,0 a 7,0 (aprobación desde 4,0)`}
        actions={
          <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving || pending.length === 0}>
            {saving && <span className="loading loading-spinner loading-xs" />}
            Guardar cambios{pending.length > 0 ? ` (${pending.length})` : ""}
          </button>
        }
      />

      <section className="surface">
        {studentsQuery.error ? (
          <ErrorState message="No se pudo cargar la lista de estudiantes." />
        ) : studentsQuery.loading && students.length === 0 ? (
          <Spinner />
        ) : students.length === 0 ? (
          <EmptyState
            title="Sin estudiantes inscritos"
            description="Inscribe estudiantes en la asignatura para poder registrar notas."
            action={
              <Link to={`/asignaturas/${subject.id}`} className="btn btn-primary btn-sm">
                Inscribir estudiantes
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-xs uppercase text-base-content/60">
                  <th>Estudiante</th>
                  <th>Notas</th>
                  <th className="text-center">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {students.map(({ user }) => {
                  const list = entries[user.id] ?? [];
                  const avg = average(list.filter((e) => isValid(e.value)).map((e) => parse(e.value)));
                  return (
                    <tr key={user.id} className="align-top hover">
                      <td className="min-w-48">
                        <p className="font-medium text-neutral">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-base-content/60">{user.rut}</p>
                      </td>
                      <td>
                        <div className="flex flex-wrap items-center gap-2">
                          {list.map((entry) => (
                            <div key={entry.key} className="join">
                              <input
                                className={`input input-bordered input-sm join-item w-16 text-center ${
                                  entry.value && !isValid(entry.value) ? "input-error" : ""
                                }`}
                                inputMode="decimal"
                                placeholder="0,0"
                                value={entry.value}
                                onChange={(e) => setValue(user.id, entry.key, e.target.value)}
                                aria-label="Nota"
                              />
                              <button
                                className="btn btn-sm join-item px-2"
                                onClick={() => removeEntry(user.id, entry)}
                                aria-label="Eliminar nota"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          <button className="btn btn-outline btn-primary btn-sm" onClick={() => addEntry(user.id)}>
                            Agregar nota
                          </button>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${gradeTone(avg)} font-semibold`}>{formatGrade(avg)}</span>
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

export default Grades;
