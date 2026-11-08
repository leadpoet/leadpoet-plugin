#!/usr/bin/env node
// Outbound math with no dependencies (Node 18 or later). Every number the skill reports comes from here.
//
//   node plan.mjs capacity --goal 15 [--goal-type meetings|positive-replies|companies] [--meeting-rate 0.5]
//                          [--positive-rate 0.01,0.02] [--contacts 2] [--emails 4] [--per-mailbox 30]
//                          [--mailboxes-per-domain 3] [--business-days 21]
//   node plan.mjs test-size --base 0.03 --target 0.06 [--alpha 0.05] [--power 0.8]
//                           [--mailboxes 2] [--per-mailbox 30] [--contacts 1] [--emails 4]
//   node plan.mjs compare --a 4/400 --b 9/400 [--planned 750]
//   node plan.mjs zero --n 100

const WARMUP = [10, 20]; // emails per mailbox per day in weeks 1 and 2; full limit from week 3
const DEFAULT_RATES = [0.005, 0.01, 0.02, 0.03];

function parse(argv) {
  const [command, ...rest] = argv;
  const opts = {};
  for (let i = 0; i < rest.length; i++) {
    if (!rest[i].startsWith("--")) throw new Error(`Unexpected argument ${rest[i]}`);
    opts[rest[i].slice(2)] = rest[i + 1];
    i++;
  }
  return { command, opts };
}
const num = (v, d, name) => {
  if (v === undefined) return d;
  const n = Number(String(v).replace(/%$/, "")) / (String(v).endsWith("%") ? 100 : 1);
  if (!Number.isFinite(n) || n < 0) throw new Error(`--${name} must be a non-negative number`);
  return n;
};
const rate = (v, d, name) => { const n = num(v, d, name); if (n > 1) throw new Error(`--${name} is a share between 0 and 1 (or a percent like 2%)`); return n; };
const pct = (x, digits = 1) => `${(x * 100).toFixed(digits).replace(/\.0+$/, "")}%`;
const int = (x) => Math.ceil(x).toLocaleString("en-US");

// Inverse of the standard normal CDF (Acklam's rational approximation, error below 1.2e-9).
function normInv(p) {
  const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
  const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
  const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
  const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
  const lo = 0.02425;
  if (p < lo) { const q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
  if (p > 1 - lo) return -normInv(1 - p);
  const q = p - 0.5; const r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

function logGamma(x) {
  const g = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x; const t = x + 5.5 - (x + 0.5) * Math.log(x + 5.5);
  let s = 1.000000000190015;
  for (const gi of g) s += gi / ++y;
  return -t + Math.log(2.5066282746310005 * s / x);
}
const logChoose = (n, k) => logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1);

// Two-sided Fisher exact test for a 2x2 table: x1 of n1 against x2 of n2.
function fisherTwoSided(x1, n1, x2, n2) {
  const k = x1 + x2; const N = n1 + n2;
  const lo = Math.max(0, k - n2); const hi = Math.min(k, n1);
  const prob = (x) => Math.exp(logChoose(n1, x) + logChoose(n2, k - x) - logChoose(N, k));
  const observed = prob(x1);
  let p = 0;
  for (let x = lo; x <= hi; x++) { const px = prob(x); if (px <= observed * (1 + 1e-7)) p += px; }
  return Math.min(1, p);
}

// Companies per version to tell base from target: pooled two-proportion formula,
// two-sided, the same calculation as R's power.prop.test.
function perVersion(p1, p2, alpha, power) {
  const za = normInv(1 - alpha / 2); const zb = normInv(power);
  const pbar = (p1 + p2) / 2;
  const n = (za * Math.sqrt(2 * pbar * (1 - pbar)) + zb * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2))) ** 2 / (p2 - p1) ** 2;
  return Math.ceil(n);
}

