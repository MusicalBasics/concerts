import type { NextApiRequest, NextApiResponse } from "next";
import sgMail from "@sendgrid/mail";
import validator from "validator";
import xss from "xss";

import { getSupabaseAdminClient } from "@/utils/supabase";

const REQUESTER_TYPES = new Set([
  "fan",
  "venue",
  "promoter",
  "school",
  "other",
]);

const PRO_REQUESTER_TYPES = new Set(["venue", "promoter", "school", "other"]);

const AUDIENCE_SIZES = new Set([
  "<100",
  "100-500",
  "500-2000",
  "2000+",
  "not-sure",
]);

const NOTES_MAX = 1000;
const NOTIFICATION_TO = "lionel@musicalbasics.com";
const NOTIFICATION_FROM = "support@musicalbasics.com";

// In-memory rate limit per IP. Vercel serverless instances are ephemeral, so
// this is a soft limit per warm instance — good enough for "basic" spam.
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const ipHits: Map<string, number[]> = (globalThis as any).__concertRequestIpHits ||
  new Map<string, number[]>();
(globalThis as any).__concertRequestIpHits = ipHits;

const isRateLimited = (ip: string): boolean => {
  const now = Date.now();
  const hits = (ipHits.get(ip) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (hits.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, hits);
    return true;
  }
  hits.push(now);
  ipHits.set(ip, hits);
  return false;
};

const getClientIp = (req: NextApiRequest): string => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
};

const sanitize = (value: unknown, max: number): string => {
  if (typeof value !== "string") return "";
  return xss(value.trim()).slice(0, max);
};

const REQUESTER_LABELS: Record<string, string> = {
  fan: "Fan organizing",
  venue: "Venue / theater",
  promoter: "Promoter / agency",
  school: "School / university",
  other: "Other",
};

const AUDIENCE_LABELS: Record<string, string> = {
  "<100": "Fewer than 100",
  "100-500": "100 – 500",
  "500-2000": "500 – 2,000",
  "2000+": "More than 2,000",
  "not-sure": "Not sure",
};

const escapeHtml = (input: string): string =>
  input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

type RequestRecord = {
  name: string;
  email: string;
  city: string;
  country: string;
  requester_type: string;
  audience_size: string | null;
  target_date: string | null;
  notes: string | null;
  org_name: string | null;
  website: string | null;
  ip_address: string;
  user_agent: string;
};

