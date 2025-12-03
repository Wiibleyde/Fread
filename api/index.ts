// Ce n'est que des tests pour l'instant le code est à revoir complètement

import express from "express";
import { env } from "./env";
import discordRouter from "./routes/auth/discord";
import googleRouter from "./routes/auth/google";

const app = express();
app.use(express.json());

app.get("/status", (_req, res) => {
    res.json({ status: "ok" });
});


app.use(discordRouter);
app.use(googleRouter);


app.listen(env.PORT, () => {
    console.log(`API server running on http://localhost:${env.PORT}`);
});
