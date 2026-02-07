import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import styles from "./AchievementsToastStack.module.css";
import { ACHIEVEMENTS_BY_ID } from "../../constants/achievements";

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function AchievementsToastStack() {
  const unlocked = useSelector((state) => state.achievements?.unlocked || {});

  // ids ya vistos en esta sesión para no spamear al hidratar persist
  const seenIdsRef = useRef(new Set());

  // cola de toasts visibles
  const [toasts, setToasts] = useState([]);

  const unlockedIds = useMemo(() => Object.keys(unlocked), [unlocked]);

  useEffect(() => {
    // primera carga (hidratar persist): marcamos como vistos sin mostrar
    if (seenIdsRef.current.size === 0 && unlockedIds.length > 0) {
      unlockedIds.forEach((id) => seenIdsRef.current.add(id));
      return;
    }

    // detectar nuevos
    const newlyUnlocked = unlockedIds.filter((id) => !seenIdsRef.current.has(id));
    if (newlyUnlocked.length === 0) return;

    newlyUnlocked.forEach((id) => seenIdsRef.current.add(id));

    // crear un toast por cada logro nuevo
    const newToasts = newlyUnlocked
      .map((achievementId) => {
        const a = ACHIEVEMENTS_BY_ID[achievementId];
        if (!a) return null;
        return {
          toastId: makeId(),
          achievementId,
          title: a.title,
          icon: a.icon,
        };
      })
      .filter(Boolean);

    if (newToasts.length === 0) return;

    setToasts((prev) => [...newToasts, ...prev]);

    // auto-dismiss
    newToasts.forEach((t) => {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.toastId !== t.toastId));
      }, 3500);
    });
  }, [unlockedIds]);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.stack} aria-live="polite" aria-label="Notificaciones de logros">
      {toasts.map((t) => (
        <div key={t.toastId} className={styles.toast} role="status">
          <div className={styles.icon}>{t.icon}</div>
          <div className={styles.text}>
            <div className={styles.kicker}>¡Logro desbloqueado!</div>
            <div className={styles.title}>{t.title}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
