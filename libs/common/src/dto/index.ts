import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min, Type } from '../validation';

export class PaginationDTO {
  @ApiProperty({ type: Number, default: 1 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiProperty({ type: Number, default: 100, required: false })
  @Max(100)
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  size?: number;
}

export class FilterGetAll extends PaginationDTO {
  @ApiProperty({ type: [String], required: false })
  ids?: string[] | number[];

  @ApiProperty({ type: [String], required: false })
  sort?: string[];

  @ApiProperty()
  is_deleted?: boolean;
}
