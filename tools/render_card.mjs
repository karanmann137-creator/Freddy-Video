// Draws a Freddy Fix It graphic to a PNG, offline.
// node tools/render_card.mjs card.json out/feed.png [story]
// card.json = {"kicker": "...", "headline": "...", "body": "line\nline"}
import fs from "fs";
const { ImageResponse } = await import("@vercel/og");
const { cardElement } = await import("./card-layout.mjs");
const [, , inFile, outFile, fmt] = process.argv;
const card = JSON.parse(fs.readFileSync(inFile, "utf8"));
const story = fmt === "story";
const r = new ImageResponse(cardElement(card, story), { width: 1080, height: story ? 1920 : 1350 });
fs.writeFileSync(outFile, Buffer.from(await r.arrayBuffer()));
console.log("wrote", outFile);