function capacity(o) {
  const goal = num(o.goal, undefined, "goal");
  if (!goal) throw new Error("--goal is required, for example --goal 15");
  const type = o["goal-type"] || "meetings";
  const meetingRate = rate(o["meeting-rate"], undefined, "meeting-rate");
  if (type === "meetings" && meetingRate === undefined) throw new Error("--meeting-rate is required with meetings: the share of positive replies that become a meeting, for example 0.5");
  const rates = o["positive-rate"] ? String(o["positive-rate"]).split(",").map((r) => rate(r, undefined, "positive-rate")) : DEFAULT_RATES;
  const contacts = num(o.contacts, 1, "contacts");
  const emails = num(o.emails, 4, "emails");
  const cap = num(o["per-mailbox"], 30, "per-mailbox");
  const perDomain = num(o["mailboxes-per-domain"], 3, "mailboxes-per-domain");
  const days = num(o["business-days"], 21, "business-days");
  const assumed = !o["positive-rate"];
  const positives = type === "meetings" ? goal / meetingRate : goal;
  const rows = rates.map((r) => {
    const companies = type === "companies" ? goal : positives / r;
    const sends = companies * contacts * emails;
    const perDay = sends / days;
    const mailboxes = Math.ceil(perDay / cap);
    return { positiveRate: r, companiesPerMonth: Math.ceil(companies), emailsPerMonth: Math.ceil(sends), emailsPerBusinessDay: Math.ceil(perDay), mailboxes, domains: Math.ceil(mailboxes / perDomain) };
  });
  const lines = [];
  lines.push(type === "meetings"
    ? `Goal: ${goal} meetings a month = ${int(positives)} positive replies at a ${pct(meetingRate)} meeting rate.`
    : type === "positive-replies" ? `Goal: ${goal} positive replies a month.` : `Goal: ${goal} companies a month.`);
  lines.push(`Each company: ${contacts} contact${contacts === 1 ? "" : "s"} x ${emails} emails. Mailbox limit ${cap} a day after warm-up, ${perDomain} mailboxes per domain, ${days} business days a month.`);
  if (assumed && type !== "companies") lines.push("Positive reply rate not given: these rows are a range to show what drives the answer, not a forecast. Use your own rate when you have one.");
  lines.push("", "| Positive replies per company | Companies a month | Emails a month | Emails a business day | Mailboxes | Domains |", "| --- | --- | --- | --- | --- | --- |");
  for (const r of rows) lines.push(`| ${type === "companies" ? "n/a" : pct(r.positiveRate)} | ${int(r.companiesPerMonth)} | ${int(r.emailsPerMonth)} | ${int(r.emailsPerBusinessDay)} | ${r.mailboxes} | ${r.domains} |`);
  lines.push("", `Warm-up: a new mailbox sends ${WARMUP[0]} a day in week 1 and ${WARMUP[1]} in week 2, then up to ${cap}. Full speed starts in week 3.`);
  const early = Math.round(2 + days / 5 + (3 * (emails - 1)) / 5);
  const late = Math.round(2 + days / 5 + (5 * (emails - 1)) / 5);
  lines.push(`Timing: with ${emails} emails 3 to 5 business days apart, a company's last email goes out ${3 * (emails - 1)} to ${5 * (emails - 1)} business days after its first. So a full month of results (2 weeks of warm-up, a month of first emails, then the last sequences finishing) takes about ${early}${late !== early ? ` to ${late}` : ""} weeks from new mailboxes.`);
  lines.push("Emails a month assumes every contact gets every email, an upper bound: people who reply, bounce or opt out drop out of the sequence.");
  if (rows.some((r) => r.emailsPerBusinessDay >= 5000)) lines.push("At 5,000 or more emails a day, Gmail, Yahoo and Outlook bulk-sender rules apply: SPF, DKIM and DMARC aligned, and one-click unsubscribe.");
  return { lines, rows };
}

