// features/shotChart/crosshairSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  distance: null,
  x: null,
  y: null,
};

const crosshairSlice = createSlice({
  name: "crosshair",
  initialState,
  reducers: {
    setCrosshair: (state, action) => {
      state.distance = action.payload.distance;
      state.x = action.payload.x;
      state.y = action.payload.y;
    },
    clearCrosshair: (state) => {
      state.distance = null;
      state.x = null;
      state.y = null;
    },
  },
});

export const { setCrosshair, clearCrosshair } = crosshairSlice.actions;
export default crosshairSlice.reducer;
