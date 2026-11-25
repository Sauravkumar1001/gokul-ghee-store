import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { corsOptions } from './config/cors.js';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { globalApiLimiter } from './middleware/rateLimiter.js';
import { telemetryMiddleware } from './middleware/telemetryMiddleware.js';
import apiV1Routes from './routes/index.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(
    express.json({
      limit: '1mb',
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  if (env.nodeEnv !== 'test') {
    app.use(morgan(env.isProduction ? 'combined' : 'dev'));
  }

  app.use('/api', globalApiLimiter);
  app.use(telemetryMiddleware);
  app.use('/api/v1', apiV1Routes);

  app.get('/', (_req, res) => {
    res.status(200).json({
      success: true,
      name: 'GOKUL GHEE API',
      business: 'Anil Ji Ka Gokul Ghee',
      version: 'v1',
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

const app = createApp();
export default app;
