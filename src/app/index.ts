import express from "express";

export async function createApplication() {
  const app = express();

  app.use(express.json());

  app.get("/", (_, res) => {
    return res.json({ message: "Welcome to iris." });
  });

  app.get("/.well-known/openid-configuration", (_, res) => {
    
  })

  return app;
}
