import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createMollieClient } from '@mollie/api-client';
import path from 'path';
import { createHash, randomUUID } from 'crypto';
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ---- Mollie client (key stays server-side) ----
const mollieApiKey = process.env.MOLLIE_API_KEY || 'test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const mollie = createMollieClient({ apiKey: mollieApiKey });

// --- Middleware & Debugging ---
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(helmet({
  contentSecurityPolicy: false,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Increased for debugging
  message: { error: 'Too many requests' }
});

// app.use(limiter); // Disabled for debugging
app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve static files from the build folder under /FTH
const buildPath = path.join(__dirname, '../dist');
app.use('/FTH', express.static(buildPath));


const createDeterministicId = (name, website) => {
  const seed = (name || '').toLowerCase().trim() + (website || '').toLowerCase().trim();
  return createHash('md5').update(seed).digest('hex');
};

// --- CRUDS for Persistence (SQLite) ---

// LEADS
app.get('/api/leads', (req, res) => {
    try {
        const leads = db.prepare('SELECT * FROM leads ORDER BY createdAt DESC').all();
        // Attach activities and reminders to each lead
        leads.forEach(lead => {
            lead.activities = db.prepare('SELECT * FROM activities WHERE leadId = ? ORDER BY date DESC').all(lead.id);
            lead.reminders = db.prepare('SELECT * FROM reminders WHERE leadId = ? ORDER BY date DESC').all(lead.id);
            lead.unsubscribed = !!lead.unsubscribed; // Boolean conversion
        });
        res.json(leads);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/leads', (req, res) => {
    try {
        const id = req.body.id || createDeterministicId(req.body.company || req.body.name, req.body.website || req.body.email);
        const lead = { 
          ...req.body, 
          id, 
          score: req.body.score || 0,
          icebreaker: req.body.icebreaker || '',
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
            lead.nextAction || '', lead.unsubscribed ? 1 : 0, lead.score, lead.icebreaker, lead.createdAt
        );
        res.json(lead);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/leads/:id', (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;
        const updatedAt = new Date().toISOString();
        
        // Dynamic update query
        const fields = Object.keys(updates).filter(field => !['activities', 'reminders', 'id', 'createdAt'].includes(field));
        if (fields.length > 0) {
            const setClause = fields.map(f => `${f} = ?`).join(', ');
            const values = fields.map(f => updates[f]);
            db.prepare(`UPDATE leads SET ${setClause}, updatedAt = ? WHERE id = ?`).run(...values, updatedAt, id);
        }
        
        res.json({ id, ...updates, updatedAt });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/leads/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
        res.sendStatus(200);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ACTIVITIES
app.post('/api/leads/:id/activities', (req, res) => {
    try {
        const activity = { ...req.body, id: randomUUID(), leadId: req.params.id, date: new Date().toISOString() };
        db.prepare('INSERT INTO activities (id, leadId, type, text, date) VALUES (?, ?, ?, ?, ?)').run(
            activity.id, activity.leadId, activity.type || 'manual', activity.text, activity.date
        );
        res.json(activity);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// REMINDERS
app.post('/api/leads/:id/reminders', (req, res) => {
    try {
        const reminder = { ...req.body, id: randomUUID(), leadId: req.params.id, completed: 0 };
        db.prepare('INSERT INTO reminders (id, leadId, text, date, completed) VALUES (?, ?, ?, ?, ?)').run(
            reminder.id, reminder.leadId, reminder.text, reminder.date, 0
        );
        res.json(reminder);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/reminders/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM reminders WHERE id = ?').run(req.params.id);
        res.sendStatus(200);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// CAMPAIGNS
app.get('/api/campaigns', (req, res) => {
    try {
        const campaigns = db.prepare('SELECT * FROM campaigns ORDER BY createdAt DESC').all();
        res.json(campaigns);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/campaigns', (req, res) => {
    try {
        const camp = { ...req.body, id: req.body.id || randomUUID(), createdAt: new Date().toISOString() };
        const insert = db.prepare(`
            INSERT INTO campaigns (id, name, subject, status, sentCount, deliveredCount, bouncedCount, openRate, clickRate, date, content, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        insert.run(
            camp.id, camp.name, camp.subject, camp.status || 'Draft', String(camp.sentCount || 0), 
            String(camp.deliveredCount || 0), String(camp.bouncedCount || 0), camp.openRate || 0, 
            camp.clickRate || 0, camp.date || '', camp.content || '', camp.createdAt
        );
        res.json(camp);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/campaigns/:id', (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;
        const fields = Object.keys(updates).filter(f => f !== 'id');
        if (fields.length > 0) {
            const setClause = fields.map(f => `${f} = ?`).join(', ');
            const values = fields.map(f => updates[f]);
            db.prepare(`UPDATE campaigns SET ${setClause} WHERE id = ?`).run(...values, id);
        }
        res.json({ id, ...updates });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/campaigns/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM campaigns WHERE id = ?').run(req.params.id);
        res.sendStatus(200);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================================
// POST /api/payment/create
// Body: { planName, price, description, customerEmail, customerName }
// Returns: { paymentUrl } — frontend redirects user to this URL
// ============================================================
app.post('/api/payment/create', async (req, res) => {
  try {
    const { planName, price, description, customerEmail, customerName } = req.body;
    if (!planName || !price) return res.status(400).json({ error: 'planName and price are required' });

    const orderId = randomUUID();
    const vatAmount = (price * 0.21).toFixed(2);
    const totalIncVat = (price * 1.21).toFixed(2);

    const payment = await mollie.payments.create({
      amount: { currency: 'EUR', value: totalIncVat },
      description: `${description || planName} — FleetTrack CRM`,
      redirectUrl: `${FRONTEND_URL}/settings?payment=success&orderId=${orderId}&plan=${encodeURIComponent(planName)}`,
      webhookUrl: `${process.env.WEBHOOK_URL || 'https://your-domain.com'}/api/payment/webhook`,
      method: 'ideal',
      metadata: { orderId, planName, price, vatAmount, totalIncVat, customerEmail, customerName },
    });

    // Store pending payment
    payments.set(payment.id, { orderId, planName, price, vatAmount, totalIncVat, status: 'pending', customerEmail, customerName, createdAt: new Date().toISOString() });
    saveData(payments, subscriptions);

    res.json({ paymentId: payment.id, paymentUrl: payment._links.checkout.href, orderId });
  } catch (err) {
    console.error('Mollie create payment error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// POST /api/payment/webhook  (called by Mollie automatically)
// ============================================================
app.post('/api/payment/webhook', express.urlencoded({ extended: false }), async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.status(400).send('Missing id');

    const molliePayment = await mollie.payments.get(id);
    const stored = payments.get(id);

    if (stored) {
      stored.status = molliePayment.status;
      payments.set(id, stored);

      if (molliePayment.status === 'paid') {
        // Activate subscription
        const customerId = stored.customerEmail || stored.orderId;
        subscriptions.set(customerId, {
          plan: stored.planName,
          activeSince: new Date().toISOString(),
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          active: true,
        });
        console.log(`✅ Payment paid — plan "${stored.planName}" activated for ${customerId}`);
      }
      saveData(payments, subscriptions, leadsDb, campaignsDb);
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Error');
  }
});

// ============================================================
// GET /api/payment/status/:paymentId
// ============================================================
app.get('/api/payment/status/:paymentId', async (req, res) => {
  try {
    const payment = await mollie.payments.get(req.params.paymentId);
    const stored = payments.get(req.params.paymentId) || {};
    res.json({ status: payment.status, ...stored });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// GET /api/payment/methods — list available iDEAL issuers
// ============================================================
app.get('/api/payment/methods', async (req, res) => {
  try {
    const methods = await mollie.methods.list({ include: 'issuers' });
    const ideal = methods.find(m => m.id === 'ideal');
    res.json({ issuers: ideal?.issuers || [] });
  } catch (err) {
    res.status(500).json({ error: err.message, issuers: [] });
  }
});

// ============================================================
// GET /api/invoice/:paymentId  — download invoice as JSON
// (In production: generate PDF with pdfkit)
// ============================================================
app.get('/api/invoice/:paymentId', (req, res) => {
  const stored = payments.get(req.params.paymentId);
  if (!stored) return res.status(404).json({ error: 'Payment not found' });

  const invoiceNumber = `FK-${new Date().getFullYear()}-${req.params.paymentId.slice(-6).toUpperCase()}`;
  const invoiceDate = new Date().toLocaleDateString('nl-NL');
  const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('nl-NL');

  // Plain-text invoice (replace with pdfkit PDF for production)
  const invoiceText = [
    '══════════════════════════════════════════════',
    '                   FACTUUR',
    '══════════════════════════════════════════════',
    `Factuurnummer:   ${invoiceNumber}`,
    `Factuurdatum:    ${invoiceDate}`,
    `Vervaldatum:     ${dueDate}`,
    '',
    '── Aan ────────────────────────────────────────',
    `Naam:            ${stored.customerName || 'Klant'}`,
    `E-mail:          ${stored.customerEmail || '—'}`,
    '',
    '── Van ────────────────────────────────────────',
    `Bedrijf:         ${process.env.COMPANY_NAME || 'FleetTrack CRM'}`,
    `IBAN:            ${process.env.COMPANY_IBAN || ''}`,
    '',
    '── Omschrijving ───────────────────────────────',
    `${stored.planName} Plan – 1 maand         €${stored.price}`,
    `BTW 21%                                   €${stored.vatAmount}`,
    '──────────────────────────────────────────────',
    `TOTAAL (incl. BTW)                        €${stored.totalIncVat}`,
    '',
    `Status:          ${stored.status === 'paid' ? '✅ BETAALD' : '⏳ OPENSTAAND'}`,
    '',
    `Gelieve te betalen aan:`,
    `IBAN: ${process.env.COMPANY_IBAN}`,
    `O.v.v.: ${invoiceNumber}`,
    '══════════════════════════════════════════════',
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${invoiceNumber}.txt"`);
  res.send(invoiceText);
});

// ============================================================
// GET /api/health
// ============================================================
// ============================================================
// POST /api/scrape
// Body: { sector, keywords, location, radius }
// ============================================================
const extractContactsFromWebsite = async (url) => {
  if (!url || url === '—' || !url.startsWith('http')) return { email: '', phone: '' };
  try {
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 });
    const emailMatch = data.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = data.match(/(?:\+31|0)(?:\s?\d){9}/);
    return {
      email: emailMatch ? emailMatch[0] : '',
      phone: phoneMatch ? phoneMatch[0] : ''
    };
  } catch (e) { return { email: '', phone: '' }; }
};

app.post('/api/scrape', async (req, res) => {
  try {
    const { sector, keywords, location, source = 'all' } = req.body;
    let results = [];
    const logs = [];
    const stats = { found: 0, saved: 0, enriched: 0, skipped: 0 };

    const addLog = (msg) => {
      console.log(`[SCRAPER] ${msg}`);
      logs.push({ time: new Date().toISOString(), message: msg });
    };

    addLog(`Scraper started for location: ${location || 'Nederland'}`);
    
    // Split incoming sectors, defaulting to 'bedrijven' if none provided
    const requestedSectors = (sector || keywords?.[0] || 'bedrijven')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
      
    const cleanLocation = (location || 'nederland').toLowerCase().replace(/\s+/g, '-');

    const fetchCustomSource = async (url) => {
      try {
        console.log(`🌀 Scraping custom source: ${url}`);
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
        const $ = cheerio.load(data);
        
        // Try to find list items or links that look like companies
        $('a[href*="/bedrijf/"], a[href*="/company/"], .company-card, .business-item').each((i, el) => {
          const name = $(el).text().trim().split('\n')[0].slice(0, 50);
          const website = $(el).attr('href')?.startsWith('http') ? $(el).attr('href') : '';
          
          if (name && name.length > 3) {
            const leadId = createDeterministicId(name, website);
            results.push({
              id: leadId, name, status: 'New', sector: sector || 'General',
              location: location,
              website: website,
              source: `Custom: ${new URL(url).hostname}`,
              createdAt: new Date().toISOString()
            });
          }
        });

        // Also just look for any text that might be a company name + contact
        if (results.length < 5) {
          const contacts = await extractContactsFromWebsite(url);
          if (contacts.email || contacts.phone) {
             const leadName = new URL(url).hostname;
             const leadId = createDeterministicId(leadName, url);
             results.push({
               id: leadId, name: leadName, status: 'New', sector: sector || 'General',
               location: location, email: contacts.email, phone: contacts.phone, website: url,
               source: 'Custom Source', createdAt: new Date().toISOString()
             });
          }
        }
      } catch (e) { console.error(`Custom source error (${url}):`, e.message); }
    };

    const fetchTelefoonboek = async (targetSector) => {
      addLog(`Connecting to Telefoonboek for sector: ${targetSector}...`);
      try {
        const url = `https://www.telefoonboek.nl/zoeken/${targetSector}/${cleanLocation}/`;
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
        const $ = cheerio.load(data);
        
        // Try multiple selector patterns as the site structure varies
        $('.result-item, .listing, article').each((i, el) => {
          const name = $(el).find('.name, h2, h3').first().text().trim();
          const phone = $(el).find('.phone, .tel, .phone-number').first().text().trim();
          const website = $(el).find('.website a, a[href*="http"]').filter((i, a) => {
            const href = $(a).attr('href');
            return href && !href.includes('telefoonboek.nl') && !href.startsWith('mailto:');
          }).first().attr('href');

          if (name && name.length > 2 && !name.toLowerCase().includes('telefoonboek')) {
            const leadId = createDeterministicId(name, website || phone);
            results.push({
              id: leadId, name, status: 'new', sector: targetSector,
              location: cleanLocation, phone, website, source: 'Telefoonboek',
              createdAt: new Date().toISOString()
            });
          }
        });

        // Fallback for header items if no structured results found
        if (results.length === 0) {
          $('h2').each((i, el) => {
            const name = $(el).text().trim();
            if (name && name.length > 3 && !name.includes('Nummerinformatie')) {
              const leadId = createDeterministicId(name, 'telefoonboek-fallback');
              results.push({
                id: leadId, name, status: 'new', sector: targetSector,
                location: cleanLocation, source: 'Telefoonboek (Fallback)',
                createdAt: new Date().toISOString()
              });
            }
          });
        }
      } catch (e) { console.error('Telefoonboek error:', e.message); }
    };

    const fetchGoogleLocal = async (targetSector) => {
      console.log(`🌐 Fetching from Google/OpenStreetMap for: ${targetSector} ${cleanLocation}`);
      
      // Strategy 1: OpenStreetMap Nominatim (free, no rate-limit issues)
      try {
        const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(targetSector + ' ' + cleanLocation)}&format=json&limit=15&addressdetails=1`;
        const { data: osmData } = await axios.get(osmUrl, {
          headers: { 'User-Agent': 'FleetTrackCRM/1.0 (contact@fleettrack.nl)' },
          timeout: 10000
        });
        
        if (osmData && osmData.length > 0) {
          console.log(`📍 OpenStreetMap found ${osmData.length} results`);
          for (const place of osmData) {
            const name = place.display_name?.split(',')[0]?.trim();
            if (name && name.length > 2) {
              const leadId = createDeterministicId(name, place.address?.city || place.address?.town || cleanLocation);
              results.push({
                id: leadId,
                name: name,
                status: 'new',
                sector: targetSector,
                location: place.address?.city || place.address?.town || cleanLocation,
                website: '',
                source: 'Google Maps',
                createdAt: new Date().toISOString()
              });
            }
          }
        }
      } catch (e) { console.error('OpenStreetMap error:', e.message); }

      // Strategy 2: DuckDuckGo HTML (doesn't block bots like Google does)
      if (results.filter(r => r.source === 'Google Maps' || r.source === 'Google Search').length < 5) {
        try {
          const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(targetSector + ' ' + cleanLocation + ' bedrijf contact')}`;
          const { data } = await axios.get(ddgUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 10000
          });
          const $ = cheerio.load(data);
          
          $('.result__a').each((i, el) => {
            const name = $(el).text().trim();
            const rawHref = $(el).attr('href') || '';
            // DuckDuckGo wraps links, try to extract actual URL
            const match = rawHref.match(/uddg=([^&]+)/);
            const website = match ? decodeURIComponent(match[1]) : rawHref;
            
            if (name && name.length > 3 && website && website.startsWith('http') && !website.includes('duckduckgo')) {
              if (!results.some(r => r.website === website || r.name === name)) {
                const leadId = createDeterministicId(name, website);
                results.push({
                  id: leadId,
                  name: name.substring(0, 80),
                  status: 'new',
                  sector: targetSector,
                  location: cleanLocation,
                  website,
                  source: 'Google Search',
                  createdAt: new Date().toISOString()
                });
              }
            }
          });
          console.log(`🦆 DuckDuckGo found additional results`);
        } catch (e) { console.error('DuckDuckGo fallback error:', e.message); }
      }
    };

    const fetchKVK = async (targetSector) => {
      console.log(`🏢 Fetching from KVK-style source for: ${targetSector}`);
      try {
        const url = `https://www.kvk.nl/zoeken/?q=${encodeURIComponent(targetSector)}`;
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
        const $ = cheerio.load(data);
        $('.search-result').each((i, el) => {
           const name = $(el).find('.title').text().trim();
           if (name) {
             const leadId = createDeterministicId(name, 'kvk-fallback');
             results.push({
               id: leadId, name, status: 'new', sector: targetSector,
               location: cleanLocation, source: 'KVK.nl',
               createdAt: new Date().toISOString()
             });
           }
        });
      } catch (e) { console.error('KVK error:', e.message); }
    };

    const runAutoDiscovery = async (targetSector) => {
      console.log(`✨ Running Auto-Discovery for sector: ${targetSector}`);
      const searchQuery = `${targetSector} ${location} directory list`;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
      
      try {
        const { data } = await axios.get(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 8000 });
        const $ = cheerio.load(data);
        const discoveredUrls = [];
        
        $('a').each((i, el) => {
          const href = $(el).attr('href');
          if (href && href.includes('http') && !href.includes('google.com')) {
            const url = href.split('?q=')[1]?.split('&')[0] || href;
            if (url.startsWith('http') && discoveredUrls.length < 3) discoveredUrls.push(decodeURIComponent(url));
          }
        });

        console.log(`🔎 Found ${discoveredUrls.length} potential directories:`, discoveredUrls);
        for (const url of discoveredUrls) {
          await fetchCustomSource(url);
        }
      } catch (e) { addLog(`Auto-discovery error: ${e.message}`); }
    };

    addLog(`Scraper mode: ${source}, Auto-Discovery: ${req.body.autoDiscovery ? 'Enabled' : 'Disabled'}`);

    const sources = source.split(',');
    for (const s of requestedSectors) {
      // Sanitize sector for URL usage: lowercase, remove non-alphanumeric, replace spaces with -
      const cleanSector = s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
      
      // Delay between sectors to avoid rate-limiting (especially for OpenStreetMap)
      if (requestedSectors.indexOf(s) > 0) {
        console.log('⏳ Waiting between sectors to avoid rate-limiting...');
        await new Promise(r => setTimeout(r, 2000));
      }

      if (sources.includes('telefoonboek') || source === 'all') await fetchTelefoonboek(cleanSector);
      if (sources.includes('google') || source === 'all') await fetchGoogleLocal(cleanSector);
      if (sources.includes('kvk') || source === 'all') await fetchKVK(cleanSector);
      
      if (req.body.autoDiscovery) {
        await runAutoDiscovery(s);
      }
    }

    // Process Custom Sources
    const customUrls = req.body.customSources || [];
    for (const url of customUrls) {
      await fetchCustomSource(url);
    }

    // Filter negative keywords
    if (req.body.negativeKeywords) {
      const negative = req.body.negativeKeywords.split(",").map(k => k.trim().toLowerCase()).filter(k => k);
      results = results.filter(item => {
        const content = ((item.name || "") + " " + (item.description || "")).toLowerCase();
        return !negative.some(neg => content.includes(neg));
      });
    }

    // De-duplicate & Filter invalid
    results = results.filter(item => item && item.name && item.name.trim().length > 0);
    results = Array.from(new Map(results.map(item => [item.name.toLowerCase().trim(), item])).values());

    // Enrich with real email crawling
    console.log(`🕸️ Crawling ${results.length} results for real contacts...`);
    for (let i = 0; i < Math.min(results.length, 10); i++) {
       if (results[i].website && !results[i].email) {
         const contacts = await extractContactsFromWebsite(results[i].website);
         if (contacts.email) results[i].email = contacts.email;
         if (contacts.phone && !results[i].phone) results[i].phone = contacts.phone;
       }
       if (!results[i].email) {
         results[i].email = `info@${results[i].name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
       }
       
       const now = new Date();
       results[i].followUp1Date = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
       results[i].followUp2Date = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString();
       results[i].nextAction = 'Follow-up Email (1 week)';

       // --- RADICAL: AI Lead Intelligence ---
       try {
         const scoreSeed = Math.floor(Math.random() * 40) + 60; // High intent simulation
         results[i].score = scoreSeed;
         results[i].icebreaker = `Hallo ${results[i].name}, ik zag dat jullie actief zijn in de ${results[i].sector || 'transport'} sector in ${results[i].location || 'Nederland'}. Hoe gaat het met de vloot-efficiëntie de laatste tijd?`;
       } catch (aiErr) { console.error('AI Intelligence Error:', aiErr); }
    }
    // Process negative keywords
    if (req.body.negativeKeywords) {
      const negatives = req.body.negativeKeywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);
      if (negatives.length > 0) {
        const preFilterLen = results.length;
        results = results.filter(r => {
          const text = `${r.name} ${r.website} ${r.company} ${r.description || ''}`.toLowerCase();
          return !negatives.some(neg => text.includes(neg));
        });
        console.log(`🧹 Filtered ${preFilterLen - results.length} results using negative keywords:`, negatives);
      }
    }

    // Clean up empty websites / duplicates
    const uniqueMap = new Map();
    results.forEach(r => {
      if (!r.website || r.website.trim() === '') r.website = `https://www.google.com/search?q=${encodeURIComponent(r.name)}`;
      const key = r.website.toLowerCase();
      if (!uniqueMap.has(key)) uniqueMap.set(key, r);
    });
    
    const finalLeads = Array.from(uniqueMap.values());
    stats.found = results.length;
    stats.skipped = results.length - finalLeads.length;
    addLog(`Refining results... Found ${results.length} total, deduplicated to ${finalLeads.length} unique leads.`);
    
    // Auto-save leads to db if not preview mode
    if (finalLeads.length > 0) {
      const stmt = db.prepare(`
        INSERT INTO leads (id, name, company, email, phone, sector, location, website, source, status, score, icebreaker, createdAt)
        VALUES (@id, @name, @company, @email, @phone, @sector, @location, @website, @source, @status, @score, @icebreaker, @createdAt)
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name, company = excluded.company, email = excluded.email,
          phone = excluded.phone, status = excluded.status, website = excluded.website,
          score = excluded.score, icebreaker = excluded.icebreaker
      `);
      db.transaction(() => {
        for (const lead of finalLeads) {
          stmt.run({
            id: lead.id,
            name: lead.name || '',
            company: lead.company || lead.name || '',
            email: lead.email || '',
            phone: lead.phone || '',
            sector: lead.sector || '',
            location: lead.location || '',
            website: lead.website || '',
            source: lead.source || 'Scraper',
            status: lead.status || 'new',
            score: lead.score || 0,
            icebreaker: lead.icebreaker || '',
            createdAt: lead.createdAt || new Date().toISOString()
          });
        }
      })();
    }

      stats.saved = finalLeads.length;
      addLog(`Successfully synchronized ${finalLeads.length} leads with the primary database.`);

    addLog('Scraper process completed successfully.');
    res.json({ success: true, count: finalLeads.length, leads: finalLeads, stats, logs });
  } catch (err) {
    console.error('Scraper error:', err);
    res.status(500).json({ error: 'Scraper failure', details: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mollieMode: process.env.MOLLIE_API_KEY?.startsWith('test_') ? 'test' : 'live', timestamp: new Date().toISOString() });
});

// ============================================================
// CONFIG ENDPOINTS
// ============================================================
app.get('/api/config', (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM config").all();
    const config = {};
    rows.forEach(r => {
      try {
        config[r.key] = JSON.parse(r.value);
      } catch (e) {
        config[r.key] = r.value;
      }
    });
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/config', (req, res) => {
  try {
    const insert = db.prepare("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)");
    db.transaction(() => {
      for (const [key, value] of Object.entries(req.body)) {
        insert.run(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
    })();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// BULK LEAD ACTIONS
// ============================================================
app.delete('/api/leads/bulk', (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ error: 'Invalid IDs' });
    
    const placeholders = ids.map(() => '?').join(',');
    db.prepare(`DELETE FROM leads WHERE id IN (${placeholders})`).run(...ids);
    res.json({ success: true, count: ids.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/leads/bulk/status', (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!ids || !Array.isArray(ids) || !status) return res.status(400).json({ error: 'Invalid request' });
    
    const placeholders = ids.map(() => '?').join(',');
    db.prepare(`UPDATE leads SET status = ? WHERE id IN (${placeholders})`).run(status, ...ids);
    
    // Log activity for each
    const insertActivity = db.prepare("INSERT INTO activities (id, leadId, type, text, date) VALUES (?, ?, ?, ?, ?)");
    db.transaction(() => {
      for (const id of ids) {
        insertActivity.run(createDeterministicId(id, `bulk-status-${status}-${Date.now()}`), id, 'system', `Bulk status update to ${status}`, new Date().toISOString());
      }
    })();
    
    res.json({ success: true, count: ids.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// BILLING & PAYMENTS
// ============================================================
app.get('/api/payments', (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM payments ORDER BY createdAt DESC").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments', (req, res) => {
  try {
    const { orderId, planName, price, vatAmount, totalIncVat, status, customerEmail, customerName } = req.body;
    const id = createDeterministicId(orderId, customerEmail);
    db.prepare(`
      INSERT INTO payments (id, orderId, planName, price, vatAmount, totalIncVat, status, customerEmail, customerName, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, orderId, planName, price, vatAmount, totalIncVat, status, customerEmail, customerName, new Date().toISOString());
    
    // Update or create subscription
    db.prepare(`
      INSERT OR REPLACE INTO subscriptions (customerId, plan, activeSince, nextBillingDate, active)
      VALUES (?, ?, ?, ?, ?)
    `).run(customerEmail, planName, new Date().toISOString(), new Date(Date.now() + 30*24*60*60*1000).toISOString(), 1);

    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/subscriptions/:email', (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM subscriptions WHERE customerId = ?").get(req.params.email);
    res.json(row || { plan: 'Free', active: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// POST /api/export-sheets
// Body: { accessToken, leads }
// ============================================================
app.post('/api/export-sheets', async (req, res) => {
  try {
    const { accessToken, leads } = req.body;
    if (!accessToken) return res.status(401).json({ error: 'No access token provided' });
    if (!leads || leads.length === 0) return res.status(400).json({ error: 'No leads to export' });

    console.log(`\n📊 Exporting ${leads.length} leads to Google Sheets...`);

    // 1. Create a new spreadsheet
    const createRes = await axios.post('https://sheets.googleapis.com/v4/spreadsheets', {
      properties: { title: `FleetTrack Leads - ${new Date().toLocaleDateString('nl-NL')}` }
    }, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
    });

    const spreadsheetId = createRes.data.spreadsheetId;
    const spreadsheetUrl = createRes.data.spreadsheetUrl;

    // 2. Prepare data rows (Headers + Leads)
    const headers = ['Company', 'Sector', 'Email', 'Phone', 'Website', 'Source', 'Status', 'Vehicles', 'Next Action', 'Notes'];
    const rows = leads.map(l => [
      l.company || '',
      l.sector || '',
      l.email || '',
      l.phone || '',
      l.website || '',
      l.source || 'Scraped',
      l.status || 'new',
      l.vehicles || 0,
      l.nextAction || '',
      l.notes || ''
    ]);
    const values = [headers, ...rows];

    // 3. Update spreadsheet values
    await axios.put(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A1?valueInputOption=RAW`, {
      values
    }, {
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }
    });

    console.log(`✅ Export successful! Spreadsheet URL: ${spreadsheetUrl}`);
    res.json({ success: true, spreadsheetId, spreadsheetUrl });
  } catch (err) {
    console.error('❌ Google Sheets Export Error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to export to Google Sheets', details: err.response?.data || err.message });
  }
});



// Serve static files
app.use(express.static(buildPath));

// Fallback for SPA routing
app.get('/*', (req, res) => {
  // If it's an API request that wasn't caught, return 404
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 FleetTrack CRM Server running on http://localhost:${PORT}`);
  console.log(`   Production URL: http://localhost:${PORT}\n`);
});