function testSize(o) {
  const p1 = rate(o.base, undefined, "base"); const p2 = rate(o.target, undefined, "target");
  if (p1 === undefined || p2 === undefined || p1 === p2) throw new Error("--base and --target are required and must differ, for example --base 0.03 --target 0.06");
  const alpha = rate(o.alpha, 0.05, "alpha"); const power = rate(o.power, 0.8, "power");
  const n = perVersion(p1, p2, alpha, power);
  const lines = [`Telling ${pct(p1)} from ${pct(p2)} takes ${int(n)} companies per version (${int(2 * n)} for two versions), counting each company once, at ${pct(alpha, 0)} significance and ${pct(power, 0)} power.`];
  if (o.mailboxes) {
    const mailboxes = num(o.mailboxes, 1, "mailboxes"); const cap = num(o["per-mailbox"], 30, "per-mailbox");
    const contacts = num(o.contacts, 1, "contacts"); const emails = num(o.emails, 4, "emails");
    const firstDays = (2 * n * contacts) / (mailboxes * cap);
    const allDays = (2 * n * contacts * emails) / (mailboxes * cap);
    lines.push(`With ${mailboxes} warmed mailbox${mailboxes === 1 ? "" : "es"} at ${cap} a day: first emails alone take ${int(firstDays)} business days, and the whole ${emails}-email sequence about ${int(allDays)} business days of sending.`);
  }
  const ref = [[0.03, 0.04], [0.03, 0.06], [0.01, 0.02]].map(([a, b]) => `${pct(a)} vs ${pct(b)}: ${int(perVersion(a, b, alpha, power))}`);
  lines.push(`For scale: ${ref.join("; ")} per version.`);
  return { lines, perVersion: n };
}

function parseCount(v, name) {
  const m = String(v || "").match(/^(\d+)\/(\d+)$/);
  if (!m || Number(m[1]) > Number(m[2]) || Number(m[2]) === 0) throw new Error(`--${name} must look like 4/400 (positive replies / companies)`);
  return [Number(m[1]), Number(m[2])];
}

function compare(o) {
  const [x1, n1] = parseCount(o.a, "a"); const [x2, n2] = parseCount(o.b, "b");
  const p = fisherTwoSided(x1, n1, x2, n2);
  const r1 = x1 / n1; const r2 = x2 / n2;
  const lines = [`A: ${x1} of ${n1} (${pct(r1, 2)}). B: ${x2} of ${n2} (${pct(r2, 2)}).`];
  lines.push(`Two-sided Fisher exact p = ${p.toFixed(3)}: if the two versions were really the same, a gap at least this big would show up about ${pct(p, 0)} of the time by chance.`);
  if (p >= 0.05) lines.push("Verdict: not a winner yet. The gap is within what chance produces.");
  else lines.push("Verdict: the gap is unlikely to be chance alone, provided the sample size was set before the test and nobody stopped it early because one version looked ahead.");
  if (o.planned) {
    const planned = num(o.planned, undefined, "planned");
    if (n1 < planned || n2 < planned) lines.push(`The test planned ${int(planned)} per version and has not reached it. Reading it early makes a false winner several times as likely; keep going unless one version is a clear miss.`);
  }
  if (x1 + x2 < 10) lines.push(`Only ${x1 + x2} positive replies in total: one or two more on either side would change the picture.`);
  return { lines, p };
}

function zero(o) {
  const n = num(o.n, undefined, "n");
  if (!n) throw new Error("--n is required: companies that finished the sequence with no positive reply");
  const upper = 1 - Math.pow(0.05, 1 / n);
  return { lines: [`0 positive replies from ${int(n)} companies: you can be 95% sure the true rate is below ${pct(upper, 1)} (about 3/n). That is a reason to change the ICP or angle, not proof that another version wins.`], upper };
}

try {
  const { command, opts } = parse(process.argv.slice(2));
  const run = { capacity, "test-size": testSize, compare, zero }[command];
  if (!run) throw new Error("Use one of: capacity, test-size, compare, zero");
  const result = run(opts);
  console.log(opts.json !== undefined ? JSON.stringify(result, null, 2) : result.lines.join("\n"));
} catch (error) {
  console.error(error.message);
  process.exitCode = 2;
}
