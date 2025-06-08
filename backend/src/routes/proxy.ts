import { Router, Request, Response } from 'express';
import axios from 'axios';
import { HttpRequest, HttpResponse } from '../types/api';
import { HttpClient } from '../httpClient';



export default function createProxyRouter() {
  const router = Router();

  router.post('/', async (req: Request, res: Response) => {
    const request: HttpRequest = await req.body.request;
    const environment = await req.body.environment || {};

    try {
      const response = await HttpClient.sendRequest(request, environment);
      console.log(response);

      const responseToSend : HttpResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        duration: response.duration,
        size: response.size
      };

      // Save to /history
      await axios.post('http://localhost:4000/history', {
        id : crypto.randomUUID(),
        response : responseToSend,
        timestamp : new Date(),
        request : request
      });

      res.status(200).json(responseToSend);
    } catch (error: any) {
      console.log("some error occureid");
      res.status(500).json({ error: error.message || "Unexpected error" });
    }
  });

  return router;
}
