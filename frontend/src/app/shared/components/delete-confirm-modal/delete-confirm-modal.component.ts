import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-delete-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div class="glass-panel w-full max-w-md p-6 rounded-2xl shadow-2xl border border-slate-700/50 bg-slate-900/90 text-slate-100 relative">
        <div class="flex items-center space-x-3 text-rose-500 mb-4">
          <div class="p-3 bg-rose-500/10 rounded-xl">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-white">Delete Product?</h3>
        </div>

        <p class="text-slate-300 mb-2">
          Are you sure you want to delete:
        </p>
        <div class="p-3 bg-slate-800/80 rounded-lg text-rose-300 font-semibold mb-4 border border-rose-500/20 truncate">
          "{{ productName }}"
        </div>
        <p class="text-xs text-slate-400 mb-6 flex items-center">
          <svg class="w-4 h-4 text-amber-400 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          This action cannot be undone.
        </p>

        <div class="flex items-center justify-end space-x-3">
          <button
            type="button"
            (click)="onCancel()"
            [disabled]="isDeleting"
            class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            (click)="onConfirm()"
            [disabled]="isDeleting"
            class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition shadow-lg shadow-rose-600/30 flex items-center space-x-2 disabled:opacity-50"
          >
            <svg *ngIf="isDeleting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isDeleting ? 'Deleting...' : 'Delete' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class DeleteConfirmModalComponent {
  @Input() isOpen = false;
  @Input() productName = '';
  @Input() isDeleting = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
