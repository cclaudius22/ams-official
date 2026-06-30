'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import {
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Eye,
  FileSearch,
  Gauge,
  Landmark,
  Layers3,
  LockKeyhole,
  Network,
  ShieldCheck,
  UserCheck,
  Workflow,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginRole = 'executive' | 'officer';

const heroStats = [
  { label: 'Processing', value: 'Weeks → under 1 min', tone: '#087348' },
  { label: 'SLA adherence', value: '98%, fully tracked', tone: '#0e7490' },
  { label: 'Work allocation', value: 'AutoQ-assigned by capacity', tone: '#6b4bb8' },
  { label: 'Visa Types', value: 'New visa types added by config in weeks', tone: '#b8860b' },
];

const principles = [
  {
    icon: Eye,
    title: 'Glass Box AI, not Black Box',
    body: 'Every recommendation carries a complete, human-readable trace of the rules and checks behind it. No opaque score — an officer, auditor, or court can see exactly why.',
    tone: '#6b4bb8',
    chip: '#f1edff',
  },
  {
    icon: UserCheck,
    title: 'The human is always in control',
    body: 'The platform returns one of three outcomes — and nothing more. The final decision, in every case, rests with the caseworker.',
    tone: '#6b4bb8',
    chip: '#f1edff',
  },
  {
    icon: ShieldCheck,
    title: 'Sovereign by design',
    body: 'Single-tenant, data-resident within the deploying nation\'s own borders, architected for the assurance and isolation a government department requires — from the ground up, not retrofitted.',
    tone: '#0e7490',
    chip: '#e0f5ee',
  },
];

const proofMetrics = [
  {
    label: 'Physical Processing infrastructure',
    value: '12-18 months',
    body: 'Buildings, hardware, hiring, procurement, and operational ramp-up before capacity changes.',
    dot: '#9890a6',
  },
  {
    label: 'OpenVisa: Digital, Cloud Native, Auto Scales',
    value: 'Up to 9 weeks',
    body: 'AI Native Decision Intelligence infrastructure deployed in weeks, customised, configured and measured against sovereign criteria.',
    dot: '#0e7490',
  },
];

const amsLayers = [
  {
    icon: Layers3,
    title: 'Multi-visa intake',
    body: 'Six visa routes land in one operating board, with each application normalised into a decision-ready queue record.',
  },
  {
    icon: Network,
    title: 'AutoQ allocation',
    body: 'Work is routed by specialism and capacity. Overflow stays visible as backlog instead of vanishing into overloaded officers.',
  },
  {
    icon: FileSearch,
    title: 'Deep review',
    body: 'Recommendation, Glass Box trace, evidence, external checks, documents, and OV assessment in one caseworker surface.',
  },
  {
    icon: BellRing,
    title: 'RFI lane',
    body: 'Missing evidence is requested, parked, returned, and re-reviewed without pretending the system made the decision.',
  },
];

const visaTypes = [
  'Work route',
  'Student',
  'Global Talent',
  'Spouse / Partner',
  'Senior Specialist',
  'Innovator Founder',
];

const officerRows = [
  ['Rachel Johnson', '24 / 25', '96%'],
  ['Ricardo Martinez', '23 / 25', '92%'],
  ['Uma Mirza', '25 / 25', '99%'],
  ['Kerry Henderson', '21 / 25', '98%'],
];

