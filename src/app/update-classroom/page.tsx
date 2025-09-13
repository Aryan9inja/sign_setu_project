"use client";

import { ProtectedRoute, useAuth } from "@/components/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import LoadingSpinner from "@/components/LoadingSpinner";
import AccessDenied from "@/components/AccessDenied";
import PageHeader from "@/components/PageHeader";
import ErrorMessage from "@/components/ErrorMessage";
import UpdateClassroomTable from "@/components/UpdateClassroomTable";

export interface ClassroomRecord {
  id: string;
  user_id: string;
  class_name: string;
  grade: number;
  student_email?: string;
  student_name?: string;
}

interface ClassroomRaw {
  id: string;
  user_id: string;
  class_name: string;
  grade: number;
  users: Array<{
    id: string;
    email: string;
    user_name: string;
  }>;
}

export interface UpdateProps {
  recordId: string;
  oldData: {
    class_name?: string;
    grade?: number;
  };
  newData: {
    class_name?: string;
    grade?: number;
  };
}

export default function UpdateClassroomPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [classroom, setClassroom] = useState<ClassroomRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("user_role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setError("Failed to verify user permissions");
        } else {
          const role = data?.user_role || null;
          setUserRole(role);

          if (role !== "teacher") {
            router.push("/");
            return;
          }
        }
      }
      setLoading(false);
    };

    fetchUserRole();
  }, [user, router]);

  useEffect(() => {
    const fetchClassroomData = async () => {
      if (userRole === "teacher") {
        try {
          const { data: classroomData, error: classroomError } =
            await supabase.from("classrooms").select(`
              id,
              user_id,
              class_name,
              grade,
              users:user_id(
                id,
                email,
                user_name
              )
            `);

          if (classroomError) {
            throw classroomError;
          }

          const transformedData: ClassroomRecord[] =
            classroomData?.map((item: ClassroomRaw) => ({
              id: item.id,
              user_id: item.user_id,
              class_name: item.class_name,
              grade: item.grade,
              student_email: item.users?.[0]?.email || "N/A",
              student_name: item.users?.[0]?.user_name || "N/A",
            })) || [];

          setClassroom(transformedData);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
          setError("Failed to fetch classrooms data: " + errorMessage);
        }
      }
    };

    fetchClassroomData();
  }, [userRole]);

  const handleClassroomUpdate = async ({
    recordId,
    oldData,
    newData,
  }: UpdateProps) => {
    const record = classroom.find((c) => c.id === recordId);
    if (!record) throw new Error("Record not found");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("No valid session found. Please log in again.");
      }

      const response = await fetch("/api/update-classroom", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          recordId,
          studentId: record.user_id,
          oldData,
          updatedData: newData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update classroom");
      }

      setClassroom((prev) =>
        prev.map((c) => (c.id === recordId ? { ...c, ...newData } : c))
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError("Failed to save classroom: " + errorMessage);
      throw err;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <LoadingSpinner />
      </ProtectedRoute>
    );
  }

  if (userRole !== "teacher") {
    return (
      <ProtectedRoute>
        <AccessDenied />
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Update Student Classroom" />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <ErrorMessage
              message={error || ""}
              onDismiss={() => setError(null)}
            />
            <UpdateClassroomTable classrooms={classroom} onClassroomUpdate={handleClassroomUpdate} onClassroomChange={setClassroom}/>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
