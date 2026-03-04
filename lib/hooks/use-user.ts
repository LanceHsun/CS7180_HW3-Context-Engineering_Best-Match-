import { useSupabase } from "@/components/providers/supabase-provider";

export function useUser() {
  const { user, isLoading } = useSupabase();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
