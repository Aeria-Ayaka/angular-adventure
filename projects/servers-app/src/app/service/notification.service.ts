import { NotifierService } from 'angular-notifier';

import { Injectable, Type } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private notifier: NotifierService) {}

  onDefault(message: string) {
    this.notifier.notify(MessageType.DEFAULT, message);
  }

  onSuccess(message: string) {
    this.notifier.notify(MessageType.SUCCESS, message);
  }

  onInfo(message: string) {
    this.notifier.notify(MessageType.INFO, message);
  }

  onWarning(message: string) {
    this.notifier.notify(MessageType.WARNING, message);
  }

  onError(message: string) {
    this.notifier.notify(MessageType.ERROR, message);
  }
}

enum MessageType {
  DEFAULT = 'default',
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}
