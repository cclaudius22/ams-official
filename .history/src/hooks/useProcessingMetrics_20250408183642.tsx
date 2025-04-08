// src/hooks/useProcessingMetrics.ts 
import { useState, useCallback, useMemo } from 'react';
import { subDays, format } from 'date-fns'; // Using date-fns for date manipulation

// --- Color Palette (reuse or define specific ones) ---
const SUBTLE_COLORS = [
    '#60a5fa', '#34d399', '#facc15', '#fb923c', '#a78bfa', '#fb7185', '#9ca3af',
    '#818cf8', '#f472b6', '#fde047' // Add more if needed
];
const STATUS_COLORS = { // Example for stages if needed, can reuse others
    Intake: '#a78bfa',      // violet-400
    'Initial Review': '#60a5fa', // blue-400
    'Security Check': '#fb923c', // orange-400
    Adjudication: '#34d399', // emerald-400
    'Final QA': '#facc15',      // yellow-400
    Decision: '#10b981',      // emerald-500 (final success)
    Waiting: '#9ca3af',      // gray-400
    Active: '#60a5fa'       // blue-400
};
const MANUAL_AUTO_COLORS = ['#818cf8', '#34d399']; // Example: indigo-400, emerald-400

// --- Helper Functions ---
const generateTimeSeries = (days: number, minY: number, maxY: number) => {
    return Array.from({ length: days }).map((_, i) => ({
        date: format(subDays(new Date(), days - 1 - i), 'MMM dd'),
        value: Math.floor(Math.random() * (maxY - minY + 1)) + minY,
    }));
};

const generateCategoricalData = (categories: string[], minY: number, maxY: number, valueKey = 'value') => {
    return categories.map(name => ({
        name,
        [valueKey]: Math.floor(Math.random() * (maxY - minY + 1)) + minY,
    }));
};

// --- Simulation Functions ---
const simulateSlaAttainmentTrend = () => generateTimeSeries(30, 85, 99); // Last 30 days, %
const simulateSlaByVisaType = () => generateCategoricalData(['Student', 'Work', 'Tourist', 'Family', 'Business', 'Other'], 80, 98);
const simulateSlaByTeam = () => generateCategoricalData(['Alpha Team', 'Bravo Team', 'Charlie Team', 'Delta Team'], 75, 99);
const simulateProcessingTimeDistribution = () => [
    { name: '<50% SLA', value: Math.floor(Math.random() * 40) + 30 },
    { name: '50-75% SLA', value: Math.floor(Math.random() * 20) + 15 },
    { name: '75-100% SLA', value: Math.floor(Math.random() * 15) + 10 },
    { name: '>100% SLA', value: Math.floor(Math.random() * 10) + 5 } // The misses
];
const simulateSlaMissReasons = () => generateCategoricalData(['Applicant Delay', 'Complexity', 'System Issue', 'Missing Docs', 'Staff Shortage'], 5, 50);

const simulateCycleTimeByStage = () => generateCategoricalData(['Intake', 'Initial Review', 'Security Check', 'Adjudication', 'Final QA', 'Decision'], 1, 5, 'avgDays'); // Avg days per stage
const simulateQueueVsActiveTime = () => ['Intake', 'Initial Review', 'Security Check', 'Adjudication', 'Final QA'].map(name => ({
    name,
    queueTime: Math.floor(Math.random() * 4) + 0.5, // Avg days waiting
    activeTime: Math.floor(Math.random() * 2) + 0.5, // Avg days active work
}));
const simulateStageCompletionRate = () => { // Cumulative % passing
    let cumulativeRate = 100;
    const stages = ['Intake', 'Initial Review', 'Security Check', 'Adjudication', 'Final QA', 'Decision'];
    return stages.map(name => {
        const passRate = Math.random() * 0.1 + 0.9; // 90-100% pass rate per stage
        cumulativeRate *= passRate;
        return { name, completionRate: Math.round(cumulativeRate * 10) / 10 }; // Round to 1 decimal
    });
};
const simulateBacklogByStage = () => generateCategoricalData(['Intake', 'Initial Review', 'Security Check', 'Adjudication', 'Final QA'], 10, 150, 'backlogCount');

