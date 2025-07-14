# CodeCraft AI - Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a Next.js TypeScript application called "CodeCraft AI" that generates complete HTML websites using AI. The project features:

- **macOS 26 liquid glass UI styling** - Modern, translucent interface design
- **AI-powered website generation** - Uses OpenRouter's DeepSeek API
- **Multiple style options** - No CSS, Simple Style, Crazy Style
- **Real-time progress tracking** - Shows generation progress with status updates
- **Fullscreen preview** - Generated websites display in fullscreen with toolbar

## Key Technologies
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- OpenRouter API integration
- DeepSeek Chat V3 model

## Code Style Guidelines
- Use TypeScript with strict typing
- Follow Next.js 14+ App Router patterns
- Implement responsive design with Tailwind CSS
- Use server components where appropriate
- Implement proper error handling for API calls
- Follow React best practices and hooks patterns

## API Integration
- OpenRouter endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Model: `deepseek/deepseek-chat-v3-0324:free`
- Environment variable: `OPENROUTER_API_KEY` in `.env.local`

## UI Components
- Focus on macOS-style liquid glass effects
- Use backdrop-blur and transparency effects
- Implement smooth animations and transitions
- Create intuitive user interactions
- Ensure accessibility compliance
