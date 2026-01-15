# Visa Builder Documentation

## Overview

The Visa Builder is a comprehensive system for governments and immigration authorities to create, manage, and publish visa type configurations. It includes support for VisaKey fast-track processing, AI-assisted visa creation, and a structured approach to visa requirements management.

---

## Architecture

### Frontend Structure

```
src/
├── app/visa-builder/
│   ├── page.tsx                    # Main Visa Builder Tool (JSON Import)
│   ├── visakey/page.tsx            # VisaKey-enabled visas management
│   ├── ai/page.tsx                 # Visa AI Assistant
│   ├── new-list/page.tsx           # New/draft visa types
│   ├── published-list/page.tsx     # Published visa types
│   ├── categories/page.tsx         # Visa categories management
│   └── knowledgebase/page.tsx      # Visa Knowledgebase (coming soon)
│
├── components/visa-builder/
│   ├── JsonVisaImporter.tsx        # JSON import and validation
│   ├── VisaKeyConfigurator.tsx     # VisaKey stage configuration dialog
│   └── VisaKeyFlowDiagram.tsx      # Visual flow diagram component
│
├── lib/
│   ├── visakey-stages.ts           # VisaKey stage definitions and helpers
│   └── sample-visa-types.ts        # Sample visa data for development
│
└── types/
    └── visaType.ts                 # TypeScript interfaces for visa types
```

---

## Core Features

### 1. JSON Visa Import (`/visa-builder`)

**Purpose:** Allow governments to import their standard visa configurations via JSON.

**File:** `src/app/visa-builder/page.tsx`

**Functionality:**
- JSON text input or file upload
- Real-time JSON validation
- Preview of parsed visa configuration
- Save to local state (persists during session)
- Option to enable VisaKey for imported visas

### 2. VisaKey Integration (`/visa-builder/visakey`)

**Purpose:** Manage visas with VisaKey fast-track processing enabled.

**File:** `src/app/visa-builder/visakey/page.tsx`

**Functionality:**
- List all VisaKey-enabled visas
- Filter by category and country
- Configure processing tiers and pricing
- Set travel insurance requirements
- View/export VisaKey configurations

### 3. Visa AI Assistant (`/visa-builder/ai`)

**Purpose:** AI-powered visa creation and analysis.

**File:** `src/app/visa-builder/ai/page.tsx`

**Functionality:**
- Natural language visa description input
- AI generates complete JSON configuration
- Analyze existing visas for improvements
- Compliance recommendations
- Export generated configurations

---

## VisaKey System

### Stage Types

#### Fixed Stages (Always Required - 10 stages)

| Stage ID | Name | Purpose |
|----------|------|---------|
| ELIGIBILITY_CHECK | Eligibility Check | Assess applicant eligibility score |
| VISA_SELECTION | Visa Selection | Confirm visa type choice |
| SMS_VERIFICATION | SMS Verification | Phone number verification |
| PASSPORT_UPLOAD | Passport Upload | OCR scan & passport verification |
| KYC_LIVENESS | KYC Liveness | Biometric identity verification |
| RESIDENCY_INFO | Residency Info | Proof of current residence |
| EXISTING_VISAS | Existing Visas | Declare current/past visas |
| PHOTO_UPLOAD | Photo Upload | Visa-compliant photo |
| PROFESSIONAL_INFO | Professional Info | Employment verification |
| FINANCIAL_INFO | Financial Info | Income/bank verification |

#### Conditional Stages (Category-based - 6 stages)

| Stage ID | Name | Recommended For |
|----------|------|-----------------|
| TRAVEL_DETAILS | Travel Details | Tourist, Business |
| TRAVEL_INSURANCE | Travel Insurance | Tourist |
| STUDENT_INFO | Student Info | Student |
| RELIGION_WORKER_INFO | Religious Worker | Work (religious) |
| MEDICAL_WORKER_INFO | Medical Worker | Work (healthcare) |
| DYNAMIC_DOCUMENTS_UPLOAD | Custom Documents | All |

