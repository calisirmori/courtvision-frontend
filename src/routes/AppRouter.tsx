import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import PlayerPage from "../pages/PlayerPage";

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/players/:id" element={<PlayerPage />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter;