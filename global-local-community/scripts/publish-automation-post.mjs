#!/usr/bin/env node

import process from 'node:process';

const requiredEnv = ['LIVING_KOREA_AUTOMATION_SECRET'];
for (const key of requiredEnv) {
  if (!process.env[key]?.trim()) {
    console.error(`Missing required env: ${key}`);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const options = new Map();
for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (!arg.startsWith('--')) continue;
  options.set(arg.slice(2), args[index + 1]);
  index += 1;
}

const payload = {
  authorId: options.get('author-id') || process.env.LIVING_KOREA_AUTOMATION_AUTHOR_ID || '',
  category: options.get('category') || 'daily-life',
  city: options.get('city') || 'Seoul',
  district: options.get('district') || '',
  title: options.get('title') || '',
  body: options.get('body') || '',
  tags: options.get('tags') || '',
};

if (!payload.authorId || !payload.title || !payload.body) {
  console.error('Usage: node scripts/publish-automation-post.mjs --author-id <uuid> --category <category> --title <title> --body <body> [--city <city>] [--district <district>] [--tags <csv>]');
  process.exit(1);
}

const siteUrl = (process.env.LIVING_KOREA_SITE_URL || 'https://www.living-korea.com').replace(/\/$/, '');
const response = await fetch(`${siteUrl}/api/admin/automation/seed-post`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-openclaw-secret': process.env.LIVING_KOREA_AUTOMATION_SECRET,
    'x-openclaw-caller': process.env.LIVING_KOREA_AUTOMATION_CALLER || 'dori-script',
  },
  body: JSON.stringify(payload),
});

const text = await response.text();
console.log(`status=${response.status}`);
console.log(text);

if (!response.ok) {
  process.exit(1);
}
