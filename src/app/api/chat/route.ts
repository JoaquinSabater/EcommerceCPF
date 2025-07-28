export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192',
      messages,
      temperature: 0.7,
      stream: false
    }),
  });

  const data = await res.json();

  const reply = data?.choices?.[0]?.message?.content || 'Ocurrió un error al procesar la respuesta.';

  return new Response(
    JSON.stringify({ message: reply }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
