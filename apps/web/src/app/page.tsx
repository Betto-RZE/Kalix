'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Shield, Layers, Home, ArrowRight, LogIn } from 'lucide-react';

export default function HomePage() {
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (token && user) {
      router.push('/dashboard/sections');
    }
  }, [token, user, router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full text-center space-y-8">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-sky-500/30 text-sky-400 text-sm font-medium">
          <Shield className="w-4 h-4 text-sky-400" />
          <span>Plataforma Multi-Comunidad Residencial v1.0</span>
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
          KALIX Architecture Monorepo
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Plataforma web modular y escalable para la administración integral de fraccionamientos, condominios y comunidades privadas.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          {token && user ? (
            <Link
              href="/dashboard/sections"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold shadow-lg shadow-sky-500/25 transition-all text-base"
            >
              <Layers className="w-5 h-5" />
              <span>Ir al Dashboard (Secciones & Propiedades)</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold shadow-lg shadow-sky-500/25 transition-all text-base"
            >
              <LogIn className="w-5 h-5" />
              <span>Iniciar Sesión en KALIX</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>

        {/* Navigation Quick Links */}
        <div className="flex justify-center gap-6 pt-2">
          <Link
            href="/dashboard/sections"
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-sky-400 transition-colors"
          >
            <Layers className="w-4 h-4" />
            <span>Gestión de Secciones</span>
          </Link>
          <Link
            href="/dashboard/properties"
            className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Gestión de Propiedades</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

