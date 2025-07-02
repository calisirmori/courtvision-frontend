import { createSlice } from "@reduxjs/toolkit";

const filtersSlice = createSlice({
  name: "filters",
  initialState: {
    selectedGameIds: [],
    madeOnly: false,
  },
  reducers: {
    toggleGameId: (state, action) => {
      const gameId = action.payload;
      if (state.selectedGameIds.includes(gameId)) {
        state.selectedGameIds = state.selectedGameIds.filter((id) => id !== gameId);
      } else {
        state.selectedGameIds.push(gameId);
      }
    },
    clearGameIds: (state) => {
      state.selectedGameIds = [];
    },
    toggleMadeOnly: (state) => {
      state.madeOnly = !state.madeOnly;
    },
  },
});

export const { toggleGameId, clearGameIds, toggleMadeOnly } = filtersSlice.actions;
export default filtersSlice.reducer;
