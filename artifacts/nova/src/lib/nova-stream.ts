export async function streamNovaMessage(
  conversationId: number,
  content: string,
  onChunk: (text: string) => void,
  onDone: () => void
) {const base = import.meta.env.VITE_API_BASE_URL ?? '';
  const res = await fetch(`${base}/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const payload = JSON.parse(line.slice(6));
          if (payload.content) onChunk(payload.content);
          if (payload.done) onDone();
        } catch {}
      }
    }
  }
}
