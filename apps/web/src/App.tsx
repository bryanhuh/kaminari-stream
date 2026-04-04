import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Search from "./pages/Search";
import AnimeDetail from "./pages/AnimeDetail";
import Watch from "./pages/Watch";
import Browse from "./pages/Browse";
import Shows from "./pages/Shows";
import Movies from "./pages/Movies";
import ErrorBoundary from "./components/ErrorBoundary";
import RateLimitToast from "./components/RateLimitToast";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
            <Route path="/search" element={<ErrorBoundary><Search /></ErrorBoundary>} />
            <Route path="/anime/:id" element={<ErrorBoundary><AnimeDetail /></ErrorBoundary>} />
            <Route path="/watch" element={<ErrorBoundary><Watch /></ErrorBoundary>} />
            <Route path="/browse" element={<ErrorBoundary><Browse /></ErrorBoundary>} />
            <Route path="/shows" element={<ErrorBoundary><Shows /></ErrorBoundary>} />
            <Route path="/movies" element={<ErrorBoundary><Movies /></ErrorBoundary>} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
      <RateLimitToast />
    </div>
  );
}
