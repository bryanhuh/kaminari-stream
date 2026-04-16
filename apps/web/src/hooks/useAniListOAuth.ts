import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";

interface OAuthStatus {
  connected: boolean;
  anilistUserId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export function useAniListOAuthStatus() {
  return useQuery<OAuthStatus>({
    queryKey: ["anilist", "oauth", "status"],
    queryFn: () => api.get<OAuthStatus>("/api/auth/anilist/status"),
  });
}

interface AuthUrlResponse {
  authUrl: string;
}

export function useAniListOAuthUrl() {
  return useQuery<AuthUrlResponse>({
    queryKey: ["anilist", "oauth", "url"],
    queryFn: () => api.get<AuthUrlResponse>("/api/auth/anilist"),
    enabled: false,
  });
}

export function useDisconnectAniList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetch(`${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000"}/api/auth/anilist`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("raijin_auth") ? JSON.parse(localStorage.getItem("raijin_auth")!).token : ""}`,
        },
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["anilist", "oauth", "status"] });
    },
  });
}
