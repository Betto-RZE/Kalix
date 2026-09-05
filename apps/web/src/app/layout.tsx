import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'KALIX - Gestión Integral de Comunidades Residenciales',
  description: 'Plataforma web modular, segura y escalable para la administración residencial.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
