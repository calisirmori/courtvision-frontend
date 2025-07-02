import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to CourtVision</h1>
      <button
        onClick={() => navigate("/players/201939")}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go to Steph Curry
      </button>
    </div>
  );
};

export default HomePage;
