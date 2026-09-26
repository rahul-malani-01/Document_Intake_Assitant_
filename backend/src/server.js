import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { ENV } from './config/env.js';

async function bootstrap() {
  try {
    await connectDB();
    const server = app.listen(ENV.PORT, () => {
      console.log(`[Server] Document Intake Backend running on http://localhost:${ENV.PORT}`);
      console.log(`[Server] LLM Provider active: ${ENV.LLM_PROVIDER}`);
    });

    server.on('error', async (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`[Server] Port ${ENV.PORT} is already in use. The backend is likely already running.`);
        await disconnectDB();
        return;
      }

      console.error('[Server] Listener error:', error.message);
      await disconnectDB();
      process.exitCode = 1;
    });
  } catch (error) {
    console.error('[Server] Fatal startup error:', error.message);
    process.exit(1);
  }
}

bootstrap();