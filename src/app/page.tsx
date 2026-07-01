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
  Check,
  CheckCircle2,
  Cpu,
  Eye,
  FileSearch,
  Gauge,
  Info,
  Landmark,
  Layers3,
  LockKeyhole,
  Network,
  RefreshCw,
  Route,
  Server,
  ShieldCheck,
  UserCheck,
  Workflow,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginRole = 'executive' | 'officer';

const heroStats = [
  { label: 'Processing', value: 'Weeks → under 1 min', tone: '#3FB07A' },
  { label: 'SLA adherence', value: '98%, fully tracked', tone: '#4DB8E8' },
  { label: 'Work allocation', value: 'AutoQ-assigned by capacity', tone: '#C0A0DD' },
  { label: 'Visa types', value: 'New routes added by config in weeks', tone: '#7FDFD3' },
];

const principles = [
  {
    icon: Eye,
    title: 'Glass Box AI, not black box',
    body: 'Every recommendation carries a complete, human-readable trace of the rules and checks behind it. No opaque score — an officer, auditor, or court can see exactly why.',
    tone: '#6B3FA0',
    chip: '#F4EEFA',
  },
  {
    icon: UserCheck,
    title: 'The human is always in control',
    body: 'The platform returns one of three outcomes — and nothing more. The final decision, in every case, rests with the caseworker.',
    tone: '#2D1B69',
    chip: '#F2F0F9',
  },
  {
    icon: ShieldCheck,
    title: 'Sovereign by design',
    body: "Single-tenant, data-resident within the deploying nation's own borders, architected for the assurance and isolation a government department requires — from the ground up, not retrofitted.",
    tone: '#0E7C71',
    chip: '#E6FAF7',
  },
];

