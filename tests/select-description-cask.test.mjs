import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectCandidate } from '../scripts/select-description-cask.mjs';

const candidate = { token: 'pdfextractor', homepage: 'https://example.com', desc: null };
test('selects only the manual-test candidate', () => {
  assert.equal(selectCandidate([{ ...candidate, token: 'other' }, candidate]), candidate);
});
test('excludes ineligible and already described casks', () => {
  for (const change of [{ disabled: true }, { deprecated: true }, { desc: 'Existing' },
    { homepage: 'http://example.com' }]) {
    assert.equal(selectCandidate([{ ...candidate, ...change }]), null);
  }
});
