"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorMessage from "@/components/ErrorMessage";
import AccessDenied from "@/components/AccessDenied";
import PageHeader from "@/components/PageHeader";
import UpdateProgressTable from "@/components/UpdateProgressTable";
import { supabase } from "@/lib/supabaseClient";

export interface ProgressRecord {
  id: string;
  user_id: string;
  progress_percent: number;
  student_email?: string;
  student_name?: string;
}

export default function UpdateProgressPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressRecord[]>([]);
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
    const fetchProgressData = async () => {
      if (userRole === "teacher") {
        try {
          const { data: progressData, error: progressError } =
            await supabase.from("progress").select(`
              id,
              user_id,
              progress_percent,
              users:user_id (
                id,
                email,
                user_name
              )
            `);

          if (progressError) {
            throw progressError;
          }

          const transformedData: ProgressRecord[] =
            progressData?.map((item: any) => ({
              id: item.id,
              user_id: item.user_id,
              progress_percent: item.progress_percent,
              student_email: item.users?.email || "N/A",
              student_name: item.users?.user_name || "N/A",
            })) || [];

          setProgress(transformedData);
        } catch (err: any) {
          setError("Failed to fetch progress data: " + err.message);
        }
      }
    };

    fetchProgressData();
  }, [userRole]);

  const handleProgressUpdate = async (
    recordId: string,
    oldProgress: number,
    newProgress: number
  ) => {
    const record = progress.find((p) => p.id === recordId);
    if (!record) throw new Error("Record not found");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error("No valid session found. Please log in again.");
      }

      const response = await fetch("/api/update-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          studentId: record.user_id,
          oldProgress,
          updatedProgress: newProgress,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update progress");
      }

      setProgress((prev) =>
        prev.map((p) =>
          p.id === recordId ? { ...p, progress_percent: newProgress } : p
        )
      );
    } catch (err: any) {
      setError("Failed to save progress: " + err.message);
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
        <PageHeader title="Update Student Progress" />

        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <ErrorMessage
              message={error || ""}
              onDismiss={() => setError(null)}
            />

            <UpdateProgressTable
              progress={progress}
              onProgressUpdate={handleProgressUpdate}
              onProgressChange={setProgress}
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
