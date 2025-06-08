import { Router, Request, Response } from 'express';
import { MikroORM } from '@mikro-orm/core';
import { RequestHistory } from '../entities/RequestHistory';

export default (orm: MikroORM) => {
  const router = Router();

  router.post('/', async (req: Request, res: Response) => {
    const em = orm.em.fork();

    // Destructure fields from request body
    const {
      id,
      response,
      timestamp,
      request
    } = await req.body;

    try {
      const entry = em.create(RequestHistory, {
        id,
        request: request,
        timestamp: timestamp,
        response : response
      });

      await em.persistAndFlush(entry);

      res.status(201).json(entry);
      return
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to save request history' });
      return
    }
  });

  router.get('/', async (req: Request, res: Response) => {
    const em = orm.em.fork();

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    try {
      const [data, count] = await em.findAndCount(RequestHistory, {}, {
        limit,
        offset: (page - 1) * limit,
        orderBy: { timestamp: 'desc' },
        fields: ["id", "timestamp", "request", "response"]
      });



      res.json({
        page,
        totalPages: Math.ceil(count / limit),
        totalCount: count,
        data,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  });

  return router;
};
