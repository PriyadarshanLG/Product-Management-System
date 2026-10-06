import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private nextId = 1;

  showSuccess(message: string): void {
    this.addToast('success', message);
  }

  showError(message: string): void {
    this.addToast('error', message);
  }

  showInfo(message: string): void {
    this.addToast('info', message);
  }

  private addToast(type: 'success' | 'error' | 'info', text: string): void {
    const id = this.nextId++;
    const current = this.toastsSubject.value;
    this.toastsSubject.next([...current, { id, type, text }]);

    setTimeout(() => {
      this.remove(id);
    }, 4000);
  }

  remove(id: number): void {
    const current = this.toastsSubject.value.filter((t) => t.id !== id);
    this.toastsSubject.next(current);
  }
}
