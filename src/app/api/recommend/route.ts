import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, books } = await req.json();

    if (!messages) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const systemPrompt = `You are a knowledgeable library assistant helping a user find a book to read.
    
    You have access to the following books in our library:
    ${JSON.stringify(books.map((b: any) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        genre: b.genre,
        description: b.description ? b.description.substring(0, 100) + "..." : "N/A" 
    })), null, 2)}

    Your INSTRUCTIONS:
    1. Recommend books from the provided list based on the user's interests, mood, or preferred plot/scenarios.
    2. If a user asks for a recommendation, suggest 1-3 relevant books from the list.
    3. Briefly explain WHY you are recommending each book based on their input.
    4. If the user's request doesn't match any specific book well, suggest the closest matches or ask for more preferences.
    5. Be friendly, helpful, and encouraging.
    6. Format your response nicely (e.g., use bullet points for book titles).
    
    Remember: You can ONLY recommend books that are in the provided list.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      max_tokens: 500,
    });

    return NextResponse.json({ 
      reply: completion.choices[0].message.content 
    });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}

