# Products service

NestJS + Sequelize API for product CRUD. Defaults to Postgres locally; MySQL is supported via env config.

## Prerequisites

- Node.js 20+
- Yarn
- A MySQL database named `ecommerce`

## Setup

```bash
yarn install
```

Copy env values into a `.env` in the project root (or export them in your shell). The app reads:

| Variable       | Default                               | Notes                                                       |
| -------------- | ------------------------------------- | ----------------------------------------------------------- |
| `PORT`         | `3000`                                | HTTP port                                                   |
| `DATABASE_URL` | `postgres://localhost:5432/ecommerce` | Used when `DB_HOST` is unset                                |
| `DB_HOST`      | —                                     | When set, uses discrete DB fields instead of `DATABASE_URL` |
| `DB_PORT`      | `5432`                                |                                                             |
| `DB_NAME`      | `ecommerce`                           |                                                             |
| `DB_USER`      | —                                     | Required when using `DB_HOST`                               |
| `DB_PASSWORD`  | —                                     |                                                             |
| `DB_DIALECT`   | —                                     | e.g. `postgres` or `mysql`                                  |
| `LOGGING`      | —                                     | Set to `true` to enable Sequelize SQL logging               |

Example Postgres `.env`:

```env
# I was using postgres locally, easier testing
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce
DB_USER=nick
DB_PASSWORD=
LOGGING=false
```

Example MySQL `.env`:

```env
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ecommerce
DB_USER=root
DB_PASSWORD=
LOGGING=false
```

Create the database if it does not exist (tables are synced on startup):

```bash
# MySQL
mysql -e "CREATE DATABASE ecommerce;"
```

## Run

```bash
# development (watch mode)
yarn start:dev

# one-shot start
yarn start

# production build + run
yarn build
yarn start:prod
```

App: http://localhost:3000  
Swagger UI: http://localhost:3000/docs  
OpenAPI JSON: http://localhost:3000/docs-json

## Test & lint

```bash
yarn test
yarn test:e2e
yarn lint
```

## API docs

Interactive request/response examples for all product endpoints are in Swagger at `/docs` once the app is running. Use “Try it out” to exercise create, list (paginated), get, update stock, and delete.
