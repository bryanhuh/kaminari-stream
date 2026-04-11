import "dotenv/config";

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 4000,
  consumetBaseUrl: process.env.CONSUMET_BASE_URL ?? "http://localhost:3001",
  databaseUrl: process.env.DATABASE_URL!,
  anilistUrl: process.env.ANILIST_API_URL ?? "https://graphql.anilist.co",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-in-production",
};
