/* eslint-disable @typescript-eslint/no-empty-interface */
import { ICrudRepo, IRepoClient } from '@fdgn/common';
import { IOptionsFindAllTypeOrm, IOptionsFindOneTypeOrm } from '../filters';

export type FilterTypeOrm<T> = IOptionsFindAllTypeOrm<T> | IOptionsFindOneTypeOrm<T>;
export type IBaseCurdTypeOrm<T, Repo> = ICrudRepo<T, FilterTypeOrm<T>> & IRepoClient<Repo>;
