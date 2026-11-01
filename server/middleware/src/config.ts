export const config = {
  port: Number(process.env.PORT ?? 3001),
  dotnetApiBaseUrl: process.env.DOTNET_API_BASE_URL ?? 'http://localhost:5080',
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
};
