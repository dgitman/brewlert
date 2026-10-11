# Cask description manual test

Run **Cask description proposal** from GitHub Actions. There is no schedule.
The initial pilot selects PDFExtractor only, and only while it is enabled,
not deprecated, and still missing a description in the live Homebrew catalog.

Add the repository Actions secret `COPILOT_GITHUB_TOKEN` with a fine-grained
GitHub personal access token having **Copilot Requests** permission. Use the
account's Copilot allowance; model usage and Actions usage follow GitHub billing.
Do not put the token in workflow files or commit it.

The workflow uses the Copilot engine and staged safe outputs. It previews at
most one proposal in the run summary. It cannot submit a Homebrew PR.
Review the source and proposed description before enabling submission or a
schedule. Submission will need a separate implementation enforcing one new
draft PR per run, no existing open AI-assisted PR, the current exact Homebrew
template, AI disclosure, and truthful validation checkboxes.

Compile changes with `gh aw compile cask-description --validate` using gh-aw
v0.89.21, then commit both Markdown and generated lock YAML.
Run selector tests with `node --test tests/select-description-cask.test.mjs`.
