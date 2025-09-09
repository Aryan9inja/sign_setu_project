"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [profiles, setProfiles] = useState<any>([]);

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) console.error("Error fetching profiles: ", error);
      else setProfiles(data);
    };

    fetchProfiles();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">Supabase Client Test</h1>
      <ul className="mt-4">
        {profiles.map((p: any) => (
          <li key={p.id} className="text-gray-700">
            {p.username}
          </li>
        ))}
      </ul>
    </main>
  );
}
