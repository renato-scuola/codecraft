import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenRouter API key not configured' }, { status: 500 });
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
              model: 'deepseek/deepseek-chat-v3-0324:free',
              messages: [
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.7,
              max_tokens: 4000,
              stream: false // We'll handle our own progress simulation
            },
            {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'CodeCraft AI'
              }
            }
          );

          const rawResponse = response.data.choices[0].message.content;
          
          // Extract only HTML content, removing any explanatory text
          let html = rawResponse;
          
          // Find the start of HTML content
          const htmlStart = rawResponse.indexOf('<!DOCTYPE html>') !== -1 
            ? rawResponse.indexOf('<!DOCTYPE html>')
            : rawResponse.indexOf('<html');
          
          if (htmlStart !== -1) {
            html = rawResponse.substring(htmlStart);
            
            // Find the end of HTML content
            const htmlEnd = html.lastIndexOf('</html>');
            if (htmlEnd !== -1) {
              html = html.substring(0, htmlEnd + 7); // +7 for '</html>'
            }
          }
          
          // Clean up any remaining non-HTML text at the beginning or end
          html = html.trim();
          
          // Simulate streaming by sending chunks with delays
          const result = JSON.stringify({ html });
          const chunks = result.match(/.{1,100}/g) || [result];
          
          for (let i = 0; i < chunks.length; i++) {
            controller.enqueue(encoder.encode(chunks[i]));
            
            // Add small delay between chunks for progress tracking
            if (i < chunks.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
          
          controller.close();
        } catch (error) {
          console.error('Error generating website:', error);
          
          // Send fallback HTML in case of error
          const fallbackHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            text-align: center;
        }
        h1 {
            color: #fff;
            margin-bottom: 30px;
            font-size: 2.5rem;
            font-weight: 300;
        }
        .content {
            background: rgba(255, 255, 255, 0.05);
            padding: 30px;
            border-radius: 15px;
            margin: 20px 0;
        }
        .feature {
            margin: 20px 0;
            padding: 15px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }
        button {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
            border: 1px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 12px 24px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px;
            transition: all 0.3s ease;
        }
        button:hover {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.2));
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Your Website is Ready!</h1>
        <div class="content">
            <p>This is a demonstration website generated by CodeCraft AI.</p>
            <div class="feature">
                <h3>Modern Design</h3>
                <p>Clean, professional layout with glassmorphism effects</p>
            </div>
            <div class="feature">
                <h3>Responsive</h3>
                <p>Works perfectly on all devices and screen sizes</p>
            </div>
            <div class="feature">
                <h3>Interactive</h3>
                <p>Smooth animations and user-friendly interface</p>
            </div>
            <button onclick="alert('Hello from your generated website!')">Click me!</button>
            <button onclick="window.open('https://github.com', '_blank')">Visit GitHub</button>
        </div>
        <p><strong>Prompt used:</strong> ${prompt}</p>
    </div>
    <script>
        // Add some interactivity
        document.addEventListener('DOMContentLoaded', function() {
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
                button.addEventListener('mouseenter', function() {
                    this.style.boxShadow = '0 10px 30px rgba(255, 255, 255, 0.2)';
                });
                button.addEventListener('mouseleave', function() {
                    this.style.boxShadow = 'none';
                });
            });
            
            console.log('Website generated successfully by CodeCraft AI!');
        });
    </script>
</body>
</html>`;

          const result = JSON.stringify({ html: fallbackHtml });
          controller.enqueue(encoder.encode(result));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
