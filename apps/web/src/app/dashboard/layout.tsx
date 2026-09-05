'use client';

import { useAuth } from '@/context/auth-context';
import { useCommunity } from '@/context/community-context';
import { CommunitySwitcher } from '@/components/community-switcher';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Shield, Layers, Home, Car, DollarSign, CreditCard, TrendingDown, LogOut } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, token, logout } = useAuth();
    const { activeMembership, isLoading } = useCommunity();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && (!token || !user)) {
            router.push('/login');
        }
    }, [token, user, isLoading, router]);

    if (isLoading || !user) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-400"></div>
            </div>
        );
    }

    const navItems = [
        { label: 'Secciones', href: '/dashboard/sections', icon: Layers },
        { label: 'Propiedades', href: '/dashboard/properties', icon: Home },
        { label: 'Vehículos', href: '/dashboard/vehicles', icon: Car },
        { label: 'Cuotas', href: '/dashboard/fees', icon: DollarSign },
        { label: 'Pagos', href: '/dashboard/payments', icon: CreditCard },
        { label: 'Gastos', href: '/dashboard/expenses', icon: TrendingDown },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col">
            {/* Top Navbar */}
            <header className="sticky top-0 z-40 border-b border-slate-800/80 glass-card bg-slate-950/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {/* Logo */}
                        <Link href="/dashboard/sections" className="flex items-center gap-2 font-bold text-xl text-white">
                            <div className="p-2 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-xl text-white shadow-lg shadow-sky-500/20">
                                <Shield className="w-5 h-5" />
                            </div>
                            <span className="bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
                                KALIX
                            </span>
                        </Link>

                        {/* Community Switcher */}
                        <CommunitySwitcher />
                    </div>

                    {/* Nav Links & User Action */}
                    <div className="flex items-center gap-4">
                        <nav className="hidden md:flex items-center gap-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                            ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="h-6 w-px bg-slate-800 hidden md:block" />

                        {/* Profile / Logout */}
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex flex-col text-right">
                                <span className="text-xs font-semibold text-slate-200">
                                    {user.firstName} {user.lastName}
                                </span>
                                <span className="text-[10px] text-slate-400">{user.email}</span>
                            </div>
                            <button
                                onClick={logout}
                                title="Cerrar sesión"
                                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
