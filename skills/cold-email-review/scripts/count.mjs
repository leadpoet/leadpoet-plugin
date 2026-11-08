#!/usr/bin/env node
// Counts what a reviewer should not estimate by eye: words, sentences, questions and links.
// No dependencies, Node 18 or later.
//
//   node count.mjs draft.txt        or        cat draft.txt | node count.mjs
//
// A first line starting with "Subject:" is read as the subject. Lines after a sign-off
// ("Best,", "Thanks,", "Cheers,", "Regards,") or a "--" line are read as the signature
// and footer, and are left out of the body count.

import { readFileSync } from "node:fs";

const text = (process.argv[2] ? readFileSync(process.argv[2], "utf8") : readFileSync(0, "utf8")).replace(/\r\n/g, "\n").trim();
let lines = text.split("\n");
let subject = null;
if (/^subject:/i.test(lines[0] || "")) { subject = lines[0].replace(/^subject:\s*/i, "").trim(); lines = lines.slice(1); }

const signOff = lines.findIndex((l) => /^(best|thanks|thank you|cheers|regards|best regards|kind regards|warmly|all the best)[,!.]?\s*$/i.test(l.trim()) || l.trim() === "--");
const bodyLines = signOff === -1 ? lines : lines.slice(0, signOff);
const footer = signOff === -1 ? "" : lines.slice(signOff).join("\n");
const greeting = bodyLines.findIndex((l) => l.trim());
const body = bodyLines.slice(greeting + (/^(hi|hello|hey|dear)\b/i.test((bodyLines[greeting] || "").trim()) ? 1 : 0)).join("\n").trim();

const words = (s) => (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’.&-]*/gu) || []).length;
const sentences = body.split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/u).map((s) => s.trim()).filter((s) => words(s) > 0);
const links = (text.match(/\bhttps?:\/\/\S+|\bwww\.\S+/gi) || []);

const out = {
  subject: subject === null ? null : { text: subject, words: words(subject), exclamations: (subject.match(/!/g) || []).length },
  body: {
    words: words(body),
    sentences: sentences.length,
    longestSentenceWords: Math.max(0, ...sentences.map(words)),
    questions: (body.match(/\?/g) || []).length,
    exclamations: (body.match(/!/g) || []).length,
    linksInBody: (body.match(/\bhttps?:\/\/\S+|\bwww\.\S+/gi) || []).length,
  },
  linksAnywhere: links.length,
  footerFound: footer.length > 0,
  optOutWording: /unsubscribe|opt[ -]?out|not interested\?|let me know if (you'd|you would) (rather|prefer) not|reply ["“]?(stop|no|remove)/i.test(text),
};
console.log(JSON.stringify(out, null, 2));
