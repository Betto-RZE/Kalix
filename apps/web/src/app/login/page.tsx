'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginDto } from '@kalix/shared';
import { useAuth } from '@/context/auth-context';
import { Shield, KeyRound, Mail, AlertCircle, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginDto>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginDto) => {
        try {
            setErrorMsg(null);
            await login(data);
            router.push('/');
        } catch (err: any) {
            setErrorMsg(err.message || 'Credenciales incorrectas');
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 glass-card p-8 rounded-2xl border border-slate-800 shadow-2xl">

                {/* Encabezado */}
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-sky-500/10 rounded-2xl text-sky-400 border border-sky-500/20 mb-2">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">
                        Iniciar Sesión
                    </h1>
                    <p className="text-sm text-slate-400">
                        Plataforma de Administración Residencial KALIX
                    </p>
                </div>

                {/* Alerta de Error */}
                {errorMsg && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Formulario */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Email */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                            Correo Electrónico
                        </label>
                        <div className="relative">
                            <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                {...register('email')}
                                type="email"
                                placeholder="ejemplo@comunidad.com"
                                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-rose-400 font-medium">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                            Contraseña
                        </label>
                        <div className="relative">
                            <KeyRound className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                {...register('password')}
                                type="password"
                                placeholder="••••••••"
                                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                            />
                        </div>
                        {errors.password && (
                            <p className="text-xs text-rose-400 font-medium">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Botón de Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold py-3.5 px-4 rounded-xl shadow-lg shadow-sky-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Validando...</span>
                            </>
                        ) : (
                            <span>Ingresar a KALIX</span>
                        )}
                    </button>
                </form>
            </div>
        </main>
    );
}
