import { FormEvent, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useAuth } from "../../auth/AuthContext";
import PageHeader from "../../components/PageHeader";
import { EmptyState, ErrorState, Spinner } from "../../components/States";
import { CHAT_CONTACTS, CONVERSATION, MessageDto, SEND_MESSAGE } from "../../graphql/operations";
import { formatDate, formatTime, initials } from "../../lib/format";
import { errorMessage, notifyError } from "../../lib/alerts";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

const roleName: Record<string, string> = {
  Teacher: "Profesor",
  Parents: "Apoderado",
  Admin: "Administrador",
};

const Conversation = ({ contact, myId }: { contact: Contact; myId: number }) => {
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const withId = Number(contact.id);

  const { data, loading } = useQuery<{ conversation: MessageDto[] }>(CONVERSATION, {
    variables: { withId },
    pollInterval: 4000,
    fetchPolicy: "network-only",
  });
  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE, {
    refetchQueries: [{ query: CONVERSATION, variables: { withId } }],
    awaitRefetchQueries: true,
  });
  const messages = data?.conversation ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const content = text.trim();
    if (!content) {
      return;
    }
    try {
      await sendMessage({ variables: { toId: withId, content } });
      setText("");
    } catch (error) {
      notifyError(errorMessage(error));
    }
  };

  return (
    <div className="flex h-[32rem] flex-col">
      <div className="flex items-center gap-3 border-b border-base-300 px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-content">
          {initials(contact.firstName, contact.lastName)}
        </span>
        <div>
          <p className="text-sm font-semibold text-neutral">
            {contact.firstName} {contact.lastName}
          </p>
          <p className="text-xs text-base-content/60">{roleName[contact.role] ?? contact.role}</p>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto bg-base-200/50 px-4 py-4">
        {loading && messages.length === 0 ? (
          <Spinner />
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-base-content/60">Aún no hay mensajes. Escribe el primero.</p>
        ) : (
          messages.map((message, index) => {
            const mine = message.fromId === myId;
            const newDay = index === 0 || formatDate(messages[index - 1].createdAt) !== formatDate(message.createdAt);
            return (
              <div key={message.id}>
                {newDay && (
                  <p className="my-2 text-center text-xs text-base-content/50">{formatDate(message.createdAt)}</p>
                )}
                <div className={`chat ${mine ? "chat-end" : "chat-start"}`}>
                  <div className={`chat-bubble text-sm ${mine ? "chat-bubble-primary" : "bg-base-100 text-base-content"}`}>
                    {message.content}
                  </div>
                  <div className="chat-footer mt-1 text-xs opacity-60">{formatTime(message.createdAt)}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-base-300 p-3">
        <input
          className="input input-bordered flex-1"
          placeholder="Escribe un mensaje"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
          Enviar
        </button>
      </form>
    </div>
  );
};

const Chat = () => {
  const { session } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, loading, error } = useQuery<{ chatContacts: Contact[] }>(CHAT_CONTACTS);
  const contacts = data?.chatContacts ?? [];
  const selected = contacts.find((contact) => contact.id === selectedId) ?? null;

  if (!session) {
    return null;
  }

  return (
    <>
      <PageHeader
        title="Mensajes"
        subtitle={
          session.role === "parents"
            ? "Conversa con los profesores de tus pupilos"
            : "Conversa con los apoderados de tus estudiantes"
        }
      />
      {error ? (
        <ErrorState message="No se pudieron cargar tus contactos." />
      ) : loading && !data ? (
        <Spinner />
      ) : contacts.length === 0 ? (
        <EmptyState
          title="Aún no tienes contactos"
          description={
            session.role === "parents"
              ? "Podrás escribir a los profesores cuando tus pupilos estén inscritos en alguna asignatura."
              : "Aparecerán los apoderados de los estudiantes inscritos en tus asignaturas."
          }
        />
      ) : (
        <div className="surface grid overflow-hidden p-0 md:grid-cols-3">
          <aside className="border-b border-base-300 md:border-b-0 md:border-r">
            <ul className="menu w-full p-2">
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <button
                    className={selectedId === contact.id ? "active" : ""}
                    onClick={() => setSelectedId(contact.id)}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-content">
                      {initials(contact.firstName, contact.lastName)}
                    </span>
                    <span className="flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {contact.firstName} {contact.lastName}
                      </span>
                      <span className="text-xs opacity-70">{roleName[contact.role] ?? contact.role}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <div className="md:col-span-2">
            {selected ? (
              <Conversation key={selected.id} contact={selected} myId={session.id} />
            ) : (
              <div className="flex h-[32rem] items-center justify-center text-sm text-base-content/60">
                Selecciona un contacto para ver la conversación.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
