import { GitHub } from "arctic";

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!,
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000/login/github/callback"
    : "https://chat.westbrookdaniel.com/login/github/callback",
);
