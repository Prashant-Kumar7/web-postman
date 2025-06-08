import "reflect-metadata";
import express from "express";
import { MikroORM } from "@mikro-orm/core";
import mikroConfig from "./mikro-orm.config";
import historyRouter from "./routes/history";
import collectionsRouter from "./routes/collections";
import proxyRoutes from "./routes/proxy";
import cors from "cors";
import { Router, Request, Response } from "express";
import { HttpRequest } from "./types/api";
import { HttpClient } from "./httpClient";

async function start() {
  const orm = await MikroORM.init(mikroConfig);
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use("/history", historyRouter(orm));
  app.use("/collections", collectionsRouter(orm));
  app.use("/proxy", proxyRoutes());

  app.post("/send-request", async (req: Request, res: Response) => {
    const request: HttpRequest = req.body.request;
    const environment = req.body.environment || {};

    try {
      const response = await HttpClient.sendRequest(request, environment);
      console.log(response);
      res.status(200).json(response);
    } catch (error: any) {
      console.log("some error occureid");
      res.status(500).json({ error: error.message || "Unexpected error" });
    }
  });

  app.listen(4000, () => {
    console.log("Server running on http://localhost:4000");
  });
}

start().catch((err) => {
  console.log(err);
});
