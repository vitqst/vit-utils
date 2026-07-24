import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { PhotoData } from "./photos.js";
import {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakSlider,
  TweakToggle,
  TweakRadio,
  TweakColor,
  TweakButton,
} from "./tweaks-panel.jsx";

/* ---------------------------------------------------------------- styles */
const CSS = `
.app { height:100%; display:flex; flex-direction:column; }

/* top bar */
.topbar { display:flex; align-items:center; gap:18px; padding:0 22px; height:58px;
  border-bottom:1px solid var(--line); background:color-mix(in oklab, var(--panel) 70%, transparent);
  backdrop-filter:blur(8px); position:relative; z-index:5; }
.brand { display:flex; align-items:center; gap:10px; font-weight:600; letter-spacing:.14em; font-size:13px; }
.brand .dot { width:13px; height:13px; border-radius:3px; background:var(--ink);
  box-shadow: 4px 0 0 -2px var(--keep), 8px 0 0 -4px var(--reject); }
.folder { color:var(--muted); font-family:var(--mono); font-size:12px; letter-spacing:0;
  display:flex; align-items:center; gap:7px; white-space:nowrap; max-width:220px; overflow:hidden; text-overflow:ellipsis; }
.folder b { color:var(--ink); font-weight:500; }
.spacer { flex:1; }
.counter { font-family:var(--mono); font-size:13px; color:var(--muted); letter-spacing:.02em; white-space:nowrap; }
.counter b { color:var(--ink); font-weight:600; }
.legend { display:flex; gap:6px; align-items:center; color:var(--faint); font-size:12px; white-space:nowrap; }
.kbd { font-family:var(--mono); font-size:11px; line-height:1; padding:5px 7px; border:1px solid var(--line-2);
  border-bottom-width:2px; border-radius:6px; background:var(--panel); color:var(--muted); min-width:14px; text-align:center; }
.btn { font-size:13px; font-weight:500; padding:8px 14px; border-radius:8px; border:1px solid var(--line-2);
  background:var(--panel); color:var(--ink); cursor:pointer; transition:.14s; letter-spacing:.01em; }
.btn:hover { border-color:var(--faint); }
.btn.ghost { background:transparent; border-color:transparent; color:var(--muted); }
.btn.ghost:hover { background:var(--bg-2); color:var(--ink); }
.btn.primary { background:var(--ink); color:#fff; border-color:var(--ink); }
.btn.primary:hover { filter:brightness(1.12); }
.btn:disabled { opacity:.4; cursor:not-allowed; }

/* progress hairline */
.progress { height:2px; background:var(--line); position:relative; z-index:4; }
.progress > i { display:block; height:100%; background:linear-gradient(90deg, var(--keep), var(--ink)); transition:width .3s cubic-bezier(.2,.8,.2,1); }

/* stage */
.stage { flex:1; position:relative; display:grid; place-items:center; overflow:hidden; padding:24px; }
.edge { position:absolute; top:0; bottom:0; width:160px; display:flex; flex-direction:column; align-items:center;
  justify-content:center; gap:10px; color:var(--faint); pointer-events:none; user-select:none; opacity:.0; transition:.18s; }
.stage:hover .edge { opacity:.5; }
.edge.left { left:0; } .edge.right { right:0; }
.edge .chev { font-size:34px; line-height:1; }
.edge .lbl { font-size:11px; letter-spacing:.18em; font-weight:600; }
.edge.left .lbl { color:var(--reject); } .edge.right .lbl { color:var(--keep); }

/* deck + cards */
.deck { position:relative; aspect-ratio:3/2; height:min(64vh, calc(88vw * 0.6667)); }
.card { position:absolute; inset:0; border-radius:var(--r); background:var(--panel);
  padding:10px; box-shadow:var(--shadow-card); }
.card .photo { position:relative; width:100%; height:100%; border-radius:4px; overflow:hidden; background:#0d0f12; }
.card .fill { position:absolute; inset:0; background-size:cover; background-position:center; will-change:transform,filter; }
.card .fill img, .card .fill canvas { width:100%; height:100%; object-fit:cover; display:block; }
.scrim { position:absolute; left:0; right:0; height:38%; pointer-events:none; }
.scrim.t { top:0; background:linear-gradient(180deg, rgba(8,9,12,.42), transparent); }
.scrim.b { bottom:0; background:linear-gradient(0deg, rgba(8,9,12,.46), transparent); }
.chip { position:absolute; font-family:var(--mono); font-size:12px; color:#fff; letter-spacing:.02em;
  text-shadow:0 1px 3px rgba(0,0,0,.5); display:flex; align-items:center; gap:8px; }
.chip.tl { top:13px; left:14px; }
.chip.tr { top:13px; right:14px; }
.chip .pill { background:rgba(12,14,18,.5); border:1px solid rgba(255,255,255,.18); padding:3px 8px; border-radius:99px;
  backdrop-filter:blur(4px); white-space:nowrap; }
.chip .pill.burst { color:#fff; }
.sharp { position:absolute; bottom:13px; left:14px; display:flex; align-items:center; gap:9px;
  font-family:var(--mono); font-size:11px; color:#fff; text-shadow:0 1px 3px rgba(0,0,0,.5); }
.sharp .bar { width:120px; height:4px; border-radius:99px; background:rgba(255,255,255,.25); overflow:hidden; }
.sharp .bar > i { display:block; height:100%; border-radius:99px; }

/* card states */
.peek { transform:scale(.945) translateY(14px); filter:saturate(.9) brightness(.97); opacity:.9; box-shadow:0 24px 50px -30px rgba(20,22,28,.4); }
.rise { animation:rise .26s cubic-bezier(.2,.85,.25,1); }
@keyframes rise { from { transform:scale(.95) translateY(12px); opacity:.6; } to { transform:none; opacity:1; } }
.leaving { z-index:3; }
.fly-right { animation:flyR var(--fly) cubic-bezier(.36,.06,.2,1) forwards; }
.fly-left  { animation:flyL var(--fly) cubic-bezier(.36,.06,.2,1) forwards; }
@keyframes flyR { to { transform:translateX(62vw) rotate(11deg); opacity:0; } }
@keyframes flyL { to { transform:translateX(-62vw) rotate(-11deg); opacity:0; } }
.stamp { position:absolute; top:26px; font-family:var(--ui); font-weight:800; font-size:34px; letter-spacing:.12em;
  padding:8px 16px; border-radius:10px; border:4px solid; transform:rotate(-12deg); opacity:0; }
.leaving .stamp.show { animation:stampIn .18s forwards; }
@keyframes stampIn { from { opacity:0; transform:rotate(-12deg) scale(1.3); } to { opacity:1; transform:rotate(-12deg) scale(1); } }
.stamp.keep { right:24px; color:var(--keep); border-color:var(--keep); transform:rotate(12deg); }
.leaving .stamp.keep.show { animation:stampInR .18s forwards; }
@keyframes stampInR { from { opacity:0; transform:rotate(12deg) scale(1.3); } to { opacity:1; transform:rotate(12deg) scale(1); } }
.stamp.reject { left:24px; color:var(--reject); border-color:var(--reject); }

/* verdict tint shown on front while a key/btn is held/hovered */
.intent { position:absolute; inset:10px; border-radius:4px; pointer-events:none; opacity:0; transition:.12s; }
.intent.keep { box-shadow:inset 0 0 0 3px var(--keep), inset 0 0 60px var(--keep-soft); opacity:1; }
.intent.reject { box-shadow:inset 0 0 0 3px var(--reject), inset 0 0 60px var(--reject-soft); opacity:1; }

/* filmstrip */
.strip-wrap { padding:14px 22px 6px; display:flex; flex-direction:column; align-items:center; gap:9px; min-height:96px; }
.strip-label { font-family:var(--mono); font-size:11px; color:var(--faint); letter-spacing:.04em; white-space:nowrap; }
.strip-label b { color:var(--muted); font-weight:500; }
.strip { display:flex; gap:8px; align-items:center; }
.tn { position:relative; width:58px; height:39px; border-radius:5px; overflow:hidden; background:#0d0f12;
  outline:2px solid transparent; outline-offset:2px; transition:.16s; flex:none; }
.tn.cur { outline-color:var(--ink); transform:translateY(-2px); }
.tn .tnfill { position:absolute; inset:0; background-size:cover; background-position:center; }
.tn .tnfill img, .tn .tnfill canvas { width:100%; height:100%; object-fit:cover; display:block; }
.tn .sdot { position:absolute; bottom:3px; right:3px; width:9px; height:9px; border-radius:99px; border:1.5px solid rgba(0,0,0,.35); }
.tn .sdot.keep { background:var(--keep); } .tn .sdot.reject { background:var(--reject); }
.tn.future { opacity:.5; }

/* footer actions */
.footer { display:flex; align-items:center; justify-content:center; gap:14px; padding:12px 22px 22px; }
.act { display:flex; align-items:center; gap:11px; padding:12px 20px; border-radius:12px; cursor:pointer;
  border:1px solid var(--line-2); background:var(--panel); font-size:15px; font-weight:600; transition:.14s; letter-spacing:.01em; }
.act:hover { transform:translateY(-1px); }
.act .ico { width:26px; height:26px; display:grid; place-items:center; font-size:18px; }
.act.reject { color:var(--reject); } .act.reject:hover { background:var(--reject-soft); border-color:var(--reject); }
.act.keep { color:var(--keep); } .act.keep:hover { background:var(--keep-soft); border-color:var(--keep); }
.act.undo { color:var(--muted); font-weight:500; font-size:14px; padding:12px 16px; }
.act.undo:hover { background:var(--bg-2); }
.act small { font-family:var(--mono); font-weight:400; font-size:11px; opacity:.7; }

/* contact sheet overlay */
.sheet { position:fixed; inset:0; z-index:60; display:grid; place-items:center;
  background:color-mix(in oklab, var(--bg) 72%, transparent); backdrop-filter:blur(10px); animation:fade .14s; }
@keyframes fade { from { opacity:0; } }
.sheet .panel { background:var(--panel); border:1px solid var(--line); border-radius:16px; padding:22px;
  box-shadow:var(--shadow-card); max-width:88vw; }
.sheet h3 { margin:0 0 4px; font-size:15px; font-weight:600; }
.sheet .sub { margin:0 0 16px; font-family:var(--mono); font-size:12px; color:var(--muted); }
.sheet .grid { display:flex; gap:12px; flex-wrap:wrap; max-width:78vw; }
.shot { position:relative; width:200px; aspect-ratio:3/2; border-radius:8px; overflow:hidden; background:#0d0f12;
  outline:2px solid transparent; outline-offset:2px; }
.shot.best { outline-color:var(--keep); }
.shot .sf { position:absolute; inset:0; background-size:cover; background-position:center; }
.shot .sf img, .shot .sf canvas { width:100%; height:100%; object-fit:cover; display:block; }
.shot .tag { position:absolute; top:8px; left:8px; font-family:var(--mono); font-size:11px; color:#fff;
  background:rgba(12,14,18,.55); padding:2px 7px; border-radius:99px; text-shadow:0 1px 2px rgba(0,0,0,.4); }
.shot .crown { position:absolute; bottom:8px; right:8px; font-family:var(--ui); font-size:10px; font-weight:700;
  letter-spacing:.1em; color:var(--keep); background:#fff; padding:3px 7px; border-radius:99px; }

/* start screen */
.start { height:100%; display:grid; place-items:center; padding:24px; }
.start .box { width:min(560px, 92vw); text-align:center; }
.start .logo { display:inline-flex; align-items:center; gap:12px; margin-bottom:26px; }
.start .logo .dot { width:20px; height:20px; border-radius:5px; background:var(--ink);
  box-shadow:6px 0 0 -3px var(--keep), 12px 0 0 -6px var(--reject); }
.start .logo span { font-weight:600; letter-spacing:.18em; font-size:16px; }
.start h1 { font-size:34px; line-height:1.12; letter-spacing:-.02em; margin:0 0 12px; font-weight:600; text-wrap:balance; }
.start p.lede { font-size:15px; color:var(--muted); line-height:1.55; margin:0 auto 30px; max-width:42ch; text-wrap:pretty; }
.start .actions { display:flex; gap:12px; justify-content:center; margin-bottom:14px; }
.start .import-row { margin-bottom:30px; }
.start .big { padding:14px 22px; font-size:15px; border-radius:11px; }
.start .keys { display:flex; gap:26px; justify-content:center; padding-top:24px; border-top:1px solid var(--line); }
.start .keys .k { display:flex; flex-direction:column; align-items:center; gap:9px; color:var(--muted); font-size:12px; }
.start .keys .k .row { display:flex; gap:5px; }
.hint-note { margin-top:22px; font-family:var(--mono); font-size:11px; color:var(--faint); }

/* review screen */
.review { height:100%; display:flex; flex-direction:column; overflow:hidden; }
.rv-head { padding:30px 36px 18px; display:flex; align-items:flex-end; gap:20px; border-bottom:1px solid var(--line); }
.rv-head h2 { margin:0; font-size:26px; font-weight:600; letter-spacing:-.01em; }
.rv-head h2 b { color:var(--keep); }
.rv-head p { margin:6px 0 0; color:var(--muted); font-size:13px; font-family:var(--mono); }
.tabs { display:flex; gap:4px; margin-left:auto; background:var(--bg-2); padding:4px; border-radius:10px; }
.tab { padding:8px 14px; border-radius:7px; border:none; background:transparent; cursor:pointer; font-size:13px;
  font-weight:500; color:var(--muted); display:flex; align-items:center; gap:7px; }
.tab.on { background:var(--panel); color:var(--ink); box-shadow:0 1px 2px rgba(0,0,0,.06); }
.tab .n { font-family:var(--mono); font-size:11px; opacity:.7; }
.rv-body { flex:1; display:flex; min-height:0; }
.rv-grid { flex:1; overflow:auto; position:relative; }
.rv-grid-canvas { position:relative; min-width:100%; }
.gcard { border-radius:9px; overflow:hidden; background:var(--panel); border:1px solid var(--line);
  box-shadow:0 1px 2px rgba(0,0,0,.04); cursor:pointer; transition:transform .14s, box-shadow .14s;
  outline:2px solid transparent; outline-offset:2px; user-select:none; position:absolute; }
.gcard:hover { transform:translateY(-2px); box-shadow:0 12px 28px -16px rgba(20,22,28,.5); }
.gcard.sel { outline-color:var(--ink); }
.gcard.sel .v { box-shadow:0 0 0 2px var(--panel); }
.gcard .gp { position:relative; height:calc(100% - 34px); background:#0d0f12; }
.gcard .gp .gf { position:absolute; inset:0; background-size:cover; background-position:center; }
.gcard .gp .gf img, .gcard .gp .gf canvas { width:100%; height:100%; object-fit:cover; display:block; }
.gcard .gp .v { position:absolute; top:8px; right:8px; width:10px; height:10px; border-radius:99px; border:1.5px solid rgba(0,0,0,.3); }
.gcard .cap { height:34px; padding:0 11px; font-family:var(--mono); font-size:11px; color:var(--muted); display:flex;
  align-items:center; justify-content:space-between; gap:8px; }
.gcard .cap span { min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

/* quick keep/reject actions on each grouped frame */
.gcard .qa { position:absolute; left:0; right:0; bottom:0; display:flex; gap:6px; padding:8px;
  opacity:0; transform:translateY(6px); transition:.14s; background:linear-gradient(0deg, rgba(8,9,12,.55), transparent); }
.gcard:hover .qa { opacity:1; transform:none; }
.qbtn { flex:1; font-family:var(--mono); font-weight:600; font-size:11px; letter-spacing:.04em; padding:7px 0;
  border-radius:7px; border:1px solid rgba(255,255,255,.26); background:rgba(12,14,18,.5); color:#fff;
  cursor:pointer; backdrop-filter:blur(4px); transition:.12s; }
.qbtn:hover { transform:translateY(-1px); }
.qbtn.k:hover, .qbtn.k.on { background:var(--keep); border-color:var(--keep); }
.qbtn.r:hover, .qbtn.r.on { background:var(--reject); border-color:var(--reject); }
.qbtn.on { box-shadow:inset 0 0 0 1px rgba(255,255,255,.3); }
.rv-tip { margin:8px 0 0; font-family:var(--mono); font-size:11px; color:var(--faint); }
.rv-tip b { color:var(--muted); font-weight:600; }

/* lightbox — big keep/reject view */
.lb { cursor:zoom-out; }
.lb-stage { display:flex; align-items:center; gap:18px; cursor:default; }
.lb-nav { width:46px; height:46px; border-radius:99px; border:1px solid var(--line-2); background:var(--panel);
  color:var(--ink); font-size:26px; line-height:1; cursor:pointer; display:grid; place-items:center; transition:.14s; flex:none; }
.lb-nav:hover:not(:disabled) { transform:scale(1.06); border-color:var(--faint); }
.lb-nav:disabled { opacity:.3; cursor:not-allowed; }
.lb-card { background:var(--panel); border-radius:14px; padding:10px; box-shadow:var(--shadow-card);
  width:min(80vw, calc(70vh * 1.5)); }
.lb-card .photo { position:relative; width:100%; aspect-ratio:3/2; border-radius:6px; overflow:hidden; background:#0d0f12; }
.lb-card .lb-fill { position:absolute; inset:0; background-size:contain; background-position:center; background-repeat:no-repeat; }
.lb-card .lb-fill img, .lb-card .lb-fill canvas { width:100%; height:100%; object-fit:contain; display:block; }
.lb-badge { position:absolute; top:14px; right:14px; font-family:var(--ui); font-weight:800; font-size:15px; letter-spacing:.12em;
  padding:6px 12px; border-radius:8px; border:3px solid; background:rgba(12,14,18,.32); backdrop-filter:blur(4px); }
.lb-badge.keep { color:var(--keep); border-color:var(--keep); }
.lb-badge.reject { color:var(--reject); border-color:var(--reject); }
.lb-actions { display:flex; gap:12px; padding:12px 4px 4px; }
.lb-actions .act { flex:1; justify-content:center; }
.rv-side { width:380px; border-left:1px solid var(--line); display:flex; flex-direction:column; background:var(--panel); }
.rv-side .sh { padding:18px 20px 12px; border-bottom:1px solid var(--line); }
.rv-side .sh h4 { margin:0; font-size:13px; font-weight:600; letter-spacing:.02em; }
.rv-side .sh p { margin:4px 0 0; font-size:12px; color:var(--muted); }
.codeblock { flex:1; overflow:auto; margin:0; padding:16px 20px; font-family:var(--mono); font-size:12.5px;
  line-height:1.7; color:var(--ink); white-space:pre; }
.codeblock .ln { color:var(--faint); user-select:none; }
.rv-side .tools { display:flex; gap:10px; padding:16px 20px; border-top:1px solid var(--line); }
.empty { color:var(--faint); font-size:13px; padding:60px; text-align:center; grid-column:1/-1; }
.toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:var(--ink); color:#fff;
  font-size:13px; padding:10px 16px; border-radius:9px; box-shadow:0 10px 30px -10px rgba(0,0,0,.4); z-index:50;
  animation:toast 2s forwards; }
@keyframes toast { 0%{opacity:0;transform:translate(-50%,10px);} 12%,80%{opacity:1;transform:translate(-50%,0);} 100%{opacity:0;} }

.pass-chip { font-family:var(--mono); font-size:12px; color:var(--ink); background:var(--bg-2);
  border:1px solid var(--line-2); padding:4px 11px; border-radius:99px; white-space:nowrap;
  display:flex; align-items:center; gap:6px; }
.pass-chip::before { content:""; width:7px; height:7px; border-radius:99px; background:var(--keep); }
.rv-foot { display:flex; align-items:center; gap:12px; padding:14px 36px; border-top:1px solid var(--line); }
.pass-actions { display:flex; gap:10px; }
`;

