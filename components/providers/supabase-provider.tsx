"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type SupabaseClient, type User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type SupabaseContext = {
  supabase: SupabaseClient;
  user: User | null;
  isLoading: boolean;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for mock user cookie in development/prototype mode
    const mockUserEmail = document.cookie
      .split("; ")
      .find((row) => row.startsWith("sb-mock-user="))
      ?.split("=")[1];

    if (mockUserEmail) {
      setUser({
        id: "mock-id",
        email: decodeURIComponent(mockUserEmail),
        aud: "authenticated",
        role: "authenticated",
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
      } as User);
      setIsLoading(false);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else if (!mockUserEmail) {
        setUser(null);
      }
      setIsLoading(false);

      if (event === "SIGNED_IN") {
        router.refresh();
      }
      if (event === "SIGNED_OUT") {
        // Clear mock cookie on sign out
        document.cookie =
          "sb-mock-user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <Context.Provider value={{ supabase, user, isLoading }}>
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }
  return context;
};
