const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  'Trekking expert': { bg: '#EEEDFE', text: '#3C3489' },
  'Food storyteller': { bg: '#FAECE7', text: '#712B13' },
  'Family-friendly': { bg: '#E1F5EE', text: '#085041' },
  'Photography support': { bg: '#FAEEDA', text: '#633806' },
  'Premium private guide': { bg: '#FBEAF0', text: '#72243E' },
  'Cultural tours': { bg: '#E8F4FD', text: '#0C4A6E' },
  'Water sports': { bg: '#E0F2FE', text: '#075985' },
  'City walking tour': { bg: '#F0FDF4', text: '#14532D' },
  'Budget-friendly': { bg: '#FEF9C3', text: '#713F12' },
};

const PALETTE = Object.values(COLOR_MAP);

function hashLabel(label: string): number {
  let h = 0;
  for (let i = 0; i < label.length; i++) {
    h = (h * 31 + label.charCodeAt(i)) % 2147483647;
  }
  return Math.abs(h);
}

export function getSpecialtyColor(label: string): { bg: string; text: string } {
  return COLOR_MAP[label] ?? PALETTE[hashLabel(label) % PALETTE.length];
}
