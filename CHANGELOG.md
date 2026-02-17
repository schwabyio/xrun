# Change Log

## v3.3.0
1. Update to xtest `v1.5.0`.
2. Dependency updates.

## v3.2.0
* no changes: skipping v3.2.0 due to npm publish issue

## v3.1.0
1. Update to xtest `v1.4.0`.

## v3.0.0
1. Switch from complicated user level `xrun/settings.json` to a simpler project level `xrun/settings.json`. Users will now run xrun from each base project testing repo.
2. Add xtest version to summary.html report.
3. Update to xtest `v1.3.0`.
4. Properly fail test-script type errors and report errors in results.
5. Fix issue with constructPostmanUrl when host is null/undefined.
6. Support directory names, in addition to collection names, when usibng the `<collectionAndOrDirectoryList>` CLI `<program-command>` option.
