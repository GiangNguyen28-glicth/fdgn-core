export interface IResult<T> {
  results: T[];
  pagination: {
    total_count?: number;
    current_page?: number;
    current_size?: number;
    total_page?: number;
    next_page?: number;
    prev_page?: number;
  };
  metadata?: any;
}

export interface IError<T> {
  message?: string;
  data?: T;
}

export interface IGrpcException {
  code: number;
  details: string;
}

export interface IResponse<DATA> {
  success: boolean;
  status_code?: number;
  data?: DATA;
  message?: string;
}
