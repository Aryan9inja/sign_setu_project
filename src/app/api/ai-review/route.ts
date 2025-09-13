import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const progressParam = req.nextUrl.searchParams.get("progress");
  const progressPercent = Number(progressParam);

  const prompt = `You are a positive reinforcement mentor. You will be provided with a progress-percentage of a student in his/her course. You have to give him positive vibes by saying something motivating but if the progress is less than 10 you have to tell him/her that he she is behind in the race. Also you are required not to give so generic response.
  
  progress-percentage=${progressPercent}
  
  You MUST respond with ONLY valid short and crisp string no markdown or punctuations
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-maverick:free",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json({ error: "AI Error" }, { status: 500 });
    }

    return NextResponse.json({ success: true, res: aiResponse }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
