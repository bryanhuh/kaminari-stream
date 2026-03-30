import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Client, cacheExchange, fetchExchange, Provider as UrqlProvider } from "urql";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5 },
  },
});

const urqlClient = new Client({
  url: import.meta.env.VITE_ANILIST_URL ?? "https://graphql.anilist.co",
  exchanges: [cacheExchange, fetchExchange],
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UrqlProvider value={urqlClient}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </UrqlProvider>
  </StrictMode>
);
