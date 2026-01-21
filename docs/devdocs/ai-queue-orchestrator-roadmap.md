# AI Queue Orchestrator & RBAC System - Roadmap

## Vision

Build an intelligent, AI-assisted queue orchestration system that automatically routes visa applications to the most suitable officers based on expertise, workload, and real-time system conditions. Includes a comprehensive RBAC system for officer onboarding and expertise mapping.

**Target:** Production-ready system with Camunda BPMN integration or custom AI agent orchestration.

---

## Phase 1: Foundation (Current State)

### Completed
- [x] Synthetic data generation (1000 applications, 6 visa types)
- [x] Officer specialization mapping (7 officers)
- [x] Basic scoring algorithm (specialization + workload + SLA)
- [x] Manual assignment via UI
- [x] "Auto-Assign All" bulk operation
- [x] Assignment suggestion API

### Current Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                      LiveQueue UI                           │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ Manual      │  │ Bulk        │  │ Auto-Assign All  │   │
│  │ Assignment  │  │ Assignment  │  │ (Demo Button)    │   │
│  └──────┬──────┘  └──────┬──────┘  └────────┬─────────┘   │
└─────────┼────────────────┼──────────────────┼─────────────┘
          │                │                  │
          ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    Assignment Engine                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  calculateAssignmentScore(officer, visaType)         │  │
│  │  - Specialization match (+30)                        │  │
│  │  - Workload capacity (-20 max)                       │  │
│  │  - SLA compliance (+15)                              │  │
│  │  - Processing speed (+10)                            │  │
│  │  - Senior bonus for complex visas (+5)               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 2: RBAC & Officer Management

### 2.1 Officer Onboarding System

#### Data Model
```typescript
interface Officer {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    employeeId: string;
  };

  // Security clearance
  clearance: {
    level: 'CTC' | 'SC' | 'DV';
    expiryDate: string;
    vettingAuthority: string;
  };

  // Role & permissions
  role: OfficerRole;
  permissions: Permission[];

  // Expertise mapping
  expertise: ExpertiseProfile;

  // Capacity & availability
  capacity: CapacityProfile;

  // Performance metrics
  performance: PerformanceMetrics;
}

interface ExpertiseProfile {
  primarySpecializations: VisaType[];      // Main expertise
  secondarySpecializations: VisaType[];    // Can handle if needed
  certifications: Certification[];          // Training completed
  experienceLevel: 'trainee' | 'standard' | 'senior' | 'expert';
  languageSkills: LanguageSkill[];          // For specific nationalities
  complexCaseCapable: boolean;              // Can handle edge cases
}

interface CapacityProfile {
  maxConcurrentCases: number;               // Workload limit
  currentLoad: number;                      // Active cases
  availabilitySchedule: WeeklySchedule;     // Working hours
  leaveCalendar: LeaveEntry[];              // Planned absences
  overtimeWilling: boolean;                 // Can take extra load
}

interface PerformanceMetrics {
  avgProcessingTime: number;                // Minutes per application
  slaCompliance: number;                    // Percentage
  qualityScore: number;                     // Review accuracy
  escalationRate: number;                   // % requiring senior review
  customerSatisfaction: number;             // Feedback score
}
```

#### Onboarding Flow
```
┌──────────────────────────────────────────────────────────────┐
│                    Officer Onboarding                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. IDENTITY VERIFICATION                                    │
│     ├─ Government ID validation                              │
│     ├─ Security clearance verification (UKSV API)           │
│     └─ Biometric enrollment                                  │
│                                                              │
│  2. ROLE ASSIGNMENT                                          │
│     ├─ Select base role (Trainee/Officer/Senior/Specialist) │
│     ├─ Assign department/team                                │
│     └─ Set reporting hierarchy                               │
│                                                              │
│  3. EXPERTISE MAPPING                                        │
│     ├─ Primary visa type specializations                     │
│     ├─ Secondary capabilities                                │
│     ├─ Language proficiencies                                │
│     └─ Complex case authorization                            │
│                                                              │
│  4. CAPACITY CONFIGURATION                                   │
│     ├─ Set max concurrent cases                              │
│     ├─ Configure working hours                               │
│     └─ Set availability preferences                          │
│                                                              │
│  5. TRAINING & CERTIFICATION                                 │
│     ├─ Assign required training modules                      │
│     ├─ Schedule certification exams                          │
│     └─ Shadow period with mentor                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Permission System

```typescript
type Permission =
  // Application permissions
  | 'application:view'
  | 'application:review'
  | 'application:decide'
  | 'application:escalate'
  | 'application:override'

  // Queue permissions
  | 'queue:view_own'
  | 'queue:view_team'
  | 'queue:view_all'
  | 'queue:assign'
  | 'queue:reassign'
  | 'queue:auto_assign'

  // Officer management
  | 'officer:view'
  | 'officer:create'
  | 'officer:edit'
  | 'officer:deactivate'

  // System permissions
  | 'system:config'
  | 'system:audit'
  | 'system:override_ai';

