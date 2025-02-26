export interface IResult<DATA, METADATA = any> {
  results: DATA[];
  pagination: {
    total_count?: number;
    current_page?: number;
    current_size?: number;
    total_page?: number;
    next_page?: number;
    prev_page?: number;
  };
  metadata?: METADATA;
}

export interface IError<DATA = any> {
  message?: string;
  data?: DATA;
}

export interface IGrpcException {
  code: number;
  details: string;
}

export interface IResponse<DATA = any> {
  success: boolean;
  status_code?: number;
  data?: DATA;
  message?: string;
}
