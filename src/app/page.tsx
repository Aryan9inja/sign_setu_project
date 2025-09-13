"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/components/auth/AuthProvider";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import WelcomeScreen from "@/components/WelcomeScreen";
import { useRouter } from "next/navigation";

export default function Home() {
  const [progress, setProgress] = useState<any>([]);
  const [classrooms, setClassrooms] = useState<any>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const { user, signOut, loading } = useAuth();

  const router = useRouter();

  useEffect(() => {
    const fetchProgress = async () => {
      const { data, error } = await supabase.from("progress").select(`
    id,
    progress_percent,
    users(user_name)
  `);
      if (error) console.error("Error fetching progress: ", error);
      else setProgress(data);
    };

    const fetchClassrooms = async () => {
      const { data, error } = await supabase
        .from("classrooms")
        .select("id,class_name,grade,users(user_name)");
      if (error) console.error("Error fetching classrooms: ", error);
      else setClassrooms(data);
    };

    const fetchUserRole = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("user_role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user role: ", error);
        } else {
          setUserRole(data?.user_role || null);
        }
      }
    };

    if (user) {
      fetchProgress();
      fetchClassrooms();
      fetchUserRole();
    }
  }, [user]);

  const handleUpdateProgress = () => {
    router.push("/update-progress");
  };

  const handleUpdateClassroom = () => {
    router.push("/update-classroom");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navigation user={user} userRole={userRole} signOut={signOut} />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {user ? (
          <Dashboard
            classrooms={classrooms}
            progress={progress}
            userRole={userRole}
            onUpdateProgress={handleUpdateProgress}
            onUpdateClassroom={handleUpdateClassroom}
          />
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </main>
  );
}
