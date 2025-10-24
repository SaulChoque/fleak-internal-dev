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
    "name": "Fleak",
    "homeUrl": "https://fleak-app.vercel.app/",
    "iconUrl": "https://fleak-app.vercel.app/icon.png",
    "splashImageUrl": "https://fleak-app.vercel.app/splash.png",
    "splashBackgroundColor": "#0000FF",
    "webhookUrl": "",
    "subtitle": "Keep your motivation",
    "description": "A fast, fun way to challenge friends in real time.",
    "screenshotUrls": [
      "https://fleak-app.vercel.app/screenshot.png",
    ],
    "primaryCategory": "productivity",
    "tags": ["example", "miniapp", "baseapp"],
    "heroImageUrl": "https://fleak-app.vercel.app/hero.png",
    "tagline": "Play instantly",
    "ogTitle": "Fleak - Challenge friends in real time",
    "ogDescription": "Challenge friends in real time.",
    "ogImageUrl": "https://fleak-app.vercel.app/hero.png",
    "noindex": false
  }
}
); // see the next step for the manifest_json_object
}