import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

/**
 * Generates both console summary and JSON file output.
 * Import and re-export handleSummary from any test file.
 *
 * @param {string} reportName - filename prefix, e.g. 'load-test'
 */
export function makeSummaryHandler(reportName) {
  return function (data) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const filename = `tests/k6/reports/${reportName}-${timestamp}.json`;

    return {
      stdout: textSummary(data, { indent: '  ', enableColors: true }),
      [filename]: JSON.stringify(data, null, 2),
    };
  };
}
