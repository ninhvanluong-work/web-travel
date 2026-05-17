/**
 * Capacity test configuration: stage steps, thresholds limits,
 * and builders for k6 options.
 */

export const STAGE_STEPS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

// Acceptable p95 response time (ms) per stage — gets more lenient as load grows
export const P95_LIMIT = {
  10: 500,
  20: 500,
  30: 800,
  40: 800,
  50: 1000,
  60: 1200,
  70: 1500,
  80: 2000,
  90: 2500,
  100: 3000,
};

// Acceptable error rate (%) per stage
export const ERROR_LIMIT = {
  10: 1,
  20: 1,
  30: 1,
  40: 1,
  50: 2,
  60: 2,
  70: 5,
  80: 5,
  90: 10,
  100: 10,
};

/**
 * Builds k6 stages array: 30s ramp-up + 90s hold per step, then ramp down.
 * Total: ~21 minutes for 10 steps.
 */
export function buildStages() {
  const stages = [];
  for (const vu of STAGE_STEPS) {
    stages.push({ duration: '30s', target: vu });
    stages.push({ duration: '90s', target: vu });
  }
  stages.push({ duration: '30s', target: 0 });
  return stages;
}

/**
 * Builds k6 thresholds keyed by stage tag, one per VU step.
 */
export function buildThresholds() {
  const t = {};
  for (const vu of STAGE_STEPS) {
    t[`http_req_duration{stage:${vu}}`] = [`p(95)<${P95_LIMIT[vu]}`];
    t[`http_req_failed{stage:${vu}}`] = [`rate<${ERROR_LIMIT[vu] / 100}`];
  }
  return t;
}
