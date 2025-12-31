import cors from "cors";
import express from "express";
import { env } from "./env";
import { errorMiddleware } from "./middleware/error";
import accountRouter from "./routes/account";
import authRouter from "./routes/auth";
import followRouter from "./routes/follow";
import likeRouter from "./routes/like";
import postRouter from "./routes/posts";
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
app.use("/account", accountRouter);
app.use("/follow", followRouter);
app.use("/post", postRouter);
app.use("/like", likeRouter);

app.use(errorMiddleware);

app.listen(env.PORT, async () => {
    await dbHealthCheck();
    console.log(`API server running on http://localhost:${env.PORT}`);
});
