# CodeCraft AI

A Next.js TypeScript application that generates complete HTML websites using AI. Features a beautiful macOS 26 liquid glass UI and integrates with OpenRouter's DeepSeek API.

## Features

- 🎨 **macOS 26 Liquid Glass UI** - Modern, translucent interface design
- 🤖 **AI-Powered Generation** - Uses OpenRouter's DeepSeek Chat V3 model
- 🎯 **Multiple Style Options** - No CSS, Simple Style, Crazy Style
- 📊 **Real-time Progress** - Shows generation progress with status updates
- 🖥️ **Fullscreen Preview** - Generated websites display in fullscreen with toolbar
- 💾 **Download HTML** - Save generated websites as HTML files

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure OpenRouter API:**
   - Get your API key from [OpenRouter](https://openrouter.ai)
   - Update `.env.local` with your API key:
   ```
   OPENROUTER_API_KEY=your_actual_api_key_here
   ```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Usage

1. **Describe your website** in the text area
2. **Choose a style** (No CSS, Simple Style, or Crazy Style)
3. **Click "Generate Website"** to start the AI generation
4. **Preview** the generated website in fullscreen
5. **Download** the HTML file or close the preview

## Technology Stack

- **Next.js 14+** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **OpenRouter API** for AI generation
- **DeepSeek Chat V3** model

## API Integration

The app uses OpenRouter's API directly from the client-side to access the `deepseek/deepseek-chat-v3-0324:free` model. All API calls are made directly from the React components to ensure compatibility with static hosting platforms like GitHub Pages.

- Prompt processing
- API authentication
- Response parsing
- Error handling with fallback HTML

## Development

To modify the application:

- **Main page**: `src/app/page.tsx`
- **Website generator**: `src/components/WebsiteGenerator.tsx` (handles AI generation with streaming)
- **Preview component**: `src/components/WebsitePreview.tsx` (handles AI editing and preview)
- **Styles**: `src/app/globals.css` (glassmorphism and animations)

All AI functionality is client-side only, making it compatible with static hosting platforms.

## License

This project is open source and available under the [MIT License](LICENSE).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
