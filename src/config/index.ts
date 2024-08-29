export const config = {
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
    provider: {
      resend: {
        key: process.env.RESEND_API_KEY,
      },
      ses: {
        key: process.env.SES_API_KEY,
        aws: {
          region: process.env.AWS_REGION,
        },
      },
      sendgrid: {
        key: process.env.SENDGRID_API_KEY,
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
      REQUEST_TEAM_LIMIT: 4,
      INVITE_USER_LIMIT: 5,
    },

    organizations: ["veersatech.com", "veersalabs.com"],

    sourceEmailAddress: "CTF Arena <onboarding@resend.dev>",
  },
};
