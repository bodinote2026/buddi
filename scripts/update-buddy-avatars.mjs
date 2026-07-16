/**
 * Patch Buddies Avatar URL for v2 seed names.
 * Usage: node --env-file=.env.local scripts/update-buddy-avatars.mjs
 */
const AVATARS = {
  김서연:
    "https://images.unsplash.com/photo-1594744803329-7eb547b9fc6b?w=800&h=1000&fit=crop&crop=faces&fp-y=0.32",
  박지민:
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&h=1000&fit=crop&crop=faces&fp-y=0.28",
  이준호:
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&h=1000&fit=crop&crop=faces&fp-y=0.32",
  정민우:
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&h=1000&fit=crop&crop=faces&fp-y=0.3",
};

const pat = process.env.AIRTABLE_PAT?.replace(/^["']|["']$/g, "");
const baseId = process.env.AIRTABLE_BASE_ID?.replace(/^["']|["']$/g, "");

if (!pat || !baseId) {
  console.error("Missing AIRTABLE_PAT or AIRTABLE_BASE_ID");
  process.exit(1);
}

const baseUrl = `https://api.airtable.com/v0/${baseId}`;

async function airtable(path, init = {}) {
  const res = await fetch(`${baseUrl}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${pat}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${init.method ?? "GET"} ${path} → ${res.status}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

const list = await airtable("Buddies");
const records = list.records ?? [];

let updated = 0;
for (const record of records) {
  const name = record.fields?.Name;
  const url = name && AVATARS[name];
  if (!url) continue;

  await airtable(`Buddies/${record.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      fields: { "Avatar URL": url },
    }),
  });
  console.log(`updated: ${name} (${record.id})`);
  updated += 1;
}

console.log(`done: ${updated} buddy avatar(s) updated`);
