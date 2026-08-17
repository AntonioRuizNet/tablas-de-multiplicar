import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../auth/AuthContext";
import { hydrateUserConfig, updateStatus } from "../../redux/reducers/userConfigSlice";
import { hydrateAchievements } from "../../redux/reducers/achievementsSlice";
import { activityAward } from "../../lib/progression";

export function useActivityReward() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [reward, setReward] = useState(null);

  const awardActivity = useCallback(async (type, result) => {
    setReward(null);
    if (!user) {
      const operations = Array.isArray(result?.operations) ? result.operations : [];
      const evaluated = operations.map((op) => Number(op.answer) === Number(op.table) * Number(op.multiplier));
      const correct = evaluated.filter(Boolean).length;
      const total = operations.length || (type === "memory" ? 6 : 0);
      const points = activityAward(type, { ...result, correct: type === "memory" ? 6 : correct, wrong: Math.max(0, total - correct), total });
      if (points > 0) dispatch(updateStatus(points));
      setReward(points);
      return points;
    }
    const response = await fetch("/api/progress/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, ...result }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "No se ha podido guardar la recompensa.");
    if (data.progress) {
      dispatch(hydrateUserConfig(data.progress.userConfig));
      dispatch(hydrateAchievements(data.progress.unlocked));
    }
    setReward(Number(data.pointsAwarded || 0));
    return Number(data.pointsAwarded || 0);
  }, [dispatch, user]);

  return { awardActivity, reward };
}
