import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createMollieClient } from '@mollie/api-client';
import path from 'path';
import helmet from 'helmet';
import { fileURLToPath } from 'url';

// Import Database
import db from './db.js';

// Import Routers
import leadsRouter from './routes/leads.js';
import apiRouter from './routes/api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Mollie client
const mollieApiKey = process.env.MOLLIE_API_KEY || 'test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const mollie = createMollieClient({ apiKey: mollieApiKey });

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json());

// Logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/leads', leadsRouter(db));
app.use('/api', apiRouter(db, mollie));

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Static Files & SPA Routing
const buildPath = path.join(__dirname, '../dist');
app.use(express.static(buildPath));

app.get('/*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'API endpoint not found' });
    res.sendFile(path.join(buildPath, 'index.html'));
});

// Export for Vercel/Serverless
export default app;

// Start Server (only if not in serverless environment)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`\n🚀 FleetTrack CRM Backend ready on http://localhost:${PORT}`);
        console.log(`   Optimized & Modularized (Web-Only)\n`);
    });
}

