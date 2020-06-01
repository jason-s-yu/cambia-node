import { Router, Request, Response } from 'express';
import { router as userRouter } from './user';
import { router as authRouter } from './auth';

export const api: Router = Router();

api.get('/', (request: Request, response: Response) => {
  response.send('hello');
});
api.use(authRouter);
api.use('/user', userRouter);

