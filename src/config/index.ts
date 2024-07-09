export const config = {
  supabase: {
    projectURL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    projectKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    adminKey: process.env.SUPABASE_ADMIN_KEY!,
  },
  db: {
    host: process.env.DB_HOST!,
    port: +process.env.DB_PORT!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASS!,
  },
  routes: {
    default: {
      NO_AUTH: "/",
      AUTH: "/home",
    },
    auth: {
      cbRedirectPath: "/auth/callback",
    },
  },
  app: {
    team: {
      MEMBERS_LIMIT: 4,
      REQUEST_TEAM_LIMIT: 4,
      INVITE_USER_LIMIT: 5,
    },

    organizations: ["veersatech.com", "veersalabs.com"],

    sourceEmailAddress: "invitation@ctf-arena.app",
  },
};
