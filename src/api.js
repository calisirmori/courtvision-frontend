const BASE_URL = import.meta.env.VITE_API_URL || "https://courtvision.moricalisir.com/api";

export const fetchPlayerProfiles = async (season) => {
  const res = await fetch(`${BASE_URL}/player-profile?season=${season}`);
  return await res.json();
};

export const fetchShotChart = async (playerId, season) => {
  const res = await fetch(`${BASE_URL}/shot-chart?playerId=${playerId}&season=${season}`);
  return await res.json();
};

export const fetchGameSummary = async (teamId, season) => {
  const res = await fetch(`${BASE_URL}/game-summary?season=${season}&teamId=${teamId}`);
  return await res.json();
};
