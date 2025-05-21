"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
exports.default = new typeorm_1.DataSource({
    type: 'postgres', // yoki 'mysql', 'sqlite' va h.k.
    host: process.env.DB_HOST || 'localhost',
    port: +(process.env.DB_PORT || 5432),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'finco_kpi',
    entities: [
        'src/features/**/**/*.entity.{ts,js}',
    ],
    migrations: [
        'src/migrations/*.{ts,js}',
    ],
    synchronize: false,
    logging: true,
});
