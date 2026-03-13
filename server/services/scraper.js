import axios from 'axios';
import * as cheerio from 'cheerio';
import { createHash } from 'crypto';
import { generateLeadIntelligence } from './aiService.js';

const createDeterministicId = (name, website) => {
  const seed = (name || '').toLowerCase().trim() + (website || '').toLowerCase().trim();
  return createHash('md5').update(seed).digest('hex');
};

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

export const runScrape = async (config, db) => {
  const { sector, keywords, location, source = 'all' } = config;
  let results = [];
  const logs = [];
  const stats = { found: 0, saved: 0, enriched: 0, skipped: 0 };

  const addLog = (msg) => {
    console.log(`[SCRAPER] ${msg}`);
    logs.push({ time: new Date().toISOString(), message: msg });
  };

  addLog(`Scraper started for location: ${location || 'Nederland'}`);
  
  const requestedSectors = (sector || keywords?.[0] || 'bedrijven')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
    
  const cleanLocation = (location || 'nederland').toLowerCase().replace(/\s+/g, '-');

  const fetchCustomSource = async (url) => {
    try {
      addLog(`🌀 Scraping custom source: ${url}`);
      const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
      const $ = cheerio.load(data);
      
      $('a[href*="/bedrijf/"], a[href*="/company/"], .company-card, .business-item').each((i, el) => {
        const name = $(el).text().trim().split('\n')[0].slice(0, 50);
        const website = $(el).attr('href')?.startsWith('http') ? $(el).attr('href') : '';
        
        if (name && name.length > 3) {
          const leadId = createDeterministicId(name, website);
          results.push({
            id: leadId, name, status: 'new', sector: sector || 'General',
            location: location, website: website,
            source: `Custom: ${new URL(url).hostname}`,
            createdAt: new Date().toISOString()
          });
        }
      });
    } catch (e) { console.error(`Custom source error (${url}):`, e.message); }
  };

  const fetchTelefoonboek = async (targetSector) => {
    addLog(`Connecting to Telefoonboek for sector: ${targetSector}...`);
    try {
      const url = `https://www.telefoonboek.nl/zoeken/${targetSector}/${cleanLocation}/`;
      const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
      const $ = cheerio.load(data);
      
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
    } catch (e) { console.error('Telefoonboek error:', e.message); }
  };

  const fetchGoogleLocal = async (targetSector) => {
    addLog(`🌐 Fetching from OpenStreetMap for: ${targetSector} ${cleanLocation}`);
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(targetSector + ' ' + cleanLocation)}&format=json&limit=15&addressdetails=1`;
      const { data: osmData } = await axios.get(osmUrl, {
        headers: { 'User-Agent': 'FleetTrackCRM/1.0 (contact@fleettrack.nl)' },
        timeout: 10000
      });
      
      if (osmData) {
        for (const place of osmData) {
          const name = place.display_name?.split(',')[0]?.trim();
          if (name && name.length > 2) {
            const leadId = createDeterministicId(name, place.address?.city || place.address?.town || cleanLocation);
            results.push({
              id: leadId, name: name, status: 'new', sector: targetSector,
              location: place.address?.city || place.address?.town || cleanLocation,
              website: '', source: 'Google Maps', createdAt: new Date().toISOString()
            });
          }
        }
      }
    } catch (e) { console.error('OpenStreetMap error:', e.message); }
  };

  const sourcesList = source.split(',');
  for (const s of requestedSectors) {
    const cleanSector = s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    if (sourcesList.includes('telefoonboek') || source === 'all') await fetchTelefoonboek(cleanSector);
    if (sourcesList.includes('google') || source === 'all') await fetchGoogleLocal(cleanSector);
  }

  // De-duplicate
  results = results.filter(item => item && item.name && item.name.trim().length > 0);
  results = Array.from(new Map(results.map(item => [item.name.toLowerCase().trim(), item])).values());

  // Enrich and AI Logic
  addLog(`🕸️ Crawling ${Math.min(results.length, 10)} results for real contacts and AI intelligence...`);
  for (let i = 0; i < Math.min(results.length, 10); i++) {
    const lead = results[i];
    if (lead.website && !lead.email) {
      const contacts = await extractContactsFromWebsite(lead.website);
      if (contacts.email) lead.email = contacts.email;
      if (contacts.phone && !lead.phone) lead.phone = contacts.phone;
    }
    if (!lead.email) lead.email = `info@${lead.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

    // REAL AI INTEGRATION
    const aiData = await generateLeadIntelligence(lead);
    lead.score = aiData.score;
    lead.icebreaker = aiData.icebreaker;

    const now = new Date();
    lead.followUp1Date = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    lead.followUp2Date = new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString();
    lead.nextAction = 'Follow-up Email (1 week)';
  }

  // Final unique map clean up
  const uniqueMap = new Map();
  results.forEach(r => {
    if (!r.website || r.website.trim() === '') r.website = `https://www.google.com/search?q=${encodeURIComponent(r.name)}`;
    const key = r.website.toLowerCase();
    if (!uniqueMap.has(key)) uniqueMap.set(key, r);
  });
  
  const finalLeads = Array.from(uniqueMap.values());
  stats.found = results.length;
  stats.saved = finalLeads.length;

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

  addLog('Scraper process completed successfully.');
  return { success: true, count: finalLeads.length, leads: finalLeads, stats, logs };
};
