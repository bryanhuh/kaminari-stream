import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";
import ErrorBoundary from "./components/ErrorBoundary";
import RateLimitToast from "./components/RateLimitToast";
import SkipToContent from "./components/SkipToContent";
import NavigationProgress from "./components/NavigationProgress";
import PageSkeleton from "./components/PageSkeleton";

const Home = lazy(() => import("./pages/Home"));
const Search = lazy(() => import("./pages/Search"));
const AnimeDetail = lazy(() => import("./pages/AnimeDetail"));
const Watch = lazy(() => import("./pages/Watch"));
const Browse = lazy(() => import("./pages/Browse"));
const Shows = lazy(() => import("./pages/Shows"));
const Movies = lazy(() => import("./pages/Movies"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const History = lazy(() => import("./pages/History"));
const NotFound = lazy(() => import("./pages/NotFound"));

function useFocusOnRouteChange() {
  const location = useLocation();
  useEffect(() => {
    const main = document.getElementById("main-content");
    if (main) main.focus({ preventScroll: true });
  }, [location.pathname, location.search]);
}

export default function App() {
  useFocusOnRouteChange();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      <SkipToContent />
      <NavigationProgress />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 pb-16 md:pb-0 outline-none">
        <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
              <Route path="/search" element={<ErrorBoundary><Search /></ErrorBoundary>} />
              <Route path="/anime/:id" element={<ErrorBoundary><AnimeDetail /></ErrorBoundary>} />
              <Route path="/watch" element={<ErrorBoundary><Watch /></ErrorBoundary>} />
              <Route path="/browse" element={<ErrorBoundary><Browse /></ErrorBoundary>} />
              <Route path="/shows" element={<ErrorBoundary><Shows /></ErrorBoundary>} />
              <Route path="/movies" element={<ErrorBoundary><Movies /></ErrorBoundary>} />
              <Route path="/watchlist" element={<ErrorBoundary><Watchlist /></ErrorBoundary>} />
              <Route path="/history" element={<ErrorBoundary><History /></ErrorBoundary>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <BottomNav />
      <RateLimitToast />
    </div>
  );
}
