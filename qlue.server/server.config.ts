export const config = {
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  openAI: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  auth: {
    url: "http://localhost:8080",
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  qloo: {
    apiKey: process.env.QLOO_API_KEY,
  },
};
