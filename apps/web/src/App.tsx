import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Search from "./pages/Search";
import AnimeDetail from "./pages/AnimeDetail";
import Watch from "./pages/Watch";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/anime/:id" element={<AnimeDetail />} />
        <Route path="/watch" element={<Watch />} />
      </Routes>
    </div>
  );
}
