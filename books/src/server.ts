import 'module-alias/register';
import app from './app';
import config from './config/config';

app.listen(config.port, () => {
  console.log(`🚀 Cosmic Reads Node.js Express Web server is running on port ${config.port}`);
});