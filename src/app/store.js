import { configureStore } from "@reduxjs/toolkit";
import shotDataReducer from "../features/shotChart/shotDataSlice";
import filtersReducer from "../features/shotChart/filtersSlice";
import hoverReducer from "../features/shotChart/hoverSlice";
import crosshairReducer from "../features/shotChart/crosshairSlice";

const store = configureStore({
  reducer: {
    shotData: shotDataReducer,
    filters: filtersReducer,
    hover: hoverReducer,
    crosshair: crosshairReducer,
  },
});

export default store;
