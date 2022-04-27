import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  startWith
} from 'rxjs';
import { DataState } from './enum/data-state.enum';
import { Status } from './enum/status.enum';
import { AppState } from './interface/app-state';
import { CustomResponse } from './interface/custom-response';
import { Server } from './interface/server';
import { NotificationService } from './service/notification.service';
import { ServerService } from './service/server.service';

declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {

  appState$?: Observable<AppState<CustomResponse>>;
  readonly DataState = DataState;
  readonly Status = Status;

  private filterSubject = new BehaviorSubject<string>('');
  filterStatus$ = this.filterSubject.asObservable();

  private dataSubject = new BehaviorSubject<CustomResponse>(null);

  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();

  constructor(
    private service: ServerService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.appState$ = this.service.servers$().pipe(
      map((response) => {
        this.dataSubject.next(response);

        this.notificationService.onSuccess(response.message);

        return {
          dataState: DataState.LOADED_STATE,
          appData: {
            ...response,
            data: {
              servers: response.data.servers.reverse(),
            },
          },
        };
      }),
      startWith({
        dataState: DataState.LOADING_STATE,
      }),
      catchError((error: string) => {
        this.notificationService.onError(error);
        return of({
          dataState: DataState.ERROR_STATE,
          error: error,
        });
      })
    );
  }

  addNewServer() {
    $('.modal').css('display', 'block');
  }

  closeModal() {
    $('.modal').css('display', 'none');
  }

  pingServer(ipAddress: string): void {
    // Show Spinner
    this.filterSubject.next(ipAddress);

    this.appState$ = this.service.ping$(ipAddress).pipe(
      map((response) => {
        // Replace Pinged Server with existing server
        this.dataSubject.value.data.servers[
          this.dataSubject.value.data.servers.findIndex(
            (server) => server.id == response.data.server.id
          )
        ] = response.data.server;
        // Hide Spinner if Data is back
        this.filterSubject.next('');

        this.notificationService.onDefault(response.message);

        return {
          dataState: DataState.LOADED_STATE,
          appData: this.dataSubject.value,
        };
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value,
      }),
      catchError((error: string) => {
        // Hide Spinner even if Data has error
        this.filterSubject.next('');
        this.notificationService.onError(error);
        return of({
          dataState: DataState.ERROR_STATE,
          error: error,
        });
      })
    );
  }

  filterServers(status: string): void {
    this.appState$ = this.service
      .filter$(status as Status, this.dataSubject.value)
      .pipe(
        map((response) => {

          this.notificationService.onInfo(response.message);

          return {
            dataState: DataState.LOADED_STATE,
            appData: response,
          };
        }),
        startWith({
          dataState: DataState.LOADED_STATE,
          appData: this.dataSubject.value,
        }),
        catchError((error: string) => {
          this.notificationService.onError(error);
          return of({
            dataState: DataState.ERROR_STATE,
            error: error,
          });
        })
      );
  }

  saveServer(serverForm: NgForm): void {
    // Show Spinner
    this.isLoading.next(true);

    this.appState$ = this.service.save$(serverForm.value).pipe(
      map((response) => {
        // Add New Server To Server List
        this.dataSubject.next({
          ...response,
          data: {
            servers: [
              response.data.server,
              ...this.dataSubject.value.data.servers,
            ],
          },
        });

        // Hide Modal And Reset Form
        $('.modal').css('display', 'none');
        serverForm.resetForm({ status: this.Status.SERVER_DOWN });

        // Hide Spinner
        this.isLoading.next(false);

        this.notificationService.onSuccess(response.message);

        return {
          dataState: DataState.LOADED_STATE,
          appData: this.dataSubject.value,
        };
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value,
      }),
      catchError((error: string) => {
        // Hide Spinner
        this.isLoading.next(false);
        this.notificationService.onError(error);
        return of({
          dataState: DataState.ERROR_STATE,
          error: error,
        });
      })
    );
  }

  deleteServer(server: Server): void {
    this.appState$ = this.service.delete$(server.id).pipe(
      map((response) => {
        // Modify Server list After delete
        this.dataSubject.next({
          ...response,
          data: {
            servers: this.dataSubject.value.data.servers.filter(
              (s) => s.id !== server.id
            ),
          },
        });

        this.notificationService.onWarning(response.message);

        return {
          dataState: DataState.LOADED_STATE,
          appData: this.dataSubject.value,
        };
      }),
      startWith({
        dataState: DataState.LOADED_STATE,
        appData: this.dataSubject.value,
      }),
      catchError((error: string) => {
        this.notificationService.onError(error);
        return of({
          dataState: DataState.ERROR_STATE,
          error: error,
        });
      })
    );
  }

  printReport(): void {
    // Save as Pdf
    // window.print();
    this.notificationService.onSuccess('Report Downloaded');
    // Save as xls
    let dataType = 'application/vnd.ms-excel.sheet.macroEnable.12';
    let tableSelect = document.getElementById('serversTable');
    let tableHtml = tableSelect.outerHTML.replace(/ /g, '%20');
    let downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);
    downloadLink.href = 'data:' + dataType + ', ' + tableHtml;
    downloadLink.download = 'server-report.xls';
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
}
