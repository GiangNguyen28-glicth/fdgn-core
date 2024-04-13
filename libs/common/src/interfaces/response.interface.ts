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

export interface IError {
  message?: string;
  data?: any;
}

export interface IResponse {
  success?: boolean;
  status_code?: number;
  data?: any;
  message?: string;
}
