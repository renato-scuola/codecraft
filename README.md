# CodeCraft AI

A modern web application with Material You design that allows users to generate websites using DeepSeek AI through the OpenRouter API.

## Features

- Beautiful Material You design with fluid animations 
- Light/dark mode support
- Secure API key management
- Interactive code generation process with real-time progress updates
- Preview generated websites within the application
- Download generated HTML files

## Technologies Used

- React with Vite for fast development
- Material UI components
- Framer Motion for smooth animations
- Axios for API requests
- OpenRouter API integration with DeepSeek AI model

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenRouter API key with access to DeepSeek models

### Installation

1. Clone this repository
2. Install dependencies:

```
npm install
```

3. Start the development server:

```
npm run dev
```

4. Open the application in your browser (typically at http://localhost:5173)
5. Add your OpenRouter API key when prompted

## Usage

1. Enter your prompt describing the website you want to create
2. Click "Generate Website" and wait for the AI to generate your code
3. Preview the generated website by clicking "View Website"
4. Download the HTML file by clicking "Download HTML"

## Deploying to GitHub Pages

You can deploy this application to GitHub Pages in two ways:

### Method 1: Using GitHub Actions (Recommended)

1. Push your code to a GitHub repository
2. Enable GitHub Pages in your repository settings:
   - Go to your repository on GitHub
   - Click on "Settings"
   - Scroll down to "Pages"
   - Under "Build and deployment", select "GitHub Actions" as the source
3. The workflow file is already included in `.github/workflows/deploy.yml`
4. Every time you push to the main branch, the site will automatically be built and deployed

### Method 2: Manual Deployment

1. Make sure you have the `gh-pages` package installed:
   ```bash
   npm install --save-dev gh-pages
   ```

2. In your `package.json` file, make sure you have the following scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```

3. Run the deploy command:
   ```bash
   npm run deploy
   ```

4. Your site will be published to the `gh-pages` branch of your repository
5. Go to your repository settings and make sure GitHub Pages is set to deploy from the `gh-pages` branch

5. Your project will be deployed and the URL will be provided in the terminal

### Important Notes for Deployment

- The OpenRouter API key is hardcoded in App.jsx. For better security, consider:
  - Setting it as an environment variable
  - Adding user input for the API key at runtime
- Make sure you have the proper CORS configuration if your deployment needs to access external APIs

## License

This project is MIT licensed.
