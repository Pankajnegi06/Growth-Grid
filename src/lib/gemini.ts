import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateWithGemini(prompt: string, systemInstruction?: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      ...(systemInstruction && {
        systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
      }),
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate AI response');
  }
}

export async function generateJSONWithGemini(prompt: string, systemInstruction?: string) {
  const fullPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON, no markdown formatting, no code blocks, no extra text.`;
  const text = await generateWithGemini(fullPrompt, systemInstruction);
  
  // Clean any markdown code blocks that might slip through
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

export default genAI;
