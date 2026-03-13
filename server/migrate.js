import fs from 'fs';
import path from 'path';
import db from './db.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, 'server-data.json');

if (fs.existsSync(dataFile)) {
    console.log('📦 Starting migration from server-data.json to SQLite...');
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

    // Migrate Leads, Activities, Reminders
    if (data.leads) {
        const insertLead = db.prepare(`
            INSERT OR IGNORE INTO leads (id, name, company, sector, email, phone, website, source, status, notes, vehicles, followUp1Date, followUp2Date, nextAction, unsubscribed, createdAt, updatedAt, lastContact)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const insertActivity = db.prepare(`
            INSERT OR IGNORE INTO activities (id, leadId, type, text, date)
            VALUES (?, ?, ?, ?, ?)
        `);
        const insertReminder = db.prepare(`
            INSERT OR IGNORE INTO reminders (id, leadId, text, date, completed, notified30m, notifiedNow)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        Object.values(data.leads).forEach(lead => {
            insertLead.run(
                lead.id, lead.name || '', lead.company || '', lead.sector || '', lead.email || '', 
                lead.phone || '', lead.website || '', lead.source || '', lead.status || 'new', 
                lead.notes || '', lead.vehicles || 0, lead.followUp1Date || '', lead.followUp2Date || '', 
                lead.nextAction || '', lead.unsubscribed ? 1 : 0, lead.createdAt || '', lead.updatedAt || '', 
                lead.lastContact || ''
            );

            if (lead.activities) {
                lead.activities.forEach(act => {
                    insertActivity.run(act.id, lead.id, act.type || 'manual', act.text, act.date);
                });
            }

            if (lead.reminders) {
                lead.reminders.forEach(rem => {
                    insertReminder.run(rem.id, lead.id, rem.text, rem.date, rem.completed ? 1 : 0, rem.notified30m ? 1 : 0, rem.notifiedNow ? 1 : 0);
                });
            }
        });
    }

    // Migrate Campaigns
    if (data.campaigns) {
        const insertCamp = db.prepare(`
            INSERT OR IGNORE INTO campaigns (id, name, subject, status, sentCount, deliveredCount, bouncedCount, openRate, clickRate, date, content, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        Object.values(data.campaigns).forEach(camp => {
            insertCamp.run(
                camp.id, camp.name, camp.subject, camp.status, String(camp.sentCount), 
                String(camp.deliveredCount), String(camp.bouncedCount), camp.openRate || 0, 
                camp.clickRate || 0, camp.date, camp.content, camp.createdAt || ''
            );
        });
    }

    // Migrate Payments
    if (data.payments) {
        const insertPayment = db.prepare(`
            INSERT OR IGNORE INTO payments (id, orderId, planName, price, vatAmount, totalIncVat, status, customerEmail, customerName, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        Object.values(data.payments).forEach(p => {
            insertPayment.run(
                p.id || p.orderId, p.orderId, p.planName, p.price, p.vatAmount, p.totalIncVat, 
                p.status, p.customerEmail, p.customerName, p.createdAt || ''
            );
        });
    }

    // Migrate Subscriptions
    if (data.subscriptions) {
        const insertSub = db.prepare(`
            INSERT OR IGNORE INTO subscriptions (customerId, plan, activeSince, nextBillingDate, active)
            VALUES (?, ?, ?, ?, ?)
        `);
        Object.entries(data.subscriptions).forEach(([id, sub]) => {
            insertSub.run(id, sub.plan, sub.activeSince, sub.nextBillingDate, sub.active ? 1 : 0);
        });
    }

    console.log('✅ Migration complete!');
} else {
    console.log('ℹ️ No server-data.json found. Database initialized empty.');
}
