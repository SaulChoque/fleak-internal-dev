/* eslint-disable @typescript-eslint/no-unused-vars */
function withValidProperties(properties: Record<string, undefined | string | string[]>) {
return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
);
}

export async function GET() {
const URL = process.env.NEXT_PUBLIC_URL as string;
return Response.json(
    {
  "accountAssociation": {
    "header": "eyJmaWQiOjEyMzA1MzMsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg4MjY0M0Y1MDJhRjgxNDQ0NWRiNDEwMjQ0NzQ3RGQyZWM0MjZjRENDIn0",
    "payload": "eyJkb21haW4iOiJmbGVhay1hcHAudmVyY2VsLmFwcCJ9",
    "signature": "czBkv3tQEX9NQ+vWPqX+h+zSqxR6OCzJev/ICHKTmAYQb1/1XBbqqPsch0eE9MIQTmA3jYK3HGlTjVgknqS71Bw="
  },
  "baseBuilder": {
    "ownerAddress": "0x018960d9713C5c7A7a39D304B982c8E65300F51F"
  },
  "miniapp": {
    "version": "1",
    "name": "Example Mini App",
    "homeUrl": "https://ex.co",
    "iconUrl": "https://ex.co/i.png",
    "splashImageUrl": "https://ex.co/l.png",
    "splashBackgroundColor": "#000000",
    "webhookUrl": "https://ex.co/api/webhook",
    "subtitle": "Fast, fun, social",
    "description": "A fast, fun way to challenge friends in real time.",
    "screenshotUrls": [
      "https://ex.co/s1.png",
      "https://ex.co/s2.png",
      "https://ex.co/s3.png"
    ],
    "primaryCategory": "social",
    "tags": ["example", "miniapp", "baseapp"],
    "heroImageUrl": "https://ex.co/og.png",
    "tagline": "Play instantly",
    "ogTitle": "Example Mini App",
    "ogDescription": "Challenge friends in real time.",
    "ogImageUrl": "https://ex.co/og.png",
    "noindex": true
  }
}
); // see the next step for the manifest_json_object
}