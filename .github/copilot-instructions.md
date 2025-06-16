<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# CodeCraft AI

This is a React application with Vite that uses Material You design and fluid animations to provide an interface for generating websites using AI. The application uses the DeepSeek AI model through the OpenRouter API.

## Key Features

- Material You design with fluid animations using MUI and Framer Motion
- API key management for OpenRouter
- Real-time progress updates during code generation
- Live preview of generated websites
- Download functionality for generated HTML

## Implementation Details

- React with MUI components for Material You design
- Framer Motion for animations
- API calls to OpenRouter using axios
- Secure API key storage using localStorage

## Components

- ApiKeyDialog: Handles API key input and validation
- OutputDisplay: Displays the generated code with syntax highlighting
- GeneratedSite: Renders the generated website using an iframe

## Important Files

- src/App.jsx: Main application logic
- src/components/: Contains all UI components
- src/App.css: Custom styling for the application
