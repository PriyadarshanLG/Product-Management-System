import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-md w-full px-4 pointer-events-none">
      <div
        *ngFor="let toast of toastService.toasts$ | async"
        class="toast-message pointer-events-auto flex items-center justify-between rounded-lg border p-4 transition-all duration-200"
        [ngClass]="{
          'toast-success': toast.type === 'success',
          'toast-error': toast.type === 'error',
          'toast-info': toast.type === 'info'
        }"
      >
        <div class="flex items-center space-x-3">
          <!-- Icon -->
          <svg *ngIf="toast.type === 'success'" class="w-6 h-6 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <svg *ngIf="toast.type === 'error'" class="w-6 h-6 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <svg *ngIf="toast.type === 'info'" class="w-6 h-6 text-sky-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>

          <span class="text-sm font-medium">{{ toast.text }}</span>
        </div>

        <button
          (click)="toastService.remove(toast.id)"
          class="ml-3 text-slate-400 transition hover:text-slate-800"
          aria-label="Close notification"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  `,
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
