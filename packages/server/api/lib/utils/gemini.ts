import { env } from "@/env";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

export async function generateText(prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text;
}

export async function generateStream(prompt: string) {
  const response = await ai.models.generateContentStream({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  // return stream
  const newStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          if (chunk.text) {
            controller.enqueue(chunk.text);
          }
        }
        controller.close();
      } catch (error) {
        console.error('Stream generation error:', error);
        controller.error(error);
      }
    },
  });

  return newStream;
}