/* ---------------------------------------------------------------- helpers */
function fillStyle(p, blurScale = 1) {
  if (p.real) return {};
  return { background: PhotoData.bgFor(p), filter: `blur(${(p.blur * blurScale).toFixed(2)}px)`,
    transform: `scale(${p.zoom}) translate(${p.shift.x}px, ${p.shift.y}px) rotate(${p.tilt}deg)` };
}
function sharpColor(s) { return s > 0.75 ? "var(--keep)" : s > 0.5 ? "var(--maybe)" : "var(--reject)"; }

const PREVIEW_DECODE_LIMIT = 2;
const PREVIEW_CACHE_MAX_BYTES = 64 * 1024 * 1024;
let activePreviewDecodes = 0;
const previewDecodeQueue = [];
const previewBitmapCache = new WeakMap();
const previewBitmapLru = new Map();
let previewBitmapCacheBytes = 0;

function pumpPreviewDecodes() {
  while (activePreviewDecodes < PREVIEW_DECODE_LIMIT && previewDecodeQueue.length) {
    const job = previewDecodeQueue.shift();
    if (job.cancelled) {
      job.resolve(null);
      continue;
    }

    activePreviewDecodes++;
    let decode;
    try {
      decode = window.createImageBitmap(job.file, {
        resizeWidth: job.resizeWidth,
        resizeQuality: "medium",
      });
    } catch (error) {
      job.reject(error);
      activePreviewDecodes--;
      continue;
    }

    Promise.resolve(decode).then((bitmap) => {
      if (job.cancelled) {
        bitmap?.close?.();
        job.resolve(null);
      } else {
        job.resolve(bitmap);
      }
    }, job.reject).finally(() => {
      activePreviewDecodes--;
      pumpPreviewDecodes();
    });
  }
}

