#!/usr/bin/env node

/**
 * VXNT Promotional Asset Capturer (Global Zero-Dependency Runner)
 * 
 * Captures sharp Retina 2x screenshots of web/app features and Xcode Simulators,
 * auto-detects points of interest (POI), applies promotional canvas dressing,
 * and exports optimized WebP + high-res PNG.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');

// 1. Resolve Playwright from Global Package Managers
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

// 2. Parse PNG Dimensions using Standard Library
function getPngDimensions(buffer) {
  if (!buffer || buffer.length < 24) return null;
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

// 3. Xcode Simulator Capture Engine
function captureSimulatorScreenshot(tempPath, options) {
  const device = options.device || 'booted';
  const mask = options.mask || 'alpha';

  // Determine simctl command
  let simctlPrefix = 'xcrun simctl';
  const xcodeDev = '/Applications/Xcode.app/Contents/Developer';
  try {
    execSync('xcrun simctl help', { stdio: 'ignore' });
  } catch (_) {
    if (fs.existsSync(xcodeDev)) {
      simctlPrefix = `DEVELOPER_DIR="${xcodeDev}" xcrun simctl`;
    }
  }

  // 1. Try simctl on booted device
  try {
    const listOut = execSync(`${simctlPrefix} list devices booted`, { encoding: 'utf8' });
    if (listOut.includes('Booted')) {
      console.log(`==> Found booted Xcode Simulator device. Capturing via simctl...`);
      execSync(`${simctlPrefix} io ${device} screenshot --mask=${mask} "${tempPath}"`, { stdio: 'inherit' });
      if (fs.existsSync(tempPath) && fs.statSync(tempPath).size > 0) {
        return true;
      }
    }
  } catch (err) {
    // simctl failed or no booted device
  }

  // 2. Fallback: Check for running Simulator app window via screencapture
  try {
    console.log('==> Checking for active Simulator app window on macOS...');
    const winId = execSync(`osascript -e 'tell application "System Events" to get id of window 1 of (every process whose name is "Simulator")' 2>/dev/null`, { encoding: 'utf8' }).trim();
    if (winId && winId !== 'missing value') {
      console.log(`  [✓] Capturing Simulator window (Window ID: ${winId}) via screencapture...`);
      execSync(`screencapture -l${winId} -o "${tempPath}"`, { stdio: 'inherit' });
      if (fs.existsSync(tempPath) && fs.statSync(tempPath).size > 0) {
        return true;
      }
    }
  } catch (_) {}

  throw new Error('No active or booted Xcode Simulator found. Please launch Simulator (`open -a Simulator`) or boot a device.');
}

// 4. Parse CLI Arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    url: '',
    selector: '',
    simulator: false,   // Capture from Xcode Simulator
    device: 'booted',
    mask: 'alpha',      // alpha, ignored, black
    preset: 'og',       // og (1200x630), producthunt (1270x760), 16-9 (1280x720), square (1080x1080), raw
    theme: 'gradient', // gradient, dark, mesh, plain
    outDir: './assets/promo',
    name: 'promo-shot',
    raw: false,
    dpr: 2,
    quality: 90,
    timeout: 30000,
    waitFor: 1000
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--url' && args[i + 1]) config.url = args[++i];
    else if (arg === '--selector' && args[i + 1]) config.selector = args[++i];
    else if (arg === '--simulator' || arg === '--xcode') config.simulator = true;
    else if (arg === '--device' && args[i + 1]) config.device = args[++i];
    else if (arg === '--mask' && args[i + 1]) config.mask = args[++i];
    else if (arg === '--preset' && args[i + 1]) config.preset = args[++i];
    else if (arg === '--theme' && args[i + 1]) config.theme = args[++i];
    else if (arg === '--out' && args[i + 1]) config.outDir = args[++i];
    else if (arg === '--name' && args[i + 1]) config.name = args[++i];
    else if (arg === '--raw') config.raw = true;
    else if (arg === '--dpr' && args[i + 1]) config.dpr = parseFloat(args[++i]);
    else if (arg === '--quality' && args[i + 1]) config.quality = parseInt(args[++i], 10);
    else if (arg === '--wait' && args[i + 1]) config.waitFor = parseInt(args[++i], 10);
    else if (arg === '-h' || arg === '--help') {
      printHelp();
      process.exit(0);
    }
  }

  if (config.preset === 'raw') config.raw = true;
  return config;
}

function printHelp() {
  console.log(`
Usage: capture.js [options]

Web / Local App Capture Options:
  --url <url>          Target URL (auto-detects local dev server if omitted)
  --selector <css>     Target element CSS selector (auto-detects POI if omitted)

Xcode Simulator Capture Options:
  --simulator, --xcode Capture screenshot from booted Xcode Simulator (iOS/iPadOS)
  --device <id|booted> Target simulator device (default: booted)
  --mask <policy>      Mask policy: alpha, ignored, black (default: alpha)

Visual Styling & Format Options:
  --preset <name>      Aspect ratio preset: og (1200x630), producthunt (1270x760),
                       16-9 (1280x720), square (1080x1080), raw (default: og)
  --theme <name>       Background canvas: gradient, dark, mesh, plain (default: gradient)
  --out <dir>          Output directory (default: ./assets/promo)
  --name <filename>    Base filename (default: promo-shot)
  --raw                Skip canvas framing, capture pure element/device screenshot
  --dpr <number>       Device Pixel Ratio for Retina sharpness (default: 2)
  --quality <1-100>    WebP compression quality (default: 90)
  --wait <ms>          Extra wait time after load in ms (default: 1000)
  -h, --help           Show this help message
`);
}

// 5. Auto-Detect Local Port
async function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, { timeout: 1000 }, (res) => {
      resolve(true);
    });
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

// 6. Main Capture Pipeline
async function main() {
  const config = parseArgs();
  const pw = resolveGlobalPlaywright();

  // Ensure output directory exists
  fs.mkdirSync(config.outDir, { recursive: true });

  const baseName = `${config.name}-${config.preset}`;
  const pngPath = path.join(config.outDir, `${baseName}.png`);
  const webpPath = path.join(config.outDir, `${baseName}.webp`);

  let canvasSize = { width: 1200, height: 630 };
  if (config.preset === 'producthunt') canvasSize = { width: 1270, height: 760 };
  else if (config.preset === '16-9') canvasSize = { width: 1280, height: 720 };
  else if (config.preset === 'square') canvasSize = { width: 1080, height: 1080 };

  let rawShotBase64 = '';
  let targetSelector = config.selector;
  let targetSource = '';
  let isMobileDevice = false;

  // ----------------------------------------------------
  // BRANCH A: Xcode Simulator Capture
  // ----------------------------------------------------
  if (config.simulator) {
    targetSource = 'Xcode Simulator';
    const tempSimPng = path.join(config.outDir, `.temp-sim-${Date.now()}.png`);
    captureSimulatorScreenshot(tempSimPng, config);

    const buf = fs.readFileSync(tempSimPng);
    fs.unlinkSync(tempSimPng); // Clean up temp file
    rawShotBase64 = buf.toString('base64');

    const dims = getPngDimensions(buf);
    if (dims) {
      isMobileDevice = dims.height > dims.width;
      console.log(`  [✓] Simulator screenshot captured: ${dims.width}x${dims.height} (${isMobileDevice ? 'Mobile Portrait' : 'Landscape/Tablet'})`);
    }
  } else {
    // ----------------------------------------------------
    // BRANCH B: Web / Local Dev Server Capture via Playwright
    // ----------------------------------------------------
    let targetUrl = config.url;
    if (!targetUrl) {
      console.log('==> Auto-scanning local dev servers...');
      const localUrl = await detectLocalDevServer();
      if (localUrl) {
        targetUrl = localUrl;
        console.log(`  [✓] Detected active local dev server at: ${targetUrl}`);
      } else {
        console.error('==> [!] No active local server found on ports (3000, 5173, 8080, 4321, 3001, 8000).');
        console.error('      Please specify a target URL using --url <url> or use --simulator for Xcode.');
        process.exit(1);
      }
    }
    targetSource = targetUrl;

    console.log(`==> Launching Headless Chromium (DPR: ${config.dpr})...`);
    const browser = await pw.chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: config.dpr,
      colorScheme: 'dark'
    });

    const page = await context.newPage();
    console.log(`==> Navigating to ${targetUrl}...`);
    try {
      await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: config.timeout });
    } catch (_) {
      console.log('  [!] Networkidle timed out, proceeding with domcontentloaded...');
      await page.waitForLoadState('domcontentloaded');
    }

    if (config.waitFor > 0) {
      await page.waitForTimeout(config.waitFor);
    }

    // POI Heuristics
    if (!targetSelector && !config.raw) {
      console.log('==> Running DOM Point of Interest (POI) Heuristics...');
      const poiResult = await page.evaluate(() => {
        const candidates = [
          '[data-promo]',
          '[data-testid*="hero"]',
          'main > section:first-of-type',
          '.hero',
          '#hero',
          '[class*="hero"]',
          '[class*="featured"]',
          '[class*="bento"]',
          '[class*="dashboard"]',
          '[class*="card-grid"]',
          '[class*="pricing"]',
          'main'
        ];

        for (const sel of candidates) {
          const el = document.querySelector(sel);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.width > 200 && rect.height > 150) {
              return { selector: sel, rect: { width: rect.width, height: rect.height } };
            }
          }
        }
        return null;
      });

      if (poiResult) {
        targetSelector = poiResult.selector;
        console.log(`  [✓] Auto-detected POI: ${targetSelector} (${Math.round(poiResult.rect.width)}x${Math.round(poiResult.rect.height)}px)`);
      } else {
        console.log('  [i] Capturing above-the-fold viewport.');
      }
    }

    if (targetSelector) {
      const el = await page.$(targetSelector);
      if (el) {
        const buf = await el.screenshot({ type: 'png' });
        rawShotBase64 = buf.toString('base64');
      }
    }
    if (!rawShotBase64) {
      const buf = await page.screenshot({ type: 'png' });
      rawShotBase64 = buf.toString('base64');
    }

    await browser.close();
  }

  // ----------------------------------------------------
  // RENDER & EXPORT (Raw or Studio Dressed)
  // ----------------------------------------------------
  const browser = await pw.chromium.launch({ headless: true });
  const studioContext = await browser.newContext({
    deviceScaleFactor: config.dpr,
    colorScheme: 'dark'
  });
  const studioPage = await studioContext.newPage();

  if (config.raw) {
    console.log(`==> Saving raw Retina capture (WebP + PNG)...`);
    const rawBuf = Buffer.from(rawShotBase64, 'base64');
    fs.writeFileSync(pngPath, rawBuf);

    // Convert to WebP via browser rendering
    await studioPage.setContent(`
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:transparent;display:inline-block;">
        <img id="raw-img" src="data:image/png;base64,${rawShotBase64}" style="display:block;" />
      </body>
      </html>
    `);
    const imgEl = await studioPage.$('#raw-img');
    await imgEl.screenshot({ path: webpPath, type: 'webp', quality: config.quality });
  } else {
    console.log(`==> Rendering dressed promotional card (${canvasSize.width}x${canvasSize.height}, preset: ${config.preset})...`);

    const themes = {
      gradient: 'radial-gradient(ellipse at top left, #1e1b4b, #0f172a 60%, #030712 100%)',
      mesh: 'radial-gradient(at 0% 0%, #312e81 0px, transparent 50%), radial-gradient(at 100% 0%, #065f46 0px, transparent 50%), radial-gradient(at 100% 100%, #1e293b 0px, transparent 50%), #090d16',
      dark: '#090d16',
      plain: '#ffffff'
    };
    const bgStyle = themes[config.theme] || themes.gradient;

    // Mobile Phone Frame vs Desktop Window Frame
    let frameMarkup = '';
    if (isMobileDevice) {
      frameMarkup = `
        <div class="phone-wrapper">
          <div class="phone-notch"></div>
          <div class="phone-body">
            <img src="data:image/png;base64,${rawShotBase64}" />
          </div>
        </div>
      `;
    } else {
      frameMarkup = `
        <div class="window-wrapper">
          <div class="window-header">
            <div class="dot dot-red"></div>
            <div class="dot dot-yellow"></div>
            <div class="dot dot-green"></div>
          </div>
          <div class="window-body">
            <img src="data:image/png;base64,${rawShotBase64}" />
          </div>
        </div>
      `;
    }

    const canvasHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: ${canvasSize.width}px;
            height: ${canvasSize.height}px;
            background: ${bgStyle};
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          }
          /* Desktop Frame */
          .window-wrapper {
            width: 88%;
            max-height: 82%;
            background: #18181b;
            border-radius: 12px;
            box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.1);
            overflow: hidden;
            display: flex;
            flex-direction: column;
          }
          .window-header {
            height: 36px;
            background: #27272a;
            display: flex;
            align-items: center;
            padding: 0 14px;
            gap: 7px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }
          .dot { width: 10px; height: 10px; border-radius: 50%; }
          .dot-red { background: #ef4444; }
          .dot-yellow { background: #f59e0b; }
          .dot-green { background: #10b981; }
          .window-body { flex: 1; overflow: hidden; display: flex; background: #09090b; }
          .window-body img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }

          /* Mobile Phone Frame */
          .phone-wrapper {
            height: 88%;
            aspect-ratio: 9 / 19.5;
            background: #000;
            border-radius: 40px;
            box-shadow: 0 30px 70px -15px rgba(0, 0, 0, 0.85), 0 0 0 3px rgba(255, 255, 255, 0.18);
            overflow: hidden;
            position: relative;
            display: flex;
            flex-direction: column;
          }
          .phone-notch {
            position: absolute;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 22px;
            background: #000;
            border-radius: 20px;
            z-index: 10;
          }
          .phone-body { width: 100%; height: 100%; overflow: hidden; display: flex; }
          .phone-body img { width: 100%; height: 100%; object-fit: cover; display: block; }
        </style>
      </head>
      <body>
        ${frameMarkup}
      </body>
      </html>
    `;

    await studioPage.setViewportSize({ width: canvasSize.width, height: canvasSize.height });
    await studioPage.setContent(canvasHtml);
    await studioPage.screenshot({ path: pngPath, type: 'png' });
    await studioPage.screenshot({ path: webpPath, type: 'webp', quality: config.quality });
  }

  await browser.close();

  const pngSize = (fs.statSync(pngPath).size / 1024).toFixed(1);
  const webpSize = (fs.statSync(webpPath).size / 1024).toFixed(1);

  console.log('\n==> [✓] Promotional Assets Successfully Created:');
  console.log(`  - Source:           ${targetSource}`);
  console.log(`  - Format Preset:    ${config.preset.toUpperCase()} (${config.raw ? 'Raw Crop' : `${canvasSize.width}x${canvasSize.height}`})`);
  console.log(`  - Device Mode:      ${isMobileDevice ? 'Mobile Phone' : 'Desktop / Web'}`);
  console.log(`  - WebP (Retina 2x): ${webpPath} (${webpSize} KB) [Optimized]`);
  console.log(`  - PNG  (Retina 2x): ${pngPath} (${pngSize} KB) [Lossless]`);

  const resultJson = {
    status: 'SUCCESS',
    source: targetSource,
    isMobile: isMobileDevice,
    preset: config.preset,
    raw: config.raw,
    dpr: config.dpr,
    assets: {
      webp: { path: webpPath, sizeKb: parseFloat(webpSize) },
      png: { path: pngPath, sizeKb: parseFloat(pngSize) }
    }
  };

  console.log('\n--- JSON RESULT ---');
  console.log(JSON.stringify(resultJson, null, 2));
}

main().catch((err) => {
  console.error('==> [X] Asset capture failed:', err.message);
  process.exit(1);
});
