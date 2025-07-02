import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const SEASON = "2015-16";

// Async thunk to fetch shot data
export const fetchShotData = createAsyncThunk(
  "shotChart/fetchShotData",
  async (playerId) => {
    const response = await fetch(
      `http://localhost:8080/shot-chart?playerId=${playerId}&season=${SEASON}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch shot data");
    }
    return await response.json();
  }
);

const shotDataSlice = createSlice({
  name: "shotChart",
  initialState: {
    shots: [],
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShotData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchShotData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.shots = action.payload;
      })
      .addCase(fetchShotData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default shotDataSlice.reducer;
