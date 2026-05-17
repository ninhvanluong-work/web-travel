// tests/k6/config.js
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
export const FE_URL = __ENV.FE_URL || 'https://web-travel-git-dev-luongworks-projects.vercel.app';
export const API_URL = __ENV.API_URL || 'https://web-travel-be.fly.dev';

export const commonHeaders = {
  'Content-Type': 'application/json',
};

export const browserHeaders = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
};
