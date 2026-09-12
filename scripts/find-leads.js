#!/usr/bin/env node
/**
 * Ringa lead prospector — finds small plumbing/HVAC businesses across
 * Vancouver Island and the Lower Mainland via Google Places, scrapes their
 * website for a contact email, writes a personalized outreach email per lead,
 * and exports to CSV (and optionally a Google Sheet).
 *
 * Usage:
 *   npm run leads
 *   node scripts/find-leads.js --trade hvac --city nanaimo --max-reviews 40
 *   node scripts/find-leads.js --sheet                 # also push to Google Sheet
 *   node scripts/find-leads.js --no-email              # skip website email scraping (faster)
 *
 * Output: leads-YYYY-MM-DD.csv in the project root
 */

import 'dotenv/config';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { parseArgs } from 'util';

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!API_KEY) {
  console.error('Missing GOOGLE_PLACES_API_KEY in .env');
  process.exit(1);
}

const { values: args } = parseArgs({
  options: {
    trade:         { type: 'string',  default: 'all' },
    city:          { type: 'string',  default: 'all' },
    'max-reviews': { type: 'string',  default: '50' },
    'min-reviews': { type: 'string',  default: '0' },
    'no-email':    { type: 'boolean', default: false },
    sheet:         { type: 'boolean', default: false },
  },
  strict: false,
});

const MAX_REVIEWS = parseInt(args['max-reviews']);
const MIN_REVIEWS = parseInt(args['min-reviews']);
const SCRAPE_EMAIL = !args['no-email'];

const BUSINESS_NAME = process.env.BUSINESS_NAME || 'Ringa';
const YOUR_NAME = process.env.OUTREACH_SENDER_NAME || 'TJ';

const SEARCHES = [
  // Greater Victoria
  { trade: 'plumbing', query: 'plumber',        city: 'Victoria BC' },
  { trade: 'hvac',     query: 'HVAC',           city: 'Victoria BC' },
  { trade: 'hvac',     query: 'heating cooling', city: 'Victoria BC' },
  { trade: 'plumbing', query: 'plumber',        city: 'Saanich BC' },
  { trade: 'plumbing', query: 'plumber',        city: 'Langford BC' },
  { trade: 'hvac',     query: 'HVAC',           city: 'Langford BC' },
  { trade: 'plumbing', query: 'plumber',        city: 'Sidney BC' },
  // Vancouver Island — Nanaimo & surrounding
  { trade: 'plumbing', query: 'plumber',        city: 'Nanaimo BC' },
  { trade: 'plumbing', query: 'plumbing',       city: 'Nanaimo BC' },
  { trade: 'hvac',     query: 'HVAC',           city: 'Nanaimo BC' },
  { trade: 'hvac',     query: 'heating cooling', city: 'Nanaimo BC' },
  { trade: 'plumbing', query: 'plumber',        city: 'Duncan BC' },
  { trade: 'hvac',     query: 'HVAC',           city: 'Duncan BC' },
  { trade: 'plumbing', query: 'plumber',        city: 'Parksville BC' },
  { trade: 'hvac',     query: 'HVAC',           city: 'Parksville BC' },
  { trade: 'plumbing', query: 'plumber',        city: 'Courtenay BC' },
  { trade: 'hvac',     query: 'HVAC',           city: 'Courtenay BC' },
  { trade: 'plumbing', query: 'plumber',        city: 'Campbell River BC' },
  { trade: 'plumbing', query: 'plumber',        city: 'Ladysmith BC' },
  // Lower Mainland
  { trade: 'plumbing', query: 'plumber',        city: 'Vancouver BC' },
  { trade: 'hvac',     query: 'HVAC',           city: 'Vancouver BC' },
  { trade: 'plumbing', query: 'plumber',        city: 'Burnaby BC' },
  { trade: 'hvac',     query: 'HVAC',           city: 'Burnaby BC' },
  { trade: 'plumbing', query: 'plumber',        city: 'Surrey BC' },
  { trade: 'hvac',     query: 'HVAC',           city: 'Surrey BC' },
  { trade: 'plumbing', query: 'plumber',        city: 'Richmond BC' },
  { trade: 'plumbing', query: 'plumber',        city: 'Coquitlam BC' },
  { trade: 'plumbing', query: 'plumber',        city: 'Langley BC' },
  { trade: 'plumbing', query: 'plumber',        city: 'North Vancouver BC' },
  { trade: 'hvac',     query: 'HVAC',           city: 'Abbotsford BC' },
];

