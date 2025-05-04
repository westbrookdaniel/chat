import {
  generateSessionToken,
  createSession,
  setSessionTokenCookie,
} from "@/lib/session";
import { github } from "@/lib/oauth";
import { cookies } from "next/headers";

import type { OAuth2Tokens } from "arctic";
import { db, eq, userTable } from "@/db";

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const cookieStore = await cookies();
    const storedState = cookieStore.get("github_oauth_state")?.value ?? null;
    if (code === null || state === null || storedState === null) {
      return new Response(null, {
        status: 400,
      });
    }
    if (state !== storedState) {
      return new Response(null, {
        status: 400,
      });
    }

    let tokens: OAuth2Tokens;
    try {
      tokens = await github.validateAuthorizationCode(code);
    } catch {
      // Invalid code or client credentials
      return new Response(null, {
        status: 400,
      });
    }
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`,
      },
    });
    const githubUser = await githubUserResponse.json();
    const githubUserId = githubUser.id;
    const githubUsername = githubUser.login;
    const githubName = githubUser.name;
    const githubAvatarUrl = githubUser.avatar_url;

    const betaUsernames = process.env.BETA_USERNAMES?.split(",") ?? [];
    if (!betaUsernames.includes(githubUsername)) {
      console.log("[Login][GitHub][Denied]", githubUsername);
      return new Response(
        "This app is in private beta. Your GitHub username is not on the allowlist.",
        { status: 403, headers: { "Content-Type": "text/plain" } },
      );
    }

    const existingUser = await db.query.userTable.findFirst({
      where: eq(userTable.githubId, githubUserId),
    });

    if (existingUser) {
      const sessionToken = generateSessionToken();
      const session = await createSession(sessionToken, existingUser.id);
      await setSessionTokenCookie(sessionToken, session.expiresAt);
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      });
    }

    const user = await db
      .insert(userTable)
      .values({
        githubId: githubUserId,
        username: githubUsername,
        fullName: githubName,
        avatarUrl: githubAvatarUrl,
      })
      .returning()
      .then((rows) => rows[0]);

    const sessionToken = generateSessionToken();
    const session = await createSession(sessionToken, user.id);
    await setSessionTokenCookie(sessionToken, session.expiresAt);
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    });
  } catch (e) {
    console.error("Error in GitHub OAuth callback:", e);
    return new Response("Authentication error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