const proofMetrics = [
  {
    label: 'Physical processing infrastructure',
    value: '12–18 months',
    body: 'Buildings, hardware, hiring, procurement, and operational ramp-up before capacity changes.',
    dot: '#D64545',
  },
  {
    label: 'DIS: cloud native, scales to demand',
    value: 'Up to 9 weeks',
    body: 'Decision infrastructure deployed as code, measured against agreed success criteria.',
    dot: '#6B3FA0',
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

const defensibleMetrics = [
  { label: 'Drools rules', value: '18', total: '/20', tone: '#1F6B45' },
  { label: 'OPA policies', value: '11', total: '/12', tone: '#A8740F' },
  { label: 'External checks', value: '6', total: '/7', tone: '#A8740F' },
  { label: 'Completeness', value: '93', total: '/100', tone: '#0F0B1E' },
];

const ipPillars = [
  {
    icon: Cpu,
    title: 'Trained for immigration',
    body: 'Models built for casework and the legal frameworks that govern it.',
    tone: '#6B3FA0',
    chip: '#F4EEFA',
  },
  {
    icon: Route,
    title: 'Every rule traceable',
    body: 'Each recommendation decomposes to its exact rules and evidence.',
    tone: '#2D1B69',
    chip: '#F2F0F9',
  },
  {
    icon: RefreshCw,
    title: 'Retrainable with feedback',
    body: "The pipeline learns from the department's own decisions.",
    tone: '#0E7C71',
    chip: '#E6FAF7',
  },
  {
    icon: Server,
    title: 'Sovereign — no third party',
    body: "All data stays in the department's environment. No external services.",
    tone: '#1F6B45',
    chip: '#E8F6EE',
  },
];

// Shared class recipes ------------------------------------------------------
const sectionRail = 'mx-auto w-full max-w-[1200px]';
const eyebrow = 'text-[11px] font-bold uppercase tracking-[0.14em]';
const cardBase =
  'rounded-xl border border-[#E4E2EC] bg-white shadow-[0_1px_2px_rgba(45,27,105,0.05)] transition-shadow duration-200 hover:shadow-[0_12px_32px_-16px_rgba(45,27,105,0.24)]';
const cardStatic =
  'rounded-xl border border-[#E4E2EC] bg-white shadow-[0_1px_2px_rgba(45,27,105,0.05)]';
const ctaBase =
  'inline-flex items-center justify-center gap-[9px] rounded-xl px-[22px] py-[14px] text-[15px] font-semibold transition-[background-color,transform] duration-150 [transition-timing-function:cubic-bezier(0.2,0,0,1)] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2D1B69]';
const ctaPrimary = `${ctaBase} bg-[#4DB8E8] text-[#14093A] hover:bg-[#3EA9DC] focus-visible:ring-[#4DB8E8]`;
const ctaOutlineDark = `${ctaBase} border border-white/25 bg-white/5 text-white hover:bg-white/10 focus-visible:ring-white/60`;
const navBtnBase =
  'inline-flex items-center gap-[7px] rounded-[10px] px-[14px] py-[9px] text-sm transition-[background-color,transform] duration-150 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2D1B69]';
const inputClass =
  'h-auto rounded-[10px] border-[#E4E2EC] bg-white px-[13px] py-[11px] text-sm text-[#0F0B1E] shadow-none placeholder:text-[#9A98AB] focus-visible:border-[#6B3FA0] focus-visible:ring-[3px] focus-visible:ring-[#6B3FA0]/[0.28]';

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
    <main className="ams-landing min-h-screen bg-[#FAF9FC] text-[#0F0B1E]">
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden bg-[#2D1B69] text-white">
        <Image
          src="/logo/ov_logo.png"
          alt=""
          aria-hidden
          width={620}
          height={360}
          priority
          className="pointer-events-none absolute -right-[140px] -top-[160px] h-auto w-[620px] max-w-none opacity-[0.06]"
        />

        <nav
          className={`relative z-[2] flex flex-wrap items-center justify-between gap-4 px-6 py-[22px] md:px-8 ${sectionRail}`}
        >
          <Link href="/" className="flex items-center gap-3" aria-label="OpenVisa AMS home">
            <Image src="/logo/ov_logo.png" alt="" width={58} height={34} priority className="h-[34px] w-auto" />
            <span className="leading-[1.1]">
              <span className="block text-[15px] font-semibold tracking-[-0.01em] text-white">OpenVisa AMS</span>
              <span className="block text-xs text-white/60">Executive demonstration</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-[22px]">
            <a href="#opportunity" className="hidden text-sm text-white/[0.72] transition-colors hover:text-white sm:inline-block">
              Opportunity
            </a>
            <a href="#access" className="hidden text-sm text-white/[0.72] transition-colors hover:text-white sm:inline-block">
              Demo access
            </a>
            <Link href="/dashboard/reviewer" className={`${navBtnBase} border border-white/20 bg-white/[0.06] font-medium text-white hover:bg-white/10 focus-visible:ring-white/60`}>
              Officer
              <UserCheck className="h-4 w-4" />
            </Link>
            <Link href="/dashboard/livequeue" className={`${navBtnBase} bg-[#4DB8E8] font-semibold text-[#14093A] hover:bg-[#3EA9DC] focus-visible:ring-[#4DB8E8]`}>
              Executive
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </nav>

        <div className={`relative z-[2] px-6 pb-[72px] pt-11 md:px-8 ${sectionRail}`}>
          <div className="max-w-[880px]">
            <div className="mb-[26px] inline-flex items-center gap-2.5 rounded-lg border border-white/[0.12] bg-white/[0.07] px-3.5 py-[7px]">
              <span className="h-0.5 w-[22px] rounded-[1px] bg-[#4DB8E8]" />
              <span className={`${eyebrow} tracking-[0.12em] text-white/[0.86]`}>
                A sovereign, explainable AI decision platform for governments
              </span>
            </div>

            <h1 className="ams-display m-0 text-[40px] leading-[1.04] text-white sm:text-[52px] lg:text-[60px]">
              Immigration casework, at the speed of the{' '}
              <span className="italic text-[#C0A0DD]">world</span>.
            </h1>

            <p className="mt-6 max-w-[720px] text-[19px] leading-[1.6] text-white/[0.74]">
              Faster processing, full transparency, and the human firmly in control of every
              decision — extended into AMS operations: AutoQ, officer capacity, multi-visa routing,
              RBAC, deep review, and RFIs.
            </p>

            <div className="mt-[26px] flex flex-wrap gap-2.5">
              {['Glass Box AI', 'Rules and policy driven', 'Human-in-control'].map((pill) => (
                <span key={pill} className="rounded-full bg-white/[0.08] px-4 py-2 text-[13px] font-semibold text-white/[0.86]">
                  {pill}
                </span>
              ))}
              <span className="rounded-full bg-[rgba(26,191,176,0.16)] px-4 py-2 text-[13px] font-semibold text-[#7FDFD3]">
                Sovereign by design
              </span>
            </div>

            <div className="mt-[30px] flex flex-wrap gap-3">
              <Link href="/dashboard/livequeue" className={ctaPrimary}>
                Start executive demo
                <Gauge className="h-[18px] w-[18px]" />
              </Link>
              <Link href="/dashboard/reviewer" className={ctaOutlineDark}>
                Open officer workbench
                <BriefcaseBusiness className="h-[18px] w-[18px]" />
              </Link>
            </div>

            <div className="mt-11 grid grid-cols-2 gap-3 md:grid-cols-4">
              {heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[10px] border-t-2 bg-white/5 px-4 pb-[15px] pt-4"
                  style={{ borderTopColor: stat.tone }}
                >
                  <div className="flex items-center gap-[7px] text-[11px] font-bold uppercase tracking-[0.05em]" style={{ color: stat.tone }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: stat.tone }} />
                    {stat.label}
                  </div>
                  <div className="mt-2 text-[15px] font-semibold leading-[1.3] text-white">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 01 WHAT WE HAVE BUILT ==================== */}
      <section className="border-b border-[#E4E2EC] bg-white px-6 py-16 md:px-8 md:py-[88px]">
        <div className={sectionRail}>
          <div className="flex items-center gap-3.5">
            <span className="ams-mono text-[13px] font-medium text-[#6B3FA0]">01</span>
            <span className={`${eyebrow} text-[#2D1B69]`}>What we have built</span>
            <span className="h-px flex-1 bg-[#E4E2EC]" />
          </div>
          <p className="mt-[22px] max-w-[840px] text-[18px] leading-[1.6] text-[#4A4564]">
            A decision-support platform — the{' '}
            <strong className="font-semibold text-[#0F0B1E]">Decision Intelligence System</strong> — live
            today for Work Route casework and configured for further routes, built on three principles a
            government can defend publicly.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <div key={principle.title} className={`${cardBase} p-7`}>
                  <div
                    className="grid h-12 w-12 place-items-center rounded-xl"
                    style={{ backgroundColor: principle.chip, color: principle.tone }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-[19px] font-semibold tracking-[-0.01em] text-[#0F0B1E]">{principle.title}</h3>
                  <p className="mt-3 text-sm leading-[1.6] text-[#4A4564]">{principle.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================= 02 THE OPPORTUNITY ======================= */}
      <section id="opportunity" className="border-b border-[#E4E2EC] bg-white px-6 py-16 md:px-8 md:py-[88px]">
        <div className={sectionRail}>
          <p className={`${eyebrow} text-[#6B3FA0]`}>02 · The opportunity</p>
          <h2 className="mt-4 max-w-[900px] text-[26px] font-semibold leading-[1.25] tracking-[-0.01em] text-[#0F0B1E] sm:text-[32px]">
            OpenVisa removes the processing burden around the decision so officers spend their time where
            judgement genuinely matters.
          </h2>

          <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_auto_1fr] lg:gap-12">
            <div>
              <div className="inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-[#2D1B69] px-3.5 py-[7px]">
                <span className="h-[7px] w-[7px] rounded-full bg-[#D64545]" />
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-white">The wait today</span>
              </div>
              <div className="ams-display mt-[18px] text-[46px] leading-[0.98] text-[#0F0B1E] sm:text-[64px]">
                Up to 12 months
              </div>
              <p className="mt-5 max-w-[440px] text-base leading-[1.65] text-[#6E6A85]">
                Upwards of two weeks for a standard case, and far longer for complex and asylum routes.
                This is the backlog.
              </p>
            </div>

            <div className="hidden place-items-center lg:grid">
              <span className="grid h-[52px] w-[52px] place-items-center rounded-full border border-[#E4E2EC] text-[#6B3FA0]">
                <ArrowRight className="h-[22px] w-[22px]" />
              </span>
            </div>

            <div>
              <div className="inline-flex items-center gap-2.5 whitespace-nowrap rounded-full bg-[#2D1B69] px-3.5 py-[7px]">
                <span className="h-[7px] w-[7px] rounded-full bg-[#4DB8E8]" />
                <span className="text-xs font-bold uppercase tracking-[0.08em] text-white">With OpenVisa</span>
              </div>
              <div className="ams-display mt-[18px] text-[46px] leading-[0.98] text-[#1F6B45] sm:text-[64px]">
                Under 1 minute
              </div>
              <p className="mt-5 max-w-[440px] text-base leading-[1.65] text-[#6E6A85]">
                Documents read, checks run, and every applicable rule applied for every case, including
                complex ones. The system never decides.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= PROOF METRICS ========================= */}
      <section className="bg-[#FAF9FC] px-6 py-16 md:px-8 md:py-20">
        <div className={`grid gap-12 md:grid-cols-2 md:gap-14 ${sectionRail}`}>
          {proofMetrics.map((metric) => (
            <div key={metric.label}>
              <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.08em]" style={{ color: metric.dot }}>
                <span className="h-[7px] w-[7px] rounded-full" style={{ backgroundColor: metric.dot }} />
                {metric.label}
              </div>
              <div className="ams-display mt-[18px] text-[44px] leading-[0.98] text-[#0F0B1E] sm:text-[60px]">
                {metric.value}
              </div>
              <p className="mt-[18px] max-w-[460px] text-base leading-[1.65] text-[#6E6A85]">{metric.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================== 03 WHAT AMS ADDS ======================== */}
      <section className="border-b border-[#E4E2EC] bg-white px-6 py-16 md:px-8 md:py-[88px]">
        <div className={sectionRail}>
          <div className="max-w-[840px]">
            <p className={`${eyebrow} text-[#6B3FA0]`}>03 · What AMS adds</p>
            <h2 className="ams-display mt-4 text-[32px] leading-[1.12] text-[#0F0B1E] sm:text-[44px]">
              DIS removes the processing burden. AMS turns that into an operating model.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {amsLayers.map((layer) => {
              const Icon = layer.icon;
              return (
                <article key={layer.title} className={`${cardBase} p-6`}>
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#E8F5FC] text-[#1F6D9C]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-[18px] font-semibold tracking-[-0.01em] text-[#0F0B1E]">{layer.title}</h3>
                  <p className="mt-[11px] text-[13.5px] leading-[1.6] text-[#4A4564]">{layer.body}</p>
                </article>
              );
            })}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-[#E4E2EC] bg-[#FAF9FC] p-7">
              <div className="flex items-center gap-3">
                <Building2 className="h-[22px] w-[22px] text-[#6B3FA0]" />
                <h3 className="text-[23px] font-semibold tracking-[-0.01em] text-[#0F0B1E]">Multi-visa from day one</h3>
              </div>
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {visaTypes.map((visa) => (
                  <div key={visa} className="flex items-center gap-2.5 rounded-[10px] border border-[#E4E2EC] bg-white px-3.5 py-3 text-sm text-[#2A2440]">
                    <CheckCircle2 className="h-[17px] w-[17px] shrink-0 text-[#1F6B45]" />
                    {visa}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-[#2D1B69] p-7 text-white">
              <Image
                src="/logo/ov_logo.png"
                alt=""
                aria-hidden
                width={230}
                height={134}
                className="pointer-events-none absolute -bottom-[70px] -right-[60px] h-auto w-[230px] max-w-none opacity-[0.06]"
              />
              <div className="relative flex items-center gap-3">
                <LockKeyhole className="h-[22px] w-[22px] text-[#7FDFD3]" />
                <h3 className="text-[23px] font-semibold tracking-[-0.01em] text-white">Role separation, not just dashboards</h3>
              </div>
              <div className="relative mt-6 grid gap-3">
                <div className="rounded-[10px] border border-white/10 bg-white/5 px-[18px] py-4">
                  <div className="text-sm font-semibold text-[#7FDFD3]">Executive view</div>
                  <p className="mt-[5px] text-sm leading-[1.55] text-white/[0.78]">
                    Live queue, workload, service levels, and allocation health without per-case PII.
                  </p>
                </div>
                <div className="rounded-[10px] border border-white/10 bg-white/5 px-[18px] py-4">
                  <div className="text-sm font-semibold text-[#F49FC8]">Officer view</div>
                  <p className="mt-[5px] text-sm leading-[1.55] text-white/[0.78]">
                    Assigned cases, DIS/OV evidence, RFIs, and decision support for the cases they own.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 04 BUILT TO BE DEFENSIBLE ==================== */}
      <section className="border-b border-[#E4E2EC] bg-white px-6 py-16 md:px-8 md:py-[88px]">
        <div className={sectionRail}>
          <div className="max-w-[860px]">
            <p className={`${eyebrow} text-[#6B3FA0]`}>04 · Built to be defensible</p>
            <h2 className="ams-display mt-4 text-[32px] leading-[1.12] text-[#0F0B1E] sm:text-[44px]">
              AI extracts. Rules decide.
            </h2>
            <p className="mt-[22px] text-[18px] leading-[1.6] text-[#4A4564]">
              The advantage is not a single model. It is an integrated, inspectable stack — deterministic
              rule engines, external screening, and a model trained for immigration. Every result is
              traceable: <strong className="font-semibold text-[#0F0B1E]">AI extracts, rules decide</strong>.
            </p>
          </div>

          <div className={`${cardStatic} mt-10 p-6`}>
            <div className="mb-[18px] flex items-center gap-2.5">
              <Info className="h-4 w-4 shrink-0 text-[#1F6D9C]" />
              <span className="ams-mono text-[11px] tracking-[0.04em] text-[#6E6A85]">
                Live today · DIS decision summary — all criteria met, one item flagged for officer review
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {defensibleMetrics.map((metric) => (
                <div key={metric.label} className="rounded-[10px] border border-[#E4E2EC] bg-[#FAF9FC] px-[18px] py-4">
                  <div className="text-xs font-medium text-[#4A4564]">{metric.label}</div>
                  <div className="mt-[9px] text-[30px] font-bold leading-none tracking-[-0.01em]" style={{ color: metric.tone }}>
                    {metric.value}
                    <span className="text-base font-semibold text-[#9A98AB]">{metric.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ipPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className={`${cardBase} p-[22px]`}>
                  <div
                    className="grid h-11 w-11 place-items-center rounded-[11px]"
                    style={{ backgroundColor: pillar.chip, color: pillar.tone }}
                  >
                    <Icon className="h-[22px] w-[22px]" />
                  </div>
                  <h3 className="mt-4 text-base font-semibold tracking-[-0.01em] text-[#0F0B1E]">{pillar.title}</h3>
                  <p className="mt-[9px] text-[13px] leading-[1.55] text-[#4A4564]">{pillar.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================== 05 HONEST ECONOMICS ====================== */}
      <section className="bg-[#FAF9FC] px-6 py-16 md:px-8 md:py-[88px]">
        <div className={`grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 ${sectionRail}`}>
          <div>
            <p className={`${eyebrow} text-[#6B3FA0]`}>05 · Honest economics</p>
            <h2 className="ams-display mt-4 text-[34px] leading-[1.1] text-[#0F0B1E] sm:text-[48px]">
              We do not claim to make officers decide faster.
            </h2>
            <p className="mt-[22px] text-[17px] leading-[1.65] text-[#4A4564]">
              Research puts caseworker throughput around 20 decisions a day. AMS does not change that, and
              should not pretend to. It removes the 2+ week processing burden, makes backlog visible, and
              lets fixed human capacity go entirely to deciding.
            </p>
          </div>

          <div className={`${cardStatic} p-8`}>
            <div className="mb-7 flex items-center gap-2.5">
              <span className="ams-mono text-[11px] uppercase tracking-[0.06em] text-[#9A98AB]">Operating snapshot</span>
              <span className="h-px flex-1 bg-[#E4E2EC]" />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col items-center text-center">
                <div className="relative h-[148px] w-[148px]">
                  <svg width="148" height="148" viewBox="0 0 128 128" role="img" aria-label="Officer utilisation 94 percent">
                    <circle cx="64" cy="64" r="54" fill="none" stroke="#EEEBF3" strokeWidth="12" />
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      fill="none"
                      stroke="#E89A3C"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray="339.29"
                      strokeDashoffset="20.36"
                      transform="rotate(-90 64 64)"
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-[34px] font-semibold leading-none tracking-[-0.01em] text-[#0F0B1E]">
                      94<span className="text-[18px] text-[#9A98AB]">%</span>
                    </div>
                  </div>
                </div>
                <p className="mt-[18px] text-xs font-bold uppercase tracking-[0.08em] text-[#A8740F]">Officer utilisation</p>
                <p className="mt-1.5 max-w-[180px] text-[13px] leading-[1.5] text-[#8C5A14]">Stretched — at full capacity</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="relative h-[148px] w-[148px]">
                  <svg width="148" height="148" viewBox="0 0 128 128" role="img" aria-label="SLA adherence 98 percent">
                    <circle cx="64" cy="64" r="54" fill="none" stroke="#E8F6EE" strokeWidth="12" />
                    <circle
                      cx="64"
                      cy="64"
                      r="54"
                      fill="none"
                      stroke="#3FB07A"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray="339.29"
                      strokeDashoffset="6.79"
                      transform="rotate(-90 64 64)"
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-[34px] font-semibold leading-none tracking-[-0.01em] text-[#1F6B45]">
                      98<span className="text-[18px] text-[#7FC7A0]">%</span>
                    </div>
                  </div>
                </div>
                <p className="mt-[18px] text-xs font-bold uppercase tracking-[0.08em] text-[#1F6B45]">SLA adherence</p>
                <p className="mt-1.5 max-w-[180px] text-[13px] leading-[1.5] text-[#1F6B45]">On track — backlog visible and tracked</p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-5 border-t border-[#E4E2EC] pt-6 sm:grid-cols-2">
              <div>
                <div className="text-[23px] font-semibold tracking-[-0.01em] text-[#0F0B1E]">
                  ~20<span className="text-sm font-medium text-[#9A98AB]"> / day</span>
                </div>
                <p className="mt-[5px] text-[12.5px] leading-[1.5] text-[#6E6A85]">
                  Caseworker throughput baseline — unchanged, and we don&apos;t pretend otherwise.
                </p>
              </div>
              <div>
                <div className="inline-flex items-center gap-[7px] text-base font-semibold tracking-[-0.01em] text-[#1F6B45]">
                  <Check className="h-4 w-4" strokeWidth={2.2} />
                  Visible &amp; tracked
                </div>
                <p className="mt-[5px] text-[12.5px] leading-[1.5] text-[#6E6A85]">
                  Backlog surfaced and SLA-tracked, never a black hole.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= 06 ENTER THE DEMO ======================= */}
      <section id="access" className="relative overflow-hidden bg-[#2D1B69] px-6 py-16 text-white md:px-8 md:py-20">
        <Image
          src="/logo/ov_logo.png"
          alt=""
          aria-hidden
          width={520}
          height={302}
          className="pointer-events-none absolute -bottom-[160px] -left-[120px] h-auto w-[520px] max-w-none opacity-[0.05]"
        />
        <div className={`relative grid items-start gap-10 lg:grid-cols-[1fr_420px] lg:gap-12 ${sectionRail}`}>
          <div>
            <p className={`${eyebrow} text-[#4DB8E8]`}>06 · Enter the demo</p>
            <h2 className="ams-display mt-4 text-[34px] leading-[1.1] text-white sm:text-[48px]">
              Start with the story, then step into the system.
            </h2>
            <p className="mt-[22px] max-w-[620px] text-[17px] leading-[1.65] text-white/[0.74]">
              Open the executive console to show intake, process, allocation, backlog, and capacity. Then
              switch to the officer workbench for case-level evidence and RFIs.
            </p>
            <div className="mt-[30px] flex flex-wrap gap-3">
              <Link href="/dashboard/livequeue" className={ctaPrimary}>
                Executive console
                <Gauge className="h-[18px] w-[18px]" />
              </Link>
              <Link href="/dashboard/reviewer" className={ctaOutlineDark}>
                Officer gateway
                <Workflow className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl bg-white p-[22px] text-[#0F0B1E] shadow-[0_24px_60px_rgba(20,9,58,0.35)]">
            <button
              type="button"
              onClick={() => setShowCredentials((current) => !current)}
              aria-expanded={showCredentials}
              className="flex w-full items-center justify-between gap-3 rounded-md text-left transition-transform active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B3FA0]/40 focus-visible:ring-offset-2"
            >
              <span>
                <span className="block text-sm font-semibold text-[#0F0B1E]">Use credentials</span>
                <span className="mt-[3px] block text-[13px] text-[#6E6A85]">Subtle fallback for seeded demo accounts</span>
              </span>
              <ArrowRight
                className={`h-[18px] w-[18px] shrink-0 text-[#6E6A85] transition-transform duration-200 [transition-timing-function:cubic-bezier(0.2,0,0,1)] ${showCredentials ? 'rotate-90' : ''}`}
              />
            </button>

            {showCredentials && (
              <form onSubmit={submitCredentials} className="mt-5 border-t border-[#E4E2EC] pt-5">
                <div className="grid grid-cols-2 gap-1.5 rounded-[10px] bg-[#F2F0F9] p-[5px]">
                  {(['officer', 'executive'] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setLoginRole(role)}
                      className={`rounded-lg px-3 py-[9px] text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6B3FA0]/40 ${
                        loginRole === role
                          ? 'bg-white font-semibold text-[#2D1B69] shadow-[0_1px_2px_rgba(45,27,105,0.14)]'
                          : 'font-medium text-[#71658D] hover:text-[#2D1B69]'
                      }`}
                    >
                      {role === 'officer' ? 'Officer' : 'Executive'}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  <Label htmlFor="email" className="mb-[7px] block text-[13px] font-medium text-[#2A2440]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@gov.example"
                    required
                    className={inputClass}
                  />
                </div>

                <div className="mt-3.5">
                  <Label htmlFor="password" className="mb-[7px] block text-[13px] font-medium text-[#2A2440]">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter password"
                    required
                    className={inputClass}
                  />
                </div>

                {error && <p className="mt-3.5 text-[13px] text-red-600">{error}</p>}

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-[18px] h-auto w-full rounded-[10px] bg-[#2D1B69] py-[13px] text-sm font-semibold text-white shadow-none transition-colors hover:bg-[#221551] active:translate-y-px"
                >
                  {isSubmitting ? 'Checking access…' : 'Sign in'}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ============================ FOOTER ============================ */}
      <footer className="bg-[#221551] px-6 py-8 text-white md:px-8">
        <div className={`flex flex-wrap items-center justify-between gap-4 ${sectionRail}`}>
          <div className="flex items-center gap-3">
            <Image src="/logo/ov_logo.png" alt="" width={52} height={30} className="h-[30px] w-auto" />
            <span className="text-sm text-white/[0.62]">OpenVisa AMS · Government demo system</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-white/[0.55]">
            <Landmark className="h-[17px] w-[17px]" />
            Built for staged pilots, human decisioning, and defensible operations
          </div>
        </div>
      </footer>
    </main>
  );
}
