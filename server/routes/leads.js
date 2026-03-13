import express from 'express';
import { randomUUID } from 'crypto';
import { runScrape } from '../services/scraper.js';

export default function leadsRouter(db) {
    const router = express.Router();

    // GET all leads (with activities and reminders)
    router.get('/', (req, res) => {
        try {
            const leads = db.prepare('SELECT * FROM leads ORDER BY createdAt DESC').all();
            leads.forEach(lead => {
                lead.activities = db.prepare('SELECT * FROM activities WHERE leadId = ? ORDER BY date DESC').all(lead.id);
                lead.reminders = db.prepare('SELECT * FROM reminders WHERE leadId = ? ORDER BY date DESC').all(lead.id);
                lead.unsubscribed = !!lead.unsubscribed;
            });
            res.json(leads);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // POST new lead
    router.post('/', (req, res) => {
        try {
            const lead = { 
                ...req.body, 
                id: req.body.id || randomUUID(), 
                createdAt: new Date().toISOString() 
            };
            const insert = db.prepare(`
                INSERT INTO leads (id, name, company, sector, location, email, phone, website, source, status, notes, vehicles, followUp1Date, followUp2Date, nextAction, unsubscribed, score, icebreaker, createdAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            insert.run(
                lead.id, lead.name || '', lead.company || '', lead.sector || '', lead.location || '', lead.email || '', 
                lead.phone || '', lead.website || '', lead.source || '', lead.status || 'new', 
                lead.notes || '', lead.vehicles || 0, lead.followUp1Date || '', lead.followUp2Date || '', 
                lead.nextAction || '', lead.unsubscribed ? 1 : 0, lead.score || 0, lead.icebreaker || '', lead.createdAt
            );
            res.json(lead);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // PUT update lead
    router.put('/:id', (req, res) => {
        try {
            const id = req.params.id;
            const updates = req.body;
            const updatedAt = new Date().toISOString();
            const fields = Object.keys(updates).filter(field => !['activities', 'reminders', 'id', 'createdAt'].includes(field));
            if (fields.length > 0) {
                const setClause = fields.map(f => `${f} = ?`).join(', ');
                const values = fields.map(f => updates[f]);
                db.prepare(`UPDATE leads SET ${setClause}, updatedAt = ? WHERE id = ?`).run(...values, updatedAt, id);
            }
            res.json({ id, ...updates, updatedAt });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // DELETE lead
    router.delete('/:id', (req, res) => {
        try {
            db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
            res.sendStatus(200);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // BULK ACTIONS
    router.delete('/bulk', (req, res) => {
        try {
            const { ids } = req.body;
            const placeholders = ids.map(() => '?').join(',');
            db.prepare(`DELETE FROM leads WHERE id IN (${placeholders})`).run(...ids);
            res.json({ success: true, count: ids.length });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    router.put('/bulk/status', (req, res) => {
        try {
            const { ids, status } = req.body;
            const placeholders = ids.map(() => '?').join(',');
            db.prepare(`UPDATE leads SET status = ? WHERE id IN (${placeholders})`).run(status, ...ids);
            res.json({ success: true, count: ids.length });
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // ACTIVITIES
    router.post('/:id/activities', (req, res) => {
        try {
            const activity = { ...req.body, id: randomUUID(), leadId: req.params.id, date: new Date().toISOString() };
            db.prepare('INSERT INTO activities (id, leadId, type, text, date) VALUES (?, ?, ?, ?, ?)').run(
                activity.id, activity.leadId, activity.type || 'manual', activity.text, activity.date
            );
            res.json(activity);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // REMINDERS
    router.post('/:id/reminders', (req, res) => {
        try {
            const reminder = { ...req.body, id: randomUUID(), leadId: req.params.id, completed: 0 };
            db.prepare('INSERT INTO reminders (id, leadId, text, date, completed) VALUES (?, ?, ?, ?, ?)').run(
                reminder.id, reminder.leadId, reminder.text, reminder.date, 0
            );
            res.json(reminder);
        } catch (err) { res.status(500).json({ error: err.message }); }
    });

    // SCRAPER INTEGRATION
    router.post('/scrape', async (req, res) => {
        try {
            const result = await runScrape(req.body, db);
            res.json(result);
        } catch (err) {
            console.error('Scraper route error:', err);
            res.status(500).json({ error: 'Scraper failure', details: err.message });
        }
    });

    return router;
}
