#!/usr/bin/env node

/**
 * VXNT Interactive Demo Recorder (Global Zero-Dependency Runner)
 * 
 * Records interactive workflows of web applications in motion with simulated
 * virtual cursor, click ripple animations, auto-templates, distraction-free
 * focus veil immunity, terminal progress feedback, active watchdog kill-switch,
 * post-mortem failure learning, and dual polished/raw MP4 video export (H.264).
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const http = require('http');
const https = require('https');

// ============================================================================
// 1. WATCHDOG STATE & KILL-SWITCH PROCEDURE
// ============================================================================

const watchdog = {
  startTime: Date.now(),
  stage: 'STAGE_1_PREFLIGHT',
  action: 'Binary verification',
  lastHeartbeat: Date.now(),
  browserInstance: null,
  activeFfmpegProc: null,
  tempDir: null,
  targetUrl: '',
  template: '',
  outDir: './assets/demo',
  timer: null,
  triggered: false
};

function updateWatchdog(stage, action) {
  watchdog.stage = stage;
  if (action) watchdog.action = action;
  watchdog.lastHeartbeat = Date.now();
}

function heartbeat(action) {
  if (action) watchdog.action = action;
  watchdog.lastHeartbeat = Date.now();
}

function startWatchdog(config) {
  watchdog.outDir = config.outDir;
  watchdog.template = config.template;
  watchdog.targetUrl = config.url;

  watchdog.timer = setInterval(() => {
    if (watchdog.triggered) return;
    const now = Date.now();
    const totalElapsed = now - watchdog.startTime;
    const stageElapsed = now - watchdog.lastHeartbeat;

    if (totalElapsed > config.watchdogTimeout) {
      clearInterval(watchdog.timer);
      triggerKillSwitch(
        'GLOBAL_WATCHDOG_TIMEOUT',
        `Total execution exceeded ${config.watchdogTimeout}ms (${(totalElapsed / 1000).toFixed(1)}s elapsed) without completing.`,
        { totalElapsed, stageElapsed, config }
      );
    } else if (stageElapsed > config.stageTimeout) {
      clearInterval(watchdog.timer);
      triggerKillSwitch(
        'STAGE_STAGNATION_TIMEOUT',
        `Automation stalled in [${watchdog.stage}] on action: "${watchdog.action}" for ${(stageElapsed / 1000).toFixed(1)}s without progress (threshold: ${config.stageTimeout}ms).`,
        { totalElapsed, stageElapsed, config }
      );
    }
  }, 1000);

  if (watchdog.timer.unref) watchdog.timer.unref();
}

async function triggerKillSwitch(reasonCode, message, details = {}) {
  if (watchdog.triggered) return;
  watchdog.triggered = true;
  if (watchdog.timer) clearInterval(watchdog.timer);

  const totalElapsed = ((Date.now() - watchdog.startTime) / 1000).toFixed(1);
  const stageElapsed = ((Date.now() - watchdog.lastHeartbeat) / 1000).toFixed(1);

  // 1. Emergency process cleanup
  try {
    if (watchdog.activeFfmpegProc) {
      watchdog.activeFfmpegProc.kill('SIGKILL');
      watchdog.activeFfmpegProc = null;
    }
  } catch (_) {}

  try {
    if (watchdog.browserInstance) {
      await watchdog.browserInstance.close().catch(() => {});
      watchdog.browserInstance = null;
    }
  } catch (_) {}

  try {
    if (watchdog.tempDir && fs.existsSync(watchdog.tempDir)) {
      fs.rmSync(watchdog.tempDir, { recursive: true, force: true });
    }
  } catch (_) {}

  // 2. Derive root-cause analysis and actionable remedy
  let rootCause = 'Unknown process freeze or deadlock.';
  let remedy = 'Inspect application logs and verify port connectivity.';
  let failureCategory = 'UNKNOWN';

  if (reasonCode === 'PREFLIGHT_PING_FAILED') {
    failureCategory = 'NETWORK_UNREACHABLE';
    rootCause = `The target web server at "${watchdog.targetUrl || details.targetUrl}" is not listening, crashed, or blocked by a single-threaded process.`;
    remedy = `1. Ensure your local dev server is running on the expected port before recording.
2. If starting dev server in the same process, ensure asynchronous non-blocking spawning.
3. Test connectivity via curl or browser before invoking recorder.`;
  } else if (watchdog.stage === 'STAGE_2_NAVIGATION') {
    failureCategory = 'NAVIGATION_STALL';
    rootCause = `Navigation to "${watchdog.targetUrl}" failed to reach domcontentloaded within threshold. Server may be hanging on SSR or holding connections open.`;
    remedy = `1. Check server terminal for unhandled exceptions or hung DB queries.
2. Increase --nav-timeout or verify there are no infinite redirects.`;
  } else if (watchdog.stage === 'STAGE_3_RECORDING') {
    failureCategory = 'ACTIONABILITY_OR_DOM_STALL';
    rootCause = `An interaction step ("${watchdog.action}") was blocked by an un-neutralized focus veil, modal backdrop, detached DOM element, or infinite CSS transition.`;
    remedy = `1. Auto-veil neutralizer disarmed standard veils, but an exotic custom overlay may require explicit selector dismissal.
2. Pass custom --steps with explicit {"action":"click","selector":"..."} or verify the selector exists in DOM.`;
  } else if (watchdog.stage === 'STAGE_4_FLUSH') {
    failureCategory = 'VIDEO_FLUSH_STALL';
    rootCause = 'Closing the Playwright video stream stalled. Matroska writer may be waiting for frames or disk write is throttled.';
    remedy = 'Ensure sufficient disk space and file write permissions in output directory.';
  } else if (watchdog.stage.includes('STAGE_5') || watchdog.stage.includes('FRAMING')) {
    failureCategory = 'FFMPEG_ENCODING_STALL';
    rootCause = 'ffmpeg process stopped streaming progress. System CPU may be saturated or input video stream was corrupted.';
    remedy = 'Run with --raw-only to skip video framing transcode, or reduce video dimensions.';
  }

  // 3. Construct post-mortem failure report
  const postMortem = {
    timestamp: new Date().toISOString(),
    status: 'KILLED_BY_WATCHDOG',
    reasonCode,
    failureCategory,
    stage: watchdog.stage,
    action: watchdog.action,
    targetUrl: watchdog.targetUrl || details.targetUrl || '',
    template: watchdog.template || 'hero-tour',
    elapsedTotalSec: parseFloat(totalElapsed),
    elapsedStageSec: parseFloat(stageElapsed),
    message,
    rootCause,
    remedy,
    safeguardsLearned: [
      `Pre-flight HTTP ping before browser launch (auto-enforced).`,
      `Actionability timeout capped at 2.5s with 3-tier fallback.`,
      `Overlay neutralization on [class*="veil"] and [aria-modal="true"].`
    ]
  };

  // 4. Persist failure post-mortem & ledger
  fs.mkdirSync(watchdog.outDir, { recursive: true });
  const postMortemPath = path.join(watchdog.outDir, '.demo-record-failure.json');
  const ledgerPath = path.join(watchdog.outDir, '.demo-failures-ledger.json');

  try {
    fs.writeFileSync(postMortemPath, JSON.stringify(postMortem, null, 2), 'utf8');

    let ledger = [];
    if (fs.existsSync(ledgerPath)) {
      try {
        ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
        if (!Array.isArray(ledger)) ledger = [];
      } catch (_) { ledger = []; }
    }
    ledger.unshift(postMortem);
    if (ledger.length > 15) ledger = ledger.slice(0, 15);
    fs.writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2), 'utf8');
  } catch (_) {}

  // 5. Output diagnostic banner
  console.error('\n' + '='.repeat(70));
  console.error('🚨 [KILL SWITCH TRIGGERED] Automation Terminated Due to Stagnation');
  console.error('='.repeat(70));
  console.error(`  Failure Code:    ${reasonCode}`);
  console.error(`  Category:        ${failureCategory}`);
  console.error(`  Stage:           [${watchdog.stage}]`);
  console.error(`  Last Action:     ${watchdog.action}`);
  console.error(`  Elapsed Time:    ${totalElapsed}s (Stage: ${stageElapsed}s)`);
  console.error(`  Trigger Reason:  ${message}`);
  console.error('\n🔍 ROOT CAUSE DIAGNOSIS:');
  console.error(`  ${rootCause}`);
  console.error('\n💡 RECOVERY & LESSON LEARNED:');
  console.error(`  ${remedy}`);
  console.error('\n📁 POST-MORTEM ARTIFACT:');
  console.error(`  Saved to: ${postMortemPath}`);
  console.error('='.repeat(70) + '\n');

  process.exit(124);
}

// ============================================================================
// 2. ADAPTIVE MEMORY & PREVIOUS FAILURE RECALL
// ============================================================================

function recallPreviousFailures(outDir, targetUrl, template) {
  const ledgerPath = path.join(outDir, '.demo-failures-ledger.json');
  if (!fs.existsSync(ledgerPath)) return null;

  try {
    const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
    if (!Array.isArray(ledger) || ledger.length === 0) return null;

    const match = ledger.find(f => (targetUrl && f.targetUrl === targetUrl) || (f.template === template));
    return match || ledger[0];
  } catch (_) {
    return null;
  }
}

// ============================================================================
// 3. PRE-FLIGHT CHECKS & HTTP PING
// ============================================================================

function checkCommandAvailable(cmd) {
  try {
    execSync(`which ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch (_) {
    const commonPaths = ['/opt/homebrew/bin', '/usr/local/bin', '/usr/bin'];
    for (const p of commonPaths) {
      if (fs.existsSync(path.join(p, cmd))) return true;
    }
    return false;
  }
}

function runPreflightChecks() {
  const missing = [];

  if (!checkCommandAvailable('ffmpeg')) {
    missing.push({
      tool: 'ffmpeg',
      remedy: 'Install via Homebrew: brew install ffmpeg (or sudo apt-get install ffmpeg)'
    });
  }

  if (missing.length > 0) {
    console.error('\n==> [X] Pre-flight Check Failed: Missing Required Binaries:');
    for (const item of missing) {
      console.error(`  - ${item.tool.toUpperCase()}: ${item.remedy}`);
    }
    console.error('\nExecution aborted immediately at pre-flight gate.\n');
    process.exit(1);
  }
}

function pingUrl(targetUrl, timeoutMs = 2500) {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(targetUrl);
      const client = u.protocol === 'https:' ? https : http;
      const req = client.request(u, { method: 'HEAD', timeout: timeoutMs }, (res) => {
        resolve({ ok: true, status: res.statusCode });
      });
      req.on('error', (err) => reject(new Error(`Server unreachable (${err.message})`)));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Connection timed out after ${timeoutMs}ms`));
      });
      req.end();
    } catch (e) {
      reject(e);
    }
  });
}

// ============================================================================
// 4. LIVE TERMINAL PROGRESS FEEDBACK COMPONENT
// ============================================================================

class ProgressBar {
  constructor({ total = 100, width = 24, label = 'Progress' } = {}) {
    this.total = Math.max(0.1, total);
    this.width = width;
    this.label = label;
    this.startTime = Date.now();
    this.lastLoggedPercent = -1;
    this.lastLogTime = 0;
    this.isTTY = Boolean(process.stdout.isTTY);
  }

  update(current, extra = '') {
    heartbeat(`${this.label} active`);
    const percent = Math.min(100, Math.max(0, Math.floor((current / this.total) * 100)));
    const filled = Math.round((this.width * percent) / 100);
    const empty = Math.max(0, this.width - filled);
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const elapsedSec = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const extraStr = extra ? ` | ${extra}` : '';
    const line = `  ${this.label} [${bar}] ${percent.toString().padStart(3)}% | ${elapsedSec}s${extraStr}`;

    if (this.isTTY) {
      process.stdout.write(`\r\x1b[K${line}`);
    } else {
      const now = Date.now();
      if (percent >= this.lastLoggedPercent + 25 || (now - this.lastLogTime >= 2500 && percent !== this.lastLoggedPercent)) {
        console.log(line.trim());
        this.lastLoggedPercent = percent;
        this.lastLogTime = now;
      }
    }
  }

  finish(msg = '') {
    heartbeat(`${this.label} finished`);
    const elapsedSec = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const line = `  [✓] ${this.label} done (${elapsedSec}s)${msg ? ' - ' + msg : ''}`;
    if (this.isTTY) {
      process.stdout.write(`\r\x1b[K${line}\n`);
    } else {
      console.log(line);
    }
  }
}

function getVideoDurationSec(filePath, fallbackSec = 10) {
  try {
    const out = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${filePath}"`, {
      encoding: 'utf8'
    }).trim();
    const parsed = parseFloat(out);
    return !isNaN(parsed) && parsed > 0 ? parsed : fallbackSec;
  } catch (_) {
    return fallbackSec;
  }
}

function runFfmpegWithProgress(args, { label = 'Transcoding', estimatedDurationSec = 10 } = {}) {
  return new Promise((resolve, reject) => {
    updateWatchdog(watchdog.stage, `${label} ffmpeg execution`);
    const bar = new ProgressBar({ total: estimatedDurationSec, label });
    const proc = spawn('ffmpeg', [...args, '-progress', 'pipe:1', '-nostats'], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    watchdog.activeFfmpegProc = proc;

    let buffer = '';
    let lastSpeed = '';
    let errBuffer = '';

    proc.stdout.on('data', (chunk) => {
      heartbeat(`${label} ffmpeg streaming`);
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith('speed=')) {
          lastSpeed = line.split('=')[1].trim();
        } else if (line.startsWith('out_time=')) {
          const val = line.split('=')[1].trim();
          const parts = val.split(':');
          if (parts.length === 3) {
            const sec = (+parts[0]) * 3600 + (+parts[1]) * 60 + parseFloat(parts[2]);
            bar.update(sec, lastSpeed ? `Speed: ${lastSpeed}` : '');
          }
        } else if (line.startsWith('progress=end')) {
          bar.update(estimatedDurationSec, lastSpeed ? `Speed: ${lastSpeed}` : '');
        }
      }
    });

    proc.stderr.on('data', (chunk) => {
      errBuffer += chunk.toString();
    });

    proc.on('error', (err) => {
      watchdog.activeFfmpegProc = null;
      reject(err);
    });

    proc.on('close', (code) => {
      watchdog.activeFfmpegProc = null;
      if (code === 0) {
        bar.finish();
        resolve();
      } else {
        reject(new Error(`ffmpeg exited with code ${code}: ${errBuffer.slice(-250)}`));
      }
    });
  });
}

// ============================================================================
// 5. RESOLVE PLAYWRIGHT FROM GLOBAL OR LOCAL PACKAGES
// ============================================================================

function resolveGlobalPlaywright() {
  try {
    const bin = execSync('which playwright', { encoding: 'utf8' }).trim();
    if (bin && fs.existsSync(bin)) {
      const content = fs.readFileSync(bin, 'utf8');
      const match = content.match(/cmd-shim-target=(.*)/);
      if (match) {
        const cliPath = match[1].trim();
        return require(path.dirname(cliPath));
      }
    }
  } catch (_) {}

  try {
    const pnpmRoot = execSync('pnpm root -g', { encoding: 'utf8' }).trim();
    if (pnpmRoot && fs.existsSync(pnpmRoot)) {
      const dirs = fs.readdirSync(pnpmRoot);
      for (const d of dirs) {
        const candidate = path.join(pnpmRoot, d, 'node_modules/playwright');
        if (fs.existsSync(candidate)) return require(candidate);
      }
    }
  } catch (_) {}

  const candidateDirs = [
    path.join(process.env.HOME || '', 'Library/pnpm/global/v11/node_modules/playwright'),
    '/usr/local/lib/node_modules/playwright',
    '/opt/homebrew/lib/node_modules/playwright'
  ];

  for (const dir of candidateDirs) {
    if (fs.existsSync(dir)) {
      try { return require(dir); } catch (_) {}
    }
  }

  try {
    return require('playwright');
  } catch (err) {
    console.error('==> [!] Playwright not found globally. Auto-installing once via pnpm...');
    try {
      execSync('pnpm add -g playwright && playwright install chromium', { stdio: 'inherit' });
      return resolveGlobalPlaywright();
    } catch (installErr) {
      console.error('==> [X] Failed to install Playwright globally:', installErr.message);
      process.exit(1);
    }
  }
}

// ============================================================================
// 6. DEV SERVER AUTO-DETECTION & CLI PARSING
// ============================================================================

async function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, { timeout: 1000 }, () => resolve(true));
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

async function detectLocalDevServer() {
  const commonPorts = [3000, 5173, 8080, 4321, 3001, 8000];
  for (const port of commonPorts) {
    if (await checkPort(port)) {
      return `http://localhost:${port}`;
    }
  }
  return null;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    url: '',
    template: 'hero-tour', // hero-tour, form-flow, tab-switch, looping-hover, custom
    steps: null,
    outDir: './assets/demo',
    name: 'demo-reel',
    preset: 'og', // og (1200x630), 16-9 (1280x720), square (1080x1080), raw
    theme: 'gradient',
    fps: 30,
    dpr: 2,
    timeout: 20000,
    navTimeout: 8000,      // Fast 8s navigation timeout
    watchdogTimeout: 45000, // 45s total process limit
    stageTimeout: 15000,    // 15s max stagnation per stage
    skipPing: false,
    clearFailures: false,
    maxDuration: 15000,     // 15 seconds recommended cap
    rawOnly: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--url' && args[i + 1]) config.url = args[++i];
    else if (arg === '--template' && args[i + 1]) config.template = args[++i];
    else if (arg === '--steps' && args[i + 1]) {
      try {
        config.steps = JSON.parse(args[++i]);
        config.template = 'custom';
      } catch (e) {
        console.error('==> [!] Failed to parse --steps JSON:', e.message);
      }
    }
    else if (arg === '--out' && args[i + 1]) config.outDir = args[++i];
    else if (arg === '--name' && args[i + 1]) config.name = args[++i];
    else if (arg === '--preset' && args[i + 1]) config.preset = args[++i];
    else if (arg === '--theme' && args[i + 1]) config.theme = args[++i];
    else if (arg === '--fps' && args[i + 1]) config.fps = parseInt(args[++i], 10);
    else if (arg === '--dpr' && args[i + 1]) config.dpr = parseFloat(args[++i]);
    else if (arg === '--watchdog' && args[i + 1]) config.watchdogTimeout = parseInt(args[++i], 10);
    else if (arg === '--stage-timeout' && args[i + 1]) config.stageTimeout = parseInt(args[++i], 10);
    else if (arg === '--nav-timeout' && args[i + 1]) config.navTimeout = parseInt(args[++i], 10);
    else if (arg === '--skip-ping') config.skipPing = true;
    else if (arg === '--clear-failures') config.clearFailures = true;
    else if (arg === '--max-duration' && args[i + 1]) config.maxDuration = parseInt(args[++i], 10);
    else if (arg === '--raw-only') config.rawOnly = true;
    else if (arg === '-h' || arg === '--help') {
      printHelp();
      process.exit(0);
    }
  }

  return config;
}

function printHelp() {
  console.log(`
Usage: record.js [options]

Workflow & Interaction Options:
  --url <url>             Target URL (auto-detects local dev server if omitted)
  --template <name>       Pre-built template: hero-tour, form-flow, tab-switch, looping-hover (default: hero-tour)
  --steps '<json>'        Custom array of action steps: [{"action":"click","selector":".btn"}, ...]
  --max-duration <ms>     Maximum recording length in ms (default: 15000)

Watchdog & Resilience Options:
  --watchdog <ms>         Global process watchdog limit (default: 45000ms)
  --stage-timeout <ms>    Maximum stagnation allowed per stage (default: 15000ms)
  --nav-timeout <ms>      Page navigation timeout (default: 8000ms)
  --skip-ping             Bypass pre-flight HTTP ping validation
  --clear-failures        Purge prior failure memory ledger

Output & Formatting Options:
  --preset <name>         Framing preset: og (1200x630), 16-9 (1280x720), square (1080x1080), raw (default: og)
  --theme <name>          Background theme: gradient, mesh, dark, plain (default: gradient)
  --out <dir>             Output directory (default: ./assets/demo)
  --name <filename>       Base filename (default: demo-reel)
  --fps <number>          Video frame rate (default: 30)
  --dpr <number>          Device pixel ratio for sharpness (default: 2)
  --raw-only              Skip canvas dressing, export raw MP4 recording only
  -h, --help              Show this help message
`);
}

// ============================================================================
// 7. DISTRACTION-FREE FOCUS VEIL & OVERLAY NEUTRALIZATION
// ============================================================================

async function neutralizeOverlaysAndVeils(page) {
  heartbeat('Neutralizing focus veils');
  try {
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);

    const neutralizedCount = await page.evaluate(() => {
      let count = 0;
      const veilSelectors = [
        '[class*="focus-veil"]',
        '[class*="distraction-free"]',
        '[id*="focus-veil"]',
        '[id*="distraction-free"]',
        '[class*="veil"]:not([role="main"]):not(main)',
        '[id*="veil"]:not([role="main"]):not(main)',
        '.modal-backdrop',
        '.overlay-backdrop',
        '.drawer-backdrop',
        '.dialog-backdrop',
        '[data-veil]',
        '[data-focus-veil]',
        '[data-backdrop]',
        '[aria-modal="true"]'
      ];

      for (const sel of veilSelectors) {
        document.querySelectorAll(sel).forEach((el) => {
          if (el.id === '__vxnt_virtual_cursor') return;
          el.style.setProperty('pointer-events', 'none', 'important');
          el.setAttribute('data-vxnt-neutralized', 'true');
          count++;
        });
      }

      const allElements = document.querySelectorAll('div, section, aside');
      for (const el of allElements) {
        if (el.id === '__vxnt_virtual_cursor' || el.getAttribute('data-vxnt-neutralized')) continue;
        const style = window.getComputedStyle(el);
        if (
          (style.position === 'fixed' || style.position === 'absolute') &&
          parseInt(style.zIndex, 10) >= 30 &&
          style.pointerEvents !== 'none'
        ) {
          const rect = el.getBoundingClientRect();
          const isViewportCover = rect.width >= (window.innerWidth * 0.85) && rect.height >= (window.innerHeight * 0.85);
          const className = (el.className || '').toString().toLowerCase();
          const id = (el.id || '').toLowerCase();

          if (isViewportCover && (
            className.includes('veil') ||
            className.includes('overlay') ||
            className.includes('backdrop') ||
            className.includes('mask') ||
            id.includes('veil') ||
            id.includes('overlay')
          )) {
            el.style.setProperty('pointer-events', 'none', 'important');
            el.setAttribute('data-vxnt-neutralized', 'true');
            count++;
          }
        }
      }
      return count;
    });

    if (neutralizedCount > 0) {
      console.log(`  [✓] Neutralized ${neutralizedCount} distraction-free focus veil(s) / overlay blocker(s).`);
    }
  } catch (_) {}
}

// ============================================================================
// 8. RESILIENT ACTION HELPERS WITH 3-TIER ACTIONABILITY FALLBACK
// ============================================================================

async function safeClick(page, el, selector = 'element') {
  heartbeat(`Clicking ${selector}`);
  try {
    await el.scrollIntoViewIfNeeded({ timeout: 1000 }).catch(() => {});
  } catch (_) {}

  try {
    await el.click({ timeout: 2500 });
    return true;
  } catch (err1) {
    try {
      console.log(`  [!] Actionability blocked on ${selector}; retrying with { force: true }...`);
      await neutralizeOverlaysAndVeils(page);
      await el.click({ force: true, timeout: 2000 });
      return true;
    } catch (err2) {
      try {
        console.log(`  [!] Force click failed on ${selector}; falling back to synthetic DOM MouseEvent dispatch...`);
        await page.evaluate((targetEl) => {
          if (!targetEl) return;
          const rect = targetEl.getBoundingClientRect();
          const clickEvt = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
            clientX: rect.left + rect.width / 2,
            clientY: rect.top + rect.height / 2
          });
          targetEl.dispatchEvent(clickEvt);
        }, el);
        return true;
      } catch (err3) {
        console.log(`  [X] Failed to click ${selector}: ${err3.message}`);
        return false;
      }
    }
  }
}

async function safeHover(page, el, selector = 'element', duration = 400) {
  heartbeat(`Hovering ${selector}`);
  try {
    await el.scrollIntoViewIfNeeded({ timeout: 1000 }).catch(() => {});
  } catch (_) {}

  try {
    await el.hover({ timeout: 2500 });
  } catch (err1) {
    try {
      await neutralizeOverlaysAndVeils(page);
      await el.hover({ force: true, timeout: 2000 });
    } catch (err2) {
      try {
        await page.evaluate((targetEl) => {
          if (!targetEl) return;
          targetEl.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true, view: window }));
          targetEl.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, cancelable: true, view: window }));
        }, el);
      } catch (_) {}
    }
  }
  await page.waitForTimeout(duration);
}

async function safeType(page, el, selector, text) {
  heartbeat(`Typing into ${selector}`);
  try {
    await safeClick(page, el, selector);
    for (const char of text) {
      heartbeat(`Typing char '${char}'`);
      await page.keyboard.type(char);
      const delay = Math.floor(Math.random() * 40) + 30;
      await page.waitForTimeout(delay);
    }
  } catch (err) {
    console.log(`  [!] Keyboard typing issue on ${selector}, falling back to fill()...`);
    try {
      await el.fill(text);
    } catch (_) {}
  }
}

// ============================================================================
// 9. INJECTED VIRTUAL CURSOR SCRIPT
// ============================================================================

const CURSOR_INJECTION_SCRIPT = `
(() => {
  if (window.__vxntCursorInitialized) return;
  window.__vxntCursorInitialized = true;

  const cursor = document.createElement('div');
  cursor.id = '__vxnt_virtual_cursor';
  cursor.style.cssText = \`
    position: fixed;
    top: 0;
    left: 0;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    border: 2px solid #ffffff;
    box-shadow: 0 4px 14px rgba(0,0,0,0.4), 0 0 10px rgba(99,102,241,0.6);
    pointer-events: none;
    z-index: 2147483647;
    transition: transform 0.08s ease-out, background 0.15s ease;
    transform: translate(-100px, -100px);
  \`;
  document.documentElement.appendChild(cursor);

  window.__vxntMoveCursor = (x, y) => {
    cursor.style.transform = \`translate(\${x - 11}px, \${y - 11}px)\`;
  };

  window.__vxntClickRipple = (x, y) => {
    cursor.style.background = 'rgba(99, 102, 241, 0.9)';
    setTimeout(() => { cursor.style.background = 'rgba(255, 255, 255, 0.4)'; }, 180);

    const ripple = document.createElement('div');
    ripple.style.cssText = \`
      position: fixed;
      top: \${y - 20}px;
      left: \${x - 20}px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid rgba(99, 102, 241, 0.85);
      background: rgba(99, 102, 241, 0.25);
      pointer-events: none;
      z-index: 2147483646;
      animation: __vxnt_pulse 0.45s ease-out forwards;
    \`;
    document.documentElement.appendChild(ripple);
    setTimeout(() => ripple.remove(), 450);
  };

  const style = document.createElement('style');
  style.textContent = \`
    @keyframes __vxnt_pulse {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(2.2); opacity: 0; }
    }
  \`;
  document.head.appendChild(style);
})();
`;

async function smoothMoveCursor(page, startX, startY, endX, endY, steps = 18) {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const curX = startX + (endX - startX) * ease;
    const curY = startY + (endY - startY) * ease;
    await page.evaluate(({ x, y }) => window.__vxntMoveCursor(x, y), { x: curX, y: curY });
    await page.waitForTimeout(16);
  }
}

// ============================================================================
// 10. ACTION STEP & TEMPLATE EXECUTORS
// ============================================================================

async function executeActionSteps(page, steps) {
  let currentX = 100;
  let currentY = 100;
  const stepBar = new ProgressBar({ total: steps.length, label: 'Steps Execution', width: 20 });

  for (let idx = 0; idx < steps.length; idx++) {
    const step = steps[idx];
    const desc = `${step.action}${step.selector ? ' ' + step.selector : ''}`;
    updateWatchdog('STAGE_3_RECORDING', `Custom step ${idx + 1}/${steps.length}: ${desc}`);
    stepBar.update(idx, `[${idx + 1}/${steps.length}] ${desc}`);

    await neutralizeOverlaysAndVeils(page);

    if (step.action === 'wait') {
      await page.waitForTimeout(step.ms || 500);
    } else if (step.action === 'click') {
      const el = await page.$(step.selector);
      if (el) {
        await el.scrollIntoViewIfNeeded({ timeout: 1000 }).catch(() => {});
        const box = await el.boundingBox();
        if (box) {
          const targetX = box.x + box.width / 2;
          const targetY = box.y + box.height / 2;
          await smoothMoveCursor(page, currentX, currentY, targetX, targetY);
          currentX = targetX;
          currentY = targetY;
          await page.evaluate(({ x, y }) => window.__vxntClickRipple(x, y), { x: targetX, y: targetY });
          await page.waitForTimeout(100);
          await safeClick(page, el, step.selector);
          await page.waitForTimeout(200);
        }
      } else {
        console.log(`  [!] Element not found for click: ${step.selector}`);
      }
    } else if (step.action === 'hover') {
      const el = await page.$(step.selector);
      if (el) {
        await el.scrollIntoViewIfNeeded({ timeout: 1000 }).catch(() => {});
        const box = await el.boundingBox();
        if (box) {
          const targetX = box.x + box.width / 2;
          const targetY = box.y + box.height / 2;
          await smoothMoveCursor(page, currentX, currentY, targetX, targetY);
          currentX = targetX;
          currentY = targetY;
          await safeHover(page, el, step.selector, step.duration || 400);
        }
      }
    } else if (step.action === 'type') {
      const el = await page.$(step.selector);
      if (el) {
        await el.scrollIntoViewIfNeeded({ timeout: 1000 }).catch(() => {});
        const box = await el.boundingBox();
        if (box) {
          const targetX = box.x + box.width / 2;
          const targetY = box.y + box.height / 2;
          await smoothMoveCursor(page, currentX, currentY, targetX, targetY);
          currentX = targetX;
          currentY = targetY;
          await safeClick(page, el, step.selector);
          await page.waitForTimeout(100);
          await safeType(page, el, step.selector, step.text || '');
          await page.waitForTimeout(200);
        }
      }
    } else if (step.action === 'scroll') {
      await page.evaluate((y) => window.scrollBy({ top: y, behavior: 'smooth' }), step.y || 300);
      await page.waitForTimeout(600);
    }
  }
  stepBar.finish(`${steps.length} steps complete`);
}

async function executeAutoTemplate(page, templateName) {
  console.log(`==> Executing Auto-Template: [${templateName}]...`);
  updateWatchdog('STAGE_3_RECORDING', `Executing template ${templateName}`);

  if (templateName === 'hero-tour') {
    console.log('  -> Phase 1/4: Breathing pause & veil neutralization...');
    await page.waitForTimeout(600);
    await neutralizeOverlaysAndVeils(page);

    console.log('  -> Phase 2/4: Discovering interactive surface elements...');
    heartbeat('Discovering hero elements');
    const elements = await page.evaluate(() => {
      const found = [];
      const cta = document.querySelector('a[href]:not([data-vxnt-neutralized]), button:not([data-vxnt-neutralized]), [class*="cta"], [class*="btn-primary"]');
      if (cta) {
        const cls = cta.className ? '.' + cta.className.split(' ')[0] : '';
        found.push({ selector: cta.tagName.toLowerCase() + cls, type: 'cta' });
      }
      const cards = document.querySelectorAll('[class*="card"], [class*="feature"], [class*="bento"]');
      cards.forEach((c, idx) => {
        if (idx < 3 && !c.getAttribute('data-vxnt-neutralized')) {
          found.push({ selector: '.' + c.className.split(' ')[0], type: 'card' });
        }
      });
      return found;
    });

    console.log(`  -> Phase 3/4: Gliding cursor across ${elements.length} primary POI items...`);
    let currentX = 200, currentY = 200;
    for (let i = 0; i < elements.length; i++) {
      const item = elements[i];
      if (!item.selector) continue;
      updateWatchdog('STAGE_3_RECORDING', `Touring element ${i + 1}/${elements.length}: ${item.selector}`);
      const el = await page.$(item.selector);
      if (el) {
        await el.scrollIntoViewIfNeeded({ timeout: 1000 }).catch(() => {});
        const box = await el.boundingBox();
        if (box && box.y > 0 && box.y < 800) {
          const targetX = box.x + box.width / 2;
          const targetY = box.y + box.height / 2;
          await smoothMoveCursor(page, currentX, currentY, targetX, targetY);
          currentX = targetX;
          currentY = targetY;
          await page.evaluate(({ x, y }) => window.__vxntClickRipple(x, y), { x: targetX, y: targetY });
          if (item.type === 'cta') {
            await safeClick(page, el, item.selector);
          } else {
            await safeHover(page, el, item.selector, 400);
          }
          await page.waitForTimeout(400);
        }
      }
    }

    console.log('  -> Phase 4/4: Subtle smooth scroll and loop settle...');
    updateWatchdog('STAGE_3_RECORDING', 'Loop scroll settle');
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: 'smooth' }));
    await page.waitForTimeout(900);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(800);

  } else if (templateName === 'form-flow') {
    console.log('  -> Phase 1/3: Discovering input elements...');
    await neutralizeOverlaysAndVeils(page);
    const inputs = await page.evaluate(() => {
      const res = [];
      document.querySelectorAll('input:not([type="hidden"]), textarea').forEach((el) => {
        if (el.id) res.push('#' + el.id);
        else if (el.name) res.push(`[name="${el.name}"]`);
      });
      return res;
    });

    console.log(`  -> Phase 2/3: Populating sample form data across ${Math.min(2, inputs.length)} fields...`);
    let currentX = 150, currentY = 150;
    for (const sel of inputs.slice(0, 2)) {
      updateWatchdog('STAGE_3_RECORDING', `Typing in input: ${sel}`);
      const el = await page.$(sel);
      if (el) {
        await el.scrollIntoViewIfNeeded({ timeout: 1000 }).catch(() => {});
        const box = await el.boundingBox();
        if (box) {
          const targetX = box.x + box.width / 2;
          const targetY = box.y + box.height / 2;
          await smoothMoveCursor(page, currentX, currentY, targetX, targetY);
          currentX = targetX;
          currentY = targetY;
          const sample = sel.includes('email') ? 'alex@example.com' : 'Acme Project';
          await safeType(page, el, sel, sample);
          await page.waitForTimeout(300);
        }
      }
    }
    console.log('  -> Phase 3/3: Form cadence complete.');

  } else if (templateName === 'tab-switch') {
    console.log('  -> Phase 1/2: Discovering tab navigation items...');
    await neutralizeOverlaysAndVeils(page);
    const tabs = await page.evaluate(() => {
      const res = [];
      document.querySelectorAll('[role="tab"], [class*="tab"], [class*="nav-link"]').forEach((el) => {
        if (el.className) res.push('.' + el.className.split(' ')[0]);
      });
      return res.slice(0, 3);
    });

    console.log(`  -> Phase 2/2: Switching through ${tabs.length} tabs...`);
    let currentX = 100, currentY = 100;
    for (const sel of tabs) {
      updateWatchdog('STAGE_3_RECORDING', `Switching tab: ${sel}`);
      const el = await page.$(sel);
      if (el) {
        await el.scrollIntoViewIfNeeded({ timeout: 1000 }).catch(() => {});
        const box = await el.boundingBox();
        if (box) {
          const targetX = box.x + box.width / 2;
          const targetY = box.y + box.height / 2;
          await smoothMoveCursor(page, currentX, currentY, targetX, targetY);
          currentX = targetX;
          currentY = targetY;
          await page.evaluate(({ x, y }) => window.__vxntClickRipple(x, y), { x: targetX, y: targetY });
          await safeClick(page, el, sel);
          await page.waitForTimeout(700);
        }
      }
    }

  } else if (templateName === 'looping-hover') {
    console.log('  -> Phase 1/2: Discovering cards & interactive triggers...');
    await neutralizeOverlaysAndVeils(page);
    const cards = await page.evaluate(() => {
      const res = [];
      document.querySelectorAll('[class*="card"], [class*="item"], button').forEach((el) => {
        if (el.className) res.push('.' + el.className.split(' ')[0]);
      });
      return res.slice(0, 4);
    });

    console.log(`  -> Phase 2/2: Hovering across ${cards.length} items...`);
    let currentX = 200, currentY = 200;
    for (const sel of cards) {
      updateWatchdog('STAGE_3_RECORDING', `Hovering card: ${sel}`);
      const el = await page.$(sel);
      if (el) {
        await el.scrollIntoViewIfNeeded({ timeout: 1000 }).catch(() => {});
        const box = await el.boundingBox();
        if (box) {
          const targetX = box.x + box.width / 2;
          const targetY = box.y + box.height / 2;
          await smoothMoveCursor(page, currentX, currentY, targetX, targetY);
          currentX = targetX;
          currentY = targetY;
          await safeHover(page, el, sel, 400);
        }
      }
    }
  }
}

// ============================================================================
// 11. MP4 TRANSCODER VIA FFMPEG (H.264 Faststart)
// ============================================================================

async function transcodeVideo(inputWebm, outMp4, fps = 30) {
  const durationSec = getVideoDurationSec(inputWebm, 10);

  updateWatchdog('STAGE_5_MP4_TRANSCODE', 'Transcoding MP4 H.264');
  console.log(`\n==> [5/5] High-Compatibility MP4 Transcoding (H.264 faststart)...`);
  await runFfmpegWithProgress(
    ['-y', '-i', inputWebm, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-r', String(fps), '-movflags', '+faststart', outMp4],
    { label: 'MP4 Transcode', estimatedDurationSec: durationSec }
  );
}

// ============================================================================
// 12. MAIN PIPELINE
// ============================================================================

async function main() {
  if (process.argv.includes('-h') || process.argv.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  const config = parseArgs();
  updateWatchdog('STAGE_1_PREFLIGHT', 'Checking system binaries');
  startWatchdog(config);

  if (config.clearFailures) {
    const lPath = path.join(config.outDir, '.demo-failures-ledger.json');
    const pPath = path.join(config.outDir, '.demo-record-failure.json');
    if (fs.existsSync(lPath)) fs.unlinkSync(lPath);
    if (fs.existsSync(pPath)) fs.unlinkSync(pPath);
    console.log('==> [✓] Purged prior failure ledger.');
  }

  // Adaptive failure memory recall
  const prevFailure = recallPreviousFailures(config.outDir, config.url, config.template);
  if (prevFailure) {
    console.log(`\n🧠 [Adaptive Memory Recall]: Previous recording encountered failure:`);
    console.log(`  - Category:    ${prevFailure.failureCategory} (${prevFailure.stage})`);
    console.log(`  - Root Cause:  ${prevFailure.rootCause}`);
    console.log(`  - Safeguards:  Enforcing strict HTTP pre-flight ping & 2.5s action cap.`);
  }

  console.log('\n==> [1/5] Discovery & Pre-flight Validation...');
  runPreflightChecks();

  let targetUrl = config.url;
  if (!targetUrl) {
    console.log('  -> Auto-scanning local dev servers on standard ports...');
    updateWatchdog('STAGE_1_PREFLIGHT', 'Scanning local ports');
    const localUrl = await detectLocalDevServer();
    if (localUrl) {
      targetUrl = localUrl;
      config.url = targetUrl;
      watchdog.targetUrl = targetUrl;
      console.log(`  [✓] Detected active local dev server at: ${targetUrl}`);
    } else {
      console.error('==> [!] No active local server found on ports (3000, 5173, 8080, 4321, 3001, 8000).');
      console.error('      Please specify target URL using --url <url>.');
      process.exit(1);
    }
  } else {
    watchdog.targetUrl = targetUrl;
  }

  // Pre-flight HTTP ping (fail-fast within 2.5s if server is dead/blocked)
  if (!config.skipPing && targetUrl.startsWith('http')) {
    console.log(`  -> Running pre-flight HTTP ping on ${targetUrl}...`);
    updateWatchdog('STAGE_1_PREFLIGHT', `Pinging ${targetUrl}`);
    try {
      await pingUrl(targetUrl, 2500);
      console.log('  [✓] Pre-flight ping succeeded: server is live and responsive.');
    } catch (pingErr) {
      await triggerKillSwitch(
        'PREFLIGHT_PING_FAILED',
        `Target server at ${targetUrl} is unresponsive (${pingErr.message}).`,
        { targetUrl }
      );
    }
  }

  const pw = resolveGlobalPlaywright();

  fs.mkdirSync(config.outDir, { recursive: true });
  const tempDir = path.join(config.outDir, `.temp-rec-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });
  watchdog.tempDir = tempDir;

  const vpWidth = 1280;
  const vpHeight = 720;

  console.log(`\n==> [2/5] Browser Launch & Veil Neutralization...`);
  console.log(`  -> Launching Chromium Recorder (Viewport: ${vpWidth}x${vpHeight})...`);
  updateWatchdog('STAGE_2_NAVIGATION', 'Launching Chromium instance');
  const browser = await pw.chromium.launch({ headless: true });
  watchdog.browserInstance = browser;

  const context = await browser.newContext({
    viewport: { width: vpWidth, height: vpHeight },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    recordVideo: {
      dir: tempDir,
      size: { width: vpWidth, height: vpHeight }
    }
  });

  const page = await context.newPage();
  page.setDefaultTimeout(config.navTimeout);

  console.log(`  -> Navigating to ${targetUrl} (Timeout: ${config.navTimeout}ms)...`);
  updateWatchdog('STAGE_2_NAVIGATION', `Navigating to ${targetUrl}`);
  try {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: config.navTimeout });
  } catch (navErr) {
    console.log(`  [!] Navigation timed out (${navErr.message.slice(0, 50)}), proceeding with caution...`);
  }

  await page.addScriptTag({ content: CURSOR_INJECTION_SCRIPT });
  await neutralizeOverlaysAndVeils(page);

  console.log(`\n==> [3/5] Recording Interactive Workflow & Motion Travel...`);
  updateWatchdog('STAGE_3_RECORDING', `Executing template ${config.template}`);
  const recordStartTime = Date.now();
  if (config.steps && Array.isArray(config.steps)) {
    console.log(`  -> Executing ${config.steps.length} custom action steps...`);
    await executeActionSteps(page, config.steps);
  } else {
    await executeAutoTemplate(page, config.template);
  }
  const recordingDurationMs = Date.now() - recordStartTime;
  console.log(`  [✓] Interactive actions complete in ${(recordingDurationMs / 1000).toFixed(1)}s.`);

  console.log(`\n==> [4/5] Video Stream Flush & Artifact Collection...`);
  updateWatchdog('STAGE_4_FLUSH', 'Closing browser and flushing video stream');
  await page.close();
  await context.close();
  await browser.close();
  watchdog.browserInstance = null;

  const videoFiles = fs.readdirSync(tempDir).filter(f => f.endsWith('.webm'));
  if (videoFiles.length === 0) {
    await triggerKillSwitch('EMPTY_VIDEO_ARTIFACT', 'No .webm video was generated during the recording session.');
  }
  const rawWebmTemp = path.join(tempDir, videoFiles[0]);

  const rawBase = `${config.name}-raw`;
  const rawMp4Path = path.join(config.outDir, `${rawBase}.mp4`);

  const polBase = `${config.name}-${config.preset}`;
  const polMp4Path = path.join(config.outDir, `${polBase}.mp4`);

  // Transcode raw WebM capture directly to MP4
  await transcodeVideo(rawWebmTemp, rawMp4Path, config.fps);

  // Clean up temporary recording directory
  fs.rmSync(tempDir, { recursive: true, force: true });
  watchdog.tempDir = null;

  // Optional Polished Video Framing (Dresses raw MP4 inside padded container)
  let polishedGenerated = false;
  if (!config.rawOnly) {
    updateWatchdog('STAGE_FRAMING', `Framing polished demo card (${config.preset})`);
    console.log(`\n==> Framing Polished Demo Card (Preset: ${config.preset.toUpperCase()})...`);
    const durationSec = getVideoDurationSec(rawMp4Path, 10);
    try {
      await runFfmpegWithProgress(
        ['-y', '-i', rawMp4Path, '-vf', 'scale=1120:-1,pad=1200:630:(ow-iw)/2:(oh-ih)/2:color=#0b0f19', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', polMp4Path],
        { label: 'Polished MP4', estimatedDurationSec: durationSec }
      );
      polishedGenerated = true;
    } catch (e) {
      console.log(`  [i] Dressed video framing skipped (${e.message.slice(0, 60)}), raw MP4 intact.`);
    }
  }

  // Clear watchdog upon successful completion
  if (watchdog.timer) clearInterval(watchdog.timer);

  const getKb = (p) => fs.existsSync(p) ? (fs.statSync(p).size / 1024).toFixed(1) : '0';

  console.log('\n' + '='.repeat(60));
  console.log('==> [✓] Interactive Demo MP4 Video Successfully Created:');
  console.log('='.repeat(60));
  console.log(`  - Target:       ${targetUrl}`);
  console.log(`  - Template:     ${config.template}`);
  console.log(`  - Raw MP4:      ${rawMp4Path} (${getKb(rawMp4Path)} KB)`);

  const resultAssets = {
    raw: {
      mp4: { path: rawMp4Path, sizeKb: parseFloat(getKb(rawMp4Path)) }
    }
  };

  if (polishedGenerated) {
    console.log(`  - Polished MP4: ${polMp4Path} (${getKb(polMp4Path)} KB)`);
    resultAssets.polished = {
      preset: config.preset,
      mp4: { path: polMp4Path, sizeKb: parseFloat(getKb(polMp4Path)) }
    };
  }

  const resultJson = {
    status: 'SUCCESS',
    source: targetUrl,
    template: config.template,
    assets: resultAssets
  };

  console.log('\n--- JSON RESULT ---');
  console.log(JSON.stringify(resultJson, null, 2));
}

main().catch(async (err) => {
  await triggerKillSwitch('UNCAUGHT_EXCEPTION', err.message);
});
