import { Router, Request, Response } from 'express';
import { authenticateUser } from '../controllers/user';

export const router: Router = Router();

router.post('/login', async (request: Request, response: Response) => {
  const { email, password } = request.body;
  const token = await authenticateUser(email, password);
  if (token) {
    response.status(200)
      .cookie('session', token, { maxAge: 86400000 }) // 1 day
      .json({
        success: true
      });
  } else {
    response.status(200)
      .json({
        success: false
      });
  }
});
