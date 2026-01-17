import cors from "cors";
import express from "express";
import { env } from "./env";
import { errorMiddleware } from "./middleware/error";
import accountRouter from "./routes/account";
import authRouter from "./routes/auth";
import followRouter from "./routes/follow";
import likeRouter from "./routes/like";
import postRouter from "./routes/posts";
import { dbHealthCheck } from "./utils/db";
import { Logger } from "./utils/logger";
import statusRouter from "./routes/status";

const logger = Logger.for(import.meta.url);

const app = express();
app.use(express.json());
app.use(cors());

app.use(authRouter);
app.use(accountRouter);
app.use(followRouter);
app.use(postRouter);
app.use(likeRouter);
app.use(errorMiddleware);
app.use(statusRouter);

app.listen(env.PORT, async () => {
    await dbHealthCheck();
    logger.info(`API server running on http://localhost:${env.PORT}`);
});
