// Peças visuais comuns às telas (estilo da referência: painel azul-marinho, botões saturados).
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'confirm' | 'secondary' | 'danger';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-amber-400 text-slate-900 hover:bg-amber-300',
  confirm: 'bg-emerald-600 text-white hover:bg-emerald-500',
  secondary: 'bg-sky-800 text-white hover:bg-sky-700 border border-sky-500/40',
  danger: 'bg-rose-700 text-white hover:bg-rose-600',
};

export function Button({
  variant = 'secondary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`rounded-lg px-4 py-2 font-bold shadow transition disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-amber-300 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

export function Panel({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-sky-300/20 bg-slate-900/85 p-5 shadow-2xl backdrop-blur ${className}`}>
      {title && <h2 className="mb-4 text-center text-xl font-extrabold tracking-wide text-amber-300">{title}</h2>}
      {children}
    </section>
  );
}

/** Fundo das telas de menu: céu e mar estilizados, até a arte final (E27). */
export function MenuBackground({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_top,#2f8fbf_0%,#1b4f7a_45%,#0f1a2b_100%)] p-4">
      {children}
    </div>
  );
}

export function Logo() {
  return (
    <div className="mb-6 text-center">
      <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-[0_3px_0_#14532d] sm:text-5xl">
        IMPÉRIO <span className="text-amber-300">URBANO</span>
      </h1>
      <p className="mt-1 inline-block rounded-full bg-emerald-700 px-4 py-1 text-sm font-extrabold tracking-widest text-amber-200">
        EDIÇÃO BRASIL
      </p>
    </div>
  );
}

export function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-3 rounded-lg bg-rose-900/70 px-3 py-2 text-sm text-rose-100">
      {message}
    </p>
  );
}
