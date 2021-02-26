import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import { EmptyInputError, NotFoundError, InvalidInputError, AlreadyExistsError } from '../types/errors';
import jwt from 'jsonwebtoken';
import { Token, DecodedToken } from 'jwt';
import { isDevMode } from '../utils';

const prisma: PrismaClient = new PrismaClient();

/**
 * Retrieve a user based on their ID
 * @param id 
 */
export const getUser = async (id?: string, email?: string) => {
  let user;
  if (id) user = await prisma.user.findUnique({ where: { id }});
  else if (email) user = await prisma.user.findUnique({ where: { email } });
  else throw new EmptyInputError('Must specify user ID or email');

  if (user) {
    return user;
  } else {
    throw new NotFoundError(`User with id ${id} not found.`);
  }
};

export const getElo = async (id: string) => {
  const elo: number = (await prisma.user.findUnique({
    where: { id },
    select: {
      elo: true
    }
  })).elo;
  return elo;
};

export const updateElo = async (id: string, type: 'set' | 'add' | 'take', amount: number) => {
  if (!isDevMode) return false;
  if (type == 'set') {
    await prisma.user.update({
      where: { id },
      data: { elo: amount }
    });
  } else if (type == 'add') {
    const { elo } = await prisma.user.findUnique({
      where: { id },
      select: { elo: true }
    })
    await prisma.user.update({
      where: { id },
      data: { elo: elo + amount }
    });
  } else if (type == 'take') {
    const { elo } = await prisma.user.findUnique({
      where: { id },
      select: { elo: true }
    })
    await prisma.user.update({
      where: { id },
      data: { elo: elo - amount }
    });
  }
  return true;
}

/**
 * Retrieves all users in the database.
 */
export const getAllUsers = async () => {
  return prisma.user.findMany();
};

/**
 * 
 * @param email 
 * @param username 
 * @param password 
 * @returns the user object if it was created successfully
 * @returns false if the username contained an invalid character (symbol)
 */
export const createUser = async (email: string, username: string, password: string) => {
  if (username.match(/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/)) throw new InvalidInputError('Username cannot contain a special character');
  else if (await prisma.user.findUnique({ where: { email }})) {
    throw new AlreadyExistsError(`Account with email ${email} already exists`);
  }
  password = await argon2.hash(password);
  const user = await prisma.user.create({
    data: { email, username, password }
  });
  return user;
};

export const authenticateUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      password: true
    }
  });
  try {
    if (await argon2.verify(user.password, password)) {
      return jwt.sign({ id: user.id, email: user.email, username: user.username }, 'devmode', { expiresIn: '1d' });
    } else return false;
  } catch (error) {
    throw error;
  }
};

export const authenticateJWT = async (payload: string) => {
  let token;
  try {
    token = await JSON.parse(payload);
  } catch (error) {
    if (error instanceof SyntaxError) {
      token = payload;
    }
  }
  
  if (token) {
    return jwt.verify(token, 'devmode');
  }
};
