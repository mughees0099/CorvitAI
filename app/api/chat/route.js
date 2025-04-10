import { GoogleGenerativeAI } from "@google/generative-ai";

export const maxDuration = 30;

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { messages } = await req.json();

    const lastUserMessage = messages.filter((m) => m.role === "user").pop();

    if (!lastUserMessage) {
      return new Response(JSON.stringify({ text: "No user message found" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

          const result = await model.generateContent(lastUserMessage.content);
          const text = result.response.text();

          const responseData = JSON.stringify({
            role: "assistant",
            content: text,
          });
          controller.enqueue(new TextEncoder().encode(responseData));
          controller.close();
        } catch (error) {
          console.error("Gemini API error:", error);
          controller.enqueue(
            new TextEncoder().encode(
              JSON.stringify({
                role: "assistant",
                content: "Oppsss something went wrong🥲",
              })
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Request processing error:", error);
    return new Response(
      JSON.stringify({
        role: "assistant",
        content: "Oppsss something went wrong🥲",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
}
