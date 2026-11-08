'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, Sparkles, X } from 'lucide-react';

export type ToastType = 'success' | 'warn' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  confirmDialog: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
  } | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    setToasts((prev) => [...prev, { id, type, message, title }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const confirmDialog = useCallback((options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }) => {
    setDialog({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar',
      onConfirm: options.onConfirm,
    });
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, confirmDialog }}>
      {children}

      {/* Container de Toasts no topo da tela (perfeito para Mobile) */}
      <div className="fixed top-4 left-0 right-0 z-[100] pointer-events-none flex flex-col items-center gap-2 px-4 max-w-md mx-auto">
        {toasts.map((toast) => {
          const typeStyles = {
            success: 'bg-mint-50/95 border-mint-300 text-mint-900 shadow-card',
            warn: 'bg-butter-50/95 border-butter-300 text-amber-900 shadow-card',
            error: 'bg-rose-50/95 border-rose-300 text-rose-900 shadow-card',
            info: 'bg-peach-50/95 border-peach-300 text-cream-900 shadow-card',
          }[toast.type];

          const Icon = {
            success: CheckCircle2,
            warn: AlertCircle,
            error: AlertCircle,
            info: Sparkles,
          }[toast.type];

          const iconColor = {
            success: 'text-mint-600',
            warn: 'text-amber-600',
            error: 'text-rose-500',
            info: 'text-coral-500',
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto w-full backdrop-blur-md rounded-2xl p-3.5 border flex items-start gap-3 animate-in slide-in-from-top-3 fade-in duration-300 ${typeStyles}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                {toast.title && (
                  <h4 className="text-xs font-black leading-tight mb-0.5">{toast.title}</h4>
                )}
                <p className="text-xs font-medium leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 p-1 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal Customizado de Confirmação (Substitui confirm() do navegador) */}
      {dialog?.isOpen && (
        <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-cream-50 w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-peach-200 animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-black text-cream-900 mb-2">{dialog.title}</h3>
            <p className="text-xs text-gray-600 mb-5 leading-relaxed">{dialog.message}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDialog(null)}
                className="flex-1 py-2.5 rounded-2xl bg-white border border-peach-200 text-xs font-bold text-gray-500 hover:bg-cream-100"
              >
                {dialog.cancelText}
              </button>
              <button
                onClick={() => {
                  dialog.onConfirm();
                  setDialog(null);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-button"
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
}

