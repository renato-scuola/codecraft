import axios from 'axios';

export async function generateWebsite(prompt: string): Promise<string> {
  const response = await axios.post('/api/generate', {
    prompt
  });
  
  return response.data.html;
}
