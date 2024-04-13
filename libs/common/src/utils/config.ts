import { isPlainObject, isBoolean } from 'lodash';
export const flattenKeys = (obj: object, current_path: string) => {
  let paths = [];

  for (const k in obj) {
    if (isPlainObject(obj[k]) || Array.isArray(obj[k])) {
      paths = paths.concat(flattenKeys(obj[k], current_path ? `${current_path}.${k}` : k));
    } else {
      paths.push(current_path ? `${current_path}.${k}` : k);
    }
  }

  return paths;
};

export const toInt = (n: number | string | boolean, def?: number): number => {
  if (isBoolean(n)) return n ? 1 : 0;
  if (n === 'true') return 1;
  if (n === 'false') return 0;
  return n ? parseInt(String(n)) : def;
};

export const toBool = (b: boolean | string | number, def = false) => {
  if (!b) return def;
  const value = String(b).toLowerCase();
  return value === 'yes' || value === 'true' || value === '1';
};