#### Final Stages (Always Required - 3 stages)

| Stage ID | Name |
|----------|------|
| REVIEW_AND_CONFIRM | Review & Confirm |
| PAYMENT | Payment |
| SUBMISSION | Submission |

### Processing Tiers

| Tier | Timeframe | Description |
|------|-----------|-------------|
| Priority | 24-48 hours | Fastest processing, highest fee |
| Premium | 3-5 business days | Expedited processing |
| Standard | 10-15 business days | Default timeline, no extra fee |

### Insurance Requirements

```typescript
interface VisaKeyInsuranceRequirements {
  required: boolean
  minimumCoverage?: number        // e.g., 30000
  coverageCurrency?: string       // e.g., "EUR"
  requirements: {
    medicalInsurance: boolean
    emergencyEvacuation: boolean
    repatriation: boolean
    personalLiability: boolean
    tripCancellation: boolean
    luggageLoss: boolean
  }
  minimumDuration?: string        // e.g., "Duration of stay + 15 days"
}
```

---

## Type Definitions

### VisaTypeConfig

```typescript
interface VisaTypeConfig {
  name: string
  visaCode: string
  category: VisaCategory
  description: string
  country: string | CountryInfo
  eVisaAvailable: boolean
  eligibilityCriteria: EligibilityCriteria[]
  kycRequirements: KYCRequirement[]
  documentsRequirements: DocumentRequirement[]
  processingTier: ProcessingTier[]
  processingInfo?: ProcessingInfo
  metadata?: VisaMetadata
  isActive: boolean
  createdAt?: string
  updatedAt?: string

  // VisaKey Integration
  visaKey?: VisaKeyConfig
}
```

### VisaKeyConfig

```typescript
interface VisaKeyConfig {
  enabled: boolean
  fixedStages: VisaKeyStageConfig[]
  conditionalStages: VisaKeyStageConfig[]
  finalStages: VisaKeyStageConfig[]
  processingPath: 'standard' | 'premium' | 'priority'
  processingTiers: VisaKeyProcessingTier[]
  insuranceRequirements?: VisaKeyInsuranceRequirements
  eligibilityThreshold?: number
}
```

---

## Backend Implementation (Proposed)

### API Contracts

#### Visa Types API

```
GET    /api/visa-types                    # List all visa types
GET    /api/visa-types/:code              # Get visa type by code
POST   /api/visa-types                    # Create new visa type
PUT    /api/visa-types/:code              # Update visa type
DELETE /api/visa-types/:code              # Delete visa type
POST   /api/visa-types/:code/publish      # Publish visa type
POST   /api/visa-types/:code/unpublish    # Unpublish visa type
```

#### VisaKey API

```
GET    /api/visakey/visas                 # List VisaKey-enabled visas
POST   /api/visakey/enable/:code          # Enable VisaKey for visa
PUT    /api/visakey/config/:code          # Update VisaKey configuration
DELETE /api/visakey/disable/:code         # Disable VisaKey for visa
GET    /api/visakey/tiers/:code           # Get processing tiers
PUT    /api/visakey/tiers/:code           # Update processing tiers
GET    /api/visakey/insurance/:code       # Get insurance requirements
PUT    /api/visakey/insurance/:code       # Update insurance requirements
```

#### Visa AI API

```
POST   /api/visa-ai/generate              # Generate visa from prompt
POST   /api/visa-ai/analyze/:code         # Analyze existing visa
POST   /api/visa-ai/compare               # Compare multiple visas
POST   /api/visa-ai/suggestions/:code     # Get improvement suggestions
```

### Database Schema (Proposed)

