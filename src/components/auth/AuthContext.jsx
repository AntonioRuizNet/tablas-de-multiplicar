import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { hydrateUserConfig, resetUserConfig } from "../../redux/reducers/userConfigSlice";
import { hydrateAchievements, resetAchievements } from "../../redux/reducers/achievementsSlice";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyPayload = useCallback((payload) => {
    setUser(payload?.user || null);
    if (payload?.user && payload?.progress) {
      dispatch(hydrateUserConfig(payload.progress.userConfig));
      dispatch(hydrateAchievements(payload.progress.unlocked));
    }
  }, [dispatch]);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
      const data = await response.json();
      applyPayload(data);
    } catch (error) {
      console.error("No se ha podido comprobar la sesión", error);
    } finally { setLoading(false); }
  }, [applyPayload]);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (email, password) => {
    const response = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,password}) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se ha podido iniciar sesión.");
    applyPayload(data); return data.user;
  }, [applyPayload]);

  const register = useCallback(async ({ name, email, password }) => {
    const response = await fetch("/api/auth/register", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name,email,password}) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se ha podido crear la cuenta.");
    applyPayload(data); return data.user;
  }, [applyPayload]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method:"POST" }).catch(() => {});
    setUser(null);
    dispatch(resetUserConfig());
    dispatch(resetAchievements());
  }, [dispatch]);

  const value = useMemo(() => ({ user, loading, login, register, logout, refresh, setUser }), [user, loading, login, register, logout, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
AuthProvider.propTypes = { children: PropTypes.node.isRequired };
export function useAuth() { return useContext(AuthContext); }