export default function LandingPage() {
  const router = useRouter();
  const [showCredentials, setShowCredentials] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState<LoginRole>('officer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitCredentials = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push(loginRole === 'executive' ? '/dashboard/livequeue' : '/dashboard/reviewer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#1a1530]">
      <section className="relative overflow-hidden bg-white text-[#20163f]">
        <HeroBackdrop />

        <nav className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 md:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="OpenVisa AMS home">
            <Image src="/logo/ov_logo.png" alt="" width={38} height={38} priority />
            <span className="leading-none">
              <span className="block text-sm font-semibold text-[#20163f]">OpenVisa AMS</span>
              <span className="block text-xs text-[#7a7188]">Executive demonstration</span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <a href="#opportunity" className="px-3 py-2 text-sm text-[#675f7d] hover:text-[#20163f]">
              Opportunity
            </a>
            <a href="#access" className="px-3 py-2 text-sm text-[#675f7d] hover:text-[#20163f]">
              Demo access
            </a>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden text-[#20163f] hover:bg-[#f4f0ff] hover:text-[#20163f] sm:inline-flex">
              <Link href="/dashboard/reviewer">
                Officer
                <UserCheck className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild className="bg-[#20163f] text-white hover:bg-[#36236f]">
              <Link href="/dashboard/livequeue">
                Executive
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </nav>

        <div className="relative z-10 mx-auto max-w-7xl px-5 pb-12 pt-6 md:px-8">
          <div className="max-w-[860px]">
            <div className="mb-5 inline-flex items-center gap-2 rounded-[8px] bg-[#20163f] px-3 py-1.5 text-sm font-semibold uppercase text-white">
              <span className="h-px w-8 bg-[#58c0e0]" />
              OpenVisa: a sovereign, explainable AI decision platform for governments
            </div>

            <h1 className="text-4xl font-semibold leading-[1.06] tracking-[-0.02em] text-[#20163f] md:text-5xl">
              Immigration casework, at the speed of the world.
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5d536b] md:text-xl">
              Faster processing, full transparency, and the human firmly in control of
              every decision, extended into AMS operations: AutoQ, officer capacity,
              multi-visa routing, RBAC, deep review, and RFIs.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {['Glass Box AI', 'Rules and policy driven', 'Human-in-control', 'Sovereign by design'].map((pill) => (
                <span key={pill} className="rounded-full bg-[#f6f3fb] px-4 py-2 text-sm font-semibold text-[#5d536b]">
                  {pill}
                </span>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11 bg-[#58c0e0] px-5 text-[#1a1530] hover:bg-[#8ad3e9]">
                <Link href="/dashboard/livequeue">
                  Start executive demo
                  <Gauge className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 border-[#d9d3e8] bg-white px-5 text-[#20163f] hover:bg-[#f4f0ff]"
              >
                <Link href="/dashboard/reviewer">
                  Open officer workbench
                  <BriefcaseBusiness className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[8px] border-t-2 bg-[#fbfaff] px-4 py-3"
                  style={{ borderTopColor: stat.tone }}
                >
                  <div
                    className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.04em]"
                    style={{ color: stat.tone }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stat.tone }} />
                    {stat.label}
                  </div>
                  <div className="mt-1.5 text-sm font-semibold leading-snug tracking-[-0.01em] text-[#20163f]">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-[#e5dfd4] bg-white px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6b4bb8]">
            01 What we have built
          </p>
          <p className="mt-5 max-w-4xl text-lg leading-8 text-[#5d536b] md:text-xl">
            A decision-support platform — the <span className="font-semibold text-[#20163f]">Decision Intelligence System</span> —
            live today for Work Route casework and configured for further routes, built on three
            principles a government can defend publicly.
          </p>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <div key={principle.title} className="rounded-2xl border border-[#e6e1ef] bg-white p-7 shadow-sm">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: principle.chip, color: principle.tone }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-[#20163f]">{principle.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#625a74]">{principle.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="opportunity" className="border-b border-[#e5dfd4] bg-white px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6b4bb8]">02 The opportunity</p>
            <h2 className="mt-3 max-w-4xl text-2xl font-semibold leading-snug tracking-[-0.01em] text-[#20163f] md:text-3xl">
              OpenVisa <span className="font-bold text-[#6b4bb8]">removes the processing bottlenecks</span> around the decision
              so officers spend their time where judgement genuinely matters.
            </h2>
          </div>

          <div className="mt-12 grid gap-x-10 gap-y-12 lg:grid-cols-[1fr_auto_1fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-[8px] bg-[#20163f] px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.08em] text-white">
                <span className="h-px w-8 bg-[#ff6b6b]" />
                The wait today
              </div>
              <div className="mt-4 text-5xl font-semibold leading-none tracking-[-0.02em] text-[#20163f] md:text-6xl">
                Up to 12 months
              </div>
              <p className="mt-5 max-w-md text-base leading-7 text-[#7a7188]">
                Upwards of two weeks for a standard case, and far longer for complex and
                asylum routes. This is the backlog.
              </p>
            </div>
            <div className="hidden items-center justify-center lg:flex">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e3ddeb] text-[#0e7490]">
                <ArrowRight className="h-5 w-5" />
              </span>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-[8px] bg-[#20163f] px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.08em] text-white">
                <span className="h-px w-8 bg-[#58c0e0]" />
                With OpenVisa
              </div>
              <div className="mt-4 text-5xl font-semibold leading-none tracking-[-0.02em] text-[#20163f] md:text-6xl">
                Under 1 minute
              </div>
              <p className="mt-5 max-w-md text-base leading-7 text-[#7a7188]">
                Documents read, checks run, and every applicable rule applied for every
                case, including complex ones. The system never decides.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf7] px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-x-16 gap-y-10 md:grid-cols-2">
            {proofMetrics.map((metric) => (
              <div key={metric.label}>
                <div className="inline-flex items-center gap-2 rounded-[8px] bg-[#20163f] px-3 py-1.5 text-sm font-semibold uppercase tracking-[0.08em] text-white">
                  <span className="h-px w-8" style={{ backgroundColor: metric.dot }} />
                  {metric.label}
                </div>
                <div className="mt-4 text-5xl font-semibold leading-none tracking-[-0.02em] text-[#20163f] md:text-6xl">
                  {metric.value}
                </div>
                <p className="mt-5 max-w-md text-base leading-7 text-[#7a7188]">{metric.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#e5dfd4] bg-white px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase text-[#6b4bb8]">03 What AMS adds</p>
            <h2 className="mt-3 text-4xl font-semibold leading-[1.06] tracking-[-0.02em] text-[#20163f] md:text-5xl">
              DIS removes the processing bottlenecks. AMS turns that into an operating model.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {amsLayers.map((layer) => {
              const Icon = layer.icon;
              return (
                <article
                  key={layer.title}
                  className="rounded-[8px] border border-[#e3ddeb] bg-white p-6 shadow-[0_4px_20px_-8px_rgba(32,22,63,0.12)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#eaf6fa] text-[#0e7490]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold tracking-[-0.01em] text-[#20163f]">{layer.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#625a74]">{layer.body}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[8px] border border-[#e3ddeb] bg-[#fbfaff] p-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-[#6b4bb8]" />
                <h3 className="text-2xl font-semibold text-[#20163f]">Multi-visa from day one</h3>
              </div>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {visaTypes.map((visa) => (
                  <div key={visa} className="flex items-center gap-2 rounded-[8px] border border-[#ebe7f3] bg-white px-3 py-3 text-sm text-[#40394f]">
                    <CheckCircle2 className="h-4 w-4 text-[#087348]" />
                    {visa}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[8px] border border-[#ded8ca] bg-[#20163f] p-6 text-white">
              <div className="flex items-center gap-3">
                <LockKeyhole className="h-5 w-5 text-[#58c0e0]" />
                <h3 className="text-2xl font-semibold">Role separation, not just dashboards</h3>
              </div>
              <div className="mt-6 grid gap-3">
                <div className="rounded-[8px] border border-white/10 bg-white/7 p-4">
                  <div className="text-sm font-semibold text-[#58c0e0]">Executive view</div>
                  <p className="mt-1 text-sm leading-6 text-[#d7cef5]">
                    Live queue, workload, service levels, and allocation health without per-case PII.
                  </p>
                </div>
                <div className="rounded-[8px] border border-white/10 bg-white/7 p-4">
                  <div className="text-sm font-semibold text-[#ffb661]">Officer view</div>
                  <p className="mt-1 text-sm leading-6 text-[#d7cef5]">
                    Assigned cases, DIS/OV evidence, RFIs, and decision support for the cases they own.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf7] px-5 py-20 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase text-[#6b4bb8]">04 Honest economics</p>
            <h2 className="mt-3 text-4xl font-semibold leading-[1.06] tracking-[-0.02em] text-[#20163f] md:text-5xl">
              We do not claim to make officers decide faster.
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#5d536b]">
              Research puts caseworker throughput around 20 decisions a day. AMS does not
              change that, and should not pretend to. It removes the 2+ week processing bottleneck,
              makes backlog visible, and lets fixed human capacity go entirely to deciding.
            </p>
          </div>

          <div className="rounded-[8px] border border-[#e3ddeb] bg-white p-6 shadow-sm">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase text-[#6b4bb8]">Officer utilisation</p>
                <div className="mt-3 text-4xl font-semibold text-[#20163f]">94%</div>
                <div className="mt-3 h-2 rounded-full bg-[#f1edff]">
                  <div className="h-2 w-[94%] rounded-full bg-[#ff9f1c]" />
                </div>
                <p className="mt-2 text-sm text-[#7a718c]">Stretched, at full capacity</p>
              </div>
              <div>
                <p className="text-sm font-semibold uppercase text-[#087348]">SLA adherence</p>
                <div className="mt-3 text-4xl font-semibold text-[#087348]">98%</div>
                <div className="mt-3 h-2 rounded-full bg-[#e0f4e9]">
                  <div className="h-2 w-[98%] rounded-full bg-[#15b37d]" />
                </div>
                <p className="mt-2 text-sm text-[#4b6c60]">On track, backlog visible and tracked</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {officerRows.map(([name, load, score]) => (
                <div key={name} className="grid grid-cols-[1fr_88px_64px] items-center gap-3 rounded-[8px] border border-[#eeeaf5] bg-[#fbfaff] px-4 py-3 text-sm">
                  <span className="font-medium text-[#20163f]">{name}</span>
                  <span className="text-[#6f6680]">{load}</span>
                  <span className="text-right font-semibold text-[#087348]">{score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="access" className="bg-[#20163f] px-5 py-16 text-white md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase text-[#58c0e0]">05 Enter the demo</p>
            <h2 className="mt-3 text-5xl font-semibold leading-tight tracking-[-0.02em] md:text-6xl">
              Start with the story, then step into the system.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#d7cef5]">
              Open the executive console to show intake, process, allocation, backlog, and capacity.
              Then switch to the officer workbench for case-level evidence and RFIs.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 bg-[#58c0e0] px-5 text-[#20163f] hover:bg-[#8ad3e9]">
                <Link href="/dashboard/livequeue">
                  Executive console
                  <Gauge className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 border-white/20 bg-white/7 px-5 text-white hover:bg-white/14 hover:text-white">
                <Link href="/dashboard/reviewer">
                  Officer gateway
                  <Workflow className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="rounded-[8px] border border-white/12 bg-white p-5 text-[#20163f] shadow-2xl shadow-black/20">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setShowCredentials((current) => !current)}
            >
              <span>
                <span className="block text-sm font-semibold">Use credentials</span>
                <span className="mt-1 block text-sm text-[#6d647c]">Subtle fallback for seeded demo accounts</span>
              </span>
              <ArrowRight className={`h-4 w-4 text-[#6d647c] transition-transform ${showCredentials ? 'rotate-90' : ''}`} />
            </button>

            {showCredentials && (
              <form onSubmit={submitCredentials} className="mt-5 space-y-4 border-t border-[#eeeaf5] pt-5">
                <div className="grid grid-cols-2 gap-2 rounded-[8px] bg-[#f4f0ff] p-1">
                  {(['officer', 'executive'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setLoginRole(role)}
                      className={`rounded-[6px] px-3 py-2 text-sm font-medium transition ${
                        loginRole === role
                          ? 'bg-white text-[#20163f] shadow-sm'
                          : 'text-[#71658d] hover:text-[#20163f]'
                      }`}
                    >
                      {role === 'officer' ? 'Officer' : 'Executive'}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@gov.example"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button type="submit" className="w-full bg-[#20163f] text-white hover:bg-[#36236f]" disabled={isSubmitting}>
                  {isSubmitting ? 'Checking access...' : 'Sign in'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#3c2a74] bg-[#20163f] px-5 py-8 text-white md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo/ov_logo.png" alt="" width={34} height={34} />
            <span className="text-sm text-white/62">OpenVisa AMS · Government demo system</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/52">
            <Landmark className="h-4 w-4" />
            Built for staged pilots, human decisioning, and defensible operations
          </div>
        </div>
      </footer>
    </main>
  );
}

function HeroBackdrop() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(14,116,144,0.05),transparent_30%),radial-gradient(circle_at_10%_85%,rgba(107,75,184,0.05),transparent_30%)]" />
    </div>
  );
}
