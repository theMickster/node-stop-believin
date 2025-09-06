import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

/**
 * Centralized environment variable configuration
 * Loads and expands environment variables from .env file
 * This should be imported once at application startup before any other config files
 */
const env = dotenv.config();
dotenvExpand.expand(env);

export default env;
