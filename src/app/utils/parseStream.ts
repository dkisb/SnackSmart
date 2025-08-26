export async function parseStream(response: Response, onChunk: (chunk: string) => void): Promise<string> {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder('utf-8');
  let text = '';

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    text += chunk;
    onChunk(chunk);
  }

  return text;
}