function schedulePreviewDecode(file, resizeWidth) {
  let resolve;
  let reject;
  const job = {
    file,
    resizeWidth,
    cancelled: false,
    promise: new Promise((res, rej) => { resolve = res; reject = rej; }),
    resolve: null,
    reject: null,
  };
  job.resolve = resolve;
  job.reject = reject;
  previewDecodeQueue.push(job);
  pumpPreviewDecodes();
  return {
    promise: job.promise,
    cancel: () => { job.cancelled = true; },
  };
}

function touchPreviewBitmap(entry) {
  previewBitmapLru.delete(entry);
  previewBitmapLru.set(entry, true);
}

function removePreviewBitmap(entry) {
  if (entry.fileEntries.get(entry.key) === entry) entry.fileEntries.delete(entry.key);
  previewBitmapLru.delete(entry);
  if (!entry.bitmap) return;
  previewBitmapCacheBytes = Math.max(0, previewBitmapCacheBytes - entry.bytes);
  entry.bitmap.close?.();
  entry.bitmap = null;
  entry.bytes = 0;
}

function evictPreviewBitmaps() {
  while (previewBitmapCacheBytes > PREVIEW_CACHE_MAX_BYTES) {
    let entry = null;
    for (const candidate of previewBitmapLru.keys()) {
      if (candidate.users === 0) {
        entry = candidate;
        break;
      }
    }
    if (!entry) return;
    removePreviewBitmap(entry);
  }
}

