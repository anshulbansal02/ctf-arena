export const config = {
  stage: (process.env.STAGE ?? "dev") as "dev" | "prod",
  db: {
    name: process.env.DB_NAME!,
    host: process.env.DB_HOST!,
    port: +process.env.DB_PORT!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASS!,
  },
  cache: {
    host: process.env.REDIS_HOST!,
    port: +process.env.REDIS_PORT!,
    password: process.env.REDIS_PASS!,
  },
  auth: {
    azure: {
      tenantId: process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID,
      accountId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      secret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
    },
  },
  email: {
    activeProvider: process.env.EMAIL_PROVIDER,
    providers: {
      resend: {
        key: process.env.RESEND_API_KEY,
        apiUrl: process.env.RESEND_API_URL,
      },
      ses: {
        accessKey: process.env.SES_ACCESS_KEY,
        secret: process.env.SES_SECRET,
        aws: {
          region: process.env.AWS_REGION,
        },
      },
      sendgrid: {
        key: process.env.SENDGRID_API_KEY,
        apiUrl: process.env.SENDGRID_API_URL,
      },
    },
  },
  host: process.env.APP_HOST,
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
      REQUEST_TEAM_DAY_LIMIT: 10,
      INVITE_USER_DAY_LIMIT: 10,
    },

    onboarding: {
      skipTeamingStep: false,
    },

    org: {
      name: "Veersa",
      domains: ["veersatech.com", "veersalabs.com"],
    },

    sourceEmailAddress: {
      auth: "CTF Arena <auth@mail.ctf-arena.com>",
      notifications: "CTF Arena <notifications@mail.ctf-arena.com>",
      support: "support@ctf-arena.com",
    },
  },
};
