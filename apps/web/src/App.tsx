import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Search from "./pages/Search";
import AnimeDetail from "./pages/AnimeDetail";
import Watch from "./pages/Watch";
import Browse from "./pages/Browse";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
          <Route path="/search" element={<ErrorBoundary><Search /></ErrorBoundary>} />
          <Route path="/anime/:id" element={<ErrorBoundary><AnimeDetail /></ErrorBoundary>} />
          <Route path="/watch" element={<ErrorBoundary><Watch /></ErrorBoundary>} />
          <Route path="/browse" element={<ErrorBoundary><Browse /></ErrorBoundary>} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
}
