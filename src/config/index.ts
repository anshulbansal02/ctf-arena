export const config = {
  supabase: {
    projectURL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    projectKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },

  routes: {
    default: {
      NO_AUTH: "/",
      AUTH: "/u/dashboard",
    },
  },
};
