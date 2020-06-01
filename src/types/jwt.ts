export interface Token {
  id: string;
  email: string;
  username: string;
  expiresIn: string;
}

export interface DecodedToken {
  id: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}