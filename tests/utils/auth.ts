import { createClient } from "@supabase/supabase-js";

export async function getStudentJwt() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.STUDENT_EMAIL!,
    password: process.env.STUDENT_PASSWORD!,
  });
  if (error) throw error;
  return data.session?.access_token!;
}

export async function getTeacherJwt() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.TEACHER_EMAIL!,
    password: process.env.TEACHER_PASSWORD!,
  });
  if (error) throw error;
  return data.session?.access_token!;
}
