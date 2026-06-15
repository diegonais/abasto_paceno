export const appConfig = () => ({
  app: {
    name: process.env.APP_NAME ?? 'Abasto Paceno API',
    description:
      process.env.APP_DESCRIPTION ??
      'Backend API for Abasto Paceno.',
    version: process.env.APP_VERSION ?? '1.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3000,
    nodeEnv: process.env.NODE_ENV ?? 'development',
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  },
});
