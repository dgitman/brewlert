// Keep inference behind AWF's credential-holding proxy, but use Copilot's
// native Auto endpoint rather than offline CLI's Chat Completions endpoint.
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
    const headers = { 'content-type': 'application/json', 'x-github-api-version': '2026-08-01' };
    const upstream = http.request(new URL('/auto', base), { method: 'POST', headers }, response => {
      console.log(`[free-auto] POST /auto status=${response.statusCode}`);
      res.writeHead(response.statusCode, response.headers);
      response.pipe(res);
    });
    upstream.on('error', error => { console.error(error.message); res.writeHead(502).end('Inference proxy unavailable'); });
    // Authentication remains entirely in AWF's proxy; never forward CLI credentials.
    req.pipe(upstream);
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
