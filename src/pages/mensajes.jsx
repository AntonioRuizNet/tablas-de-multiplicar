import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "../components/layout/AppLayout";
import { UserAvatar } from "../components/avatar/UserAvatar";
import { useAuth } from "../components/auth/AuthContext";
import styles from "../styles/messages.module.css";

export default function Mensajes() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [thread, setThread] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const loadConversations = async () => {
    const r = await fetch("/api/messages", { cache: "no-store" });
    const d = await r.json();
    if (r.ok) setConversations(d.conversations || []);
  };
  const loadThread = async (id) => {
    const r = await fetch(`/api/messages?with=${encodeURIComponent(id)}`, { cache: "no-store" });
    const d = await r.json();
    if (r.ok) {
      setThread(d);
      setActive(id);
      setError("");
    } else setError(d.error || "No se ha podido abrir la conversación.");
  };
  useEffect(() => {
    loadConversations().catch(() => setError("No se han podido cargar los mensajes."));
  }, []);
  useEffect(() => {
    if (router.isReady && router.query.con && !active) loadThread(String(router.query.con));
  }, [router.isReady, router.query.con, active]);
  useEffect(() => {
    if (!active) return undefined;
    const interval = window.setInterval(() => loadThread(active).catch(() => {}), 20000);
    return () => window.clearInterval(interval);
  }, [active]);
  const send = async (event) => {
    event.preventDefault();
    if (!active || !text.trim()) return;
    const r = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId: active, body: text }),
    });
    const d = await r.json();
    if (!r.ok) {
      setError(d.error || "No se ha podido enviar.");
      return;
    }
    setText("");
    await loadThread(active);
    await loadConversations();
  };
  const moderate = async (action, messageId) => {
    const body = action === "report" ? { action, messageId } : { action, userId: active };
    const r = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await r.json();
    if (!r.ok) setError(d.error || "No se ha podido completar la acción.");
    else if (action !== "report") loadThread(active);
  };
  return (
    <AppLayout title="Mensajes | Tablas de multiplicar" description="Mensajes entre amigos.">
      <main className={styles.page}>
        <header>
          <h1>Mensajes</h1>
          <p>Solo puedes hablar con amigos aceptados. Los enlaces y el lenguaje ofensivo no están permitidos.</p>
        </header>
        {error ? <p className={styles.error}>{error}</p> : null}
        <div className={styles.layout}>
          <aside className={styles.list}>
            <h2>Amigos</h2>
            {conversations.length ? (
              conversations.map((c) => (
                <button
                  key={c.id}
                  className={`${styles.conversation} ${active === c.id ? styles.active : ""}`}
                  onClick={() => loadThread(c.id)}
                >
                  <UserAvatar icon={c.avatar_icon} color={c.avatar_color} size={28} />
                  <span>
                    <strong>{c.name}</strong>
                    <small>{c.last_body || "Sin mensajes todavía"}</small>
                  </span>
                  {c.unread ? <b>{c.unread}</b> : null}
                </button>
              ))
            ) : (
              <p>Aún no tienes amigos aceptados.</p>
            )}
          </aside>
          <section className={styles.thread}>
            {!thread ? (
              <p>Selecciona un amigo para empezar una conversación.</p>
            ) : (
              <>
                <div className={styles.threadHead}>
                  <div>
                    <UserAvatar icon={thread.person.avatar_icon} color={thread.person.avatar_color} size={42} />
                    <strong>{thread.person.name}</strong>
                  </div>
                  <button className={styles.textButton} onClick={() => moderate(thread.blocked ? "unblock" : "block")}>
                    {thread.blocked ? "Desbloquear" : "Bloquear"}
                  </button>
                </div>
                <div className={styles.messages}>
                  {thread.messages.length ? (
                    thread.messages.map((m) => (
                      <article key={m.id} className={m.sender_id === user?.id ? styles.own : styles.theirs}>
                        <p>{m.body}</p>
                        <small>{new Date(m.created_at).toLocaleString("es-ES")}</small>
                        {m.sender_id !== user?.id ? <button onClick={() => moderate("report", m.id)}>Reportar</button> : null}
                      </article>
                    ))
                  ) : (
                    <p>Aún no hay mensajes. Saluda a tu amigo.</p>
                  )}
                </div>
                {!thread.blocked ? (
                  <form className={styles.compose} onSubmit={send}>
                    <textarea
                      value={text}
                      maxLength="280"
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Escribe un mensaje…"
                    />
                    <button>Enviar</button>
                  </form>
                ) : (
                  <p className={styles.blocked}>Has bloqueado a este usuario.</p>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </AppLayout>
  );
}
