// Keep inference behind AWF's credential-holding proxy, but use Copilot's
// Auto session protocol rather than offline CLI's literal "auto" model.
const http = require('node:http');
const { spawn } = require('node:child_process');
const { readFileSync } = require('node:fs');

async function main() {
  const base = new URL(process.env.COPILOT_PROVIDER_BASE_URL);
  if (!['api-proxy', '172.30.0.30'].includes(base.hostname) || base.port !== '10002') {
    throw new Error('Expected the AWF Copilot inference proxy');
  }
  const [command, ...original] = process.argv.slice(2);
  if (!command) throw new Error('Missing Copilot command');
  // Protocol from microsoft/vscode-copilot-chat automodeService.ts and
  // autoChatEndpoint.ts. Only the account-authorized response chooses a model.
  const session = await new Promise((resolve, reject) => {
    const request = http.request(new URL('/models/session', base), { method: 'POST', headers: {
      'content-type': 'application/json', 'x-github-api-version': '2025-07-16',
    } }, response => {
      let body = '';
      response.on('data', chunk => { body += chunk; if (body.length > 1000000) request.destroy(new Error('Auto session response too large')); });
      response.on('end', () => {
        if (response.statusCode !== 200) return reject(new Error(`Auto session status=${response.statusCode}`));
        try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid Auto session response')); }
      });
    });
    request.on('error', reject);
    request.setTimeout(30000, () => request.destroy(new Error('Auto session timeout')));
    request.end(JSON.stringify({ auto_mode: { model_hints: ['auto'] } }));
  });
  const selectedModel = session.available_models?.[0];
  if (!selectedModel || !session.session_token) throw new Error('Auto returned no authorized model or session');
  console.log(`[free-auto] Session authorized model=${selectedModel}`);
  const args = [];
  for (let i = 0; i < original.length; i++) {
    if (original[i] === '--prompt-file') {
      args.push('--prompt', readFileSync(original[++i], 'utf8'));
    } else args.push(original[i]);
  }
  const relay = http.createServer((req, res) => {
    if (req.method !== 'POST' || !['/chat/completions', '/v1/chat/completions'].includes(req.url)) {
      res.writeHead(404).end('Unsupported inference route');
      return;
    }
    const headers = { 'content-type': 'application/json', 'Copilot-Session-Token': session.session_token };
    const upstream = http.request(new URL('/chat/completions', base), { method: 'POST', headers }, response => {
      console.log(`[free-auto] Auto inference status=${response.statusCode}`);
      res.writeHead(response.statusCode, response.headers);
      response.pipe(res);
    });
    upstream.on('error', error => { console.error(error.message); res.writeHead(502).end('Inference proxy unavailable'); });
    // Authentication remains entirely in AWF's proxy; never forward CLI credentials.
    let body = '';
    req.on('data', chunk => { body += chunk; if (body.length > 10000000) req.destroy(); });
    req.on('end', () => {
      try { const payload = JSON.parse(body); payload.model = selectedModel; upstream.end(JSON.stringify(payload)); }
      catch { upstream.destroy(); res.writeHead(400).end('Invalid inference request'); }
    });
  });
  await new Promise(resolve => relay.listen(0, '127.0.0.1', resolve));
  const child = spawn(command, args, { stdio: 'inherit', env: {
    ...process.env,
    COPILOT_MODEL: 'auto',
    COPILOT_PROVIDER_BASE_URL: `http://127.0.0.1:${relay.address().port}`,
  } });
  const timer = setTimeout(() => child.kill('SIGTERM'), 10 * 60 * 1000);
  child.on('error', error => { console.error(error.message); clearTimeout(timer); relay.close(); process.exitCode = 1; });
  child.on('exit', code => { clearTimeout(timer); relay.close(); process.exitCode = code ?? 1; });
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
