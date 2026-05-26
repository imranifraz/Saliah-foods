import { readFileSync, writeFileSync } from "node:fs";

let html = readFileSync("index.html", "utf8");
html = html.replace(/<div id="root"><\/[^>]+>/, '<div id="root"></div>');
writeFileSync("index.html", html);
console.log("fixed");
