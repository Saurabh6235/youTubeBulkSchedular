/**
 * Shorts Bulk Scheduler — Instagram + Facebook backend (Cloudflare Worker)
 *
 * Bindings (Worker → Settings → Bindings):
 *   MEDIA  = R2 bucket   (videos yahan rakhi jaati hain)
 *   DB     = KV namespace (queue + Meta token)
 * Secrets / Variables (Worker → Settings → Variables and Secrets):
 *   APP_PASSWORD     = koi bhi lamba password (app ke Settings me bhi yahi daalna hai)
 *   META_APP_ID      = Meta app ka App ID
 *   META_APP_SECRET  = Meta app ka App Secret
 * Trigger (Worker → Settings → Triggers → Cron):  every 5 minutes  (cron: * /5 * * * * — bina space ke)
 */

const GRAPH_VERSION = 'v26.0';
const G = `https://graph.facebook.com/${GRAPH_VERSION}`;
const MAX_JOBS_PER_RUN = 8;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,X-App-Key,X-File-Name',
  'Access-Control-Max-Age': '86400',
};
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'Content-Type': 'application/json', ...CORS } });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const FINAL = s => s === 'done' || s === 'error';

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const p = url.pathname;
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (p.startsWith('/media/')) return serveMedia(req, env, decodeURIComponent(p.slice(7)));
    if (p === '/' || p === '') return new Response('Shorts Scheduler worker chal raha hai ✓', { headers: CORS });
    if (!p.startsWith('/api/')) return json({ error: 'not found' }, 404);

    if (!env.APP_PASSWORD) return json({ error: 'Worker me APP_PASSWORD secret set nahi hai' }, 500);
    if (req.headers.get('X-App-Key') !== env.APP_PASSWORD) return json({ error: 'Galat App Password' }, 401);
    if (!env.MEDIA || !env.DB) return json({ error: 'Worker me R2 binding "MEDIA" ya KV binding "DB" nahi mili' }, 500);

    try {
      // ---- status ----
      if (p === '/api/status' && req.method === 'GET') {
        const meta = await env.DB.get('meta', 'json');
        return json({ ok: true, version: 1, hasAppSecret: !!(env.META_APP_ID && env.META_APP_SECRET), meta: meta ? publicMeta(meta) : null });
      }
      // ---- Meta connect ----
      if (p === '/api/meta/connect' && req.method === 'POST') {
        const body = await req.json();
        return json(await connectMeta(env, body.token, body.pageId));
      }
      if (p === '/api/meta/disconnect' && req.method === 'POST') {
        await env.DB.delete('meta');
        return json({ ok: true });
      }
      // ---- upload video to R2 ----
      if (p === '/api/upload' && req.method === 'PUT') {
        const name = decodeURIComponent(req.headers.get('X-File-Name') || 'video.mp4');
        const ext = (name.match(/\.[a-z0-9]{2,4}$/i) || ['.mp4'])[0].toLowerCase();
        const key = `v-${Date.now().toString(36)}-${crypto.randomUUID()}${ext}`;
        const obj = await env.MEDIA.put(key, req.body, { httpMetadata: { contentType: req.headers.get('Content-Type') || 'video/mp4' } });
        return json({ key, size: obj ? obj.size : null });
      }
      // ---- jobs ----
      if (p === '/api/jobs' && req.method === 'POST') {
        const b = await req.json();
        const platforms = (b.platforms || []).filter(x => x === 'instagram' || x === 'facebook');
        if (!b.key || !platforms.length) return json({ error: 'key aur platforms zaroori hain' }, 400);
        const at = Date.parse(b.at) || Date.now();
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
        const job = {
          id, key: b.key, fileName: b.fileName || '', title: (b.title || '').slice(0, 255),
          igCaption: (b.igCaption || '').slice(0, 2200), fbCaption: (b.fbCaption || '').slice(0, 5000),
          at, base: url.origin, created: Date.now(), p: {},
        };
        platforms.forEach(pl => (job.p[pl] = { status: 'scheduled' }));
        await env.DB.put(`job:${id}`, JSON.stringify(job));
        if (at <= Date.now() + 60000) ctx.waitUntil(processDue(env));
        return json({ id });
      }
      if (p === '/api/jobs' && req.method === 'GET') {
        const jobs = await listJobs(env);
        jobs.sort((a, b) => a.at - b.at);
        return json({ jobs: jobs.map(publicJob) });
      }
      let m;
      if ((m = p.match(/^\/api\/jobs\/([\w-]+)$/)) && req.method === 'DELETE') {
        const job = await env.DB.get(`job:${m[1]}`, 'json');
        if (job) { await env.MEDIA.delete(job.key); await env.DB.delete(`job:${m[1]}`); }
        return json({ ok: true });
      }
      if ((m = p.match(/^\/api\/jobs\/([\w-]+)\/retry$/)) && req.method === 'POST') {
        const job = await env.DB.get(`job:${m[1]}`, 'json');
        if (!job) return json({ error: 'job nahi mila' }, 404);
        if (job.cleaned) return json({ error: 'Video file hat chuki hai — dobara upload kariye' }, 400);
        for (const st of Object.values(job.p)) if (st.status === 'error') { st.status = 'scheduled'; delete st.error; delete st.container; st.tries = 0; }
        if (job.at < Date.now()) job.at = Date.now();
        await env.DB.put(`job:${job.id}`, JSON.stringify(job));
        ctx.waitUntil(processDue(env));
        return json({ ok: true });
      }
      if (p === '/api/run' && req.method === 'POST') {
        const r = await processDue(env);
        return json({ ok: true, ...r });
      }
      return json({ error: 'not found' }, 404);
    } catch (e) {
      return json({ error: e.message || String(e) }, 500);
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(processDue(env));
  },
};

