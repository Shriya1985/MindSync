import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleChatCompletion } from "./routes/chat";
import { testGPTConnection } from "./routes/test-gpt";
import { handleGeminiChat, testGeminiConnection } from "./routes/gemini-chat";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Chat completion endpoint for GPT integration
  app.post("/api/chat/completion", handleChatCompletion);

  // Test GPT connection endpoint
  app.get("/api/test-gpt", testGPTConnection);

  return app;
}