function acquirePreviewBitmap(file, width, height) {
  let fileEntries = previewBitmapCache.get(file);
  if (!fileEntries) {
    fileEntries = new Map();
    previewBitmapCache.set(file, fileEntries);
  }

  const key = `${width}x${height}`;
  let entry = fileEntries.get(key);
  if (!entry) {
    const job = schedulePreviewDecode(file, Math.max(width, height));
    entry = {
      key,
      fileEntries,
      job,
      users: 0,
      bitmap: null,
      bytes: 0,
      state: "pending",
      cancelled: false,
      promise: null,
    };
    entry.promise = job.promise.then((bitmap) => {
      if (!bitmap || entry.cancelled) {
        bitmap?.close?.();
        return null;
      }
      entry.state = "ready";
      entry.bitmap = bitmap;
      entry.bytes = bitmap.width * bitmap.height * 4;
      previewBitmapCacheBytes += entry.bytes;
      touchPreviewBitmap(entry);
      evictPreviewBitmaps();
      return bitmap;
    }, (error) => {
      if (fileEntries.get(key) === entry) fileEntries.delete(key);
      throw error;
    });
    fileEntries.set(key, entry);
  } else if (entry.state === "ready") {
    touchPreviewBitmap(entry);
  }

  entry.users++;
  let released = false;
  return {
    promise: entry.promise,
    release: () => {
      if (released) return;
      released = true;
      entry.users = Math.max(0, entry.users - 1);
      if (entry.state === "pending" && entry.users === 0) {
        entry.cancelled = true;
        if (fileEntries.get(key) === entry) fileEntries.delete(key);
        entry.job.cancel();
        return;
      }
      if (entry.state === "ready") {
        touchPreviewBitmap(entry);
        evictPreviewBitmaps();
      }
    },
  };
}

