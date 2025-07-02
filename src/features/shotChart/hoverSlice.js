import { createSlice } from "@reduxjs/toolkit";

const hoverSlice = createSlice({
    name: "hover",
    initialState: {
        hoveredShot: null,
        hoveredDistance: null,
    },
    reducers: {
        setHoveredShot: (state, action) => {
            state.hoveredShot = action.payload;
        },
        clearHoveredShot: (state) => {
            state.hoveredShot = null;
        },
        setHoveredDistance: (state, action) => {
            state.hoveredDistance = action.payload; // number in ft
        },
        clearHoveredDistance: (state) => {
            state.hoveredDistance = null;
        },
    }
});

export const {
  setHoveredShot,
  clearHoveredShot,
  setHoveredDistance,
  clearHoveredDistance,
} = hoverSlice.actions;

export default hoverSlice.reducer;
