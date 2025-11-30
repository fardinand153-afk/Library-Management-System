import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, book } = await req.json();

    if (!messages || !book) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the last user message
    const userMessage = messages[messages.length - 1];

    const systemPrompt = `You are a knowledgeable library assistant. 
    You are currently discussing the book: "${book.title}" by ${book.author}.
    
    Book Details:
    - Title: ${book.title}
    - Author: ${book.author}
    - Genre: ${book.genre || 'N/A'}
    - Description: ${book.description || 'N/A'}
    - Publisher: ${book.publisher || 'N/A'}
    - Year: ${book.publication_year || 'N/A'}

    Your INSTRUCTIONS:
    1. Answer questions ONLY related to this specific book.
    2. If the user asks about other books, general topics, or anything unrelated, politely refuse and steer the conversation back to "${book.title}".
    3. Use the provided book details to answer specific questions.
    4. You can use your general knowledge about this book (plot, characters, themes) if it is a real, well-known book, but prioritize the provided context.
    5. Keep responses concise, friendly, and encouraging.
    
    Remember: You are an expert on "${book.title}" and nothing else for this conversation.`;

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