function drawBitmapCover(canvas, bitmap, width, height) {
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return false;
  canvas.width = width;
  canvas.height = height;
  const scale = Math.max(width / bitmap.width, height / bitmap.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  context.drawImage(
    bitmap,
    (bitmap.width - sourceWidth) / 2,
    (bitmap.height - sourceHeight) / 2,
    sourceWidth,
    sourceHeight,
    0,
    0,
    width,
    height,
  );
  return true;
}

function PreviewFill({ p, cls, width, height }) {
  const canvasRef = useRef(null);
  const [fallbackUrl, setFallbackUrl] = useState(null);

  useEffect(() => {
    let mounted = true;
    let fallbackObjectUrl = null;
    let preview = null;
    setFallbackUrl(null);

    const showFallback = () => {
      if (!mounted || fallbackObjectUrl) return;
      fallbackObjectUrl = URL.createObjectURL(p.file);
      setFallbackUrl(fallbackObjectUrl);
    };

    if (typeof window.createImageBitmap !== "function") {
      showFallback();
    } else {
      preview = acquirePreviewBitmap(p.file, width, height);
      preview.promise.then((bitmap) => {
        if (!mounted || !bitmap) return;
        const drawn = canvasRef.current && drawBitmapCover(canvasRef.current, bitmap, width, height);
        if (!drawn) showFallback();
      }).catch(showFallback);
    }

    return () => {
      mounted = false;
      preview?.release();
      if (fallbackObjectUrl) URL.revokeObjectURL(fallbackObjectUrl);
    };
  }, [p.file, width, height]);

  return (
    <div className={cls}>
      {fallbackUrl
        ? <img src={fallbackUrl} alt={p.name} draggable="false" loading="lazy" decoding="async" />
        : <canvas ref={canvasRef} width={width} height={height} role="img" aria-label={p.name} />}
    </div>
  );
}

function ObjectUrlFill({ p, cls, fit }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(p.file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [p.file]);

  return <div className={cls}>{url && <img src={url} alt={p.name} draggable="false" loading="lazy"
    decoding="async" style={fit ? { objectFit: fit } : undefined} />}</div>;
}

/* a single photo surface (demo gradient or real <img>) */
export function Fill({ p, cls = "fill", blurScale = 1, previewWidth = 0, previewHeight = 0, fit }) {
  if (p.real && previewWidth && previewHeight) return <PreviewFill p={p} cls={cls} width={previewWidth} height={previewHeight} />;
  if (p.real) return <ObjectUrlFill p={p} cls={cls} fit={fit} />;
  return <div className={cls} style={fillStyle(p, blurScale)} />;
}

/* ---------------------------------------------------------------- cards */
function Card({ photo, variant, dir, t, anim }) {
  const showMeta = t.meta !== false;
  return (
    <div className={`card grain ${variant} ${variant === "leaving" ? (dir === "keep" ? "fly-right" : "fly-left") : ""} ${anim ? "rise" : ""}`}>
      <div className="photo">
        <Fill p={photo} />
        <div className="scrim t" />
        <div className="chip tl"><span className="pill">{photo.name}</span></div>
        {photo.isBurst && (
          <div className="chip tr"><span className="pill burst">⚡ {photo.burstName} · {photo.frame + 1}/{photo.frames}</span></div>
        )}
        {showMeta && !photo.real && (
          <>
            <div className="scrim b" />
            <div className="sharp">
              <span>SHARP</span>
              <span className="bar"><i style={{ width: `${Math.round(photo.sharp * 100)}%`, background: sharpColor(photo.sharp) }} /></span>
              <span>{Math.round(photo.sharp * 100)}</span>
            </div>
          </>
        )}
        {variant === "leaving" && <div className={`stamp show ${dir}`}>{dir === "keep" ? "KEEP" : "REJECT"}</div>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- start */
async function collectDirectoryFiles(directoryHandle) {
  const files = [];

  async function visit(handle) {
    for await (const entry of handle.values()) {
      if (entry.kind === "file") files.push(await entry.getFile());
      else if (entry.kind === "directory") await visit(entry);
    }
  }

  await visit(directoryHandle);
  return files;
}

function StartScreen({ onDemo, onFolder, onImport }) {
  const inputRef = useRef(null);
  const importRef = useRef(null);
  const chooseFolder = async () => {
    if (typeof window.showDirectoryPicker !== "function") {
      inputRef.current?.click();
      return;
    }

    try {
      const directory = await window.showDirectoryPicker({ mode: "read" });
      const files = await collectDirectoryFiles(directory);
      onFolder(files, directory.name);
    } catch (error) {
      if (error?.name !== "AbortError") inputRef.current?.click();
    }
  };

  return (
    <div className="start">
      <div className="box">
        <div className="logo"><span className="dot" /><span>CULL</span></div>
        <h1>Cull a shoot in minutes, not hours.</h1>
        <p className="lede">One frame at a time, full-size. Keep it or drop it with a single key.
          Burst sequences are grouped so you can spot the sharp one fast.</p>
        <div className="actions">
          <button className="btn primary big" onClick={chooseFolder}>Choose a folder…</button>
          <button className="btn big" onClick={onDemo}>Try a demo shoot</button>
          <input ref={inputRef} type="file" webkitdirectory="" directory="" multiple
            style={{ display: "none" }} onChange={(e) => onFolder(e.target.files)} />
        </div>
        <div className="import-row">
          <button className="btn ghost" onClick={() => importRef.current.click()}>↥ Import a saved list…</button>
          <input ref={importRef} type="file" accept=".txt,.json,text/plain,application/json"
            style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) onImport(e.target.files[0]); e.target.value = ""; }} />
        </div>
        <div className="keys">
          <div className="k"><div className="row"><span className="kbd">←</span></div><span>Reject</span></div>
          <div className="k"><div className="row"><span className="kbd">→</span></div><span>Keep</span></div>
          <div className="k"><div className="row"><span className="kbd">Space</span></div><span>Compare burst</span></div>
          <div className="k"><div className="row"><span className="kbd">Z</span></div><span>Undo</span></div>
        </div>
        <div className="hint-note">Everything stays on your machine — nothing is uploaded.</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- contact sheet */
function ContactSheet({ photos, current, decisions, onClose }) {
  const best = photos.reduce((a, b) => (b.sharp > a.sharp ? b : a), photos[0]);
  return (
    <div className="sheet" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <h3>{current.real ? "Burst" : `${current.burstName} burst`}</h3>
        <p className="sub">{photos.length} frames · press Space or Esc to close{!current.real ? " · sharpest is highlighted" : ""}</p>
        <div className="grid">
          {photos.map((p) => {
            const v = decisions[p.id];
            return (
              <div key={p.id} className={`shot grain ${!p.real && p.id === best.id ? "best" : ""} ${p.id === current.id ? "best" : ""}`}>
                <Fill p={p} cls="sf" blurScale={0.6} previewWidth={400} previewHeight={267} />
                <span className="tag">{p.name}{p.frames > 1 ? ` · ${p.frame + 1}` : ""}</span>
                {v && <span className="crown" style={{ color: v === "keep" ? "var(--keep)" : "var(--reject)" }}>{v.toUpperCase()}</span>}
                {!v && !p.real && p.id === best.id && <span className="crown">SHARPEST</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- cull */
export function CullScreen({ queue, allPhotos, cursor, decisions, leaving, t, passLabel, onDecide, onUndo, onReview, sheet, onSheet }) {
  const cur = queue[cursor];
  const next = queue[cursor + 1];
  const photosByBurst = useMemo(() => {
    const groups = new Map();
    allPhotos.forEach((photo) => {
      const group = groups.get(photo.burst);
      if (group) group.push(photo);
      else groups.set(photo.burst, [photo]);
    });
    return groups;
  }, [allPhotos]);
  const burstPhotos = cur ? photosByBurst.get(cur.burst) || [] : [];
  const stripPhotos = useMemo(() => {
    if (!cur || burstPhotos.length <= 9) return burstPhotos;
    const currentIndex = burstPhotos.findIndex((photo) => photo.id === cur.id);
    const start = Math.max(0, Math.min(currentIndex - 4, burstPhotos.length - 9));
    return burstPhotos.slice(start, start + 9);
  }, [burstPhotos, cur]);
  const kept = queue.filter((p) => decisions[p.id] === "keep").length;
  const pct = Math.round((cursor / queue.length) * 100);

  return (
    <div className="app" style={{ "--fly": (t.fly || 320) + "ms" }}>
      <div className="topbar">
        <div className="brand"><span className="dot" /> CULL</div>
        {passLabel
          ? <div className="pass-chip">{passLabel} · {queue.length} frames</div>
          : <div className="folder">📁 <b>{t._folder}</b></div>}
        <div className="spacer" />
        <div className="counter"><b>{cursor}</b> / {queue.length} {passLabel ? "reviewed" : "judged"} · <b>{kept}</b> kept</div>
        <div className="legend"><span className="kbd">←</span> reject <span className="kbd">→</span> keep <span className="kbd">Z</span> undo</div>
        <button className="btn" onClick={onReview}>Review →</button>
      </div>
      <div className="progress"><i style={{ width: pct + "%" }} /></div>

      <div className="stage">
        <div className="edge left"><span className="chev">‹</span><span className="lbl">REJECT</span></div>
        <div className="edge right"><span className="chev">›</span><span className="lbl">KEEP</span></div>
        <div className="deck">
          {next && <Card key={next.id} photo={next} variant="peek" t={t} />}
          {cur && <Card key={cur.id} photo={cur} variant="front" t={t} anim />}
          {leaving && <Card key={leaving.photo.id} photo={leaving.photo} variant="leaving" dir={leaving.dir} t={t} />}
        </div>
        {sheet && cur && <ContactSheet photos={burstPhotos} current={cur} decisions={decisions} onClose={() => onSheet(false)} />}
      </div>

      {t.strip !== false && (
        <div className="strip-wrap">
          {cur && cur.isBurst ? (
            <>
              <div className="strip-label">Burst — <b>{cur.burstName}</b> · frame {cur.frame + 1} of {cur.frames}</div>
              <div className="strip">
                {stripPhotos.map((p) => {
                  const v = decisions[p.id];
                  return (
                    <div key={p.id} className={`tn ${p.id === cur.id ? "cur" : ""} ${!v && p.id !== cur.id ? "future" : ""}`}>
                      <Fill p={p} cls="tnfill" blurScale={0.4} previewWidth={160} previewHeight={107} />
                      {v && <span className={`sdot ${v}`} />}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="strip-label">{cur ? "Single frame — not part of a burst" : ""}</div>
          )}
        </div>
      )}

      <div className="footer">
        <button className="act reject" onClick={() => onDecide("reject")}><span className="ico">✕</span> Reject <small>←</small></button>
        <button className="act undo" onClick={onUndo} disabled={cursor === 0}>↩ Undo <small>Z</small></button>
        <button className="act keep" onClick={() => onDecide("keep")}><span className="ico">✓</span> Keep <small>→</small></button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- lightbox (big keep/reject view) */
function BigView({ photo, idx, total, verdict, t, onClose, onPrev, onNext, onReclassify }) {
  const showMeta = t.meta !== false && !photo.real;
  const classify = (nextVerdict) => {
    onReclassify(photo.id, nextVerdict);
    if (idx < total - 1) onNext();
  };
  return (
    <div className="sheet lb" onClick={onClose}>
      <div className="lb-stage" onClick={(e) => e.stopPropagation()}>
        <button className="lb-nav prev" onClick={onPrev} disabled={idx <= 0} aria-label="Previous">‹</button>
        <div className="lb-card grain">
          <div className="photo">
            <Fill p={photo} cls="lb-fill" fit="contain" />
            <div className="scrim t" />
            <div className="chip tl"><span className="pill">{photo.name}</span></div>
            {photo.isBurst && <div className="chip tr"><span className="pill burst">⚡ {photo.burstName} · {photo.frame + 1}/{photo.frames}</span></div>}
            {verdict && <div className={`lb-badge ${verdict}`}>{verdict.toUpperCase()}</div>}
            {showMeta && (
              <>
                <div className="scrim b" />
                <div className="sharp">
                  <span>SHARP</span>
                  <span className="bar"><i style={{ width: `${Math.round(photo.sharp * 100)}%`, background: sharpColor(photo.sharp) }} /></span>
                  <span>{Math.round(photo.sharp * 100)}</span>
                </div>
              </>
            )}
          </div>
          <div className="lb-actions">
            <button className="act reject" onClick={() => classify("reject")}><span className="ico">✕</span> Reject <small>R</small></button>
            <button className="act keep" onClick={() => classify("keep")}><span className="ico">✓</span> Keep <small>K</small></button>
          </div>
        </div>
        <button className="lb-nav next" onClick={onNext} disabled={idx >= total - 1} aria-label="Next">›</button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- review */
const GRID_GAP = 16;
const GRID_MIN_COLUMN_WIDTH = 190;
const GRID_CAP_HEIGHT = 34;
const GRID_PADDING_X = 36;
const GRID_PADDING_Y = 24;
const GRID_OVERSCAN_ROWS = 2;
const GRID_FALLBACK_WIDTH = 900;
const GRID_FALLBACK_HEIGHT = 600;

function ReviewCard({ p, decisions, sel, onSelect, onReclassify, onLightbox, style }) {
  const dec = decisions[p.id];
  return (
    <div className={`gcard ${sel === p.id ? "sel" : ""}`} style={style}
      onClick={() => onSelect(p.id)} onDoubleClick={() => onLightbox(p.id)}
      title="Click to select · double-click to enlarge">
      <div className="gp grain">
        <Fill p={p} cls="gf" blurScale={0.5} previewWidth={480} previewHeight={320} />
        <span className="v" style={{ background: dec === "keep" ? "var(--keep)" : dec === "reject" ? "var(--reject)" : "var(--line-2)" }} />
        <div className="qa">
          <button className={`qbtn r ${dec === "reject" ? "on" : ""}`}
            onClick={(e) => { e.stopPropagation(); onReclassify(p.id, "reject"); }}>R · Reject</button>
          <button className={`qbtn k ${dec === "keep" ? "on" : ""}`}
            onClick={(e) => { e.stopPropagation(); onReclassify(p.id, "keep"); }}>K · Keep</button>
        </div>
      </div>
      <div className="cap"><span>{p.name}</span>{p.isBurst && <span>{p.burstName} {p.frame + 1}/{p.frames}</span>}</div>
    </div>
  );
}

function VirtualizedPhotoGrid({ photos, decisions, sel, onSelect, onReclassify, onLightbox }) {
  const gridRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewport, setViewport] = useState({
    width: GRID_FALLBACK_WIDTH,
    height: GRID_FALLBACK_HEIGHT,
  });

  const measure = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const width = grid.clientWidth || GRID_FALLBACK_WIDTH;
    const height = grid.clientHeight || GRID_FALLBACK_HEIGHT;
    setViewport((current) => current.width === width && current.height === height
      ? current
      : { width, height });
  }, []);

  useEffect(() => {
    measure();
    const grid = gridRef.current;
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    if (grid && observer) observer.observe(grid);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  if (photos.length === 0) {
    return <div className="rv-grid" ref={gridRef}><div className="empty">Nothing here yet.</div></div>;
  }

  const contentWidth = Math.max(GRID_MIN_COLUMN_WIDTH, viewport.width - GRID_PADDING_X * 2);
  const columnCount = Math.max(1, Math.floor((contentWidth + GRID_GAP) / (GRID_MIN_COLUMN_WIDTH + GRID_GAP)));
  const columnWidth = (contentWidth - GRID_GAP * (columnCount - 1)) / columnCount;
  const cardHeight = columnWidth / 1.5 + GRID_CAP_HEIGHT;
  const rowHeight = cardHeight + GRID_GAP;
  const rowCount = Math.ceil(photos.length / columnCount);
  const canvasHeight = GRID_PADDING_Y * 2 + rowCount * cardHeight + Math.max(0, rowCount - 1) * GRID_GAP;
  const effectiveScrollTop = Math.min(scrollTop, Math.max(0, canvasHeight - viewport.height));
  const startRow = Math.max(0, Math.floor((effectiveScrollTop - GRID_PADDING_Y) / rowHeight) - GRID_OVERSCAN_ROWS);
  const endRow = Math.min(
    rowCount,
    Math.ceil((effectiveScrollTop + viewport.height - GRID_PADDING_Y) / rowHeight) + GRID_OVERSCAN_ROWS,
  );
  const startIndex = startRow * columnCount;
  const endIndex = Math.min(photos.length, endRow * columnCount);
  const visiblePhotos = photos.slice(startIndex, endIndex);

  return (
    <div className="rv-grid" ref={gridRef} onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
      <div className="rv-grid-canvas" style={{ height: canvasHeight }}>
        {visiblePhotos.map((p, offset) => {
          const index = startIndex + offset;
          const row = Math.floor(index / columnCount);
          const column = index % columnCount;
          return (
            <ReviewCard key={p.id} p={p} decisions={decisions} sel={sel}
              onSelect={onSelect} onReclassify={onReclassify} onLightbox={onLightbox}
              style={{
                top: GRID_PADDING_Y + row * rowHeight,
                left: GRID_PADDING_X + column * (columnWidth + GRID_GAP),
                width: columnWidth,
                height: cardHeight,
              }} />
          );
        })}
      </div>
    </div>
  );
}

export function ReviewScreen({ photos, decisions, t, onBack, onRestart, onRefine, onSave, onImport, toast,
  sel, onSelect, onReclassify, lightbox, onLightbox }) {
  const [tab, setTab] = useState("keep");
  const importRef = useRef(null);
  const { keeps, rejects, pending } = useMemo(() => {
    const groups = { keeps: [], rejects: [], pending: [] };
    photos.forEach((p) => {
      if (decisions[p.id] === "keep") groups.keeps.push(p);
      else if (decisions[p.id] === "reject") groups.rejects.push(p);
      else groups.pending.push(p);
    });
    return groups;
  }, [photos, decisions]);
  const shown = tab === "keep" ? keeps : tab === "reject" ? rejects : pending;
  const list = useMemo(() => keeps.map((p) => p.name).join("\n"), [keeps]);
  const numberedList = useMemo(() => keeps.map((p, i) => `${String(i + 1).padStart(3, "0")}  ${p.name}`).join("\n"), [keeps]);
  const lbPhoto = lightbox != null ? photos.find((p) => p.id === lightbox) : null;
  const lbIdx = lbPhoto ? photos.findIndex((p) => p.id === lightbox) : -1;

  const copy = () => { navigator.clipboard.writeText(list); toast("Copied " + keeps.length + " filenames"); };
  const download = () => {
    const blob = new Blob([list + "\n"], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "keepers.txt"; a.click(); URL.revokeObjectURL(a.href);
    toast("Downloaded keepers.txt");
  };

  return (
    <div className="review">
      <div className="rv-head">
        <div>
          <h2>You kept <b>{keeps.length}</b> of {photos.length}</h2>
          <p>{rejects.length} rejected{pending.length ? ` · ${pending.length} still to judge` : ""} · {keeps.length ? Math.round(keeps.length/photos.length*100) : 0}% selection rate</p>
          <p className="rv-tip">Click a frame, then <b>K</b>/<b>R</b> to re-file · or use the on-card buttons · double-click to enlarge</p>
        </div>
        <div className="tabs">
          <button className={`tab ${tab === "keep" ? "on" : ""}`} onClick={() => setTab("keep")}><span className="sdot keep" style={{position:"static",width:8,height:8,border:"none",borderRadius:99,background:"var(--keep)"}} /> Keeps <span className="n">{keeps.length}</span></button>
          <button className={`tab ${tab === "reject" ? "on" : ""}`} onClick={() => setTab("reject")}>Rejects <span className="n">{rejects.length}</span></button>
          {pending.length > 0 && <button className={`tab ${tab === "pending" ? "on" : ""}`} onClick={() => setTab("pending")}>To do <span className="n">{pending.length}</span></button>}
        </div>
      </div>
      <div className="rv-body">
        <VirtualizedPhotoGrid key={tab} photos={shown} decisions={decisions} sel={sel}
          onSelect={onSelect} onReclassify={onReclassify} onLightbox={onLightbox} />
        <div className="rv-side">
          <div className="sh"><h4>Keepers — filename list</h4><p>{keeps.length} files, in shoot order</p></div>
          <pre className="codeblock">{keeps.length === 0 ? "— no keepers yet —" : numberedList}</pre>
          <div className="tools">
            <button className="btn primary" onClick={copy} disabled={!keeps.length}>Copy list</button>
            <button className="btn" onClick={download} disabled={!keeps.length}>Download .txt</button>
            <button className="btn" onClick={onSave} disabled={!keeps.length && !rejects.length}>Save .json</button>
          </div>
        </div>
      </div>
      <div className="rv-foot">
        <button className="btn" onClick={onBack} disabled={pending.length === 0}>{pending.length ? `← Judge remaining ${pending.length}` : "All judged"}</button>
        <div className="pass-actions">
          {tab === "keep" && keeps.length > 1 && (
            <button className="btn primary" onClick={() => onRefine("keep")}>↻ Cull these {keeps.length} keeps again</button>
          )}
          {tab === "reject" && rejects.length > 0 && (
            <button className="btn primary" onClick={() => onRefine("reject")}>↻ Reconsider these {rejects.length} rejects</button>
          )}
          {tab === "pending" && pending.length > 0 && (
            <button className="btn primary" onClick={onBack}>→ Judge remaining {pending.length}</button>
          )}
        </div>
        <div className="spacer" />
        <button className="btn ghost" onClick={() => importRef.current.click()}>↥ Import…</button>
        <input ref={importRef} type="file" accept=".txt,.json,text/plain,application/json"
          style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) onImport(e.target.files[0]); e.target.value = ""; }} />
        <button className="btn ghost" onClick={onRestart}>Start over</button>
      </div>
      {lbPhoto && (
        <BigView photo={lbPhoto} idx={lbIdx} total={photos.length} verdict={decisions[lbPhoto.id]} t={t}
          onClose={() => onLightbox(null)}
          onPrev={() => lbIdx > 0 && onLightbox(photos[lbIdx - 1].id)}
          onNext={() => lbIdx < photos.length - 1 && onLightbox(photos[lbIdx + 1].id)}
          onReclassify={onReclassify} />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- root */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "fly": 320,
  "meta": true,
  "strip": true,
  "bg": "cool",
  "keep": "#1f8a5b",
  "reject": "#d4493a"
}/*EDITMODE-END*/;

export function buildFromFiles(files) {
  const maxBurstFrames = 20;
  const imgs = Array.from(files).filter((f) => /^image\//.test(f.type) || /\.(jpe?g|png|webp|gif|tiff?|heic)$/i.test(f.name));
  imgs.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  // group bursts by lastModified gaps (< 2.5s ⇒ same burst)
  const photos = []; let burst = -1; let lastT = -1e15; let frame = 0; const groups = [];
  imgs.forEach((f) => {
    const tm = f.lastModified || 0;
    if (Math.abs(tm - lastT) > 2500 || frame >= maxBurstFrames) { burst++; frame = 0; groups[burst] = 0; }
    lastT = tm;
    const p = { id: "r" + photos.length, real: true, file: f, name: f.name,
      burst, frame, burstName: "burst " + (burst + 1) };
    groups[burst]++; p.frame = frame++; photos.push(p);
  });
  photos.forEach((p) => { p.frames = groups[p.burst]; p.isBurst = groups[p.burst] > 1; p.sharp = 0; });
  return photos;
}

export default function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [source, setSource] = useState(null);          // 'demo' | 'folder'
  const [folderName, setFolderName] = useState("");
  const [photos, setPhotos] = useState([]);
  const [queue, setQueue] = useState([]);              // active pass list
  const [passLabel, setPassLabel] = useState(null);    // null = full first pass
  const [decisions, setDecisions] = useState({});
  const [history, setHistory] = useState([]);
  const [cursor, setCursor] = useState(0);
  const [screen, setScreen] = useState("start");        // start | cull | review
  const [leaving, setLeaving] = useState(null);
  const [sheet, setSheet] = useState(false);
  const [reviewSel, setReviewSel] = useState(null);   // selected frame on review screen
  const [lightbox, setLightbox] = useState(null);     // photo id open in big view
  const [toastMsg, setToastMsg] = useState(null);
  const lock = useRef(false);

  // apply theme tweaks
  useEffect(() => {
    document.body.dataset.bg = t.bg || "cool";
    document.documentElement.style.setProperty("--keep", t.keep);
    document.documentElement.style.setProperty("--reject", t.reject);
  }, [t.bg, t.keep, t.reject]);

  // persist demo session
  useEffect(() => {
    if (source !== "demo") return;
    localStorage.setItem("cull.demo", JSON.stringify({
      decisions, history, cursor, screen, passLabel, passIds: queue.map((p) => p.id),
    }));
  }, [source, decisions, history, cursor, screen, passLabel, queue]);

  const startDemo = useCallback(() => {
    const ph = PhotoData.build();
    setPhotos(ph); setSource("demo"); setFolderName("demo-shoot-2026");
    const saved = JSON.parse(localStorage.getItem("cull.demo") || "null");
    if (saved && saved.decisions) {
      setDecisions(saved.decisions); setHistory(saved.history || []);
      setCursor(saved.cursor || 0);
      setPassLabel(saved.passLabel || null);
      const q = (saved.passIds && saved.passIds.length)
        ? saved.passIds.map((id) => ph.find((p) => p.id === id)).filter(Boolean) : ph;
      setQueue(q.length ? q : ph);
      setScreen(saved.screen === "review" ? "review" : "cull");
    } else {
      setDecisions({}); setHistory([]); setCursor(0); setPassLabel(null); setQueue(ph); setScreen("cull");
    }
  }, []);

  const startFolder = useCallback((files, selectedFolderName) => {
    const ph = buildFromFiles(files);
    if (!ph.length) { setToastMsg("No images found in that folder"); return; }
    let fname = selectedFolderName || "selected folder";
    if (files[0] && files[0].webkitRelativePath) fname = files[0].webkitRelativePath.split("/")[0];
    setPhotos(ph); setSource("folder"); setFolderName(fname);
    setDecisions({}); setHistory([]); setCursor(0); setPassLabel(null); setQueue(ph); setScreen("cull");
  }, []);

  // start a focused re-cull over a subset (e.g. just the keeps, or just the rejects)
  const startPass = useCallback((ids, label) => {
    if (!ids.length) return;
    const q = ids.map((id) => photos.find((p) => p.id === id)).filter(Boolean);
    if (!q.length) return;
    setQueue(q); setPassLabel(label); setHistory([]); setCursor(0); setScreen("cull");
  }, [photos]);

  const refine = useCallback((verdict) => {
    const ids = photos.filter((p) => decisions[p.id] === verdict).map((p) => p.id);
    startPass(ids, verdict === "keep" ? "Refining keeps" : "Reconsidering rejects");
  }, [photos, decisions, startPass]);

  // export the whole decision set, keyed by filename so it survives re-import
  const saveSession = useCallback(() => {
    const byName = {};
    photos.forEach((p) => { if (decisions[p.id]) byName[p.name] = decisions[p.id]; });
    const data = { app: "cull", version: 1, folder: folderName, savedAt: new Date().toISOString(), decisions: byName };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "cull-session.json"; a.click(); URL.revokeObjectURL(a.href);
    setToastMsg("Saved cull-session.json");
  }, [photos, decisions, folderName]);

  // import a saved .json session or a plain keeper .txt; resume on the review screen
  const importList = useCallback(async (file) => {
    let text = "";
    try { text = await file.text(); } catch { setToastMsg("Couldn't read that file"); return; }
    let map = {};
    try {
      const j = JSON.parse(text);
      if (Array.isArray(j)) j.forEach((n) => { map[String(n).trim()] = "keep"; });
      else if (j && j.decisions) map = j.decisions;
      else if (j && typeof j === "object") map = j;
    } catch {
      text.split(/\r?\n/).map((s) => s.trim()).filter((s) => s && !s.startsWith("#")).forEach((n) => { map[n] = "keep"; });
    }
    // need photos to map filenames onto — fall back to the demo set
    let ph = photos;
    if (!ph.length) {
      ph = PhotoData.build();
      setPhotos(ph); setSource("demo"); setFolderName("demo-shoot-2026");
    }
    const norm = (v) => (String(v).toLowerCase().startsWith("r") ? "reject" : "keep");
    const dec = {}; let matched = 0;
    ph.forEach((p) => { if (map[p.name]) { dec[p.id] = norm(map[p.name]); matched++; } });
    if (!matched) { setToastMsg("No matching filenames in that list"); return; }
    setDecisions(dec); setHistory([]); setCursor(0); setPassLabel(null); setQueue(ph); setScreen("review");
    setToastMsg(`Imported ${matched} decision${matched === 1 ? "" : "s"}`);
  }, [photos]);

  const decide = useCallback((dir) => {
    if (lock.current || screen !== "cull") return;
    const p = queue[cursor]; if (!p) return;
    lock.current = true;
    setHistory((h) => [...h, { id: p.id, prev: decisions[p.id] }]);
    setDecisions((d) => ({ ...d, [p.id]: dir }));
    setLeaving({ photo: p, dir });
    const nxt = cursor + 1; setCursor(nxt);
    setTimeout(() => {
      setLeaving(null); lock.current = false;
      if (nxt >= queue.length) setScreen("review");
    }, (t.fly || 320));
  }, [screen, queue, cursor, decisions, t.fly]);

  const undo = useCallback(() => {
    if (lock.current) return;
    setHistory((h) => {
      if (!h.length) return h;
      const last = h[h.length - 1];
      setDecisions((d) => { const n = { ...d }; if (last.prev === undefined) delete n[last.id]; else n[last.id] = last.prev; return n; });
      const idx = queue.findIndex((p) => p.id === last.id);
      if (idx >= 0) setCursor(idx);
      setScreen("cull");
      return h.slice(0, -1);
    });
  }, [queue]);

  const restart = useCallback(() => {
    localStorage.removeItem("cull.demo");
    setDecisions({}); setHistory([]); setCursor(0); setScreen("start");
    setSource(null); setPhotos([]); setQueue([]); setPassLabel(null);
    setReviewSel(null); setLightbox(null);
  }, []);

  const showToast = useCallback((m) => { setToastMsg(m); setTimeout(() => setToastMsg(null), 2000); }, []);

  // re-file a single frame into the other group from the review screen
  const reclassify = useCallback((id, verdict) => {
    setDecisions((d) => (d[id] === verdict ? d : { ...d, [id]: verdict }));
    showToast(verdict === "keep" ? "Moved to Keeps" : "Moved to Rejects");
  }, [showToast]);

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (screen === "cull") {
        if (sheet) { if (e.key === " " || e.key === "Escape") { e.preventDefault(); setSheet(false); } return; }
        if (e.key === "ArrowRight") { e.preventDefault(); decide("keep"); }
        else if (e.key === "ArrowLeft") { e.preventDefault(); decide("reject"); }
        else if (e.key === "z" || e.key === "Z" || e.key === "Backspace") { e.preventDefault(); undo(); }
        else if (e.key === " ") { e.preventDefault(); const c = queue[cursor]; if (c && c.isBurst) setSheet(true); }
        else if (e.key === "Enter") { e.preventDefault(); setScreen("review"); }
      } else if (screen === "review") {
        if (lightbox != null) {
          const idx = photos.findIndex((p) => p.id === lightbox);
          if (e.key === "Escape") { e.preventDefault(); setLightbox(null); }
          else if (e.key === "ArrowLeft") { e.preventDefault(); if (idx > 0) setLightbox(photos[idx - 1].id); }
          else if (e.key === "ArrowRight") { e.preventDefault(); if (idx < photos.length - 1) setLightbox(photos[idx + 1].id); }
          else if (e.key === "k" || e.key === "K") { e.preventDefault(); reclassify(lightbox, "keep"); }
          else if (e.key === "r" || e.key === "R") { e.preventDefault(); reclassify(lightbox, "reject"); }
          return;
        }
        if (reviewSel != null && (e.key === "k" || e.key === "K")) { e.preventDefault(); reclassify(reviewSel, "keep"); return; }
        if (reviewSel != null && (e.key === "r" || e.key === "R")) { e.preventDefault(); reclassify(reviewSel, "reject"); return; }
        if (reviewSel != null && e.key === "Enter") { e.preventDefault(); setLightbox(reviewSel); return; }
        if (e.key === "Escape") {
          if (reviewSel != null) { setReviewSel(null); return; }
          if (Object.keys(decisions).length < photos.length) setScreen("cull");
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, sheet, decide, undo, queue, cursor, decisions, photos, reviewSel, lightbox, reclassify]);

  return (
    <>
      {screen === "start" && <StartScreen onDemo={startDemo} onFolder={startFolder} onImport={importList} />}
      {screen === "cull" && (
        <CullScreen queue={queue} allPhotos={photos} cursor={cursor} decisions={decisions} leaving={leaving}
          t={{ ...t, _folder: folderName }} passLabel={passLabel} onDecide={decide} onUndo={undo}
          onReview={() => setScreen("review")} sheet={sheet} onSheet={setSheet} />
      )}
      {screen === "review" && (
        <ReviewScreen photos={photos} decisions={decisions} t={t}
          sel={reviewSel} onSelect={setReviewSel} onReclassify={reclassify}
          lightbox={lightbox} onLightbox={setLightbox}
          onBack={() => { setLightbox(null); const idx = photos.findIndex((p) => !decisions[p.id]); setQueue(photos); setPassLabel(null); setHistory([]); setCursor(idx < 0 ? 0 : idx); setScreen("cull"); }}
          onRestart={restart} onRefine={refine} onSave={saveSession} onImport={importList} toast={showToast} />
      )}

      {toastMsg && <div className="toast">{toastMsg}</div>}

      <TweaksPanel>
        <TweakSection label="Feel" />
        <TweakSlider label="Swipe speed" value={t.fly} min={150} max={500} step={10} unit="ms"
          onChange={(v) => setTweak("fly", v)} />
        <TweakToggle label="Sharpness meter" value={t.meta} onChange={(v) => setTweak("meta", v)} />
        <TweakToggle label="Burst filmstrip" value={t.strip} onChange={(v) => setTweak("strip", v)} />
        <TweakSection label="Look" />
        <TweakRadio label="Background" value={t.bg} options={["cool", "warm", "paper"]} onChange={(v) => setTweak("bg", v)} />
        <TweakColor label="Keep" value={t.keep} options={["#1f8a5b", "#2f7d3f", "#0f766e", "#3b6ea5"]} onChange={(v) => setTweak("keep", v)} />
        <TweakColor label="Reject" value={t.reject} options={["#d4493a", "#c2410c", "#b8275f", "#9333ea"]} onChange={(v) => setTweak("reject", v)} />
        <TweakSection label="Session" />
        <TweakButton label="Restart from start screen" onClick={restart} />
      </TweaksPanel>
    </>
  );
}

const styleEl = document.getElementById("app-styles") || document.createElement("style");
styleEl.id = "app-styles";
styleEl.textContent = CSS;
if (!styleEl.isConnected) document.head.appendChild(styleEl);
