import { getMongoDb } from "@/lib/mongo";
import { createClient } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

interface ReqData {
  recordId: string;
  studentId: string;
  updatedData: {
    grade?: number;
    class_name?: string;
  };
  oldData: {
    grade?: number;
    class_name?: string;
  };
}

export async function POST(req: NextRequest) {
  const supabase = createClient(req);

  try {
    const { recordId, studentId, updatedData, oldData }: ReqData =
      await req.json();

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
      .from("classrooms")
      .update(updatedData)
      .eq("id", recordId)
      .eq("user_id", studentId)
      .select();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    const db = await getMongoDb();
    await db.collection("activity_log").insertOne({
      teacherId,
      studentId,
      activity: "UPDATE_CLASSROOM",
      oldData,
      updatedData,
    });

    return NextResponse.json({ success: true, data: data[0] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
