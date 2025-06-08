import express from "express";
import { HttpClient } from "./httpClient";
import { HttpRequest } from "./types/api";
import cors from "cors";

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(cors());

app.post("/send-request", async (req, res) => {
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

app.listen(PORT, () => {
    console.log(`HTTP Client server running on http://localhost:${PORT}`);
});
