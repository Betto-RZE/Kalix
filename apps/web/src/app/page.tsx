import { Shield, Home, Building2, Users, FileText, KeyRound, Wrench, Calendar, Bell } from 'lucide-react';

export default function HomePage() {
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

        {/* Status Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left pt-6">
          <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
            <div className="p-2 bg-sky-500/10 rounded-lg w-fit text-sky-400">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200">Monorepo Ready</h3>
            <p className="text-xs text-slate-400">Next.js + NestJS + Turborepo + Prisma</p>
          </div>

          <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg w-fit text-emerald-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200">Multi-Tenancy</h3>
            <p className="text-xs text-slate-400">Aislamiento por comunidad & RBAC</p>
          </div>

          <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
            <div className="p-2 bg-amber-500/10 rounded-lg w-fit text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200">PostgreSQL + Prisma</h3>
            <p className="text-xs text-slate-400">25 Entidades del Modelo Maestro</p>
          </div>

          <div className="glass-card p-5 rounded-xl border border-slate-800 space-y-2">
            <div className="p-2 bg-purple-500/10 rounded-lg w-fit text-purple-400">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-slate-200">Stack Completo</h3>
            <p className="text-xs text-slate-400">TanStack Query, Zod, Tailwind CSS</p>
          </div>
        </div>

        {/* Roles Badge Grid */}
        <div className="pt-6 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Roles Configurados en el Sistema</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20 text-xs font-semibold">ADMIN</span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold">RESIDENT</span>
            <span className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">OWNER</span>
            <span className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold">SECURITY</span>
            <span className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 text-xs font-semibold">MAINTENANCE</span>
          </div>
        </div>
      </div>
    </main>
  );
}
