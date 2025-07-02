import { useDispatch, useSelector } from "react-redux";
import { toggleMadeOnly, toggleGameId, clearGameIds } from "../../features/shotChart/filtersSlice";

const ShotFilters = ({ allGameIds }) => {
  const dispatch = useDispatch();
  const selectedGameIds = useSelector((state) => state.filters.selectedGameIds);
  const madeOnly = useSelector((state) => state.filters.madeOnly);

  return (
    <div className="flex flex-col gap-4 bg-white border p-4 rounded shadow-md">
      <h3 className="font-semibold text-lg">Filters</h3>

      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={madeOnly}
            onChange={() => dispatch(toggleMadeOnly())}
          />
          Made shots only
        </label>
      </div>

      <div>
        <p className="font-medium mb-1">Filter by Game</p>
        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
          {allGameIds.map((id) => (
            <button
              key={id}
              onClick={() => dispatch(toggleGameId(id))}
              className={`px-2 py-1 rounded border ${
                selectedGameIds.includes(id)
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {id.slice(-4)}
            </button>
          ))}
        </div>
        <button
          onClick={() => dispatch(clearGameIds())}
          className="text-sm text-red-500 mt-2"
        >
          Clear game filters
        </button>
      </div>
    </div>
  );
};

export default ShotFilters;
