// backend/src/config/database.js
const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';

// Determine the .env file path based on the environment
const envPath = env === 'test' 
    ? path.resolve(__dirname, '../../../.env.test') 
    : path.resolve(__dirname, '../../.env');

dotenv.config({ path: envPath });

// Load environment-specific configuration variables
const dbConfig = {
    name: process.env.NODE_ENV === 'test' ? process.env.DB_NAME_TEST : process.env.DB_NAME,
    user: process.env.NODE_ENV === 'test' ? process.env.DB_USER_TEST : process.env.DB_USER,
    password: process.env.NODE_ENV === 'test' ? process.env.DB_PASSWORD_TEST : process.env.DB_PASSWORD,
    host: process.env.NODE_ENV === 'test' ? process.env.DB_HOST_TEST : process.env.DB_HOST,
    dialect: process.env.NODE_ENV === 'test' ? process.env.DB_DIALECT_TEST : process.env.DB_DIALECT,
    port: process.env.NODE_ENV === 'test' ? process.env.DB_PORT_TEST : process.env.DB_PORT,
};

// Validate that all required configuration variables are present
if (Object.values(dbConfig).some(value => value === undefined)) {
    console.error(`[DB] ERROR: Missing environment variables for database in environment "${env}".`);
    console.error(`[DB] Make sure the file ${envPath} is complete.`);
    process.exit(1);
}

const dbPortInt = parseInt(dbConfig.port, 10);
if (isNaN(dbPortInt)) {
    console.error(`[DB] ERROR: Database port "${dbConfig.port}" is not a valid number.`);
    process.exit(1);
}

const db = {};

const sequelizeInstance = new Sequelize(
    dbConfig.name,
    dbConfig.user,
    dbConfig.password,
    {
        host: dbConfig.host,
        port: dbPortInt,
        dialect: dbConfig.dialect,
        dialectOptions: { charset: 'utf8mb4' },
        logging: env === 'development' ? console.log : false,
        pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    }
);

// --- Model Loading ---
// Models will be attached to `sequelizeInstance.models` when imported
require('../api/models/user')(sequelizeInstance);
require('../api/models/objectives')(sequelizeInstance);
require('../api/models/progress')(sequelizeInstance);
require('../api/models/activityLog')(sequelizeInstance);
require('../api/models/tag')(sequelizeInstance);
require('../api/models/goalTemplate')(sequelizeInstance);
require('../api/models/tag')(sequelizeInstance);
require('../api/models/goalTemplate')(sequelizeInstance);

db.sequelize = sequelizeInstance;
db.Sequelize = Sequelize;

// Assign models to the `db` object for easy access
Object.assign(db, sequelizeInstance.models);

// --- Model Associations ---
// Execute the `associate` method on each model if it exists
Object.values(sequelizeInstance.models)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => model.associate(sequelizeInstance.models));

let isInitialized = false;

async function initializeDatabase() {
    if (isInitialized) {
        return;
    }
    try {
        console.log(`[DB] Authenticating with database '${dbConfig.name}'...`);
        await db.sequelize.authenticate();
        console.log(`[DB] Connection to '${dbConfig.name}' established.`);

        // Sync logic controlled by environment variables
        const forceSync = process.env.DB_FORCE_SYNC === 'true';
        // 'alter' is activated if DB_ALTER_SYNC is true, or in development if not force syncing.
        const alterSync = process.env.DB_ALTER_SYNC === 'true' || (env === 'development' && !forceSync);

        if (forceSync) {
            console.warn('[DB] Syncing database with { force: true } - ALL DATA WILL BE LOST!');
            await db.sequelize.sync({ force: true });
        } else if (alterSync) {
            console.log('[DB] Syncing database with { alter: true }...');
            await db.sequelize.sync({ alter: true });
        } else {
            console.log('[DB] Syncing database (standard sync)...');
            await db.sequelize.sync();
        }
        
        isInitialized = true;
        console.log('[DB] Database initialization completed.');

        const seedTemplates = require('../api/models/goalTemplate').seedTemplates;
        if (typeof seedTemplates === 'function') {
            await seedTemplates(sequelizeInstance);
        }

    } catch (error) {
        console.error(`[DB] Error connecting/syncing with database '${dbConfig.name}':`, error);
        throw error; // Rethrow so the main process handles it
    }
}

db.initializeDatabase = initializeDatabase;

module.exports = db;