import 'dotenv/config';
import { createTables } from '../src/db/schema.js';

await createTables();
process.exit(0);