const ROLE_PERMISSIONS: Record<OfficerRole, Permission[]> = {
  trainee: [
    'application:view',
    'queue:view_own',
  ],
  officer: [
    'application:view',
    'application:review',
    'application:decide',
    'application:escalate',
    'queue:view_own',
    'queue:view_team',
  ],
  senior_officer: [
    'application:view',
    'application:review',
    'application:decide',
    'application:escalate',
    'application:override',
    'queue:view_own',
    'queue:view_team',
    'queue:assign',
    'queue:reassign',
    'officer:view',
  ],
  supervisor: [
    // All senior permissions plus...
    'queue:view_all',
    'queue:auto_assign',
    'officer:view',
    'officer:edit',
    'system:audit',
  ],
  admin: [
    // All permissions
    '*',
  ],
};
```

---

## Phase 3: AI-Assisted Queue Orchestrator

### 3.1 Architecture Options

#### Option A: Custom AI Agent System
```
┌─────────────────────────────────────────────────────────────────┐
│                    AI Queue Orchestrator                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │  Intake Agent   │    │  Routing Agent  │                    │
│  │  ─────────────  │    │  ─────────────  │                    │
│  │  • Classify     │───▶│  • Match        │                    │
│  │  • Prioritize   │    │  • Score        │                    │
│  │  • Flag risks   │    │  • Assign       │                    │
│  └─────────────────┘    └────────┬────────┘                    │
│                                  │                              │
│                                  ▼                              │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │  Balance Agent  │◀───│  Monitor Agent  │                    │
│  │  ─────────────  │    │  ─────────────  │                    │
│  │  • Redistribute │    │  • Track SLAs   │                    │
│  │  • Handle surge │    │  • Alert issues │                    │
│  │  • Optimize     │    │  • Report       │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Pros:**
- Full control over logic
- Tight integration with existing codebase
- Can use Claude/GPT for complex decisions
- No external dependencies

**Cons:**
- More development effort
- Need to build monitoring/observability
- Complex state management

#### Option B: Camunda BPMN Integration
```
┌─────────────────────────────────────────────────────────────────┐
│                    Camunda Orchestration                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 BPMN Process Definition                   │  │
│  │                                                          │  │
│  │  [Start] ──▶ [Classify] ──▶ [Route] ──▶ [Assign] ──▶    │  │
│  │                  │            │            │              │  │
│  │                  ▼            ▼            ▼              │  │
│  │            [AI Service] [Rules Engine] [Worker Pool]      │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  External Task Workers:                                         │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐                 │
│  │ Classifier │ │  Matcher   │ │  Assigner  │                 │
│  │  Worker    │ │  Worker    │ │  Worker    │                 │
│  └────────────┘ └────────────┘ └────────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Pros:**
- Visual process modeling
- Built-in monitoring & analytics
- DMN decision tables
- Enterprise-grade reliability
- Easy to modify workflows

**Cons:**
- Additional infrastructure (Camunda server)
- Learning curve for BPMN
- May be overkill for initial needs

#### Option C: Hybrid Approach (Recommended)
```
┌─────────────────────────────────────────────────────────────────┐
│                    Hybrid Orchestration                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Phase 1: Custom AI Agents (Now)                                │
│  ├─ Simple rule-based routing                                   │
│  ├─ Scoring algorithm                                           │
│  └─ Manual overrides                                            │
│                                                                 │
│  Phase 2: Enhanced AI (3-6 months)                              │
│  ├─ LLM-powered classification                                  │
│  ├─ Predictive workload balancing                               │
│  └─ Anomaly detection                                           │
│                                                                 │
│  Phase 3: Camunda Integration (6-12 months)                     │
│  ├─ Complex workflow orchestration                              │
│  ├─ Multi-step approval processes                               │
│  └─ Audit & compliance reporting                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Intelligent Routing Algorithm (Enhanced)

