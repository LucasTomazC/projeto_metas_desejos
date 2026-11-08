'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useBodyScrollLock } from '@/lib/useBodyScrollLock';
import { useToast } from '@/components/ToastContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  useBodyScrollLock(isOpen);
  const { showToast } = useToast();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || 'Jennyfer',
            },
          },
        });

        if (error) throw error;
        showToast('Conta criada com sucesso! Você já está conectado.', 'success', 'Bem-vinda! ✨');
        if (data.session) {
          onSuccess();
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        showToast('Login realizado com sucesso!', 'success', 'Bem-vinda de volta! ✨');
        if (data.session) {
          onSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao realizar autenticação.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-center p-4 overscroll-contain">
      <div className="bg-cream-50 w-full max-w-sm rounded-4xl p-6 shadow-2xl border border-peach-200 animate-in zoom-in-95 duration-200 overscroll-contain">
        
        <div className="flex items-center justify-between pb-3 border-b border-peach-200/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-coral-500 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-cream-900">
              {isSignUp ? 'Criar Conta' : 'Acessar Metas'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-gray-400 hover:text-cream-900 flex items-center justify-center border border-peach-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleAuth} className="mt-4 space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-cream-900 mb-1">Seu Nome</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Jennyfer"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-peach-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral-400 text-cream-900 shadow-soft"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-cream-900 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-peach-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral-400 text-cream-900 shadow-soft"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-cream-900 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-peach-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-coral-400 text-cream-900 shadow-soft"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-coral-500 text-white text-xs font-bold shadow-button hover:bg-coral-600 active:scale-95 transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Carregando...' : isSignUp ? 'Cadastrar e Salvar' : 'Entrar na Conta'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-peach-200 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-semibold text-coral-600 hover:text-coral-700"
          >
            {isSignUp ? 'Já tem uma conta? Entrar' : 'Não tem conta? Cadastre-se'}
          </button>
        </div>
      </div>
    </div>
  );
}