```sql
-- Visa Types Table
CREATE TABLE visa_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visa_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  country_code VARCHAR(3) NOT NULL,
  e_visa_available BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  config JSONB NOT NULL,  -- Full visa configuration
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- VisaKey Configurations Table
CREATE TABLE visakey_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visa_type_id UUID REFERENCES visa_types(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT false,
  fixed_stages JSONB NOT NULL,
  conditional_stages JSONB NOT NULL,
  final_stages JSONB NOT NULL,
  processing_path VARCHAR(20) DEFAULT 'standard',
  processing_tiers JSONB NOT NULL,
  insurance_requirements JSONB,
  eligibility_threshold INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(visa_type_id)
);

-- Visa Categories Table
CREATE TABLE visa_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Audit Log Table
CREATE TABLE visa_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visa_type_id UUID REFERENCES visa_types(id),
  action VARCHAR(50) NOT NULL,  -- 'create', 'update', 'publish', 'delete', 'visakey_enable', etc.
  changes JSONB,                -- Diff of changes
  performed_by UUID REFERENCES users(id),
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);

-- Indexes
CREATE INDEX idx_visa_types_category ON visa_types(category);
CREATE INDEX idx_visa_types_country ON visa_types(country_code);
CREATE INDEX idx_visa_types_active ON visa_types(is_active, is_published);
CREATE INDEX idx_visakey_enabled ON visakey_configs(enabled);
CREATE INDEX idx_audit_visa_type ON visa_audit_log(visa_type_id);
CREATE INDEX idx_audit_performed_at ON visa_audit_log(performed_at);
```

---

## File Reference

| File | Purpose |
|------|---------|
| `src/app/visa-builder/page.tsx` | Main JSON import tool |
| `src/app/visa-builder/visakey/page.tsx` | VisaKey management page |
| `src/app/visa-builder/ai/page.tsx` | Visa AI assistant |
| `src/app/visa-builder/new-list/page.tsx` | Draft visa types list |
| `src/app/visa-builder/published-list/page.tsx` | Published visa types |
| `src/app/visa-builder/categories/page.tsx` | Category management |
| `src/app/visa-builder/knowledgebase/page.tsx` | Knowledgebase (coming soon) |
| `src/components/visa-builder/JsonVisaImporter.tsx` | JSON import component |
| `src/components/visa-builder/VisaKeyConfigurator.tsx` | VisaKey configuration dialog |
| `src/components/visa-builder/VisaKeyFlowDiagram.tsx` | Visual stage flow diagram |
| `src/lib/visakey-stages.ts` | Stage definitions and types |
| `src/lib/sample-visa-types.ts` | Sample data |
| `src/types/visaType.ts` | TypeScript interfaces |

---

## User Flows

### 1. Import New Visa Type

```
1. Navigate to /visa-builder
2. Paste JSON or upload file
3. System validates JSON structure
4. Preview parsed configuration
5. Optionally enable VisaKey
   - Configure stages
   - Set processing tiers
   - Set insurance requirements
6. Save visa type
```

### 2. Enable VisaKey for Existing Visa

```
1. Navigate to /visa-builder/published-list
2. Find visa in list
3. Click "Enable VisaKey" action
4. VisaKey Configurator opens
5. Configure stages (fixed are pre-selected)
6. Set processing tiers and pricing
7. Optionally configure insurance
8. Save configuration
```

### 3. Create Visa with AI

```
1. Navigate to /visa-builder/ai
2. Select "Create Visa" tab
3. Describe visa in natural language
4. Click "Generate"
5. Review generated JSON
6. Edit if needed
7. Download or import to builder
```

---

## Future Enhancements

1. **Visa Knowledgebase**
   - Document repository
   - AI-powered search
   - Chat assistant
   - Auto-updates on regulation changes

2. **Version Control**
   - Track changes to visa configurations
   - Rollback capability
   - Diff visualization

3. **Multi-language Support**
   - Visa descriptions in multiple languages
   - Document templates per language

4. **Analytics Dashboard**
   - Application success rates
   - Processing time metrics
   - Popular visa types

5. **Integration APIs**
   - Webhook notifications
   - Third-party system sync
   - Bulk import/export

---

## Contributing

When adding new features to the Visa Builder:

1. Follow existing TypeScript patterns
2. Add proper type definitions
3. Update this documentation
4. Include sample data for testing
5. Ensure responsive design
6. Add appropriate error handling

---

*Last Updated: January 2026*
