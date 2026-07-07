// Processing Metrics mock — DIS-domain simulation (still mock; real wiring = the
// deferred data-wiring track). Vocabulary is locked to the operating model:
// canonical visa registry, two clocks (active touch-time vs elapsed SLA), ~85/15
// triage, decision effort by recommendation outcome, the 7 real external checks.
// Spec test: src/__tests__/processing-metrics-domain.test.ts
import { useState, useCallback } from 'react';
import { subDays, format } from 'date-fns';
import { VISA_TYPES } from '@/config/visaTypes';

// --- Helpers ---
const between = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateTimeSeries = (days: number, minY: number, maxY: number) =>
    Array.from({ length: days }).map((_, i) => ({
        date: format(subDays(new Date(), days - 1 - i), 'MMM dd'),
        value: between(minY, maxY),
    }));

// --- The simulation (exported pure so the domain vocabulary is testable) ---
export const simulateProcessingMetrics = () => {
    const clearShare = between(83, 88); // the ~85/15 triage claim
    return {
        // Decision SLA (15 working days), last 30 days
        slaAttainmentTrend: generateTimeSeries(30, 85, 99),
        // Canonical taxonomy — labels come from the registry so they can't drift
        slaByVisaType: VISA_TYPES.map((v) => ({ name: v.label, value: between(80, 98) })),
        // Why elapsed-SLA is at risk, in decision-lane terms (RFI clock-stop aside)
        slaMissReasons: [
            { name: 'Officer capacity', value: between(30, 45) },
            { name: 'Complex case', value: between(20, 30) },
            { name: 'RFI round-trip', value: between(15, 25) },
            { name: 'Escalation', value: between(5, 15) },
        ],
        // Officer decision effort per DIS recommendation outcome (the capacity model:
        // ~10m clear-approve / ~20m clear-reject / ~45m manual+RFI)
        decisionEffortByOutcome: [
            { name: 'Clear approve', avgMinutes: between(8, 12) },
            { name: 'Clear reject', avgMinutes: between(18, 22) },
            { name: 'Manual + RFI', avgMinutes: between(40, 50) },
        ],
        // Two clocks: where the elapsed days actually go. The machine row is a sliver
        // by design — DIS processes in under a minute; the human lane is the bottleneck.
        queueVsActiveTime: [
            { name: 'Machine pipeline', queueTime: 0, activeTime: 0.001 },
            { name: 'Awaiting allocation', queueTime: between(2, 4), activeTime: 0 },
            { name: 'Officer review', queueTime: between(1, 3) / 2, activeTime: between(3, 7) / 10 },
            { name: 'RFI round-trip', queueTime: between(3, 6), activeTime: between(1, 3) / 10 },
        ],
        // First-pass clear rate across the 7 real DIS external checks
        externalChecksClearRate: [
            { name: 'Certificate of Sponsorship', value: between(90, 98) },
            { name: 'Identity & passport', value: between(94, 99) },
            { name: 'Sanctions & watchlist', value: between(96, 99) },
            { name: 'PNC (criminal record)', value: between(95, 99) },
            { name: 'TB certificate', value: between(88, 96) },
            { name: 'English proficiency', value: between(90, 97) },
            { name: 'Financial evidence', value: between(88, 95) },
        ],
        // Phase-1 honest framing: DIS recommends, officers decide — nothing is auto-decided.
        triageSplit: [
            { name: 'Clear recommendation', value: clearShare },
            { name: 'Manual review', value: 100 - clearShare },
        ],
        // Kept as-is per Chris (3 Jul): Top Escalation Reasons
        escalationReasons: [
            { name: 'Complex Nationality', value: between(5, 40) },
            { name: 'Sanctions Hit', value: between(5, 40) },
            { name: 'Missing Docs', value: between(5, 40) },
            { name: 'Fraud Flags', value: between(5, 40) },
            { name: 'Policy Edge Case', value: between(5, 40) },
        ],
        escalatedResolutionTime: between(3, 7), // days
    };
};

export type ProcessingMetricsData = ReturnType<typeof simulateProcessingMetrics>;

// --- The Hook ---
export const useProcessingMetrics = () => {
    const [data, setData] = useState<ProcessingMetricsData>(() => simulateProcessingMetrics());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // TODO: replace simulation with the contract adapter (data-wiring track)
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            await new Promise((resolve) => setTimeout(resolve, 800));
            setData(simulateProcessingMetrics());
        } catch (err) {
            setError('Failed to load processing metrics.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { ...data, isLoading, error, fetchData };
};
