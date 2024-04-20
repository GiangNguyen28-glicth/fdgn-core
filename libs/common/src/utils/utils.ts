import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { isArray } from 'lodash';

import { IParseJson, IResult } from '../interfaces';
import { PaginationDTO } from '../dto';
import { UNITS_OF_TIME } from '../consts';

export function throwIfNotExists<T>(model: T | any, message: string) {
  if (!model || model?.deleted_at) {
    throw new NotFoundException(`${message}`);
  }
}

export async function hash(value: string): Promise<string> {
  try {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(value, salt);
  } catch (error) {
    throw error;
  }
}

export async function compareHash(value: string, hashValue: string): Promise<boolean> {
  const correct = await bcrypt.compare(value, hashValue);
  return correct ? true : false;
}

export function toKeyword(str: string): string {
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  str = str.replace(/\u02C6|\u0306|\u031B/g, '');
  return str;
}

export function formatResult<T>(data: T[], total_count: number, pagination?: PaginationDTO): IResult<T> {
  const results: IResult<T> = {
    results: data,
    pagination: {
      current_page: pagination?.page,
      current_size: pagination?.size,
      total_count,
    },
  };
  if (!pagination) {
    return results;
  }
  const total_page = total_count / pagination?.size;
  results.pagination.total_page = Math.floor(total_page) + 1;
  if (total_page % 1 === 0) {
    results.pagination.total_page = total_page;
  }
  if (pagination?.page > 1) {
    results.pagination.prev_page = pagination.page - 1;
  } else {
    results.pagination.prev_page = null;
  }
  if (results.pagination.total_page <= pagination.page) {
    results.pagination.next_page = null;
  } else {
    results.pagination.next_page = pagination.page + 1;
  }
  return results;
}

export async function sleep(time: number, unit: UNITS_OF_TIME = 'milliseconds') {
  const valueUnitOfTime = {
    milliseconds: 1,
    seconds: 1000,
    minutes: 1000 * 60,
    hours: 1000 * 60 * 60,
  };
  return new Promise(resolve => setTimeout(resolve, valueUnitOfTime[unit] * time));
}

export function isJSONString(str: string): boolean {
  if (typeof str !== 'string') {
    return false;
  }

  try {
    JSON.parse(str);

    return true;
  } catch (e) {
    return false;
  }
}

export function parseJSON<T>(str: string): IParseJson<T> {
  try {
    return { data: JSON.parse(str), error: null };
  } catch (error) {
    return { error, data: null };
  }
}

export function toArray<T>(data: T | Array<T>): T[] {
  if (!data) return [];
  return (isArray(data) ? data : [data]) as T[];
}
