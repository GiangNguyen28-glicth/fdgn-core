import { ICrudRepo, IRepoClient } from '@fdgn/common';
import { IOptionsFindAllMongo, IOptionsFindOneMongo } from '../filters';

export type IFilterMongo<T> = IOptionsFindAllMongo<T> | IOptionsFindOneMongo<T>;
export type IBaseCurdMongo<T, Document> = ICrudRepo<T, IFilterMongo<T>> & IRepoClient<Document>;
