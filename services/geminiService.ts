import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateImpactMessage = async (amount: number, userName: string): Promise<string> => {
  const client = getClient();
  if (!client) {
    return `Thank you, ${userName}! Your donation of ₹${amount} makes a huge difference.`;
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are a helpful assistant for a Non-Governmental Organization.
        Write a single, short (max 20 words), inspiring sentence telling the donor specifically what their donation of ₹${amount} could achieve (e.g. buying books, feeding children, planting trees).
        Address the donor as ${userName}.
        Tone: Gratitude and Impact.
      `,
    });
    return response.text?.trim() || `Thank you, ${userName}! Your contribution helps us move forward.`;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Thank you, ${userName}! Your generous donation of ₹${amount} has been received.`;
  }
};