```typescript
interface RoutingDecision {
  applicationId: string;
  assignedOfficerId: string;
  confidence: number;
  reasoning: string[];
  alternativeOfficers: AlternativeAssignment[];
  flags: RoutingFlag[];
}

interface RoutingContext {
  application: ApplicationDetail;
  availableOfficers: OfficerWithCapacity[];
  queueState: QueueMetrics;
  timeOfDay: string;
  historicalPatterns: PatternData;
}

async function intelligentRoute(context: RoutingContext): Promise<RoutingDecision> {
  const scores: OfficerScore[] = [];

  for (const officer of context.availableOfficers) {
    let score = 0;
    const reasons: string[] = [];

    // 1. EXPERTISE MATCH (0-40 points)
    const expertiseScore = calculateExpertiseMatch(
      officer.expertise,
      context.application
    );
    score += expertiseScore.points;
    reasons.push(...expertiseScore.reasons);

    // 2. CAPACITY FACTOR (0-25 points)
    const capacityScore = calculateCapacityScore(
      officer.capacity,
      context.queueState
    );
    score += capacityScore.points;
    reasons.push(...capacityScore.reasons);

    // 3. PERFORMANCE HISTORY (0-20 points)
    const performanceScore = calculatePerformanceScore(
      officer.performance,
      context.application.visaTypeId
    );
    score += performanceScore.points;
    reasons.push(...performanceScore.reasons);

    // 4. CONTEXTUAL FACTORS (0-15 points)
    const contextScore = calculateContextualScore(
      officer,
      context
    );
    score += contextScore.points;
    reasons.push(...contextScore.reasons);

    scores.push({ officer, score, reasons });
  }

  // Sort by score and return decision
  scores.sort((a, b) => b.score - a.score);

  return {
    applicationId: context.application.id,
    assignedOfficerId: scores[0].officer.id,
    confidence: scores[0].score / 100,
    reasoning: scores[0].reasons,
    alternativeOfficers: scores.slice(1, 4).map(s => ({
      officerId: s.officer.id,
      score: s.score,
      reasons: s.reasons,
    })),
    flags: detectRoutingFlags(context, scores[0]),
  };
}

function calculateExpertiseMatch(
  expertise: ExpertiseProfile,
  application: ApplicationDetail
): ScoringResult {
  let points = 0;
  const reasons: string[] = [];

  // Primary specialization match
  if (expertise.primarySpecializations.includes(application.visaTypeId)) {
    points += 30;
    reasons.push('Primary specialization match');
  } else if (expertise.secondarySpecializations.includes(application.visaTypeId)) {
    points += 15;
    reasons.push('Secondary specialization match');
  }

  // Language match for applicant nationality
  const applicantLanguages = getLanguagesForNationality(application.country);
  const languageMatch = expertise.languageSkills.some(
    ls => applicantLanguages.includes(ls.language) && ls.proficiency >= 'intermediate'
  );
  if (languageMatch) {
    points += 5;
    reasons.push('Language proficiency for applicant nationality');
  }

  // Complex case capability
  if (application.flags?.includes('High Risk') && expertise.complexCaseCapable) {
    points += 5;
    reasons.push('Authorized for complex cases');
  }

  return { points, reasons };
}
```

### 3.3 Real-Time Queue Balancing

```typescript
interface QueueBalancer {
  // Continuous monitoring
  monitorQueueHealth(): QueueHealthReport;

  // Proactive rebalancing
  suggestRebalancing(): RebalancingPlan;
  executeRebalancing(plan: RebalancingPlan): Promise<void>;

  // Surge handling
  detectSurge(): SurgeAlert | null;
  activateSurgeProtocol(alert: SurgeAlert): Promise<void>;

  // SLA management
  identifyAtRiskApplications(): AtRiskApplication[];
  escalateAtRiskApplications(apps: AtRiskApplication[]): Promise<void>;
}

interface QueueHealthReport {
  timestamp: string;
  overallHealth: 'healthy' | 'warning' | 'critical';

  metrics: {
    totalPending: number;
    avgWaitTime: number;
    slaAtRisk: number;
    officerUtilization: Record<string, number>;
  };

  imbalances: {
    overloadedOfficers: string[];
    underutilizedOfficers: string[];
    visaTypeBacklogs: Record<string, number>;
  };

  recommendations: string[];
}

// Example surge detection
function detectSurge(metrics: QueueMetrics): SurgeAlert | null {
  const SURGE_THRESHOLD = 1.5; // 50% above normal
  const normalInflow = metrics.historicalAvgInflow;
  const currentInflow = metrics.last15MinInflow * 4; // Extrapolate hourly

  if (currentInflow > normalInflow * SURGE_THRESHOLD) {
    return {
      severity: currentInflow > normalInflow * 2 ? 'critical' : 'warning',
      currentRate: currentInflow,
      normalRate: normalInflow,
      projectedBacklog: calculateProjectedBacklog(metrics),
      recommendedActions: [
        'Activate overflow officers',
        'Enable overtime authorization',
        'Pause non-critical training',
      ],
    };
  }

  return null;
}
```

