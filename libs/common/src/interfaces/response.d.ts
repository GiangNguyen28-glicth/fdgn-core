export interface IResult<T> {
  results: T[];
  pagination: {
    totalCount?: number;
    currentPage?: number;
    currentSize?: number;
    totalPage?: number;
    nextPage?: number;
    prevPage?: number;
  };
  metadata?: any;
}

export interface IErrorResponse {
  message?: string;
  data?: any;
}

export interface IResponse {
  success?: boolean;
  statusCode?: number;
  data?: any;
  message?: string;
}
