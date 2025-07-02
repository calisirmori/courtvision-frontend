import { useSelector } from "react-redux";
import ShotCourt from "./ShotCourt";
import ShotFilters from "./ShotFilters";
import ShotDistanceLineChart from "./ShotDistanceLineChart";
import ShotFGPercentageLineChart from "./ShotFGPercentageLineChart";
import ShotSideFrequencyChart from "./ShotSideFrequencyChart";
import ShotSideFGPercentageBarChart from "./ShotSideFGPercentageChart";

const ShotCourtWrapper = () => {
  const { shots, status } = useSelector((state) => state.shotData);
  const { selectedGameIds, madeOnly } = useSelector((state) => state.filters);
  const hoveredShot = useSelector((state) => state.hover.hoveredShot);

  if (status === "loading") return <p className="p-4">Loading chart...</p>;
  if (!shots || shots.length === 0) return <p className="p-4">No shots available.</p>;

  const allGameIds = [...new Set(shots.map((s) => s.id.gameId))];

  const filteredShots = shots.filter((shot) => {
    const byGame = selectedGameIds.length === 0 || selectedGameIds.includes(shot.id.gameId);
    const byMake = !madeOnly || shot.shotMadeFlag === 1;
    return byGame && byMake;
  });

  return (
    <div className="flex flex-col items-center space-y-6">
      <ShotFilters allGameIds={allGameIds} />
      <ShotCourt shots={filteredShots} />
      <ShotDistanceLineChart shots={filteredShots} />
      <ShotFGPercentageLineChart shots={filteredShots} />
      <ShotSideFrequencyChart shots={filteredShots} />
      <ShotSideFGPercentageBarChart shots={filteredShots} />
      {hoveredShot && ( 
        <div className="bg-yellow-100 text-sm px-4 py-2 rounded shadow-md">
          <p><strong>{hoveredShot.eventType}</strong> - {hoveredShot.actionType}</p>
          <p>{hoveredShot.shotZoneBasic} ({hoveredShot.shotDistance} ft)</p>
        </div>
      )}
    </div>
  );
};

export default ShotCourtWrapper;
