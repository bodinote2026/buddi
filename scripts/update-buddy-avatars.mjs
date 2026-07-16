/**
 * Patch Buddies Avatar URL for seed names.
 * Usage: node --env-file=.env.local scripts/update-buddy-avatars.mjs
 */
const AVATARS = {
  김서연:
    "https://res.cloudinary.com/djnwbzh6a/image/upload/v1784168674/smiling-asian-woman-with-long-black-hair-wearing-grey-shirt-gives-thumbsup-gesture-white-background_t1svvc.jpg",
  이준호:
    "https://res.cloudinary.com/djnwbzh6a/image/upload/v1784168673/young-man-wearing-yellow-hoodie-is-smiling-looking-up-sky_nutcdh.jpg",
  박지민:
    "https://res.cloudinary.com/djnwbzh6a/image/upload/v1784168673/424068655_c65a220f-8659-423d-bf81-3747e6a3716c_gqrn3q.jpg",
  정민우:
    "https://res.cloudinary.com/djnwbzh6a/image/upload/v1784168672/man-with-black-hair-tan-shirt-with-white-logo-front_ueuown.jpg",
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
