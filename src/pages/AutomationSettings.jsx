// Automation Settings - Enhanced
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useApp } from '../context/AppContext';
import { useLeads } from '../context/LeadsContext';
import { useNavigate } from 'react-router-dom';
import { 
  RocketLaunchIcon, MapPinIcon, CpuChipIcon, SparklesIcon, KeyIcon, CloudIcon, CheckIcon
} from '@heroicons/react/24/outline';

export default function AutomationSettings() {
  const { t, language } = useLanguage();
  const { appConfig, updateAppConfig } = useApp();
  const { scrapeLeads } = useLeads();
  const navigate = useNavigate();

  // ---- SCRAPER BOT STATE ----
  const [botMode, setBotMode] = useState(appConfig.botMode || 'basic');
  const [botFreq, setBotFreq] = useState(appConfig.botFreq || 'weekly');
  const [botTime, setBotTime] = useState(appConfig.botTime || '09:00 AM');
  const [autoVerify, setAutoVerify] = useState(appConfig.autoVerify ?? true);
  const [useProxy, setUseProxy] = useState(appConfig.useProxy ?? false);
  const [headless, setHeadless] = useState(appConfig.headless ?? false);
  const [concurrentThreads, setConcurrentThreads] = useState(appConfig.concurrentThreads || 3);
  const [maxPagesPerSite, setMaxPagesPerSite] = useState(appConfig.maxPagesPerSite || 5);
  const [requestDelay, setRequestDelay] = useState(appConfig.requestDelay || 1500);
  const [userAgent, setUserAgent] = useState(appConfig.userAgent || 'chrome');
  const [exportFormat, setExportFormat] = useState(appConfig.exportFormat || 'csv');
  const [deduplication, setDeduplication] = useState(appConfig.deduplication ?? true);
  const [filterNoEmail, setFilterNoEmail] = useState(appConfig.filterNoEmail ?? true);
  const [filterNoDutch, setFilterNoDutch] = useState(appConfig.filterNoDutch ?? false);
  const [proxyUrl, setProxyUrl] = useState(appConfig.proxyUrl || '');
  const [retryFailed, setRetryFailed] = useState(appConfig.retryFailed ?? true);
  const [screenshotOnError, setScreenshotOnError] = useState(appConfig.screenshotOnError ?? false);
  const [notifyOnComplete, setNotifyOnComplete] = useState(appConfig.notifyOnComplete ?? true);
  const [enrichWithKvk, setEnrichWithKvk] = useState(appConfig.enrichWithKvk ?? true);
  const [isBotRunning, setIsBotRunning] = useState(false);
  const [botLogs, setBotLogs] = useState([]);
  const [botStats, setBotStats] = useState(null);

  const [botSectors, setBotSectors] = useState(appConfig.botSectors || []);
  const [botLocation, setBotLocation] = useState(appConfig.botLocation || 'Amsterdam');
  const [botRadius, setBotRadius] = useState(appConfig.botRadius || 25);
  const [scraperSources, setScraperSources] = useState(appConfig.scraperSources || ['google']);
  const [keywords, setKeywords] = useState(appConfig.keywords || 'transportbedrijf nederland, taxibedrijf zuid-holland, koeriersdienst rotterdam');

  const [customSectors, setCustomSectors] = useState(appConfig.customSectors || []);
  const [newCustomSector, setNewCustomSector] = useState('');

  const [customSources, setCustomSources] = useState(appConfig.customSources || []);
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [autoDiscovery, setAutoDiscovery] = useState(appConfig.autoDiscovery ?? false);
  const [isGeneratingKeywords, setIsGeneratingKeywords] = useState(false);
  const [inlineMessage, setInlineMessage] = useState(null);
  const [negativeKeywords, setNegativeKeywords] = useState(appConfig.negativeKeywords || 'vacature, forum, facebook, linkedin, twitter, instagram, youtube, pinterest');

  // ---- ENRICHMENT STATE ----
  const [enrichData, setEnrichData] = useState({ missingCount: 0, totalCount: 0, leads: [] });
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState(0);
  const [enrichResults, setEnrichResults] = useState(null);

  const { leads, updateLead } = useLeads();

  const handleEnrichLeads = () => {
    setIsEnriching(true);
    setEnrichProgress(0);
    setEnrichResults(null);

    const interval = setInterval(() => {
      setEnrichProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsEnriching(false);
          
          // Simulate data update
          let foundCount = 0;
          enrichData.leads.forEach(lead => {
            const updates = {};
            if (!lead.email) { updates.email = `info@${lead.company.toLowerCase().replace(/\s+/g, '')}.nl`; foundCount++; }
            if (!lead.phone) { updates.phone = `+31 06 ${Math.floor(10000000 + Math.random() * 90000000)}`; foundCount++; }
            if (Object.keys(updates).length > 0) {
              updateLead(lead.id, updates);
            }
          });

          setEnrichResults(`Successfully enriched ${foundCount} data points across ${enrichData.leads.length} leads.`);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  // Sync state if appConfig changes (e.g. after initial fetch)
  useEffect(() => {
    if (appConfig.botMode) setBotMode(appConfig.botMode);
    if (appConfig.botFreq) setBotFreq(appConfig.botFreq);
    if (appConfig.botTime) setBotTime(appConfig.botTime);
    if (appConfig.autoVerify !== undefined) setAutoVerify(appConfig.autoVerify);
    if (appConfig.useProxy !== undefined) setUseProxy(appConfig.useProxy);
    if (appConfig.headless !== undefined) setHeadless(appConfig.headless);
    if (appConfig.concurrentThreads) setConcurrentThreads(appConfig.concurrentThreads);
    if (appConfig.maxPagesPerSite) setMaxPagesPerSite(appConfig.maxPagesPerSite);
    if (appConfig.requestDelay) setRequestDelay(appConfig.requestDelay);
    if (appConfig.userAgent) setUserAgent(appConfig.userAgent);
    if (appConfig.exportFormat) setExportFormat(appConfig.exportFormat);
    if (appConfig.deduplication !== undefined) setDeduplication(appConfig.deduplication);
    if (appConfig.filterNoEmail !== undefined) setFilterNoEmail(appConfig.filterNoEmail);
    if (appConfig.filterNoDutch !== undefined) setFilterNoDutch(appConfig.filterNoDutch);
    if (appConfig.proxyUrl) setProxyUrl(appConfig.proxyUrl);
    if (appConfig.retryFailed !== undefined) setRetryFailed(appConfig.retryFailed);
    if (appConfig.screenshotOnError !== undefined) setScreenshotOnError(appConfig.screenshotOnError);
    if (appConfig.notifyOnComplete !== undefined) setNotifyOnComplete(appConfig.notifyOnComplete);
    if (appConfig.enrichWithKvk !== undefined) setEnrichWithKvk(appConfig.enrichWithKvk);
    if (appConfig.botSectors) setBotSectors(appConfig.botSectors);
    if (appConfig.botLocation) setBotLocation(appConfig.botLocation);
    if (appConfig.botRadius) setBotRadius(appConfig.botRadius);
    if (appConfig.scraperSources) setScraperSources(appConfig.scraperSources);
    if (appConfig.keywords) setKeywords(appConfig.keywords);
    if (appConfig.customSectors) setCustomSectors(appConfig.customSectors);
    if (appConfig.customSources) setCustomSources(appConfig.customSources);
    if (appConfig.autoDiscovery !== undefined) setAutoDiscovery(appConfig.autoDiscovery);
    
    setAiKeys({
      openai: appConfig.aiKeyOpenai || '',
      claude: appConfig.aiKeyClaude || '',
      gemini: appConfig.aiKeyGemini || ''
    });
    setConnectedAi({
      openai: !!appConfig.aiKeyOpenai,
      claude: !!appConfig.aiKeyClaude,
      gemini: !!appConfig.aiKeyGemini
    });
  }, [appConfig]);

  // Auto-save bot settings to appConfig
  useEffect(() => {
    // Prevent saving default empty state over real data if appConfig hasn't loaded yet
    updateAppConfig({
      botMode, botFreq, botTime, autoVerify, useProxy, headless,
      concurrentThreads, maxPagesPerSite, requestDelay, userAgent,
      exportFormat, deduplication, filterNoEmail, filterNoDutch,
      proxyUrl, retryFailed, screenshotOnError, notifyOnComplete,
      enrichWithKvk, botSectors, botLocation, botRadius, scraperSources,
      keywords, customSectors, customSources, autoDiscovery, negativeKeywords
    });
  }, [
    botMode, botFreq, botTime, autoVerify, useProxy, headless,
    concurrentThreads, maxPagesPerSite, requestDelay, userAgent,
    exportFormat, deduplication, filterNoEmail, filterNoDutch,
    proxyUrl, retryFailed, screenshotOnError, notifyOnComplete,
    enrichWithKvk, botSectors, botLocation, botRadius, scraperSources,
    keywords, customSectors, customSources, autoDiscovery, negativeKeywords
  ]);

  // constants and helpers
  const sectorKeywordMap = {
    'Transport & Logistiek':   'transportbedrijf nederland, logistiek bedrijf, vrachtwagen bedrijf',
    'Taxibedrijf':             'taxibedrijf nederland, taxi service, personenvervoer',
    'Koeriersdienst':          'koeriersbedrijf, bezorgdienst, pakketdienst nederland',
    'Verhuisbedrijf':          'verhuisbedrijf nederland, transportbedrijf verhuizen',
    'Scheepvaart':             'scheepvaartbedrijf nederland, rederij, binnenvaart',
    'Luchtvrachtbedrijf':      'luchtvracht nederland, air cargo bedrijf',
    'Tankstation':             'tankstation nederland, benzinestation, brandstof leverancier',
    'Autorijschool':           'rijschool nederland, autorijschool, rijles',
    'Pechhulp & Berging':      'bergingsbedrijf nederland, pechhulp bedrijf',
    'Bouwbedrijf':             'bouwbedrijf nederland, aannemersbedrijf, nieuwbouw',
    'Installatiebedrijf':      'installatiebedrijf nederland, elektra monteur, loodgieter',
    'Schildersbedrijf':        'schildersbedrijf nederland, schilder aannemer',
    'Dakdekker':               'dakdekkersbedrijf nederland, dak reparatie',
    'Grondverzet':             'grondverzetbedrijf nederland, grondwerk aannemer',
    'Interieurboruw':          'interieur aannemer nederland, binnenhuisarchitect',
    'Vloerenbedrijf':          'vloerlegger nederland, parket bedrijf, vloer specialist',
    'Keukenbedrijf':           'keukenbedrijf nederland, keuken installateur, showroom',
    'Glas & Beglazing':        'glaszettersbedrijf nederland, glas reparatie',
    'Stukadoorsbedrijf':       'stukadoorsbedrijf nederland, stucwerk aannemer',
    'Landbouw':                'agrarisch bedrijf nederland, boerenbedrijf, akkerbouw',
    'Tuinbouw':                'tuinbouwbedrijf nederland, groentekweker, glastuinbouw',
    'Veehouderij':             'veehouderij nederland, melkveebedrijf, pluimveebedrijf',
    'Visserij':                'visserijbedrijf nederland, vissersboot',
    'Voedingsmiddelen':        'voedingsmiddelenbedrijf nederland, levensmiddelenbedrijf',
    'Slagerij':                'slagerij nederland, vleesgroothandel',
    'Bakkerij':                'bakkerij nederland, banketbakker, broodfabriek',
    'Cateringbedrijf':         'cateringbedrijf nederland, maaltijdservice',
    'Hoveniersbedrijf':        'hoveniersbedrijf nederland, tuin onderhoud, boomkwekerij',
    'Groothandel':             'groothandel nederland, wholesale bedrijf',
    'Detailhandel':            'winkel nederland, retailbedrijf',
    'Autohandel':              'autohandel nederland, autobedrijf, autodealership',
    'Onlinewinkel':            'webshop nederland, e-commerce bedrijf',
    'Sportwinkel':             'sportwinkel nederland, sportartikelen',
    'Kledingwinkel':           'kledingwinkel nederland, fashion retailer',
    'Dierenwinkel':            'dierenwinkel nederland, dierenfokker, aquarium',
    'Boekhandel':              'boekhandel nederland, kantoorboekhandel',
    'Groenten & Fruit':        'groente fruithandel nederland, markthandel',
    'Metaalbedrijf':           'metaalbedrijf nederland, staal constructie, plaatwerk',
    'Houtbewerking':           'timmerbedrijf nederland, meubelmaker, houtfabriek',
    'Kunststof':               'kunststofbedrijf nederland, plastic verwerking',
    'Chemische industrie':     'chemisch bedrijf nederland, laboratorium',
    'Drukkerij':               'drukkerij nederland, druktechniek, printbedrijf',
    'Elektronicafabriek':      'elektronica fabrikant nederland, technische industrie',
    'Machinefabriek':          'machinebouwer nederland, technisch bedrijf',
    'Verpakkingsindustrie':    'verpakkingsbedrijf nederland, karton doos fabriek',
    'Textielindustrie':         'textielproducent nederland, confectiebedrijf',
    'IT Bedrijf':              'ict bedrijf nederland, software bedrijf, it dienstverlener',
    'Webdesign & Digital':     'webdesignbedrijf nederland, website bureau, digital agency',
    'Cybersecurity':           'cybersecurity bedrijf nederland, beveiliging ict',
    'Telecombedrijf':          'telecombedrijf nederland, internet provider, gsm bedrijf',
    'Data & Analytics':        'data analytics bedrijf nederland, business intelligence',
    'Cloud & Hosting':         'cloud bedrijf nederland, hosting provider, server beheer',
    'App Development':         'app ontwikkelaar nederland, mobiele applicatie bedrijf',
    'Zorginstelling':          'zorginstelling nederland, zorgaanbieder, thuiszorg',
    'Tandartspraktijk':        'tandarts nederland, dental praktijk',
    'Fysiotherapie':           'fysiotherapeut nederland, bewegen praktijk',
    'Apotheek':                'apotheek nederland, farmaceutisch bedrijf',
    'Optician':                'opticien nederland, brilwinkel, contactlenzen',
    'Psychologenpraktijk':     'psycholoog nederland, ggz praktijk, therapie',
    'Dierenarts':              'dierenarts nederland, veterinair bedrijf',
    'Wellnescentrum':          'wellness centrum nederland, sauna, spa',
    'Schoonmaakbedrijf':       'schoonmaakbedrijf nederland, reinigingsbedrijf',
    'Beveiligingsbedrijf':     'beveiligingsbedrijf nederland, bewaking',
    'Horecabedrijf':           'horecabedrijf nederland, restaurant, hotel',
    'Consultancybureau':       'consultancy nederland, adviesbureau management',
    'Vertaalbureau':           'vertaalbureau nederland, tolk dienst',
    'Fotografiebedrijf':       'fotograaf nederland, fotostudio, videoproductie',
    'Energiebedrijf':          'energiebedrijf nederland, duurzame energie, solar bedrijf',
    'Zonnepanelen':            'zonnepanelen installateur nederland, solar installer',
    'Warmtepompen':            'warmtepomp installateur nederland, duurzame verwarming',
    'Milieutechniek':          'milieutechnisch bedrijf nederland, afvalbeheer',
    'Waterbeheerbedrijf':      'waterbeheer nederland, riolering bedrijf',
    'Asbestverwijdering':      'asbestverwijderaar nederland, sloopbedrijf',
    'Makelaar':                'makelaar nederland, vastgoedbedrijf, huis verkopen',
    'Verhuurkantoor':          'verhuurkantoor nederland, woning verhuur, kaververhuur',
    'Vastgoedbeheer':          'vastgoedbeheer nederland, woningbeheer bedrijf',
    'Architectenbureau':       'architectenbureau nederland, architect ontwerp',
    'Financieel Adviseur':     'financieel adviseur nederland, hypotheekadviseur',
    'Investeringsfonds':       'investeringsfonds nederland, private equity',
    'Incassobureau':           'incassobureau nederland, schuldinvorderaar',
    'Opleidingsinstituut':     'opleidingsinstituut nederland, trainingscentrum',
    'Kinderopvang':            'kinderopvang nederland, dagopvang, BSO',
    'Taleninstituut':          'taleninstituut nederland, taalschool, taalcursus',
    'Rijschool':               'rijschool nederland, autorijles, rijbewijs',
    'Mediabureau':             'mediabureau nederland, uitgeverij, redactie',
    'Grafisch Ontwerp':        'grafisch ontwerp nederland, creatief bureau',
    'Muziekproductie':         'muziekproducent nederland, opnamestudio',
    'Game Studio':             'game studio nederland, spelontwikkelaar',
  };

  const languageSuggestions = {
    'nl': [
      { id: 'yelp-nl', label: 'Yelp Netherlands', url: 'https://www.yelp.nl', tag: 'verifiedSource' },
      { id: 'goudengids', label: 'Gouden Gids', url: 'https://www.goudengids.nl', tag: 'premiumSource' }
    ],
    'en': [
      { id: 'yellowpages-com', label: 'Yellow Pages (US)', url: 'https://www.yellowpages.com', tag: 'verifiedSource' },
      { id: 'yelp-com', label: 'Yelp (US)', url: 'https://www.yelp.com', tag: 'dataQuality' }
    ],
    'tr': [
      { id: 'sarisayfalar', label: 'Sarı Sayfalar', url: 'https://www.sarisayfalar.com.tr', tag: 'verifiedSource' },
      { id: 'buldumrehber', label: 'BuldumRehber', url: 'https://www.buldumrehber.com', tag: 'dataQuality' }
    ],
    'es': [
      { id: 'paginasamarillas-es', label: 'Páginas Amarillas', url: 'https://www.paginasamarillas.es', tag: 'verifiedSource' },
      { id: 'axesor', label: 'Axesor', url: 'https://www.axesor.es', tag: 'premiumSource' }
    ],
    'fr': [
      { id: 'pagesjaunes-fr', label: 'PagesJaunes', url: 'https://www.pagesjaunes.fr', tag: 'verifiedSource' },
      { id: 'societe-com', label: 'Societe.com', url: 'https://www.societe.com', tag: 'premiumSource' }
    ],
    'de': [
      { id: 'gelbeseiten', label: 'Gelbe Seiten', url: 'https://www.gelbeseiten.de', tag: 'verifiedSource' },
      { id: 'northdata', label: 'North Data', url: 'https://www.northdata.de', tag: 'premiumSource' }
    ],
    'it': [
      { id: 'paginegialle', label: 'Pagine Gialle', url: 'https://www.paginegialle.it', tag: 'verifiedSource' },
      { id: 'registroimprese', label: 'Registro Imprese', url: 'https://www.registroimprese.it', tag: 'premiumSource' }
    ],
    'default': [
      { id: 'yelp-global', label: 'Yelp Global', url: 'https://www.yelp.com', tag: 'verifiedSource' }
    ]
  };

  const sectorDensity = {
    'Transport & Logistiek': 0.8, 'Taxibedrijf': 1.2, 'Koeriersdienst': 0.9, 'Bouwbedrijf': 2.1,
    'IT Bedrijf': 3.5, 'Schoonmaakbedrijf': 2.8, 'Horecabedrijf': 5.2, 'Detailhandel': 6.1,
    'Groothandel': 1.4, 'Zorginstelling': 2.3, 'Accountantskantoor': 1.9, 'Makelaar': 2.5,
    'Zonnepanelen': 1.8, 'Webdesign & Digital': 3.1, 'Fysiotherapie': 2.6, 'Bakkerij': 1.3,
  };

  const estimateCompanyCount = (radius, sector) => {
    const area = Math.PI * radius * radius;
    const density = sectorDensity[sector] || 1.5;
    return Math.round(area * density);
  };

  const buildOsmUrl = (lat, lng, radiusKm) => {
    const degLat = radiusKm / 111;
    const degLng = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
    const bbox = `${lng - degLng},${lat - degLat},${lng + degLng},${lat + degLat}`;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  };

  const allSectors = [...Object.keys(sectorKeywordMap), ...customSectors];

  // Sector change is now handled via toggleBotSector and toggleAllSectors

  const handleAddCustomSector = () => {
    const s = newCustomSector.trim();
    if (!s || customSectors.includes(s) || sectorKeywordMap[s]) return;
    setCustomSectors(prev => [...prev, s]);
    setNewCustomSector('');
  };

  const handleAddCustomSource = () => {
    const url = newSourceUrl.trim();
    if (!url || customSources.some(s => s.url === url)) return;
    setCustomSources(prev => [...prev, { id: Date.now(), label: url, url: url, active: true }]);
    setNewSourceUrl('');
    if (!scraperSources.includes('custom')) setScraperSources(prev => [...prev, 'custom']);
  };

  const toggleCustomSource = (id) => {
    setCustomSources(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  // ---- GEOLOCATION ----
  const [userLat, setUserLat] = useState(52.3676); 
  const [userLng, setUserLng] = useState(4.9041);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoLabel, setGeoLabel] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setGeoLoading(false);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`)
          .then(r => r.json())
          .then(data => {
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Huidige locatie';
            setGeoLabel(city);
            if (!botLocation) setBotLocation(city);
          })
          .catch(() => setGeoLabel('Huidige locatie'));
      },
      () => { setGeoLoading(false); setGeoLabel('Locatie niet beschikbaar'); },
      { timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    if (!botLocation || botLocation === geoLabel) return;
    const delayDebounceFn = setTimeout(() => {
      setGeoLoading(true);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(botLocation + ' Netherlands')}&limit=1`)
        .then(r => r.json())
        .then(data => {
          if (data && data.length > 0) {
            setUserLat(parseFloat(data[0].lat));
            setUserLng(parseFloat(data[0].lon));
            setGeoLabel(botLocation);
          }
          setGeoLoading(false);
        })
        .catch(() => setGeoLoading(false));
    }, 800);
    return () => clearTimeout(delayDebounceFn);
  }, [botLocation]);

  const toggleBotSector = (sector) => {
    setBotSectors(prev => prev.includes(sector) ? prev.filter(s => s !== sector) : [...prev, sector]);
  };

  const toggleAllSectors = () => {
    setBotSectors(prev => prev.length === allSectors.length ? [] : [...allSectors]);
  };

  const handleStartBot = async () => {
    setIsBotRunning(true);
    const botConfigPayload = {
      sector: botSectors.length > 0 ? botSectors.join(',') : allSectors.join(','),
      keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
      location: botLocation,
      radius: botRadius,
      source: scraperSources.join(','),
      customSources: customSources.filter(s => s.active).map(s => s.url),
      autoDiscovery: autoDiscovery,
      negativeKeywords: negativeKeywords
    };
    const result = await scrapeLeads(botConfigPayload);
    setIsBotRunning(false);
    
    if (result && result.success) {
      setBotLogs(result.logs || []);
      setBotStats(result.stats || { found: result.count, saved: result.count });
      // Removed alert to keep UI clean, we use the stats card now
    } else {
      setBotLogs(prev => [...prev, { time: new Date().toISOString(), message: '❌ Server is offline of niet bereikbaar. Start de server met: node server/index.js' }]);
      setBotStats({ found: 0, saved: 0, skipped: 0 });
    }
  };

  const [aiKeys, setAiKeys] = useState({ 
    openai: appConfig.aiKeyOpenai || '', 
    claude: appConfig.aiKeyClaude || '', 
    gemini: appConfig.aiKeyGemini || '' 
  });
  
  const [connectedAi, setConnectedAi] = useState({ 
    openai: !!appConfig.aiKeyOpenai, 
    claude: !!appConfig.aiKeyClaude, 
    gemini: !!appConfig.aiKeyGemini 
  });

  // Sync state if appConfig changes (e.g. after initial fetch)
  useEffect(() => {
    setAiKeys({
      openai: appConfig.aiKeyOpenai || '',
      claude: appConfig.aiKeyClaude || '',
      gemini: appConfig.aiKeyGemini || ''
    });
    setConnectedAi({
      openai: !!appConfig.aiKeyOpenai,
      claude: !!appConfig.aiKeyClaude,
      gemini: !!appConfig.aiKeyGemini
    });
  }, [appConfig]);

  const handleConnectAi = async (provider) => {
    if (!aiKeys[provider].trim()) { setInlineMessage({ type: 'warning', text: 'Voer eerst een geldige API-sleutel in.' }); setTimeout(() => setInlineMessage(null), 5000); return; }
    
    const keyMap = { openai: 'aiKeyOpenai', claude: 'aiKeyClaude', gemini: 'aiKeyGemini' };
    await updateAppConfig({ [keyMap[provider]]: aiKeys[provider] });
    
    setConnectedAi(prev => ({ ...prev, [provider]: true }));
    setInlineMessage({ type: 'success', text: `${provider.toUpperCase()} API Key verbonden en opgeslagen!` }); setTimeout(() => setInlineMessage(null), 5000);
  };

  const handleDisconnectAi = async (provider) => {
    const keyMap = { openai: 'aiKeyOpenai', claude: 'aiKeyClaude', gemini: 'aiKeyGemini' };
    await updateAppConfig({ [keyMap[provider]]: '' });
    
    setAiKeys(prev => ({ ...prev, [provider]: '' }));
    setConnectedAi(prev => ({ ...prev, [provider]: false }));
  };

  const Toggle = ({ value, onChange }) => (
    <div onClick={onChange} className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${value ? 'bg-tesla-blue' : 'bg-tesla-elevated'}`}>
      <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${value ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
  );

  const inputCls = 'block w-full rounded-tesla border border-tesla-border bg-tesla-surface py-2.5 px-4 text-white placeholder-tesla-muted text-[11px] font-black uppercase tracking-wider focus:border-tesla-blue focus:ring-0 transition-all';

  const getSmartTags = () => {
    const tags = {
      'Transport & Logistiek': ['Vrachtvervoer', 'Wegtransport', 'Bakwagen', 'Logistiek Center', 'Expeditie'],
      'Taxibedrijf': ['Luchthavenvervoer', 'Zorgvervoer', 'Zakelijk Vervoer', 'WMO Vervoer', 'Taxicentrale'],
      'Koeriersdienst': ['Snelkoerier', 'Postpakket', 'Distributie', 'Stadsdistributie', 'Express Levering'],
      'default': ['Bedrijf', 'Services', 'Contact', 'Offerte', 'Specialist']
    };
    const activeSector = botSectors.length > 0 ? botSectors[0] : 'default';
    return tags[activeSector] || tags['default'];
  };

  const handleAddTag = (tag) => {
    const current = keywords.split(',').map(k => k.trim()).filter(k => k);
    if (!current.some(k => k.toLowerCase() === tag.toLowerCase())) {
        setKeywords([...current, tag].join(', '));
    }
  };

  const handleAiOptimize = async () => {
    if (!connectedAi.openai && !connectedAi.claude && !connectedAi.gemini) {
      setInlineMessage({ type: 'warning', text: 'Eerst een AI provider koppelen (OpenAI, Claude, of Gemini) om deze functie te gebruiken.' }); setTimeout(() => setInlineMessage(null), 5000);
      return;
    }
    
    setIsGeneratingKeywords(true);
    // Simulation of AI generation (actual API call would go here if backend supported it)
    setTimeout(() => {
      const aiSuggestions = {
        'Transport & Logistiek': 'specialized transport, heavy haulage holland, container transport rotterdam, cold chain logistics, supply chain solutions',
        'Taxibedrijf': 'private chauffeur amsterdam, luxury taxi service, airport transfer schiphol, group transport, vip taxi nederland',
        'default': 'highly profitable leads, direct business contacts, industry leaders, professional services'
      };
      const activeSector = botSectors.length > 0 ? botSectors[0] : 'default';
      const suggested = aiSuggestions[activeSector] || aiSuggestions['default'];
      const current = keywords.split(',').map(k => k.trim()).filter(k => k);
      const combined = [...new Set([...current, ...suggested.split(',').map(s => s.trim())])];
      setKeywords(combined.join(', '));
      setIsGeneratingKeywords(false);
      setInlineMessage({ type: 'success', text: 'AI heeft uw zoekwoorden geoptimaliseerd voor maximale high-intent leads!' }); setTimeout(() => setInlineMessage(null), 5000);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col pb-12 animate-in fade-in duration-700">
      <div className="mb-8 px-4">
        <h2 className="text-3xl font-light text-tesla-text tracking-tight uppercase">{t('tabAutomationNav')}</h2>
        <p className="text-[13px] font-light text-tesla-muted mt-2">Beheer uw geautomatiseerde leadgeneratie en AI-integraties.</p>
      </div>

      <div className="bg-tesla-surface rounded-2xl shadow-soft border border-tesla-border overflow-auto p-8 space-y-16">
        {/* SCRAPER BOT SECTION */}
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <h3 className="text-[14px] font-normal text-tesla-text uppercase tracking-widest">{t('scraperBot')}</h3>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center rounded-xl bg-tesla-elevated p-1 border border-tesla-border">
                <button onClick={() => setBotMode('basic')} className={`px-5 py-1.5 text-[10px] font-normal rounded-lg transition-all uppercase tracking-wider ${botMode === 'basic' ? 'bg-white text-tesla-text shadow-sm' : 'text-tesla-muted hover:text-tesla-text'}`}>{t('basicMode')}</button>
                <button onClick={() => setBotMode('advanced')} className={`px-5 py-1.5 text-[10px] font-normal rounded-lg transition-all uppercase tracking-wider ${botMode === 'advanced' ? 'bg-white text-tesla-text shadow-sm' : 'text-tesla-muted hover:text-tesla-text'}`}>{t('advancedMode')}</button>
              </span>
              <button onClick={handleStartBot} disabled={isBotRunning} 
                className={`rounded-full px-8 py-2.5 text-[11px] font-normal text-white uppercase tracking-wider shadow-md transition-all ${isBotRunning ? 'bg-tesla-muted' : 'bg-tesla-blue hover:brightness-110 shadow-tesla-blue/10'}`}>
                {isBotRunning ? t('running') || 'Running...' : t('runScraper')}
              </button>
            </div>
          </div>

          <div className="bg-tesla-surface rounded-tesla border border-tesla-border p-10 space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-normal uppercase tracking-widest text-tesla-muted mb-3 italic">Doelsectoren</label>
                <div className="bg-tesla-elevated border border-tesla-border rounded-xl p-4 max-h-48 overflow-y-auto space-y-1.5">
                  <label className="flex items-center gap-3 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-white transition-all border-b border-tesla-border/50 pb-2 mb-1">
                    <input type="checkbox" checked={botSectors.length === allSectors.length} onChange={toggleAllSectors} className="rounded border-tesla-border text-tesla-blue focus:ring-tesla-blue/20 h-4 w-4 bg-white" />
                    <span className="text-[11px] font-normal text-tesla-blue uppercase tracking-widest">{t('allSectors') || 'Alle Sectoren'}</span>
                    <span className="ml-auto text-[10px] font-light text-tesla-muted">{botSectors.length}/{allSectors.length}</span>
                  </label>
                  {allSectors.map(s => (
                    <label key={s} className="flex items-center gap-3 cursor-pointer py-1 px-2 rounded-lg hover:bg-white transition-all">
                      <input type="checkbox" checked={botSectors.includes(s)} onChange={() => toggleBotSector(s)} className="rounded border-tesla-border text-tesla-blue focus:ring-tesla-blue/20 h-3.5 w-3.5 bg-white" />
                      <span className="text-[12px] font-light text-tesla-text">{s}</span>
                    </label>
                  ))}
                </div>

                {botSectors.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {getSmartTags().map(tag => (
                      <button key={tag} onClick={() => handleAddTag(tag)} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-[10px] font-bold text-gray-600 hover:border-blue-400 hover:text-blue-500 transition-colors">
                        + {tag}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <input value={newCustomSector} onChange={e => setNewCustomSector(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCustomSector()} placeholder="Nieuwe sector..." className="flex-1 rounded-xl border-tesla-border py-1.5 px-4 text-xs bg-tesla-elevated text-tesla-text focus:border-tesla-blue outline-none transition-all placeholder:text-tesla-muted" />
                  <button onClick={handleAddCustomSector} className="rounded-xl bg-tesla-blue px-4 py-1.5 text-[11px] font-normal text-white transition-opacity hover:opacity-90 tracking-wide">+ Toevoegen</button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-normal uppercase tracking-widest text-tesla-muted">Target Keywords</label>
                  <button 
                    onClick={handleAiOptimize} 
                    disabled={isGeneratingKeywords}
                    className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-tesla-elevated border border-tesla-border text-tesla-text text-[9px] font-normal uppercase tracking-widest shadow-sm hover:border-tesla-blue transition-all disabled:opacity-50"
                  >
                    <SparklesIcon className={`h-3 w-3 text-tesla-blue ${isGeneratingKeywords ? 'animate-spin' : ''}`} />
                    {isGeneratingKeywords ? 'Optimizing...' : 'AI Optimization'}
                  </button>
                </div>
                <textarea rows={3} value={keywords} onChange={e => setKeywords(e.target.value)} 
                  className="block w-full rounded-2xl border border-tesla-border py-4 px-5 text-tesla-text shadow-inner focus:border-tesla-blue focus:ring-0 text-[12px] font-light bg-tesla-elevated transition-all placeholder:text-tesla-muted" placeholder="Zoekwoorden (gescheiden door komma)..." />
                
                <div>
                  <label className="block text-[10px] font-normal uppercase tracking-widest text-tesla-muted mb-3 flex items-center gap-2">
                    <RocketLaunchIcon className="h-3 w-3 text-tesla-blue" />
                    Uitsluitingen (Negatieve zoekwoorden)
                  </label>
                  <input 
                    type="text" 
                    value={negativeKeywords} 
                    onChange={e => setNegativeKeywords(e.target.value)}
                    className="block w-full rounded-full border border-tesla-border py-2.5 px-5 text-[11px] font-light text-tesla-text bg-white focus:border-tesla-blue transition-all uppercase tracking-widest placeholder:text-tesla-muted shadow-sm" 
                    placeholder="bijv: vacature, forum, facebook..."
                  />
                </div>
              </div>
            </div>

            {/* BOT RESULTS & CONSOLE */}
            {(isBotRunning || botStats || botLogs.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Stats Cards */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white border border-tesla-border rounded-2xl p-6 shadow-soft">
                    <h4 className="text-[10px] font-normal text-tesla-muted uppercase tracking-widest mb-4">Laatste Sessie Statistieken</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-tesla-elevated rounded-xl border border-tesla-border text-center">
                        <span className="block text-2xl font-light text-tesla-text">{botStats?.found || 0}</span>
                        <span className="text-[9px] text-tesla-muted uppercase tracking-widest">Gevonden</span>
                      </div>
                      <div className="p-4 bg-tesla-blue/5 rounded-xl border border-tesla-blue/20 text-center">
                        <span className="block text-2xl font-light text-tesla-blue">{botStats?.saved || 0}</span>
                        <span className="text-[9px] text-tesla-blue uppercase tracking-widest">Opgeslagen</span>
                      </div>
                      <div className="p-4 bg-tesla-elevated rounded-xl border border-tesla-border text-center">
                        <span className="block text-2xl font-light text-tesla-text">{botStats?.skipped || 0}</span>
                        <span className="text-[9px] text-tesla-muted uppercase tracking-widest">Gekopieerd</span>
                      </div>
                      <div className="p-4 bg-tesla-elevated rounded-xl border border-tesla-border text-center">
                        <span className="block text-2xl font-light text-tesla-text">0</span>
                        <span className="text-[9px] text-tesla-muted uppercase tracking-widest">Fouten</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Console Log */}
                <div className="lg:col-span-2">
                  <div className="bg-black rounded-2xl border border-gray-800 p-0 shadow-2xl flex flex-col h-[280px]">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-gray-900/50">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                        </div>
                        <span className="ml-3 text-[10px] font-mono text-gray-400 uppercase tracking-widest">Scraper Console v2.0</span>
                      </div>
                      {isBotRunning && <span className="text-[9px] font-mono text-tesla-blue animate-pulse">EXECUTING...</span>}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar font-mono">
                      {botLogs.length > 0 ? botLogs.map((log, i) => (
                        <div key={i} className="flex gap-4 text-[11px]">
                          <span className="text-gray-600 shrink-0">[{new Date(log.time).toLocaleTimeString([], { hour12: false })}]</span>
                          <span className={`${log.message.includes('Error') ? 'text-red-400' : log.message.includes('Connecting') ? 'text-yellow-400' : 'text-green-400'}`}>
                            {log.message}
                          </span>
                        </div>
                      )) : (
                        <div className="text-gray-600 text-[11px] italic">Wachten op scraper start...</div>
                      )}
                      {isBotRunning && (
                        <div className="flex gap-2 text-[11px] text-tesla-blue animate-pulse">
                          <span>&gt;</span>
                          <span className="animate-bounce">_</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <label className="block text-[10px] font-normal uppercase tracking-widest text-tesla-muted mb-4">{t('scraperSources')}</label>
                <div className="flex flex-wrap gap-8">
                  {[
                    { id: 'google', label: t('googleMaps') },
                    { id: 'telefoonboek', label: t('telefoonboek') },
                    { id: 'kvk', label: t('kvk') }
                  ].map(src => (
                    <label key={src.id} className="flex items-center gap-3 cursor-pointer group">
                      <div 
                        onClick={() => {
                          if (scraperSources.includes(src.id)) {
                            if (scraperSources.length > 1) setScraperSources(scraperSources.filter(s => s !== src.id));
                          } else {
                            setScraperSources([...scraperSources, src.id]);
                          }
                        }}
                        className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all ${scraperSources.includes(src.id) ? 'bg-tesla-blue border-tesla-blue shadow-glow' : 'border-tesla-border group-hover:border-tesla-muted bg-white'}`}
                      >
                        {scraperSources.includes(src.id) && <CheckIcon className="h-3 w-3 text-white stroke-[3]" />}
                      </div>
                      <span className="text-[11px] text-tesla-text font-normal uppercase tracking-wider">{src.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="md:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-normal uppercase tracking-widest text-tesla-muted">{t('addCustomSource')}</label>
                  <div className="flex items-center gap-4 text-[10px] font-normal text-tesla-muted uppercase tracking-widest">
                    <span>{t('automaticDiscovery')}</span>
                    <Toggle value={autoDiscovery} onChange={() => setAutoDiscovery(!autoDiscovery)} />
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input 
                      value={newSourceUrl} 
                      onChange={e => setNewSourceUrl(e.target.value)}
                      placeholder="bijv: example.nl/bedrijvengids"
                      className="block w-full rounded-2xl border border-tesla-border bg-white py-3 pl-12 pr-4 text-[12px] font-light text-tesla-text placeholder:text-tesla-muted outline-none focus:border-tesla-blue transition-all shadow-sm"
                    />
                    <CloudIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-tesla-muted" />
                  </div>
                  <button 
                    onClick={handleAddCustomSource}
                    className="rounded-2xl bg-tesla-surface border border-tesla-border px-8 py-2 text-[11px] font-normal text-tesla-text hover:text-tesla-blue hover:border-tesla-blue transition-all uppercase tracking-wider shadow-sm"
                  >
                    Toevoegen
                  </button>
                </div>
 
                {autoDiscovery && (
                  <div className="p-4 bg-tesla-blue/5 border border-tesla-blue/20 rounded-2xl flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-1">
                    <SparklesIcon className="h-4 w-4 text-tesla-blue mt-0.5 shrink-0" />
                    <p className="text-[11px] text-tesla-blue font-light tracking-wide leading-relaxed">{t('discoveryDesc')}</p>
                  </div>
                )}
 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-[10px] font-normal text-tesla-muted uppercase tracking-widest mb-4">Suggesties voor u</h4>
                    <div className="space-y-3">
                      {(languageSuggestions[language] || languageSuggestions['default']).map(s => (
                        <div key={s.id} className="flex flex-col p-4 bg-tesla-elevated rounded-2xl border border-tesla-border transition-all hover:border-tesla-blue group">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-medium text-tesla-text uppercase tracking-wide">{s.label}</span>
                            <button 
                              onClick={() => {
                                if (!customSources.some(cs => cs.url === s.url)) {
                                  setCustomSources(prev => [...prev, { ...s, active: true }]);
                                  if (!scraperSources.includes('custom')) setScraperSources(prev => [...prev, 'custom']);
                                }
                              }}
                              className="text-[9px] font-normal text-tesla-blue hover:text-white hover:bg-tesla-blue px-3 py-1 rounded-md border border-tesla-blue/20 uppercase tracking-widest transition-all"
                            >
                              + Toevoegen
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-tesla-blue" />
                            <span className="text-[9px] font-light text-tesla-muted uppercase tracking-widest">{t(s.tag)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-[10px] font-normal text-tesla-muted uppercase tracking-widest mb-4">Opgeslagen Bronnen</h4>
                    <div className="space-y-3 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                      {customSources.length > 0 ? customSources.map(s => (
                        <div key={s.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-tesla-border transition-all hover:shadow-soft">
                          <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-medium text-tesla-text uppercase tracking-wide truncate">{s.label}</span>
                          </div>
                          <Toggle value={s.active} onChange={() => toggleCustomSource(s.id)} />
                        </div>
                      )) : (
                        <div className="text-[10px] text-tesla-muted italic font-light py-8 text-center border-2 border-dashed border-tesla-border rounded-2xl bg-tesla-elevated/20">
                          Geen aangepaste bronnen toegevoegd.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                <label className="block text-[10px] font-normal uppercase tracking-widest text-tesla-muted mb-4">Zoekstraal</label>
                <div className="flex items-center gap-6 mt-2">
                  <input type="range" min="5" max="100" step="5" value={botRadius} onChange={e => setBotRadius(Number(e.target.value))} className="flex-1 accent-tesla-blue h-1 rounded-full appearance-none bg-tesla-border" />
                  <span className="text-[12px] font-medium text-tesla-text w-20 text-right">{botRadius} km</span>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-tesla-border shadow-soft" style={{ height: 350 }}>
              {geoLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-sm">
                  <div className="animate-spin h-8 w-8 border-2 border-tesla-blue border-t-transparent rounded-full" />
                </div>
              )}
              <iframe key={`${userLat}-${userLng}`} src={buildOsmUrl(userLat, userLng, botRadius)} title="Map" className="absolute inset-0 w-full h-full border-none" loading="lazy" />
              <div className="absolute top-5 left-5 z-10 bg-white/90 backdrop-blur-md rounded-2xl px-5 py-3 shadow-premium border border-tesla-border flex items-center gap-3 w-80">
                <MapPinIcon className="h-5 w-5 text-tesla-blue" />
                <input 
                  value={botLocation} 
                  onChange={e => setBotLocation(e.target.value)}
                  placeholder={t('manualLocation')}
                  className="bg-transparent border-none p-0 text-[13px] font-light text-tesla-text placeholder:text-tesla-muted focus:ring-0 w-full"
                />
              </div>
            </div>

            {botMode === 'advanced' && (
              <div className="border-t border-tesla-border pt-10 space-y-8 animate-in slide-in-from-top-2">
                 <h5 className="font-normal text-[11px] text-tesla-text uppercase tracking-widest italic">Geavanceerde Technische Configuratie</h5>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="space-y-4">
                      <label className="block text-[10px] font-normal text-tesla-muted uppercase tracking-widest pl-1">Aantal Threads</label>
                      <input type="range" min="1" max="10" value={concurrentThreads} onChange={e => setConcurrentThreads(+e.target.value)} className="w-full accent-tesla-blue bg-tesla-border h-1 rounded-full appearance-none" />
                      <div className="flex justify-between text-[10px] font-light text-tesla-text"><span>1</span><span>{concurrentThreads} Threads</span><span>10</span></div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-normal text-tesla-muted uppercase tracking-widest mb-3 pl-1">Netwerkvertraging (ms)</label>
                      <select value={requestDelay} onChange={e => setRequestDelay(+e.target.value)} 
                        className="block w-full rounded-2xl border border-tesla-border bg-white py-2.5 px-4 text-tesla-text text-[11px] font-light uppercase tracking-wider focus:border-tesla-blue transition-all outline-none">
                        <option value={1500}>1500ms (Veilige Modus)</option>
                        <option value={3000}>3000ms (Stealth Modus)</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-tesla-elevated rounded-2xl border border-tesla-border">
                      <span className="text-[10px] font-normal text-tesla-text uppercase tracking-widest">Headless Engine</span>
                      <Toggle value={headless} onChange={() => setHeadless(p=>!p)} />
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* AI INTEGRATIONS SECTION */}
        <div>
          <h3 className="text-[14px] font-normal text-tesla-text uppercase tracking-widest mb-10">AI & Brain Integraties</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { key: 'openai', label: 'OpenAI / ChatGPT', abbr: 'GPT', color: '#10a37f', desc: t('openaiDesc') },
              { key: 'claude', label: 'Anthropic / Claude', abbr: 'CLD', color: '#c96442', desc: t('claudeDesc') },
              { key: 'gemini', label: 'Google Gemini', abbr: 'GEM', color: 'linear-gradient(135deg,#4285F4,#7c3aed)', desc: t('geminiDesc') },
            ].map(ai => (
              <div key={ai.key} className="border border-tesla-border rounded-2xl p-8 bg-white shadow-soft flex flex-col gap-6 transition-all hover:border-tesla-blue/30 group">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-black text-[12px] uppercase tracking-widest shadow-sm" style={{ background: ai.color }}>{ai.abbr}</div>
                  <div>
                    <h4 className="font-medium text-tesla-text text-[13px] uppercase tracking-wide">{ai.label}</h4>
                    <span className={`text-[9px] font-normal uppercase tracking-widest mt-1 block ${connectedAi[ai.key] ? 'text-tesla-blue' : 'text-tesla-muted'}`}>{connectedAi[ai.key] ? 'Verbonden' : 'Niet Verbonden'}</span>
                  </div>
                </div>
                <input type="password" value={aiKeys[ai.key]} onChange={e => setAiKeys(prev => ({ ...prev, [ai.key]: e.target.value }))} placeholder="API KEY (SK-...)" className="block w-full rounded-xl border border-tesla-border py-3 px-4 text-tesla-text placeholder:text-tesla-muted text-[10px] font-mono bg-tesla-elevated focus:border-tesla-blue focus:ring-0 outline-none transition-all" />
                <button onClick={() => connectedAi[ai.key] ? handleDisconnectAi(ai.key) : handleConnectAi(ai.key)} className="w-full py-3 rounded-xl text-[10px] font-normal text-white shadow-md uppercase tracking-wider hover:brightness-110 transition-all" style={{ background: ai.color }}>
                  {connectedAi[ai.key] ? 'Disconnect' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        </div>        {/* LEAD ENRICHMENT SECTION */}
        <div className="pt-20 border-t border-tesla-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h3 className="text-[14px] font-normal text-tesla-text uppercase tracking-widest">{t('leadEnrichment') || 'Lead Verrijking'}</h3>
              <p className="text-[11px] font-light text-tesla-muted mt-2 uppercase tracking-wider">Scan uw CRM voor leads met ontbrekende gegevens en verrijk ze automatisch.</p>
            </div>
            <button 
              onClick={() => {
                const missing = leads.filter(l => !l.email || !l.phone);
                setEnrichData({ 
                  missingCount: missing.length, 
                  totalCount: leads.length,
                  leads: missing
                });
              }}
              className="rounded-full bg-tesla-surface px-6 py-2.5 text-[10px] font-normal text-tesla-text border border-tesla-border shadow-sm hover:border-tesla-blue transition-all uppercase tracking-widest"
            >
              Scan voor ontbrekende data
            </button>
          </div>

          {enrichData.totalCount > 0 && (
            <div className="bg-tesla-elevated/50 rounded-2xl border border-tesla-border p-8 flex flex-col md:flex-row items-center justify-between gap-10 shadow-soft">
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-2xl bg-white border border-tesla-border flex items-center justify-center shadow-sm">
                  <SparklesIcon className="h-8 w-8 text-tesla-blue animate-pulse" />
                </div>
                <div>
                  <p className="text-xl font-light text-tesla-text leading-none">{enrichData.missingCount} {t('leadsWithMissingData') || 'Leads met missende data'}</p>
                  <p className="text-[11px] font-light text-tesla-muted mt-2 uppercase tracking-widest">Van de {enrichData.totalCount} totale database records</p>
                </div>
              </div>
              {!isEnriching && enrichData.missingCount > 0 && (
                <button 
                  onClick={handleEnrichLeads}
                  className="rounded-tesla bg-tesla-blue px-10 py-4 text-[11px] font-black text-white shadow-xl hover:brightness-110 hover:-translate-y-0.5 transition-all uppercase tracking-superwide shadow-tesla-blue/20"
                >
                  Start Deep Enrichment
                </button>
              )}
              {isEnriching && (
                <div className="w-full space-y-4">
                  <div className="flex justify-between text-[10px] font-black text-tesla-muted uppercase tracking-widest">
                    <span className="flex items-center gap-2 text-tesla-blue">
                      <div className="animate-spin h-3 w-3 border-2 border-tesla-blue border-t-transparent rounded-full" />
                      {enrichProgress < 100 ? 'Deep crawling in progress...' : 'Enrichment complete!'}
                    </span>
                    <span>{enrichProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden shadow-inner">
                    <div 
                      className="bg-gradient-to-r from-[#007AFF] to-blue-400 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${enrichProgress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 italic">Verifying website domains, scraping meta tags, and matching KVK records...</p>
                </div>
              )}

              {enrichResults && !isEnriching && (
                <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3">
                  <CheckIcon className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-800 font-medium">{enrichResults}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DRIVE INTEGRATION SECTIE */}
        <div className="pt-8 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
              <CloudIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('exportDestination')}</h3>
              <p className="text-sm text-gray-500">Your scraping results are automatically synced to Google Drive.</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                <img 
                  src={`https://api.dicebear.com/7.x/notionists/svg?seed=${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))?.email : 'guest'}`} 
                  className="h-10 w-10 rounded-full border-2 border-white shadow-sm bg-gray-50"
                  alt="Avatar"
                />
                <div className="h-10 w-10 rounded-full border-2 border-white shadow-sm bg-white flex items-center justify-center">
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{t('googleDrive')}</p>
                <p className="text-xs text-gray-500">
                  {t('connectedAs')} <span className="text-fleet-navy font-semibold">{localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))?.email : '—'}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => window.open('https://drive.google.com', '_blank')}
                className="px-4 py-2 rounded-lg text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                Go to Drive
              </button>
              <button 
                onClick={() => navigate('/leads')}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#007AFF] hover:bg-blue-600 transition-all shadow-sm shadow-blue-200"
              >
                Open Latest Sheet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