const SKIP_KEYWORDS = [
  'home depot', 'rona', 'canadian tire', 'walmart', 'costco',
  'service experts', 'enercare', 'reliance', 'john g',
];

// Places API (New) — one searchText call returns all the detail fields we
// need, so there's no separate per-place details lookup.
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.formattedAddress',
  'places.userRatingCount',
  'places.rating',
  'places.businessStatus',
  'places.googleMapsUri',
  'places.regularOpeningHours',
  'places.currentOpeningHours',
  'places.types',
  'nextPageToken',
].join(',');

async function textSearch(query, city, pageToken) {
  const body = { textQuery: `${query} ${city}`, regionCode: 'CA', maxResultCount: 20 };
  if (pageToken) body.pageToken = pageToken;
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': FIELD_MASK,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.error) return { error: json.error, places: [] };
  return json;
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const SKIP_EMAIL = ['example.com', 'sentry', 'wixpress', 'godaddy', '.png', '.jpg', '.gif', '.webp', 'domain.com', 'yourdomain', 'email@'];
const SOCIAL_RE = {
  facebook:  /https?:\/\/(?:www\.)?facebook\.com\/[A-Za-z0-9_.\-/]+/i,
  instagram: /https?:\/\/(?:www\.)?instagram\.com\/[A-Za-z0-9_.\-/]+/i,
  linkedin:  /https?:\/\/(?:www\.)?linkedin\.com\/(?:company|in)\/[A-Za-z0-9_.\-/]+/i,
};

/**
 * Visit a business website (home + common contact pages) and pull every bit
 * of contact info we can find: emails, phone numbers, and social profiles.
 */
async function scrapeSite(website) {
  const out = { emails: new Set(), phones: new Set(), facebook: '', instagram: '', linkedin: '' };
  if (!website) return out;
  const base = website.replace(/\/+$/, '');
  const candidates = [website, `${base}/contact`, `${base}/contact-us`, `${base}/about`];

  for (const url of candidates) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (lead-research)' },
      });
      clearTimeout(t);
      if (!res.ok) continue;
      const html = await res.text();

      (html.match(EMAIL_RE) || [])
        .map(e => e.toLowerCase())
        .filter(e => !SKIP_EMAIL.some(s => e.includes(s)))
        .forEach(e => out.emails.add(e));

      (html.match(PHONE_RE) || [])
        .map(p => p.trim())
        .filter(p => p.replace(/\D/g, '').length >= 10)
        .forEach(p => out.phones.add(p));

      for (const [key, re] of Object.entries(SOCIAL_RE)) {
        if (!out[key]) {
          const m = html.match(re);
          if (m && !/sharer|share\.php|intent/i.test(m[0])) out[key] = m[0];
        }
      }
    } catch { /* timeout or network error — try next candidate */ }
  }
  return out;
}

function pickPrimaryEmail(emails) {
  if (!emails.length) return '';
  return emails.find(e => /^(info|office|contact|service|admin|hello|book)/.test(e)) || emails[0];
}

/**
 * Fallback: when a business has no email from its website, try its Facebook
 * page. We hit mbasic.facebook.com (the no-JS mobile site), whose "about"
 * page sometimes surfaces a contact email/phone without requiring login.
 * Facebook increasingly blocks this, so treat any result as a bonus.
 */
async function scrapeFacebook(fbUrl) {
  const out = { emails: [], phones: [] };
  if (!fbUrl) return out;
  // Normalize to the mbasic about page
  const handle = fbUrl.replace(/https?:\/\/(?:www\.|m\.|mbasic\.)?facebook\.com\//i, '').replace(/\/+$/, '').split('?')[0];
  if (!handle) return out;
  const urls = [
    `https://mbasic.facebook.com/${handle}/about`,
    `https://mbasic.facebook.com/${handle}`,
  ];
  for (const url of urls) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(url, {
        signal: ctrl.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36' },
      });
      clearTimeout(t);
      if (!res.ok) continue;
      const html = await res.text();
      out.emails = (html.match(EMAIL_RE) || [])
        .map(e => e.toLowerCase())
        .filter(e => !SKIP_EMAIL.some(s => e.includes(s)) && !e.includes('facebook.com'));
      out.phones = (html.match(PHONE_RE) || [])
        .map(p => p.trim())
        .filter(p => p.replace(/\D/g, '').length >= 10);
      if (out.emails.length || out.phones.length) break;
    } catch { /* blocked, timeout, or login wall — give up quietly */ }
  }
  return out;
}

