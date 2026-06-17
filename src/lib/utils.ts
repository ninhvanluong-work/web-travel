import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  classGroups: {
    'font-size': [
      'text-xxs',
      'text-d1',
      'text-d2',
      'text-d3',
      'text-h1',
      'text-h2',
      'text-h3',
      'text-h4',
      'text-h5',
      'text-h6',
      'text-caption1',
      'text-caption2',
      'text-body1',
      'text-body2',
      'text-body3',
      'text-body4',
      'text-overline1',
      'text-overline2',
      'text-overline3',
      'text-button1',
      'text-button2',
      'text-button3',
    ],
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export function unslugify(str: string) {
  return str.replace(/-/g, ' ');
}

export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function isArrayOfFile(files: unknown): files is File[] {
  const isArray = Array.isArray(files);
  if (!isArray) return false;
  return files.every((file) => file instanceof File);
}

/* eslint-disable @typescript-eslint/no-unused-expressions */
export function removeItem<T>([...arr]: T[], item: T) {
  const index = arr.indexOf(item);
  index > -1 && arr.splice(index, 1);
  return arr;
}

export function closestItem<T>(arr: T[], item: T) {
  const index = arr.indexOf(item);
  if (index === -1) {
    return arr[0];
  }
  if (index === arr.length - 1) {
    return arr[arr.length - 2];
  }
  return arr[index + 1];
}
