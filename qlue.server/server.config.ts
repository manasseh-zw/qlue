export const config = {
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",
  database: {
    url: process.env.DATABASE_URL,
  },
  qloo: {
    apiKey: process.env.QLOO_API_KEY,
    url: process.env.QLOO_URL,
  },
  tavus: {
    apiKey: process.env.TAVUS_API_KEY,
    url: process.env.TAVUS_URL || "https://tavusapi.com",
  },
};
