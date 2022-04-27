import { Server } from './server';


export interface CustomResponse {
  timeStamp: Date;
  data: { servers?: Server[]; server?: Server };
  message: string;
  status: string;
  statusCode: number;
  developerMessage: string;
  reason: string;
}
