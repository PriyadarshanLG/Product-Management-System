export interface AdminAuthConfig {
  username: string;
  password: string;
  jwtSecret: string;
}

const developmentConfig: AdminAuthConfig = {
  username: 'admin',
  password: 'admin12345',
  jwtSecret: 'gupio-local-development-secret-change-before-production',
};

export function getAdminAuthConfig(): AdminAuthConfig | null {
  if (process.env.NODE_ENV === 'production') {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    const jwtSecret = process.env.JWT_SECRET;

    if (!username || !password || !jwtSecret || jwtSecret.length < 32) return null;
    return { username, password, jwtSecret };
  }

  return {
    username: process.env.ADMIN_USERNAME || developmentConfig.username,
    password: process.env.ADMIN_PASSWORD || developmentConfig.password,
    jwtSecret: process.env.JWT_SECRET || developmentConfig.jwtSecret,
  };
}