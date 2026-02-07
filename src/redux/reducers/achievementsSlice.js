import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // unlocked: { [id]: { unlockedAt: number } }
  unlocked: {},
};

const achievementsSlice = createSlice({
  name: "achievements",
  initialState,
  reducers: {
    unlockAchievement: (state, action) => {
      const id = action.payload;
      if (!id) return;
      if (state.unlocked[id]) return; // ya desbloqueado
      state.unlocked[id] = { unlockedAt: Date.now() };
    },
    unlockMany: (state, action) => {
      const ids = action.payload || [];
      ids.forEach((id) => {
        if (!state.unlocked[id]) state.unlocked[id] = { unlockedAt: Date.now() };
      });
    },
    resetAchievements: (state) => {
      state.unlocked = {};
    },
  },
});

export const { unlockAchievement, unlockMany, resetAchievements } = achievementsSlice.actions;
export default achievementsSlice.reducer;
