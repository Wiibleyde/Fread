import cors from "cors";
import express from "express";
import { env } from "./env";
import authRouter from "./routes/auth";
import testRouter from "./routes/test";
import { dbHealthCheck } from "./utils/db";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/status", (_req, res) => {
    res.json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/test", testRouter);

app.listen(env.PORT, async () => {
    await dbHealthCheck();
    console.log(`API server running on http://localhost:${env.PORT}`);
});
