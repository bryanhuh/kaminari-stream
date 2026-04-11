import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ApiError } from "./lib/api";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      // Never retry a 429 — retrying makes rate limiting worse.
      // For other errors, allow one retry.
      retry: (failureCount, error) => {
        if (error instanceof ApiError && (error.status === 429 || error.status === 401)) return false;
        return failureCount < 1;
      },
      // Don't refetch when the user switches back to the tab.
      // This is the primary cause of burst 429s in practice.
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