const simulateManualVsAuto = () => generateCategoricalData(['Manual', 'Automated'], 30, 70);
const simulateAutomationAccuracy = () => Math.floor(Math.random() * 5) + 95; // 95-99% accuracy
const simulateEscalationRateTrend = () => generateTimeSeries(30, 3, 12); // Last 30 days, % escalated
const simulateEscalationReasons = () => generateCategoricalData(['Complex Nationality', 'Sanctions Hit', 'Missing Docs', 'Fraud Flags', 'Policy Edge Case'], 5, 40);
const simulateEscalatedResolutionTime = () => Math.floor(Math.random() * 5) + 3; // 3-7 days avg resolution

// --- The Hook ---
export const useProcessingMetrics = () => {
    const [data, setData] = useState(() => ({ // Initialize with simulated data
        slaAttainmentTrend: simulateSlaAttainmentTrend(),
        slaByVisaType: simulateSlaByVisaType(),
        slaByTeam: simulateSlaByTeam(),
        processingTimeDistribution: simulateProcessingTimeDistribution(),
        slaMissReasons: simulateSlaMissReasons(),
        cycleTimeByStage: simulateCycleTimeByStage(),
        queueVsActiveTime: simulateQueueVsActiveTime(),
        stageCompletionRate: simulateStageCompletionRate(),
        backlogByStage: simulateBacklogByStage(),
        manualVsAuto: simulateManualVsAuto(),
        automationAccuracy: simulateAutomationAccuracy(),
        escalationRateTrend: simulateEscalationRateTrend(),
        escalationReasons: simulateEscalationReasons(),
        escalatedResolutionTime: simulateEscalatedResolutionTime(),
    }));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // TODO: Replace simulation with actual data fetching based on filters (date range, etc.)
    const fetchData = useCallback(async (/* filters */) => {
        setIsLoading(true);
        setError(null);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 800));
            // Regenerate simulated data on fetch
            setData({
                slaAttainmentTrend: simulateSlaAttainmentTrend(),
                slaByVisaType: simulateSlaByVisaType(),
                slaByTeam: simulateSlaByTeam(),
                processingTimeDistribution: simulateProcessingTimeDistribution(),
                slaMissReasons: simulateSlaMissReasons(),
                cycleTimeByStage: simulateCycleTimeByStage(),
                queueVsActiveTime: simulateQueueVsActiveTime(),
                stageCompletionRate: simulateStageCompletionRate(),
                backlogByStage: simulateBacklogByStage(),
                manualVsAuto: simulateManualVsAuto(),
                automationAccuracy: simulateAutomationAccuracy(),
                escalationRateTrend: simulateEscalationRateTrend(),
                escalationReasons: simulateEscalationReasons(),
                escalatedResolutionTime: simulateEscalatedResolutionTime(),
            });
        } catch (err) {
            setError("Failed to load processing metrics.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch simulation (or trigger based on filters later)
    // useEffect(() => { fetchData(); }, [fetchData]);

    // Memoize processed data if complex transformations are needed
    const processedData = useMemo(() => {
        // Example: Assign colors dynamically if needed, otherwise handled in chart
         const slaMissReasonsWithColors = data.slaMissReasons.map((item, index) => ({
            ...item,
            fill: SUBTLE_COLORS[index % SUBTLE_COLORS.length],
        }));
         const manualVsAutoWithColors = data.manualVsAuto.map((item, index) => ({
            ...item,
            fill: MANUAL_AUTO_COLORS[index % MANUAL_AUTO_COLORS.length],
        }));

        return { ...data, slaMissReasons: slaMissReasonsWithColors, manualVsAuto: manualVsAutoWithColors };
    }, [data]);


    return { ...processedData, isLoading, error, fetchData };
};