// tests/rls.test.ts
import { describe, it, expect } from "vitest";
import { studentClient, teacherClient } from "./utils/supabaseClients";

describe("RLS Policies", () => {
  it("student can only see their own progress", async () => {
    const supabase = studentClient();
    const { data, error } = await supabase.from("progress").select("*");

    expect(error).toBeNull();
    expect(data).toBeDefined();
    data!.forEach((row) => {
      expect(row.user_id).toBe(process.env.STUDENT_USER_ID);
    });
  });

  it("teacher can see all progress rows", async () => {
    const supabase = teacherClient();
    const { data, error } = await supabase.from("progress").select("*");

    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThan(1);
  });

  it("teacher can update student progress data", async () => {
    const supabase = teacherClient();
    const { error } = await supabase
      .from("progress")
      .update({ progress_percent: 76 })
      .eq("user_id", process.env.STUDENT_USER_ID);

    expect(error).toBeNull();
  });

  it("student cannot update another student's progress", async () => {
    const supabase = studentClient();
    const { data, error } = await supabase
      .from("progress")
      .update({ progress_percent: 85 })
      .eq("user_id", process.env.OTHER_STUDENT_ID);

    expect(error).toBeNull();
    expect(data).toBeNull();
  });

  it("student can see own classroom", async () => {
    const supabase = studentClient();
    const { data, error } = await supabase.from("classrooms").select("*");

    expect(error).toBeNull();
    expect(data).toBeDefined();
    // ensure all rows belong to this student
    data!.forEach((row) => {
      expect(row.user_id).toBe(process.env.STUDENT_USER_ID);
    });
  });

  it("teacher can see all classroom rows", async () => {
    const supabase = teacherClient();
    const { data, error } = await supabase.from("classrooms").select("*");

    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThan(1);
  });

  it("teacher can update student classroom data", async () => {
    const supabase = teacherClient();
    const { error } = await supabase
      .from("classrooms")
      .update({ grade: 7, class_name: "Chemistry Hons" })
      .eq("user_id", process.env.STUDENT_USER_ID)
      .eq("id", process.env.TEST_CLASS);

    expect(error).toBeNull();
  });

  it("student cannot update another student's classroom", async () => {
    const supabase = studentClient();
    const { data, error } = await supabase
      .from("classrooms")
      .update({ grade: 5,class_name:"Testing" })
      .eq("user_id", process.env.OTHER_STUDENT_ID)
      .eq("id", process.env.TEST_CLASS);

    expect(error).toBeNull();
    expect(data).toBeNull();
  });
});