---

## Phase 4: Advanced Features

### 4.1 Predictive Analytics

```typescript
interface PredictiveEngine {
  // Workload forecasting
  forecastDailyVolume(date: Date): VolumeForecast;
  forecastByVisaType(date: Date): Record<VisaType, number>;

  // Processing time estimation
  estimateProcessingTime(application: ApplicationDetail): TimeEstimate;

  // Officer performance prediction
  predictOfficerPerformance(officerId: string, period: DateRange): PerformancePrediction;

  // Bottleneck detection
  predictBottlenecks(horizon: number): BottleneckPrediction[];
}
```

### 4.2 LLM-Powered Features

```typescript
// Application classification using LLM
async function classifyApplicationComplexity(
  application: ApplicationDetail
): Promise<ComplexityClassification> {
  const prompt = `
    Analyze this visa application and classify its complexity:

    Visa Type: ${application.visaType}
    Applicant Nationality: ${application.country}
    Flags: ${application.flags?.join(', ') || 'None'}
    Document Issues: ${application.scanResult?.issues?.length || 0}

    Classify as: SIMPLE, STANDARD, COMPLEX, or SPECIALIST_REQUIRED
    Provide reasoning.
  `;

  const response = await llm.complete(prompt);
  return parseComplexityResponse(response);
}

// Intelligent case notes summarization
async function summarizeCaseForHandoff(
  application: ApplicationDetail,
  previousNotes: CaseNote[]
): Promise<string> {
  // LLM generates concise handoff summary
}

// Anomaly explanation
async function explainAnomaly(
  anomaly: DetectedAnomaly
): Promise<string> {
  // LLM provides human-readable explanation
}
```

### 4.3 Audit & Compliance

```typescript
interface AuditLog {
  id: string;
  timestamp: string;
  action: AuditAction;
  actor: {
    type: 'officer' | 'system' | 'ai';
    id: string;
    name: string;
  };
  target: {
    type: 'application' | 'officer' | 'assignment';
    id: string;
  };
  details: Record<string, unknown>;
  aiInvolvement?: {
    modelUsed: string;
    confidence: number;
    reasoning: string;
  };
}

type AuditAction =
  | 'assignment:created'
  | 'assignment:changed'
  | 'assignment:ai_suggested'
  | 'assignment:ai_overridden'
  | 'decision:made'
  | 'decision:escalated'
  | 'officer:capacity_changed'
  | 'system:rebalance_executed';
```

---

## Implementation Timeline

### Q1 2026: Foundation
- [ ] Officer management UI (CRUD)
- [ ] Basic RBAC implementation
- [ ] Expertise mapping interface
- [ ] Enhanced assignment algorithm

### Q2 2026: Intelligence Layer
- [ ] Real-time queue monitoring dashboard
- [ ] SLA risk detection & alerting
- [ ] Workload balancing automation
- [ ] Performance analytics

### Q3 2026: AI Enhancement
- [ ] LLM integration for classification
- [ ] Predictive workload forecasting
- [ ] Anomaly detection
- [ ] Smart case routing

### Q4 2026: Enterprise Features
- [ ] Camunda integration (optional)
- [ ] Advanced audit & compliance
- [ ] Multi-team coordination
- [ ] API for external systems

---

## Tech Stack Recommendations

### Backend
- **Runtime:** Node.js with Next.js API routes (current)
- **Database:** PostgreSQL with Prisma ORM
- **Queue:** Redis for real-time state + Bull for job processing
- **AI/ML:** OpenAI API or Claude API for LLM features

### Orchestration (if using Camunda)
- **Engine:** Camunda Platform 8 (cloud or self-hosted)
- **Modeling:** Camunda Modeler for BPMN/DMN
- **Workers:** Node.js external task workers

### Monitoring
- **Metrics:** Prometheus + Grafana
- **Logging:** ELK stack or Loki
- **Alerting:** PagerDuty or Opsgenie

### Frontend
- **Framework:** Next.js with React (current)
- **State:** TanStack Query for server state
- **Real-time:** WebSockets or Server-Sent Events
- **Charts:** Recharts (current) + D3 for complex viz

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Avg assignment time | Manual | < 1 second |
| SLA compliance | N/A | > 95% |
| Officer utilization balance | N/A | < 15% variance |
| Routing accuracy | N/A | > 90% match |
| System uptime | N/A | 99.9% |

---

## References

- [Camunda Best Practices](https://camunda.com/best-practices/)
- [BPMN 2.0 Specification](https://www.omg.org/spec/BPMN/2.0/)
- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [UK Home Office Digital Standards](https://www.gov.uk/service-manual)
