import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

// Keep the first manual test on a previously reviewed, enabled candidate.
export function selectCandidate(casks) {
  return casks.find(cask => cask.token === 'pdfextractor' &&
    !cask.token.startsWith('font-') && !cask.disabled && !cask.deprecated &&
    !cask.desc?.trim() && /^https:\/\//.test(cask.homepage)) ?? null;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const response = await fetch('https://formulae.brew.sh/api/cask.json');
  if (!response.ok) throw new Error(`Homebrew catalog request failed: ${response.status}`);
  const casks = await response.json();
  if (!Array.isArray(casks)) throw new Error('Invalid Homebrew cask catalog');
  const cask = selectCandidate(casks);
  const output = process.argv[2];
  if (!output) throw new Error('Provide an output path');
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify(cask && {
    token: cask.token, name: cask.name, homepage: cask.homepage,
    version: cask.version, desc: cask.desc,
  }, null, 2) + '\n');
  console.log(cask ? `Selected ${cask.token}` : 'No eligible candidate');
}
