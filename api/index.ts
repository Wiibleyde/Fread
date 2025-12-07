// Ce n'est que des tests pour l'instant le code est à revoir complètement

import express from "express";
import { env } from "./env";
import authRouter from "./routes/auth";
import testRouter from "./routes/test";
import { dbHealthCheck } from "./utils/db";

const app = express();
app.use(express.json());

app.get("/status", (_req, res) => {
    res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/test", testRouter);

app.listen(env.PORT, async () => {
    await dbHealthCheck();
    console.log(`API server running on http://localhost:${env.PORT}`);
});
