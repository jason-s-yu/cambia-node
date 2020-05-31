/* Workaround for CREATE TABLE IF NOT EXISTS */
SELECT 'CREATE DATABASE cambia'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'cambia')\gexec

DROP TABLE IF EXISTS "User";
CREATE TABLE IF NOT EXISTS "public"."User" (
  id        UUID PRIMARY KEY NOT NULL,
  username  VARCHAR(255),
  email     VARCHAR(255) UNIQUE NOT NULL,
  password  VARCHAR(255),
  elo       INTEGER
);

DROP TABLE IF EXISTS "Game";
CREATE TABLE IF NOT EXISTS "public"."Game" (
  id            UUID PRIMARY KEY NOT NULL,
  duration      INTEGER, /* in seconds */
  "playerCount" INTEGER
);

/*
 * Matches define relationships between users and games.
 * Multiple users participate in games.
 */
DROP TABLE IF EXISTS "Match";
CREATE TABLE IF NOT EXISTS "public"."Match" (
  id          SERIAL PRIMARY KEY NOT NULL,
  "userId"    UUID NOT NULL,
  "gameId"    UUID NOT NULL,
  FOREIGN KEY ("userId") REFERENCES "public"."User"(id),
  FOREIGN KEY ("gameId") REFERENCES "public"."Game"(id)
);
