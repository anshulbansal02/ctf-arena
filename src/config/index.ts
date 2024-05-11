export const config = {
  supabase: {
    projectURL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    projectKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    adminKey: process.env.SUPABASE_ADMIN_KEY!,
  },

  routes: {
    default: {
      NO_AUTH: "/",
      AUTH: "/u/dashboard",
    },
  },

  team: {
    MEMBERS_LIMIT: 4,
    REQUEST_TEAM_LIMIT: 4,
    INVITE_USER_LIMIT: 5,
  },

  auth: {
    cbRedirectPath: "/auth/callback",
  },
};
