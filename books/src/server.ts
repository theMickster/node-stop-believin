// Only use module-alias in production (compiled JS), not in dev (ts-node-dev uses tsconfig paths)
if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('module-alias/register');
}

import app from './app';
import config from './config/config';

app.listen(config.port, () => {
  console.log(`🚀 Cosmic Reads Node.js Express Web server is running on port ${config.port}`);
});