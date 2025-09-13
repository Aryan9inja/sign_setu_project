import { NextRequest, NextResponse } from "next/server";
import { getMongoDb } from "@/lib/mongo";
import { createClient } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
  const supabase = createClient(req);

  try {
    const { studentId, oldProgress, updatedProgress } = await req.json();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          details: authError?.message,
        },
        { status: 401 }
      );
    }

    const teacherId = user.id;

    const { data, error } = await supabase
      .from("progress")
      .update({ progress_percent: updatedProgress })
      .eq("user_id", studentId)
      .select();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    const db = await getMongoDb();
    await db.collection("activity_log").insertOne({
      teacherId,
      studentId,
      activity: "UPDATE_PROGRESS",
      oldProgress,
      updatedProgress,
    });

    return NextResponse.json({ success: true, data: data[0] }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
