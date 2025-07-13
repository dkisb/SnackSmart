import { NextResponse } from 'next/server';
import axios from 'axios';
import { loadMarkdownData } from '@/library/loadMarkdown';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Nincsenek üzenetek.' }, { status: 400 });
    }

    const lastMessage = messages.pop();
    const userPrompt = (lastMessage?.content ?? '').trim();

    const mdData = await loadMarkdownData();

    // Hívjuk meg a külső API-t stream-ben
    const response = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      {
        model: 'grok-4',
        messages: [
          {
            role: 'system',
            content: `
Mindig magyarul válaszolj.

Te egy professzionális táplálkozási asszisztens vagy. A felhasználó kérdéseire pontos, megbízható, és változatos válaszokat adsz.

Az alábbi étrendadatok a viszonyítási alapod. Ha egy étel, étrend-kiegészítő vagy tápanyag szerepel bennük, akkor elsődlegesen ezekből meríts információt:

${mdData}

Viszont ha a felhasználó olyan ételről, étrendkiegészítőről, vagy kérdésről érdeklődik, ami a fenti adatbázisban **nem szerepel, vagy hiányos**, akkor bátran egészítsd ki megbízható források (pl. USDA, Nutritionix, EFSA, PubMed) alapján szerzett adatokkal.

**Fontos:**
- Adj változatos, kreatív étrendi javaslatokat, ne csak a sablonos ételeket ismételd.
- Készíts teljes napi étrendeket is, ha a felhasználó ezt kéri (pl. reggeli, ebéd, vacsora, snack).
- Minden étkezéshez írd le a pontos kalória- és makrotápanyag-értékeket (fehérje, szénhidrát, zsír).
- Ha pontos értéket nem tudsz mondani, jelezd, hogy csak becsült adatokról van szó.
- Adj javaslatokat étrend-kiegészítőkre is, ha indokolt.
- Tartsd szem előtt a felhasználó egyéni adatait (nem, életkor, súly, magasság, célkalória, étkezések száma), ha ezek rendelkezésre állnak.
- Ha a felhasználó változatosabb étrendet szeretne, mindig többféle opciót is adj.
- Törekedj ízletes, élvezetes fogásokra is, ne csak a számokra.
`.trim(),
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        stream: true,
        temperature: 0.7,
        search_parameters: { enable: true },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.XAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        responseType: 'stream',
      }
    );

    const stream = new ReadableStream({
      async start(controller) {
        response.data.on('data', (chunk: Buffer) => {
          // egyszerűen továbbítjuk a szöveges chunkot
          const text = chunk.toString();
          controller.enqueue(new TextEncoder().encode(text));
        });

        response.data.on('end', () => {
          controller.close();
        });

        response.data.on('error', (err: Error) => {
          console.error('Stream error:', err);
          controller.error(err);
        });
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('xAI API error:', error);
    return NextResponse.json({ error: 'Belső szerverhiba', details: String(error) }, { status: 500 });
  }
}
