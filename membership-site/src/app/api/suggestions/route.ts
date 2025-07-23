import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description || description.length < 60) {
      return NextResponse.json(
        { error: 'Description must be at least 60 characters' },
        { status: 400 }
      );
    }

    const apiKey = process.env.CHAT_GPT_API_CODE || process.env.CHAT_GPT_API_KEY;
    const model = process.env.CHAT_GPT_API_MODEL || 'gpt-3.5-turbo';

    console.log('API Key exists:', !!apiKey);
    console.log('Model:', model);
    console.log('Description length:', description.length);

    if (!apiKey) {
      console.error('ChatGPT API key not configured');
      return NextResponse.json(
        { error: 'ChatGPT API key not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = `Generate 30 encouraging statements that support the goal described in the user's prompt. 

IMPORTANT GUIDELINES:
- DO NOT use "I" or "I'm" or "I am" in any statement
- Use present tense, active voice
- Make statements empowering and motivational
- Each statement should be a simple sentence (maximum 18 words)
- Focus on the goal, outcome, or desired state
- Use varied language and avoid repetition
- Make statements that feel personal and relevant

Examples of good statements:
- "Embracing this journey with confidence and determination"
- "Moving forward with clarity and purpose"
- "Building strength through consistent practice"
- "Creating positive change through focused action"

Return the response as a simple JSON array of strings.`;

    const requestBody = {
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: description
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    console.log('Making OpenAI API request...');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('OpenAI response status:', response.status);
    console.log('OpenAI response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response data:', JSON.stringify(data, null, 2));
    
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('No content in OpenAI response:', data);
      throw new Error('No content received from OpenAI');
    }

    console.log('OpenAI content received:', content);

    // Parse the JSON response
    let suggestions: string[];
    try {
      suggestions = JSON.parse(content);
    } catch {
      // If parsing fails, try to extract array from the response
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        suggestions = JSON.parse(match[0]);
      } else {
        throw new Error('Invalid response format from OpenAI');
      }
    }

    // Ensure we have an array of strings
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      throw new Error('No valid suggestions received');
    }

    // Limit to 30 suggestions and ensure they're strings
    suggestions = suggestions.slice(0, 30).map(s => String(s));

    return NextResponse.json({ suggestions });

  } catch (error) {
    console.error('Suggestions API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { error: 'Having trouble with suggestions. Try again later.' },
      { status: 500 }
    );
  }
} 