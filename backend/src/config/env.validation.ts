export function validateEnv(config: Record<string, unknown>) {
  const requiredValues = [
    'DATABASE_HOST',
    'DATABASE_PORT',
    'DATABASE_USER',
    'DATABASE_PASSWORD',
    'DATABASE_NAME',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
  ];

  for (const key of requiredValues) {
    if (!config[key]) {
      throw new Error(`Missing environment variable: ${key}`);
    }
  }

  const databasePort = Number(config.DATABASE_PORT);
  const port = config.PORT ? Number(config.PORT) : 3000;

  if (Number.isNaN(databasePort)) {
    throw new Error('DATABASE_PORT must be a number');
  }

  if (Number.isNaN(port)) {
    throw new Error('PORT must be a number');
  }

  return {
    ...config,
    DATABASE_PORT: databasePort,
    PORT: port,
  };
}
