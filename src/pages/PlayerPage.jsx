import { useParams } from "react-router-dom";

const PlayerPage = () => {
  const { id } = useParams();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <h2 className="text-2xl font-semibold text-gray-700">Player ID: {id}</h2>
      {/* Later: Fetch and show player stats here */}
    </div>
  );
};

export default PlayerPage;
