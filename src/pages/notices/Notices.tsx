import { FormEvent, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "../../auth/AuthContext";
import PageHeader from "../../components/PageHeader";
import Modal from "../../components/Modal";
import { EmptyState, ErrorState, Spinner } from "../../components/States";
import { CREATE_NOTICE, DELETE_NOTICE, GET_ALL_NOTICES, NoticeDto } from "../../graphql/operations";
import { formatDate } from "../../lib/format";
import { confirmAction, errorMessage, notifyError, notifySuccess } from "../../lib/alerts";

const emptyForm = { title: "", description: "", imageUrl: "" };

const Notices = () => {
  const { session } = useAuth();
  const canPublish = session?.role === "teacher" || session?.role === "admin";
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, loading, error } = useQuery<{ getAllNotices: NoticeDto[] }>(GET_ALL_NOTICES);
  const [createNotice, createState] = useMutation(CREATE_NOTICE, { refetchQueries: [GET_ALL_NOTICES] });
  const [deleteNotice] = useMutation(DELETE_NOTICE, { refetchQueries: [GET_ALL_NOTICES] });
  const notices = data?.getAllNotices ?? [];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const { data: result } = await createNotice({
        variables: {
          title: form.title.trim(),
          description: form.description.trim(),
          imageUrl: form.imageUrl.trim() || null,
        },
      });
      if (!result?.createNotice?.isCreateNotice) {
        throw new Error("No se pudo publicar el anuncio");
      }
      notifySuccess("Anuncio publicado");
      setForm(emptyForm);
      setOpen(false);
    } catch (err) {
      notifyError(errorMessage(err));
    }
  };

  const handleDelete = async (notice: NoticeDto) => {
    const confirmed = await confirmAction("Eliminar anuncio", `Se eliminará "${notice.title}".`, "Eliminar");
    if (!confirmed) {
      return;
    }
    try {
      await deleteNotice({ variables: { id: Number(notice.id) } });
      notifySuccess("Anuncio eliminado");
    } catch (err) {
      notifyError(errorMessage(err));
    }
  };

  return (
    <>
      <PageHeader
        title="Anuncios"
        subtitle={canPublish ? "Publica comunicados para la comunidad escolar" : "Comunicados del colegio"}
        actions={
          canPublish && (
            <button className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>
              Nuevo anuncio
            </button>
          )
        }
      />

      {error ? (
        <ErrorState message="No se pudieron cargar los anuncios." />
      ) : loading && notices.length === 0 ? (
        <Spinner />
      ) : notices.length === 0 ? (
        <EmptyState title="No hay anuncios publicados" description="Cuando se publique un comunicado aparecerá aquí." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {notices.map((notice) => (
            <article key={notice.id} className="surface flex flex-col gap-3">
              {notice.imageUrl && (
                <img src={notice.imageUrl} alt="" className="h-44 w-full rounded-box object-cover" loading="lazy" />
              )}
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-neutral">{notice.title}</h2>
                <span className="whitespace-nowrap text-xs text-base-content/60">{formatDate(notice.createdAt)}</span>
              </div>
              <p className="whitespace-pre-line text-sm text-base-content/80">{notice.description}</p>
              {canPublish && (
                <div className="mt-auto">
                  <button className="btn btn-ghost btn-sm text-error" onClick={() => handleDelete(notice)}>
                    Eliminar
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <Modal open={open} title="Nuevo anuncio" onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="form-control">
            <span className="label py-1">
              <span className="field-label">Título</span>
            </span>
            <input
              className="input input-bordered w-full"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </label>
          <label className="form-control">
            <span className="label py-1">
              <span className="field-label">Mensaje</span>
            </span>
            <textarea
              className="textarea textarea-bordered h-32 w-full"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
            />
          </label>
          <label className="form-control">
            <span className="label py-1">
              <span className="field-label">URL de imagen (opcional)</span>
            </span>
            <input
              type="url"
              className="input input-bordered w-full"
              placeholder="https://"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </label>
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={createState.loading}>
              Publicar
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Notices;