function outreachEmail(lead) {
  const first = lead.name.split(/\s|,/)[0];
  return `Subject: Quick question for ${lead.name}

Hi ${first} team,

I came across ${lead.name} while looking at ${lead.trade} companies around ${lead.cityShort}. Quick question — do you ever miss calls when you're out on a job or after hours?

I built ${BUSINESS_NAME}, an AI receptionist made specifically for small plumbing and HVAC shops here on the Island and in the Lower Mainland. It answers every call 24/7, books the job straight into your calendar, and texts the customer a confirmation — so you stop losing work to voicemail.

Worth a quick 15-minute look? Happy to show you exactly how it'd handle your calls.

Cheers,
${YOUR_NAME}`;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function isTooLarge(place) {
  const reviews = place.userRatingCount ?? 0;
  if (reviews > MAX_REVIEWS) return true;
  const name = (place.displayName?.text ?? '').toLowerCase();
  return SKIP_KEYWORDS.some(kw => name.includes(kw));
}

function csvEscape(v) {
  if (v == null) return '';
  const s = String(v);
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"` : s;
}

async function pushToSheet(leads, headers) {
  const { google } = await import('googleapis');
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_REFRESH_TOKEN } = process.env;
  if (!GOOGLE_REFRESH_TOKEN) {
    console.log('\n⚠ --sheet skipped: no GOOGLE_REFRESH_TOKEN in .env. Run `node scripts/google-auth.js`.');
    return;
  }
  const auth = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
  auth.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });
  const sheets = google.sheets({ version: 'v4', auth });

  try {
    const created = await sheets.spreadsheets.create({
      requestBody: { properties: { title: `Ringa leads — ${new Date().toISOString().slice(0, 10)}` } },
    });
    const id = created.data.spreadsheetId;
    const values = [headers, ...leads.map(l => headers.map(h => l[h] ?? ''))];
    await sheets.spreadsheets.values.update({
      spreadsheetId: id,
      range: 'A1',
      valueInputOption: 'RAW',
      requestBody: { values },
    });
    console.log(`\n✓ Google Sheet created: ${created.data.spreadsheetUrl}`);
  } catch (err) {
    if (String(err).includes('insufficient') || String(err).includes('scope')) {
      console.log('\n⚠ Sheets scope missing. Re-run `node scripts/google-auth.js` to re-authorize, then update GOOGLE_REFRESH_TOKEN in .env.');
    } else {
      console.log('\n⚠ Could not write to Google Sheet:', err.message);
    }
  }
}

