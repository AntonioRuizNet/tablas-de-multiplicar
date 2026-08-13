import React, { useEffect, useState } from "react";
import styles from "./Leaderboard.module.css";

export function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/leaderboard", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled && data.ok && Array.isArray(data.users)) setUsers(data.users);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className={styles.card} aria-labelledby="leaderboard-title">
      <div className={styles.heading}>
        <span aria-hidden="true">🏆</span>
        <h2 id="leaderboard-title">Top usuarios</h2>
      </div>

      {loading ? (
        <p className={styles.empty}>Cargando clasificación…</p>
      ) : users.length === 0 ? (
        <p className={styles.empty}>Aún no hay usuarios con puntos.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Usuario</th>
                <th>Puntos</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td title={user.name}>{user.name}</td>
                  <td>{user.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
