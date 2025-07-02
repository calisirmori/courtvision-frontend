import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchShotData } from "../features/shotChart/shotDataSlice";
import {
  fetchPlayerProfiles,
  fetchGameSummary,
} from "../api";
import ShotCourtWrapper from "../components/PlayerPage/ShotCourtWrapper";

const PlayerPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [primaryPlayer, setPrimaryPlayer] = useState(null);
  const [otherPlayers, setOtherPlayers] = useState([]);
  const [gameSummary, setGameSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const season = "2024-25";

  useEffect(() => {
    const loadData = async () => {
      try {
        const players = await fetchPlayerProfiles(season);
        const matched = players.find((p) => p.playerId === Number(id));
        const others = players.filter((p) => p.playerId !== Number(id));
        setPrimaryPlayer(matched);
        setOtherPlayers(others);

        if (!matched) return;

        dispatch(fetchShotData(matched.playerId));
        const summary = await fetchGameSummary(matched.teamId, season);
        setGameSummary(summary);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, dispatch]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!primaryPlayer) return <div className="p-6 text-red-600">Player not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">{primaryPlayer.displayFirstLast}</h1>

      <ShotCourtWrapper />

      {/* Game summary debug output for now */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Game Summary</h2>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
          {JSON.stringify(gameSummary, null, 2)}
        </pre>
      </section>
    </div>
  );
};

export default PlayerPage;
