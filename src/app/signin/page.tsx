// src/app/signin/page.tsx
// Branded demo sign-in for OpenVisa AMS. Phase 1: no credentials form — two
// seeded demo identities (officer / executive), each one POST away from a
// working session. Visual idiom matches src/app/page.tsx (the public
// landing page): deep-purple hero, cyan primary CTA, Fraunces display type.
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, BriefcaseBusiness, Loader2, ShieldCheck } from 'lucide-react';
import { landingFor, type Role } from '@/lib/authRedirect';
import { STORAGE_KEY as OFFICER_STORAGE_KEY } from '@/contexts/OfficerContext';

type DemoLogin = {
  role: Role;
  title: string;
  cta: string;
  description: string;
  email: string;
  password: string;
  icon: typeof ShieldCheck;
};

const DEMO_LOGINS: DemoLogin[] = [
  {
    role: 'officer',
    title: 'Officer (demo)',
    cta: 'Sign in as Officer (demo)',
    description: 'Reviewer gateway, case queue, deep review, and the RFI lane.',
    email: 'officer@demo.gov',
    password: 'officer',
    icon: ShieldCheck,
  },
  {
    role: 'admin',
    title: 'Executive (demo)',
    cta: 'Sign in as Executive (demo)',
    description: 'Live queue, workload, service levels, and allocation health.',
    email: 'admin@demo.gov',
    password: 'admin',
    icon: BriefcaseBusiness,
  },
];

// Shared class recipes — mirrors src/app/page.tsx so /signin reads as the
// same product, not a generic auth screen.
const eyebrow = 'text-[11px] font-bold uppercase tracking-[0.14em]';
const cardBase =
  'rounded-xl border border-[#E4E2EC] bg-white shadow-[0_1px_2px_rgba(45,27,105,0.05)] transition-shadow duration-200 hover:shadow-[0_12px_32px_-16px_rgba(45,27,105,0.24)]';
const ctaBase =
  'inline-flex w-full items-center justify-center gap-[9px] rounded-xl px-[22px] py-[14px] text-[15px] font-semibold transition-[background-color,transform] duration-150 [transition-timing-function:cubic-bezier(0.2,0,0,1)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70';
const ctaPrimary = `${ctaBase} bg-[#4DB8E8] text-[#14093A] hover:bg-[#3EA9DC] focus-visible:ring-[#4DB8E8]`;

export default function SignInPage() {
  const router = useRouter();
  const [pendingRole, setPendingRole] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(login: DemoLogin) {
    setPendingRole(login.role);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: login.email, password: login.password }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.error || 'Unable to sign in');
      }

      // Demo-only: seed the officer switcher's default selection so the
      // dashboard opens already showing the officer who just signed in,
      // rather than whatever OfficerContext.tsx falls back to on first
      // mount. Executive sign-in has no officerId and must not touch this.
      if (login.role === 'officer') {
        window.localStorage.setItem(OFFICER_STORAGE_KEY, body?.officerId || 'officer-demo');
      }

      router.push(landingFor(login.role));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
      setPendingRole(null);
    }
  }

  return (
    <main className="ams-landing min-h-screen bg-[#FAF9FC] text-[#0F0B1E]">
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden bg-[#2D1B69] px-6 py-14 text-white md:px-8 md:py-20">
        <Image
          src="/logo/ov_logo.png"
          alt=""
          aria-hidden
          width={620}
          height={360}
          priority
          className="pointer-events-none absolute -right-[140px] -top-[160px] h-auto w-[460px] max-w-none opacity-[0.06]"
        />

        <div className="relative z-[2] mx-auto flex w-full max-w-[1200px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="OpenVisa AMS home">
            <Image src="/logo/ov_logo.png" alt="" width={58} height={34} priority className="h-[34px] w-auto" />
            <span className="leading-[1.1]">
              <span className="block text-[15px] font-semibold tracking-[-0.01em] text-white">OpenVisa AMS</span>
              <span className="block text-xs text-white/60">Demo sign-in</span>
            </span>
          </Link>
        </div>

        <div className="relative z-[2] mx-auto mt-11 w-full max-w-[1200px]">
          <div className="mb-[22px] inline-flex items-center gap-2.5 rounded-lg border border-white/[0.12] bg-white/[0.07] px-3.5 py-[7px]">
            <span className="h-0.5 w-[22px] rounded-[1px] bg-[#4DB8E8]" />
            <span className={`${eyebrow} text-white/[0.86]`}>Sign in to the demo workspace</span>
          </div>

          <h1 className="ams-display max-w-[720px] text-[36px] leading-[1.08] text-white sm:text-[48px]">
            Step into the demo as the role you want to see.
          </h1>

          <p className="mt-5 max-w-[620px] text-[17px] leading-[1.6] text-white/[0.74]">
            This is a seeded demo sign-in, not a credentials form — full department accounts
            arrive in Phase 2. Pick a role below and the demo signs you in instantly.
          </p>
        </div>
      </section>

      {/* ===================== ROLE PICKER ===================== */}
      <section className="px-6 py-14 md:px-8 md:py-16">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="grid gap-5 md:grid-cols-2">
            {DEMO_LOGINS.map((login) => {
              const Icon = login.icon;
              const isPending = pendingRole === login.role;
              const isDisabled = pendingRole !== null;

              return (
                <button
                  key={login.role}
                  type="button"
                  onClick={() => signIn(login)}
                  disabled={isDisabled}
                  className={`${cardBase} flex min-h-[200px] w-full flex-col items-start justify-between p-7 text-left`}
                >
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#F4EEFA] text-[#6B3FA0]">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[18px] font-semibold tracking-[-0.01em] text-[#0F0B1E]">
                        {login.title}
                      </div>
                      <p className="mt-1.5 text-sm leading-[1.55] text-[#4A4564]">{login.description}</p>
                    </div>
                  </div>

                  <span className={`${ctaPrimary} mt-6`}>
                    {isPending ? 'Signing in…' : login.cta}
                    {isPending ? (
                      <Loader2 className="h-[18px] w-[18px] animate-spin" aria-hidden="true" />
                    ) : (
                      <ArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {error ? (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-[#F0B8B8] bg-[#FDECEC] px-5 py-4 text-sm text-[#8A2A2A]"
            >
              {error}
            </div>
          ) : null}

          <p className="ams-mono mt-10 text-xs text-[#9A98AB]">
            Demo credentials: officer@demo.gov · admin@demo.gov — seeded for this environment only.
          </p>
        </div>
      </section>
    </main>
  );
}
