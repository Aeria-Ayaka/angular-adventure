import { Server } from './../interface/server';
import { CustomResponse } from './../interface/custom-response';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Status } from '../enum/status.enum';

const apiUrl = 'http://localhost:8080/server';

@Injectable({
  providedIn: 'root',
})
export class ServerService {
  constructor(private httpClient: HttpClient) {}

  servers$ = () =>
    <Observable<CustomResponse>>(
      this.httpClient
        .get<CustomResponse>(`${apiUrl}/list`)
        .pipe(tap(console.log), catchError(this.handleErorr))
    );

  save$ = (server: Server) =>
    <Observable<CustomResponse>>(
      this.httpClient
        .post<CustomResponse>(`${apiUrl}/save`, server)
        .pipe(tap(console.log), catchError(this.handleErorr))
    );

  ping$ = (ipAddress: string) =>
    <Observable<CustomResponse>>(
      this.httpClient
        .get<CustomResponse>(`${apiUrl}/ping/${ipAddress}`)
        .pipe(tap(console.log), catchError(this.handleErorr))
    );

  delete$ = (serverId: number) =>
    <Observable<CustomResponse>>(
      this.httpClient
        .delete<CustomResponse>(`${apiUrl}/delete/${serverId}`)
        .pipe(tap(console.log), catchError(this.handleErorr))
    );

  filter$ = (status: Status, response: CustomResponse) =>
    <Observable<CustomResponse>>new Observable<CustomResponse>((subscriber) => {
      subscriber.next(
        status === Status.ALL
          ? // Filter by All
            { ...response, message: `Servers Filtered by ${status} status` }
          : // Filter By UP or DOWN
            {
              ...response,
              message:
                response.data.servers!.filter(
                  (server) => server.status === status
                ).length > 0
                  ? `Servers Filtered by ${
                      status === Status.SERVER_UP ? 'SERVER UP' : 'SERVER DOWN'
                    } status`
                  : `No Servers of ${status} was found`,
              data: {
                servers: response.data.servers!.filter(
                  (server) => server.status === status
                ),
              },
            }
      );
      subscriber.complete();
    }).pipe(tap(console.log), catchError(this.handleErorr));

  private handleErorr(erorr: HttpErrorResponse): Observable<never> {
    console.log(erorr);
    return throwError(
      () => new Error(`An Error occured - Erorr code: ${erorr.status}`)
    );
  }
}
