import { Sequelize } from 'sequelize';
import { initProductModel } from './products.model.js';
import {
  sequelizeConfig,
  sequelizeConnectionUri,
} from './sequelize.config.js';
import { SEQUELIZE } from "./constants.js";

export const databaseProviders = [
  {
    provide: SEQUELIZE,
    useFactory: async (): Promise<Sequelize> => {
      const sequelize = process.env.DB_HOST
        ? new Sequelize(sequelizeConfig)
        : new Sequelize(sequelizeConnectionUri, sequelizeConfig);

      initProductModel(sequelize);

      // Authenticate and sync the database to match the models provided
      await sequelize.authenticate();
      await sequelize.sync();

      return sequelize;
    },
  },
];
