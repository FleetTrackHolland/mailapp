import express from 'express';
import { randomUUID } from 'crypto';
import path from 'path';

export default function paymentsRouter(db, mollie, payments, subscriptions) {
    const router = express.Router();

    // PAYMENTS - List all
    router.get('/payments', (req, res) => {
        try {
            const rows = db.prepare("SELECT * FROM payments ORDER BY createdAt DESC").all();
            res.json(rows);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // PAYMENTS - Create local record
    router.post('/payments', (req, res) => {
        try {
            const { orderId, planName, price, vatAmount, totalIncVat, status, customerEmail, customerName } = req.body;
            db.prepare(`
                INSERT INTO payments (id, orderId, planName, price, vatAmount, totalIncVat, status, customerEmail, customerName, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(randomUUID(), orderId, planName, price, vatAmount, totalIncVat, status, customerEmail, customerName, new Date().toISOString());
            res.json({ success: true });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // MOLLIE - Create checkout
    router.post('/payment/create', async (req, res) => {
        try {
            const { planName, price, description, customerEmail, customerName } = req.body;
            const orderId = randomUUID();
            const totalIncVat = (price * 1.21).toFixed(2);
            const payment = await mollie.payments.create({
                amount: { currency: 'EUR', value: totalIncVat },
                description: `${description || planName} — FleetTrack CRM`,
                redirectUrl: `${process.env.FRONTEND_URL}/settings?payment=success&orderId=${orderId}&plan=${encodeURIComponent(planName)}`,
                webhookUrl: `${process.env.WEBHOOK_URL || 'https://your-domain.com'}/api/payment/webhook`,
                method: 'ideal',
                metadata: { orderId, planName, price, customerEmail, customerName },
            });
            res.json({ paymentUrl: payment._links.checkout.href, orderId });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // CAMPAIGNS
    router.get('/campaigns', (req, res) => {
        try {
            const campaigns = db.prepare('SELECT * FROM campaigns ORDER BY createdAt DESC').all();
            res.json(campaigns);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.post('/campaigns', (req, res) => {
        try {
            const camp = { ...req.body, id: req.body.id || randomUUID(), createdAt: new Date().toISOString() };
            db.prepare(`
                INSERT INTO campaigns (id, name, subject, status, sentCount, deliveredCount, bouncedCount, openRate, clickRate, date, content, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                camp.id, camp.name, camp.subject, camp.status || 'Draft', String(camp.sentCount || 0), 
                String(camp.deliveredCount || 0), String(camp.bouncedCount || 0), camp.openRate || 0, 
                camp.clickRate || 0, camp.date || '', camp.content || '', camp.createdAt
            );
            res.json(camp);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // CONFIG
    router.get('/config', (req, res) => {
        try {
            const rows = db.prepare("SELECT * FROM config").all();
            const config = {};
            rows.forEach(r => {
                try { config[r.key] = JSON.parse(r.value); } catch (e) { config[r.key] = r.value; }
            });
            res.json(config);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.post('/config', (req, res) => {
        try {
            const insert = db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)");
            db.transaction(() => {
                for (const [key, value] of Object.entries(req.body)) {
                    insert.run(key, typeof value === 'string' ? value : JSON.stringify(value));
                }
            })();
            res.json({ success: true });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    return router;
}
