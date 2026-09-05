'use client';

import { useCommunity } from '@/context/community-context';
import { Building2, ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';

export function CommunitySwitcher() {
    const { memberships, activeMembership, setActiveCommunityId } = useCommunity();
    const [isOpen, setIsOpen] = useState(false);

    if (memberships.length === 0) {
        return null;
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl glass-card hover:bg-slate-800/60 border border-slate-800 text-slate-200 transition-all text-sm font-medium"
            >
                <div className="p-1.5 bg-sky-500/10 rounded-lg text-sky-400">
                    <Building2 className="w-4 h-4" />
                </div>
                <div className="text-left">
                    <p className="font-semibold text-xs text-slate-200">
                        {activeMembership?.community.name || 'Seleccionar Comunidad'}
                    </p>
                    <p className="text-[10px] text-sky-400 font-semibold uppercase">
                        Rol: {activeMembership?.role.name || 'N/A'}
                    </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-64 glass-card rounded-xl border border-slate-800 shadow-2xl py-2 z-50">
                    <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Tus Comunidades
                    </p>
                    {memberships.map((m) => {
                        const isSelected = m.communityId === activeMembership?.communityId;
                        return (
                            <button
                                key={m.id}
                                onClick={() => {
                                    setActiveCommunityId(m.communityId);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-xs text-left transition-colors ${isSelected
                                    ? 'bg-sky-500/10 text-sky-300 font-semibold'
                                    : 'text-slate-300 hover:bg-slate-800/50'
                                    }`}
                            >
                                <div>
                                    <p className="font-medium text-slate-200">{m.community.name}</p>
                                    <p className="text-[10px] text-slate-400 uppercase">Rol: {m.role.name}</p>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
