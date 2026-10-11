import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/homebrew.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { getWeeklyAdditions, parseTitle } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

const packages = [
  { title: 'vectorcraft: 0.4.0 (new cask)', token: 'vectorcraft', version: '0.4.0' },
  { title: 'photocraft: 0.3.0 (new cask)', token: 'photocraft', version: '0.3.0' },
  { title: 'Add auto tune central', token: 'auto-tune-central', version: '2.0.2' },
];

test('resolves free-form titles from added files before querying metadata', async () => {
  const originalFetch = globalThis.fetch;
  const endpoints = [];
  globalThis.fetch = async (input) => {
    const url = String(input);
    if (url.includes('/search/issues')) {
      return Response.json({ items: url.includes('homebrew-cask') ? packages.map((p, index) => ({
        title: p.title, html_url: `https://github.com/Homebrew/homebrew-cask/pull/${index}`,
        closed_at: '2026-10-07T12:00:00Z',
      })) : [] });
    }
    if (url.endsWith('.diff')) {
      const p = packages[Number(url.match(/\/(\d+)\.diff$/)[1])];
      return new Response(`diff --git a/Casks/a/${p.token}.rb b/Casks/a/${p.token}.rb\nnew file mode 100644\n--- /dev/null\n+++ b/Casks/a/${p.token}.rb\n@@ -0,0 +1,6 @@\n+cask "${p.token}" do\n+  version "${p.version}"\n+  name "Display ${p.token}"\n+  desc "Description ${p.token}"\n+  homepage "https://example.com/${p.token}"\n+end\n`);
    }
    endpoints.push(url);
    return new Response('', { status: 404 });
  };
  try {
    const additions = await getWeeklyAdditions(new Date('2026-10-11T12:00:00Z'));
    assert.deepEqual(additions.map(p => p.name), packages.map(p => p.token));
    for (const [index, addition] of additions.entries()) {
      assert.equal(addition.version, packages[index].version);
      assert.equal(addition.description, `Description ${addition.name}`);
      assert.equal(addition.displayName, `Display ${addition.name}`);
      assert.equal(addition.homepage, `https://example.com/${addition.name}`);
    }
    assert.deepEqual(endpoints, packages.map(p => `https://formulae.brew.sh/api/cask/${p.token}.json`));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('title fallback strips colon punctuation and preserves standard names', () => {
  assert.equal(parseTitle('vectorcraft: 0.4.0 (new cask)', 'cask').name, 'vectorcraft');
  assert.equal(parseTitle('node@22 22.0 (new formula)', 'formula').name, 'node@22');
});
