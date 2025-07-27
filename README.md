# Chat

An open-source AI chat application built with modern web technologies. Try the hosted version at [chat.westbrookdaniel.com](https://chat.westbrookdaniel.com/) or deploy your own instance.

## Features

- **Multi-Model AI Support**: Easily configurable to use OpenAI, Google, or other AI providers via the Vercel AI SDK
- **GitHub OAuth Authentication**: Secure login with GitHub integration
- **Persistent Chat History**: Conversations are saved and organized in threads
- **Real-time Streaming**: Server-sent events for responsive AI interactions
- **Auto-generated Titles**: Thread titles are automatically created from conversation context
- **Modern UI**: Clean, responsive interface built with shadcn/ui components
- **Reasoning Support**: Display AI reasoning when available
- **File Upload**: Support for file attachments in conversations

## Tech Stack

- **Frontend**: Next.js 15 with React Server Components
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: GitHub OAuth via Arctic and Oslo library
- **AI Integration**: Vercel AI SDK with model abstraction
- **Styling**: Tailwind CSS with shadcn/ui components
- **Deployment**: Optimized for Vercel and other serverless platforms

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- GitHub OAuth app credentials

### Environment Variables

Create a `.env.local` file with:

```bash
DATABASE_URL=postgresql://user:pass@host:port/db
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Installation

```bash
# Clone the repository
git clone https://github.com/westbrookdaniel/chat.git
cd chat

# Install dependencies
pnpm install

# Start PostgreSQL (optional, using Docker)
docker-compose up -d

# Generate and run database migrations
pnpm db generate
pnpm db migrate

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Development Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm lint         # Run ESLint
pnpm db           # Run Drizzle commands
```

## Configuration

### AI Model Configuration

The application uses Vercel's [AI SDK](https://ai-sdk.dev/). See their docs for how to configure different models and providers. 
Out of the box Anthropic has been configured with a variety of their models.

### OAuth Setup

Authentication has been configured using [Oslo](https://oslojs.dev/) and [Artic](https://arcticjs.dev/) for maximum flexibility. Oslo supports many OAuth providers that can be easily made to work with this app, but it has been preconfigured to use GitHub. Ensure if you change the provider to update the database user columns too.

Setup GitHub OAuth:

1. Create a GitHub OAuth app at [github.com/settings/developers](https://github.com/settings/developers)
2. Set the authorization callback URL to `https://yourdomain.com/login/github/callback`
3. Add your client ID and secret to environment variables

## Customization

This project is designed to be easily adaptable for different use cases:

- **Easy to Adapt**: Simple but reliable foundation that can be easily configured
- **Custom Models**: Add support for additional AI providers through the Vercel AI SDK
- **UI Modifications**: Customize the interface using the existing shadcn/ui component library

## Contributing

This is an open-source MIT licensed project. Contributions are welcome!

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Deployment

The application is optimized for deployment on Vercel, but can be deployed anywhere that supports Node.js. For example [chat.westbrookdaniel.com](https://chat.westbrookdaniel.com/) is deployed on [Railway](https://railway.com/):

```bash
pnpm build
pnpm start
```
