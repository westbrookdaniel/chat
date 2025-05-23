# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
AI chat application built with Next.js 15, PostgreSQL/Drizzle ORM, GitHub OAuth, and Vercel AI SDK supporting OpenAI (GPT-4.1, o4-mini) and Google Gemini models.

## Development Commands

```bash
# Core development
pnpm dev                    # Start dev server with Turbopack
pnpm build                  # Production build  
pnpm lint                   # ESLint checking
pnpm start                  # Start production server

# Database operations
pnpm db generate           # Generate migrations from schema changes
pnpm db push              # Push schema directly to database
pnpm db migrate           # Run pending migrations
pnpm db studio            # Open Drizzle Studio interface

# Local services
docker-compose up          # Start PostgreSQL + WebSocket proxy
```

## Architecture

### Database Schema
- **Users**: GitHub OAuth integration (githubId, username, avatarUrl)
- **Sessions**: 30-day expiry with auto-renewal at 15-day threshold
- **Threads**: Chat conversations with JSON message storage and auto-generated titles

### Authentication System
- GitHub OAuth via Arctic library with CSRF protection
- Base32-encoded session tokens (SHA-256 hashed storage)
- Middleware handles session validation and cookie extension
- Automatic session renewal when < 15 days remaining

### AI Integration
- Model abstraction in `src/lib/models.ts` supports OpenAI and Google models
- Streaming responses via Server-Sent Events with reasoning support
- o4-mini used for "thinking mode" with reasoning display
- Thread titles auto-generated from conversation context

### Key Patterns
- Global PostgreSQL client singleton to prevent connection pool exhaustion
- Server Components for data fetching, Client Components for interactivity
- Snake_case database naming, camelCase TypeScript
- Path aliases: `@/*` maps to `src/*`

## Database Connection
Uses connection pooling optimized for serverless with singleton pattern. Database URL format: `postgresql://user:pass@host:port/db`

## Environment Variables
Required: `DATABASE_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `OPENAI_API_KEY`
Optional: `GEMINI_API_KEY`