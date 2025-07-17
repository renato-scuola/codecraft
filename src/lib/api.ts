export async function generateWebsite(prompt: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'CodeCraft AI'
    },
    body: JSON.stringify({
      model: 'deepseek/deepseek-chat-v3-0324:free',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      stream: false
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate website');
  }

  const data = await response.json();
  const rawResponse = data.choices[0].message.content;
  
  // Extract HTML content
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
  
  // Clean up any remaining non-HTML text
  html = html.trim();
  
  if (!html) {
    throw new Error('No HTML content received');
  }
  
  return html;
}
