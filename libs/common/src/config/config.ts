import { snakeCase, get, set, pick } from 'lodash';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { flattenKeys } from '../utils';

export enum ENV {
  DEV = 'dev',
  TESTING = 'testing',
  STAGING = 'staging',
  PROD = 'prod',
}

export class AppConfig {
  name: string;
  description?: string;
  version: string;
  isProd: boolean;
  env: ENV;
}

const YAML_CONFIG_FILENAME = 'config.yml';
const PACKAGE_CONFIG_FILENAME = 'package.json';

export const config = (): Promise<AppConfig> => {
  const env: ENV = (process.env['NODE_ENV'] ?? ENV.DEV) as ENV;
  const appCfg = yaml.load(readFileSync(YAML_CONFIG_FILENAME, 'utf8')) as object;
  const paths = flattenKeys(appCfg, null);
  for (const path of paths) {
    const envKey = snakeCase(path).toUpperCase();
    set(appCfg, path, process.env[envKey] ?? get(appCfg, path));
  }
  const pkg = JSON.parse(readFileSync(PACKAGE_CONFIG_FILENAME, 'utf8'));
  const pkgCfg = pick(pkg, ['name', 'description', 'version']);

  return {
    env,
    isProd: env === ENV.PROD,
    ...appCfg,
    ...pkgCfg,
  };
};