/* ================= Meta (Facebook / Instagram) ================= */
function publicMeta(m) {
  return { pageId: m.pageId, pageName: m.pageName, igId: m.igId, igUsername: m.igUsername, longLived: m.longLived, savedAt: m.savedAt };
}

async function connectMeta(env, token, pageId) {
  if (!token) throw new Error('Token khaali hai');
  let userToken = token.trim(), longLived = false;
  if (env.META_APP_ID && env.META_APP_SECRET) {
    const ex = await gget(`/oauth/access_token?grant_type=fb_exchange_token&client_id=${env.META_APP_ID}&client_secret=${env.META_APP_SECRET}&fb_exchange_token=${encodeURIComponent(userToken)}`);
    userToken = ex.access_token; longLived = true;
  }
  const acc = await gget(`/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&limit=100&access_token=${encodeURIComponent(userToken)}`);
  const pages = acc.data || [];
  if (!pages.length) throw new Error('Koi Facebook Page nahi mila. Token banate waqt pages_show_list permission di aur apna Page select kiya tha?');
  if (!pageId && pages.length > 1) {
    return { choose: pages.map(pg => ({ id: pg.id, name: pg.name, igUsername: pg.instagram_business_account?.username || null })) };
  }
  const page = pages.find(pg => pg.id === pageId) || pages[0];
  const meta = {
    pageId: page.id, pageName: page.name, pageToken: page.access_token,
    igId: page.instagram_business_account?.id || null, igUsername: page.instagram_business_account?.username || null,
    longLived, savedAt: Date.now(),
  };
  await env.DB.put('meta', JSON.stringify(meta));
  return { ok: true, meta: publicMeta(meta) };
}

async function gget(path) {
  const r = await fetch(G + path);
  return graphResult(r);
}
async function gpost(path, params) {
  const r = await fetch(G + path, { method: 'POST', body: new URLSearchParams(params) });
  return graphResult(r);
}
async function graphResult(r) {
  let j;
  try { j = await r.json(); } catch (e) { throw new Error('Meta se galat jawab (HTTP ' + r.status + ')'); }
  if (j && j.error) {
    const e = new Error(`${j.error.error_user_msg || j.error.message} (code ${j.error.code}${j.error.error_subcode ? '/' + j.error.error_subcode : ''})`);
    e.code = j.error.code; e.subcode = j.error.error_subcode;
    if ([190, 10, 200].includes(j.error.code)) e.fatal = true;
    if (j.error.code === 190) e.message = 'Meta token expire/galat — Settings me dobara Connect kariye. ' + e.message;
    if (j.error.code === 9 || j.error.code === 4 || j.error.code === 32) e.rateLimit = true;
    throw e;
  }
  return j;
}

/* ================= Queue processing ================= */
async function listJobs(env) {
  const out = [];
  let cursor;
  do {
    const l = await env.DB.list({ prefix: 'job:', cursor });
    for (const k of l.keys) {
      const j = await env.DB.get(k.name, 'json');
      if (j) out.push(j);
    }
    cursor = l.list_complete ? null : l.cursor;
  } while (cursor);
  return out;
}

function publicJob(j) {
  return { id: j.id, fileName: j.fileName, title: j.title, at: j.at, p: j.p, cleaned: !!j.cleaned };
}

async function processDue(env) {
  const meta = await env.DB.get('meta', 'json');
  const jobs = await listJobs(env);
  const now = Date.now();
  let processed = 0;

  // purani poori ho chuki jobs (7 din) saaf
  for (const j of jobs) {
    if (Object.values(j.p).every(s => FINAL(s.status)) && now - j.at > 7 * 864e5) {
      if (!j.cleaned) await env.MEDIA.delete(j.key);
      await env.DB.delete(`job:${j.id}`);
    }
  }
  if (!meta) return { processed, note: 'Meta connect nahi hai' };

  const due = jobs
    .filter(j => j.at <= now && Object.values(j.p).some(s => !FINAL(s.status)))
    .sort((a, b) => a.at - b.at)
    .slice(0, MAX_JOBS_PER_RUN);

  for (const job of due) {
    for (const [pl, st] of Object.entries(job.p)) {
      if (FINAL(st.status)) continue;
      try {
        if (pl === 'instagram') await stepInstagram(job, st, meta);
        else if (pl === 'facebook') await stepFacebook(job, st, meta);
        delete st.lastError;
      } catch (e) {
        st.lastError = e.message;
        if (!e.rateLimit) st.tries = (st.tries || 0) + 1;
        if (e.fatal || st.tries >= 3) { st.status = 'error'; st.error = e.message; }
      }
    }
    if (!job.cleaned && Object.values(job.p).every(s => s.status === 'done')) {
      await env.MEDIA.delete(job.key);
      job.cleaned = true;
    }
    await env.DB.put(`job:${job.id}`, JSON.stringify(job));
    processed++;
  }
  return { processed };
}

