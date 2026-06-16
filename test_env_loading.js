// test_env_loading.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env directly from this script's directory
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '.env') });

console.log('Test Output: MONGODB_URI is:', process.env.MONGODB_URI);
console.log('Test Output: JWT_SECRET is:', process.env.JWT_SECRET);