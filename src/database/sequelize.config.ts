import type { Dialect, Options } from 'sequelize';

// Assignment target is MySQL; currently using Postgres for local testing.
export const sequelizeConnectionUri =
  process.env.DATABASE_URL ?? 'postgres://localhost:5432/ecommerce';

export const sequelizeConfig: Options = process.env.DB_HOST
  ? {
      dialect: process.env.DB_DIALECT as Dialect,
      logging: process.env.LOGGING === 'true',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      database: process.env.DB_NAME ?? 'ecommerce',
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    }
  : {
      dialect: process.env.DB_DIALECT as Dialect,
      logging: process.env.LOGGING === 'true',
    };