function mediaUrl(job) { return `${job.base}/media/${encodeURIComponent(job.key)}`; }

async function stepInstagram(job, st, meta) {
  if (!meta.igId) { const e = new Error('Facebook Page se koi Instagram Business account juda nahi mila'); e.fatal = true; throw e; }
  const tk = meta.pageToken;
  if (st.status === 'scheduled') {
    const c = await gpost(`/${meta.igId}/media`, {
      media_type: 'REELS', video_url: mediaUrl(job), caption: job.igCaption || job.title || '', share_to_feed: 'true', access_token: tk,
    });
    st.container = c.id; st.status = 'processing'; st.containerAt = Date.now();
  }
  if (st.status === 'processing') {
    for (let i = 0; i < 4; i++) {
      const s = await gget(`/${st.container}?fields=status_code,status&access_token=${encodeURIComponent(tk)}`);
      if (s.status_code === 'FINISHED') {
        const pub = await gpost(`/${meta.igId}/media_publish`, { creation_id: st.container, access_token: tk });
        st.mediaId = pub.id; st.status = 'done'; st.doneAt = Date.now();
        try { const pm = await gget(`/${pub.id}?fields=permalink&access_token=${encodeURIComponent(tk)}`); st.link = pm.permalink; } catch (e) {}
        return;
      }
      if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') {
        const e = new Error(`Instagram ne video reject kiya: ${s.status || s.status_code}`); e.fatal = true; throw e;
      }
      if (i < 3) await sleep(15000);
    }
    if (Date.now() - (st.containerAt || 0) > 3 * 3600e3) { const e = new Error('Instagram processing 3 ghante se atki hai'); e.fatal = true; throw e; }
    // abhi IN_PROGRESS — agle cron me phir check hoga
  }
}

async function stepFacebook(job, st, meta) {
  const tk = meta.pageToken;
  const start = await gpost(`/${meta.pageId}/video_reels`, { upload_phase: 'start', access_token: tk });
  const up = await fetch(start.upload_url || `https://rupload.facebook.com/video-upload/${GRAPH_VERSION}/${start.video_id}`, {
    method: 'POST', headers: { Authorization: `OAuth ${tk}`, file_url: mediaUrl(job) },
  });
  const upj = await graphResult(up);
  if (upj.success === false) throw new Error('Facebook upload fail hua');
  await gpost(`/${meta.pageId}/video_reels`, {
    upload_phase: 'finish', video_id: start.video_id, video_state: 'PUBLISHED',
    description: job.fbCaption || job.igCaption || job.title || '', access_token: tk,
  });
  st.videoId = start.video_id; st.status = 'done'; st.doneAt = Date.now();
  st.link = `https://www.facebook.com/reel/${start.video_id}`;
}

/* ================= Media serving (Meta yahin se video uthata hai) ================= */
async function serveMedia(req, env, key) {
  if (!key || !env.MEDIA) return new Response('not found', { status: 404 });
  if (req.method === 'HEAD') {
    const h = await env.MEDIA.head(key);
    if (!h) return new Response(null, { status: 404 });
    return new Response(null, { headers: { 'Content-Type': h.httpMetadata?.contentType || 'video/mp4', 'Content-Length': String(h.size), 'Accept-Ranges': 'bytes' } });
  }
  const opts = {};
  const range = req.headers.get('Range');
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (m && (m[1] || m[2])) {
      if (m[1]) { const s = +m[1]; opts.range = m[2] ? { offset: s, length: +m[2] - s + 1 } : { offset: s }; }
      else opts.range = { suffix: +m[2] };
    }
  }
  const obj = await env.MEDIA.get(key, opts);
  if (!obj) return new Response('not found', { status: 404 });
  const headers = new Headers({ 'Content-Type': obj.httpMetadata?.contentType || 'video/mp4', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' });
  if (opts.range && obj.range) {
    const size = obj.size;
    let start, len;
    if ('suffix' in obj.range) { len = Math.min(obj.range.suffix, size); start = size - len; }
    else { start = obj.range.offset || 0; len = obj.range.length ?? size - start; }
    headers.set('Content-Range', `bytes ${start}-${start + len - 1}/${size}`);
    headers.set('Content-Length', String(len));
    return new Response(obj.body, { status: 206, headers });
  }
  headers.set('Content-Length', String(obj.size));
  return new Response(obj.body, { headers });
}
