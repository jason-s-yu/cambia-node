# Database Configuration

We designate a custom [Dockerfile](Dockerfile) so we can automatically add our [infile](infile.sql) to the Postgres database.

```
FROM postgres:12.3-alpine

ADD database/infile.sql /docker-entrypoint-initdb.d
```
([Dockerfile](Dockerfile))