async function run() {
  const tradeFilter = args.trade === 'all' ? null : args.trade;
  const cityFilter  = args.city  === 'all' ? null : args.city.toLowerCase();

  const searches = SEARCHES.filter(s => {
    if (tradeFilter && s.trade !== tradeFilter) return false;
    if (cityFilter  && !s.city.toLowerCase().includes(cityFilter)) return false;
    return true;
  });

  console.log(`\nRinga lead prospector`);
  console.log(`Searches to run: ${searches.length}`);
  console.log(`Review filter: ${MIN_REVIEWS}–${MAX_REVIEWS}`);
  console.log(`Email scraping: ${SCRAPE_EMAIL ? 'on' : 'off'}\n`);

  const seen = new Set();
  const leads = [];

  for (const search of searches) {
    const cityShort = search.city.replace(/ BC$/, '');
    process.stdout.write(`Searching "${search.query}" in ${cityShort} ... `);
    let pageToken = null;
    let pages = 0;

    do {
      if (pageToken) await sleep(2200);
      const res = await textSearch(search.query, search.city, pageToken);

      if (res.error) {
        console.log(`API error: ${res.error.status || res.error.code} — ${res.error.message}`);
        break;
      }

      const results = res.places ?? [];
      let added = 0;

      for (const place of results) {
        if (seen.has(place.id)) continue;
        seen.add(place.id);

        const reviews = place.userRatingCount ?? 0;
        if (reviews < MIN_REVIEWS || reviews > MAX_REVIEWS) continue;
        if (isTooLarge(place)) continue;
        if (place.businessStatus === 'CLOSED_PERMANENTLY') continue;

        const lead = {
          name:       place.displayName?.text ?? '',
          trade:      search.trade,
          city:       search.city,
          cityShort,
          phone:      place.nationalPhoneNumber ?? '',
          phoneIntl:  place.internationalPhoneNumber ?? '',
          altPhones:  '',
          email:      '',
          allEmails:  '',
          emailSource: '',
          website:    place.websiteUri ?? '',
          facebook:   '',
          instagram:  '',
          linkedin:   '',
          address:    place.formattedAddress ?? '',
          hours:      (place.regularOpeningHours?.weekdayDescriptions ?? []).join(' | '),
          openNow:    place.currentOpeningHours?.openNow == null ? '' : (place.currentOpeningHours.openNow ? 'yes' : 'no'),
          categories: (place.types ?? []).filter(t => t !== 'point_of_interest' && t !== 'establishment').join('; '),
          reviews,
          rating:     place.rating ?? '',
          placeId:    place.id,
          listingUrl: place.googleMapsUri ?? `https://maps.google.com/?q=place_id:${place.id}`,
          mapsUrl:    place.googleMapsUri ?? `https://maps.google.com/?q=place_id:${place.id}`,
        };

        if (SCRAPE_EMAIL && lead.website) {
          const site = await scrapeSite(lead.website);
          const emails = [...site.emails];
          lead.email = pickPrimaryEmail(emails);
          lead.allEmails = emails.join('; ');
          lead.facebook = site.facebook;
          lead.instagram = site.instagram;
          lead.linkedin = site.linkedin;
          // Extra phone numbers found on-site that differ from the Google one
          const gp = lead.phone.replace(/\D/g, '');
          lead.altPhones = [...site.phones].filter(p => p.replace(/\D/g, '') !== gp).slice(0, 3).join('; ');

          // Fallback: no email from the website but we have a Facebook page —
          // try to pull contact details off Facebook.
          if (!lead.email && lead.facebook) {
            const fb = await scrapeFacebook(lead.facebook);
            if (fb.emails.length) {
              lead.email = pickPrimaryEmail(fb.emails);
              lead.allEmails = fb.emails.join('; ');
              lead.emailSource = 'facebook';
            }
            if (!lead.altPhones && fb.phones.length) {
              lead.altPhones = fb.phones.filter(p => p.replace(/\D/g, '') !== gp).slice(0, 3).join('; ');
            }
          }
        }
        if (lead.email && !lead.emailSource) lead.emailSource = 'website';
        lead.outreach = outreachEmail(lead);

        leads.push(lead);
        added++;
      }

      process.stdout.write(`${added} leads`);
      pageToken = res.nextPageToken ?? null;
      pages++;
      if (pageToken) process.stdout.write(` → next page`);
    } while (pageToken && pages < 3);

    console.log('');
  }

  if (leads.length === 0) {
    console.log('\nNo leads found. Try raising --max-reviews or broadening filters.');
    return;
  }

  leads.sort((a, b) => (a.reviews || 0) - (b.reviews || 0));

  const date = new Date().toISOString().slice(0, 10);
  const outPath = path.join(process.cwd(), `leads-${date}.csv`);
  const headers = [
    'name', 'trade', 'cityShort', 'phone', 'phoneIntl', 'altPhones',
    'email', 'allEmails', 'emailSource', 'website', 'facebook', 'instagram', 'linkedin',
    'address', 'hours', 'openNow', 'categories', 'reviews', 'rating',
    'listingUrl', 'mapsUrl', 'placeId', 'outreach',
  ];
  const rows = [
    headers.join(','),
    ...leads.map(l => headers.map(h => csvEscape(l[h])).join(',')),
  ];
  fs.writeFileSync(outPath, rows.join('\n'), 'utf8');

  const withEmail = leads.filter(l => l.email).length;
  console.log(`\n✓ ${leads.length} leads written to ${path.basename(outPath)} (${withEmail} with email)`);
  console.log('\nTop 10 prospects (fewest reviews = most likely owner-operated):\n');
  leads.slice(0, 10).forEach((l, i) => {
    console.log(`  ${i + 1}. ${l.name} — ${l.cityShort} (${l.reviews} reviews, ${l.rating}★)`);
    console.log(`     Phone:   ${l.phone || '(none)'}${l.altPhones ? ' / ' + l.altPhones : ''}`);
    console.log(`     Email:   ${l.email || '(none)'}`);
    console.log(`     Web:     ${l.website || '(no website)'}`);
    const socials = [l.facebook && 'FB', l.instagram && 'IG', l.linkedin && 'LI'].filter(Boolean).join(', ');
    if (socials) console.log(`     Social:  ${socials}`);
    console.log(`     Address: ${l.address}`);
    console.log('');
  });

  if (args.sheet) await pushToSheet(leads, headers);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
