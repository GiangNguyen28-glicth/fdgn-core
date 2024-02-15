import { Schema } from 'mongoose';
export const ASIA_HCM_TZ = 'Asia/Ho_Chi_Minh';
export const OK = 'OK';

export const LANGUAGE = {
  EN: 'en',
  VI: 'vi',
};

export const MongoID = Schema.Types.ObjectId;

export const DATE_FORMAT = {
  DEFAULT: 'YYYY-MM-DD',
  YYYYMMDD: 'YYYYMMDD',
  YYYYMM: 'YYYYMM',
  YYYY_MM: 'YYYY-MM',
};
