'use client';

import React, { useState, useEffect } from 'react';
import { X, Download, Upload, Smartphone, Share, CheckCircle2, ShieldCheck, HardDrive } from 'lucide-react';
import { Goal } from '@/types/database';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';
import { useToast } from '@/components/ToastContext';

interface PwaAndBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Goal[];
  salary: number;
  onRestoreBackup: (data: { goals: Goal[]; salary: number }) => void;
}

export function PwaAndBackupModal({
  isOpen,
  onClose,
  goals,
  salary,
  onRestoreBackup,
}: PwaAndBackupModalProps) {
  useBodyScrollLock(isOpen);
  const { showToast } = useToast();

  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detectar se já está instalado como PWA
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Detectar iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(userAgent));

    // Capturar evento de instalação no Android/Chrome
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        showToast('Aplicativo instalado com sucesso na tela de início!', 'success');
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      showToast('No iPhone: toque no ícone Compartilhar e depois em "Adicionar à Tela de Início".', 'info');
    } else {
      showToast('Acesse as opções do seu navegador e clique em "Instalar aplicativo" ou "Adicionar à tela inicial".', 'info');
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      salary,
      goals,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-metas-jennyfer-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    showToast('Backup baixado com sucesso no seu dispositivo!', 'success');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && Array.isArray(json.goals)) {
          onRestoreBackup({
            goals: json.goals,
            salary: json.salary || salary,
          });
          showToast('Dados restaurados com sucesso a partir do backup!', 'success');
          onClose();
        } else {
          showToast('Arquivo de backup inválido.', 'error');
        }
      } catch {
        showToast('Não foi possível ler o arquivo selecionado.', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 overscroll-contain">
      <div className="bg-cream-50 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-4xl sm:rounded-4xl p-6 shadow-2xl border border-peach-200 animate-in slide-in-from-bottom duration-300 overscroll-contain">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-peach-200/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-coral-500 text-white flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-coral-600 uppercase tracking-wider">Ajustes & PWA</span>
              <h3 className="text-base font-black text-cream-900 leading-tight">Instalação & Backup</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-gray-400 hover:text-cream-900 flex items-center justify-center border border-peach-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-5">
          {/* Seção 1: Instalação do PWA na Tela de Início */}
          <div className="bg-white rounded-3xl p-4 border border-peach-200 shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="w-4 h-4 text-coral-500" />
              <h4 className="text-xs font-black text-cream-900">Aplicativo na Tela de Início</h4>
            </div>

            {isStandalone ? (
              <div className="bg-mint-50 border border-mint-200 rounded-2xl p-3 flex items-center gap-2 text-xs font-bold text-mint-800">
                <CheckCircle2 className="w-4 h-4 text-mint-600 shrink-0" />
                <span>Aplicativo já está instalado no modo nativo standalone! 🎉</span>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">
                  Instale o aplicativo no seu smartphone para abrir em tela cheia com carregamento instantâneo, exatamente como um app da App Store / Play Store.
                </p>

                {isIos ? (
                  <div className="bg-peach-50 border border-peach-200 rounded-2xl p-3 text-xs text-cream-900 space-y-1.5">
                    <p className="font-bold flex items-center gap-1.5 text-coral-600">
                      <Share className="w-3.5 h-3.5" /> Como instalar no iPhone (Safari):
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-[11px] text-gray-600">
                      <li>Toque no botão de <strong>Compartilhar</strong> (ícone do quadrado com a seta para cima na barra inferior do Safari).</li>
                      <li>Role para baixo e selecione <strong>&quot;Adicionar à Tela de Início&quot;</strong>.</li>
                      <li>Pronto! O ícone com brilho ✨ aparecerá na tela do seu iPhone.</li>
                    </ol>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="w-full py-3 rounded-2xl bg-coral-500 text-white text-xs font-bold shadow-button hover:bg-coral-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Adicionar à Tela de Início</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Seção 2: Backup e Restauração de Dados */}
          <div className="bg-white rounded-3xl p-4 border border-peach-200 shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-black text-cream-900">Segurança & Backup dos Dados</h4>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed mb-3">
              Guarde uma cópia de segurança de todos os seus desejos, fotos, valores e cofrinhos no seu aparelho.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="py-2.5 px-3 rounded-2xl bg-cream-100 border border-cream-200 hover:bg-cream-200 text-xs font-bold text-cream-900 flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-coral-500" />
                <span>Exportar JSON</span>
              </button>

              <label className="cursor-pointer py-2.5 px-3 rounded-2xl bg-cream-100 border border-cream-200 hover:bg-cream-200 text-xs font-bold text-cream-900 flex items-center justify-center gap-1.5 transition-all active:scale-95">
                <Upload className="w-3.5 h-3.5 text-amber-600" />
                <span>Restaurar</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-peach-200 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-cream-900 text-white text-xs font-bold hover:bg-cream-800 transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

