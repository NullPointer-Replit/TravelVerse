import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

function getGenAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

export async function POST(request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const { destination, days, interests, startDate } = await request.json();

    const genAI = getGenAI();
    const candidates = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-flash-latest',
      'gemini-pro-latest'
    ];

    let model = null;
    for (const candidate of candidates) {
      try {
        const m = genAI.getGenerativeModel({ model: candidate });
        await m.generateContent('OK');
        model = m;
        break;
      } catch (err) {
        continue;
      }
    }

    if (!model) {
      return NextResponse.json(
        { success: false, error: 'No accessible models found' },
        { status: 500 }
      );
    }

    const prompt = `Create a comprehensive packing list for a ${days}-day trip to ${destination}.
    
Interests: ${interests?.join(', ') || 'General travel'}
${startDate ? `Travel dates: ${startDate}` : ''}

Format the response as JSON with this exact schema:
{
  "packingList": [
    {
      "category": "Clothing",
      "items": ["item1", "item2", "item3"]
    },
    {
      "category": "Footwear",
      "items": ["item1", "item2"]
    }
  ]
}

Return ONLY valid JSON, no markdown, no code blocks.`;

    const result = await model.generateContent(prompt);
    let text = '';
    
    if (result && result.response) {
      const resp = result.response;
      if (typeof resp.text === 'function') {
        text = await resp.text();
      } else if (typeof resp.text === 'string') {
        text = resp.text;
      }
    }

    if (!text) {
      throw new Error('Empty response from generative model');
    }

    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(text);

    return NextResponse.json({ success: true, data: data.packingList || [] });
  } catch (error) {
    console.error('Error generating packing list:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

