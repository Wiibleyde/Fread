// Ce n'est que des tests pour l'instant le code est à revoir complètement

import express from "express";
import { env } from "./env";
import authRouter from "./routes/auth";

const app = express();
app.use(express.json());

app.get("/status", (_req, res) => {
    res.json({ status: "ok" });
});

app.use("/auth", authRouter);

app.listen(env.PORT, () => {
    console.log(`API server running on http://localhost:${env.PORT}`);
});
