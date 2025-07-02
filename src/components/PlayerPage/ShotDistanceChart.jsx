import { useSelector } from "react-redux";

const BIN_SIZE = 2;
const MAX_DISTANCE = 35;

const ShotDistanceChart = () => {
  const shots = useSelector((state) => state.shotData.shots);
  const hoveredShot = useSelector((state) => state.hover.hoveredShot);

  // Bin shots by distance
  const bins = Array.from({ length: Math.ceil(MAX_DISTANCE / BIN_SIZE) }, (_, i) => ({
    binStart: i * BIN_SIZE,
    binEnd: (i + 1) * BIN_SIZE,
    count: 0,
  }));

  shots.forEach((shot) => {
    const dist = shot.shotDistance;
    const index = Math.floor(dist / BIN_SIZE);
    if (bins[index]) bins[index].count++;
  });

  const maxCount = Math.max(...bins.map((b) => b.count || 1));
  const hoveredBin = hoveredShot ? Math.floor(hoveredShot.shotDistance / BIN_SIZE) : null;

  return (
    <div className="w-full max-w-md">
      <h3 className="font-semibold text-lg mb-2">Shot Frequency by Distance</h3>
      <div className="flex items-end gap-1 h-32 border-b border-gray-300">
        {bins.map((bin, i) => (
          <div
            key={i}
            className={`flex-1 transition-all ${
              hoveredBin === i ? "bg-blue-500" : "bg-gray-400"
            }`}
            style={{ height: `${(bin.count / maxCount) * 100}%` }}
            title={`${bin.binStart}–${bin.binEnd} ft: ${bin.count}`}
          />
        ))}
      </div>
      <div className="flex text-xs text-gray-600 mt-1 justify-between">
        <span>0 ft</span>
        <span>{MAX_DISTANCE} ft</span>
      </div>
    </div>
  );
};

export default ShotDistanceChart;
