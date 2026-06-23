// backend/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yaml');
const path = require('path');
const fs = require('fs');

const AppError = require('./src/utils/AppError');
const errorHandler = require('./src/middlewares/errorHandler');
const { apiLimiter } = require('./src/middlewares/rateLimitMiddleware');

const app = express();

const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
};
app.use(cors(corsOptions));

app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(compression());
app.use('/api', apiLimiter);

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

try {
    const swaggerDocumentPath = path.join(__dirname, '../docs/api/swagger.yaml');
    const swaggerFile = fs.readFileSync(swaggerDocumentPath, 'utf8');
    const swaggerDocument = YAML.parse(swaggerFile);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
    console.error("[API Docs] Error al cargar swagger.yaml:", e.message);
}

app.use('/api/auth', require('./src/api/routes/authRoutes'));
app.use('/api/users', require('./src/api/routes/userRoutes'));
app.use('/api/objectives', require('./src/api/routes/objectivesRoutes'));
app.use('/api/dashboard', require('./src/api/routes/dashboardRoutes'));
app.use('/api/analysis', require('./src/api/routes/analysisRoutes'));
app.use('/api/profile', require('./src/api/routes/profileRoutes'));
app.use('/api/settings', require('./src/api/routes/settingsRoutes'));
app.use('/api/tags', require('./src/api/routes/tagRoutes'));
app.use('/api/streak', require('./src/api/routes/streakRoutes'));
app.use('/api/templates', require('./src/api/routes/templateRoutes'));
app.use('/api/ai', require('./src/api/routes/aiRoutes'));

app.get('/api', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'GoalMaster API running. Documentation at /api-docs'
    });
});

app.get('/', (req, res) => {
    res.send('GoalMaster Backend. Access /api or /api-docs.');
});

app.all('*', (req, res, next) => {
    next(new AppError(`La ruta ${req.originalUrl} no se ha encontrado en este servidor.`, 404));
});

app.use(errorHandler);

module.exports = app;