const buildNotificationEmail = (record: RequestRecord) => {
  const requesterLabel =
    REQUESTER_LABELS[record.requester_type] || record.requester_type;
  const audienceLabel = record.audience_size
    ? AUDIENCE_LABELS[record.audience_size] || record.audience_size
    : "-";
  const isPro = record.requester_type !== "fan";

  const lines = [
    `Name: ${record.name}`,
    `Email: ${record.email}`,
    `Who: ${requesterLabel}`,
    `City: ${record.city}`,
    `Country: ${record.country}`,
  ];
  if (isPro) {
    lines.push(`Organization: ${record.org_name || "-"}`);
    lines.push(`Audience size: ${audienceLabel}`);
    lines.push(`Target date: ${record.target_date || "-"}`);
    lines.push(`Website: ${record.website || "-"}`);
  }
  lines.push("");
  lines.push("Notes:");
  lines.push(record.notes || "-");
  lines.push("");
  lines.push("---");
  lines.push(`IP: ${record.ip_address}`);
  lines.push(`User agent: ${record.user_agent}`);

  const text = lines.join("\n");

  const proRows = isPro
    ? `
        <tr><td><strong>Organization</strong></td><td>${escapeHtml(record.org_name || "-")}</td></tr>
        <tr><td><strong>Audience size</strong></td><td>${escapeHtml(audienceLabel)}</td></tr>
        <tr><td><strong>Target date</strong></td><td>${escapeHtml(record.target_date || "-")}</td></tr>
        <tr><td><strong>Website</strong></td><td>${
          record.website
            ? `<a href="${escapeHtml(record.website)}">${escapeHtml(record.website)}</a>`
            : "-"
        }</td></tr>`
    : "";

  const heading = isPro ? "New concert host request" : "New concert request";

  const html = `
    <div style="font-family: Helvetica, Arial, sans-serif; color:#232323; line-height:1.5;">
      <h2 style="margin:0 0 16px 0;">${heading}</h2>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
        <tr><td><strong>Name</strong></td><td>${escapeHtml(record.name)}</td></tr>
        <tr><td><strong>Email</strong></td><td><a href="mailto:${escapeHtml(record.email)}">${escapeHtml(record.email)}</a></td></tr>
        <tr><td><strong>Who</strong></td><td>${escapeHtml(requesterLabel)}</td></tr>
        <tr><td><strong>City</strong></td><td>${escapeHtml(record.city)}</td></tr>
        <tr><td><strong>Country</strong></td><td>${escapeHtml(record.country)}</td></tr>${proRows}
      </table>
      <h3 style="margin:24px 0 8px 0;">Notes</h3>
      <p style="white-space:pre-wrap;">${escapeHtml(record.notes || "-")}</p>
      <hr style="margin:24px 0; border:none; border-top:1px solid #ddd;" />
      <p style="font-size:12px; color:#888;">
        IP: ${escapeHtml(record.ip_address)}<br/>
        User agent: ${escapeHtml(record.user_agent)}
      </p>
    </div>
  `;

  return { text, html };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ ok: false, error: `Method ${req.method} not allowed` });
  }

  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return res
      .status(429)
      .json({ ok: false, error: "Too many requests. Please try again later." });
  }

  const body = req.body || {};

  // Honeypot — silently accept (bots get a 200) so they don't retry.
  if (typeof body.website === "string" && body.website.trim().length > 0) {
    return res.status(200).json({ ok: true });
  }

  const name = sanitize(body.name, 200);
  const email = sanitize(body.email, 320);
  const city = sanitize(body.city, 120);
  const country = sanitize(body.country, 120);
  const requester_type = sanitize(body.requester_type, 32);
  const audience_size_raw = sanitize(body.audience_size, 32);
  const target_date_raw = sanitize(body.target_date, 200);
  const notes_raw = sanitize(body.notes, NOTES_MAX);
  const org_name_raw = sanitize(body.org_name, 200);
  const org_website_raw = sanitize(body.org_website, 500);

  if (!name || !email || !city || !country || !requester_type) {
    return res
      .status(400)
      .json({ ok: false, error: "Please fill in all required fields." });
  }

  if (!validator.isEmail(email)) {
    return res
      .status(400)
      .json({ ok: false, error: "Please enter a valid email address." });
  }

  if (!REQUESTER_TYPES.has(requester_type)) {
    return res
      .status(400)
      .json({ ok: false, error: "Please choose a valid requester type." });
  }

  if (PRO_REQUESTER_TYPES.has(requester_type) && !org_name_raw) {
    return res.status(400).json({
      ok: false,
      error: "Please tell me which organization or venue you represent.",
    });
  }

  if (audience_size_raw && !AUDIENCE_SIZES.has(audience_size_raw)) {
    return res
      .status(400)
      .json({ ok: false, error: "Please choose a valid audience size." });
  }

  if (
    org_website_raw &&
    !validator.isURL(org_website_raw, { require_protocol: false })
  ) {
    return res
      .status(400)
      .json({ ok: false, error: "Please enter a valid website URL." });
  }

  const audience_size = audience_size_raw || null;
  const target_date = target_date_raw || null;
  const notes = notes_raw || null;
  const org_name = org_name_raw || null;
  const org_website = org_website_raw || null;
  const userAgent =
    typeof req.headers["user-agent"] === "string"
      ? req.headers["user-agent"].slice(0, 500)
      : "";

  const record = {
    name,
    email,
    city,
    country,
    requester_type,
    audience_size,
    target_date,
    notes,
    org_name,
    website: org_website,
    ip_address: ip,
    user_agent: userAgent,
  };

  // Insert into Supabase
  try {
    const supabase = getSupabaseAdminClient();
    const { error: insertError } = await supabase
      .from("concert_requests")
      .insert(record);

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return res.status(500).json({
        ok: false,
        error: "We couldn't save your request. Please try again.",
      });
    }
  } catch (error: any) {
    console.error("Supabase client error:", error);
    return res.status(500).json({
      ok: false,
      error: "We couldn't save your request. Please try again.",
    });
  }

  // Send notification email
  try {
    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    if (!sendGridApiKey) {
      console.error("SENDGRID_API_KEY not configured — skipping notification");
    } else {
      sgMail.setApiKey(sendGridApiKey);
      const { text, html } = buildNotificationEmail(record);
      const isPro = requester_type !== "fan";
      const subjectPrefix = isPro
        ? "New host request"
        : "New concert request";
      const subjectOrg = isPro && org_name ? ` (${org_name})` : "";
      await sgMail.send({
        to: NOTIFICATION_TO,
        from: NOTIFICATION_FROM,
        replyTo: email,
        subject: `${subjectPrefix}: ${city}, ${country}${subjectOrg}`,
        text,
        html,
      });
    }
  } catch (error: any) {
    // Notification failure shouldn't block the user — the row is already saved.
    console.error("SendGrid send error:", error?.response?.body || error);
  }

  return res.status(200).json({ ok: true });
};

export default handler;
