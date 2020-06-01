import { Router, Request, Response } from 'express';
import { createUser, getAllUsers, getUser, updateElo } from '../controllers/user';
import { EmptyInputError, AlreadyExistsError } from '../types/errors';

export const router: Router = Router();

router.post('/create', async (request: Request, response: Response) => {
  const { email, username, password } = request.body;
  let user;
  try {
    user = await createUser(email, username, password);
  } catch (error) {
    if (error instanceof AlreadyExistsError) {
      response.status(403)
              .send(error.message);
    } else {
      console.error(error);
      response.status(500)
              .send(error.message);
    }
    return;
  }

  if (user) {
    response.status(200)
            .json(user);
  }
});

router.get('/all', async (request: Request, response: Response) => {
  response.status(200)
          .json(await getAllUsers());
});

router.post('/get', async (request: Request, response: Response) => {
  const { id, email } = request.body;
  let user;
  try {
    user = getUser(id, email);
  } catch (error) {
    if (error instanceof EmptyInputError) {
      response.status(400)
              .send('ID or email must be specified.');
    } else {
      response.status(500)
              .send(error);
    }
    return;
  }
  response.status(200)
          .json(user);
});

router.post('/elo/set', async (request: Request, response: Response) => {
  const { id, amount } = request.body;
  const result = await updateElo(id, 'set', amount);
  if (result) response.status(200).send('Success');
  else response.status(500).send('');
});

router.post('/elo/add', async (request: Request, response: Response) => {
  const { id, amount } = request.body;
  const result = await updateElo(id, 'add', amount);
  if (result) response.status(200).send('Success');
  else response.status(500).send('');
});

router.post('/elo/take', async (request: Request, response: Response) => {
  const { id, amount } = request.body;
  const result = await updateElo(id, 'take', amount);
  if (result) response.status(200).send('Success');
  else response.status(500).send('');
});
