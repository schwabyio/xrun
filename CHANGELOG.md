# Change Log

## v3.5.0
1. Add support for external data files (`.csv` or `.json`) to drive a collection run (Newman `iterationData`). Place a data file named after a collection into `<your-project-repo>/xrun/data/` (e.g. `xrun/data/MY_COLLECTION.csv`) and that collection is run one time per data file row.
2. Add new `dataFileDirectoryPath` setting to configure the data file directory location (defaults to `data`).
3. Add data file name, iteration count and per test iteration labels to the collection html report.
4. Fix `request` and `test-script` failure messages being reported against every iteration of a test instead of only the iteration that failed.
5. Fix a collection that can NOT be run (e.g. an unreadable data file, a collection newman rejects) being silently reported as a collection that passed. It is now reported as a failed collection, named in the cli output and summary report, with the error shown in its collection html report.
6. Increase unit test coverage from 71% to 97%.
7. Fix the Request URL in the collection html report not matching the request Postman actually sent: query parameters were not separated by `&` (e.g. `?key1=value1key2=value2`), disabled query parameters were included and query parameters without a value were reported as `key=null`.

## v3.4.1
1. Fix `limitConcurrency`, `timeoutCollection`, `timeoutRequest` and `timeoutScript` being treated as strings when passed in from the command line (e.g. `--limitConcurrency 10` silently ran everything with a concurrency of 1).
2. Fix broken unit tests: undefined `getDirectories` reference and missing `empty-directory` test fixture.
3. Fix `getHostname.js` filename casing to `getHostName.js` to match how it is required (only resolved on case-insensitive file systems).

## v3.4.0
1. Update to xtest `v1.6.0`.
2. Dependency updates.

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
