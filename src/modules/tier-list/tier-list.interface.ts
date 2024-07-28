import { IUser } from '../user/user.interface';

export interface ITierList {
  id: string;
  user: IUser;
  type: string;
  title: string;
  content: string;
  updatedAt: Date;
  createdAt: Date;
}

export interface ICreateTierListResponse extends ITierList {}
