# Service Contracts - Feature Specification

## 🎯 Overview

**Expanded Scope: Maintenance + Service Contracts**

ServiceTag now tracks not just maintenance, but also the **service contracts** that cover your assets - answering the critical question:

> **"What am I covered for, until when, and under what conditions?"**

This is **HUGE value** - most people lose track of warranties, forget required maintenance, and miss renewal deadlines.

---

## 📋 What Service Contracts Include

### Contract Types Supported

1. **Extended Warranties**
   - Manufacturer extended warranties
   - Third-party warranty coverage
   - Bumper-to-bumper coverage
   - Powertrain warranties

2. **Maintenance Plans**
   - Prepaid maintenance packages
   - Scheduled service plans
   - Oil change packages
   - Tire rotation plans

3. **Service Agreements**
   - HVAC service contracts
   - Pest control agreements
   - Lawn care contracts
   - Security system monitoring
   - Pool maintenance

4. **Subscriptions Tied to Physical Assets**
   - Equipment monitoring subscriptions
   - Software licenses for hardware
   - Telematics services
   - Remote monitoring

5. **Insurance Riders**
   - Equipment breakdown insurance
   - Extended coverage riders
   - Specialized asset insurance

---

## 🎯 Core Question Answered

### "What am I covered for, until when, and under what conditions?"

**For Each Asset, You Know:**
- ✅ Active contracts covering this asset
- ✅ What's covered vs. what's not
- ✅ When coverage expires
- ✅ What maintenance is required to keep coverage valid
- ✅ What happens if you miss required service
- ✅ When renewals are coming up
- ✅ How much renewals will cost

**Example:**
```
Asset: 2020 Honda Civic

Active Contracts:
1. Extended Warranty (expires Dec 2026)
   ✅ Covered: Powertrain, electrical
   ❌ Not covered: Wear items (brakes, tires)
   ⚠️  Required: Oil changes every 6 months
   💰 Cost: $1,800 (paid)

2. Maintenance Plan (expires Nov 2025)
   ✅ Covered: Oil changes, tire rotations, inspections
   ⚠️  Required: Use authorized dealer
   💰 Cost: $45/month

Status: ✅ Fully compliant
Next required service: Oil change (due in 2 weeks)
Contract risk: None
```

---

## 🗂️ New Core Objects

### 1. ServiceContract Entity

**Purpose:** Tracks warranties, maintenance plans, and service agreements

**Key Fields:**

#### **Basic Information**
```typescript
{
  contractName: string          // "Honda Extended Warranty"
  providerName: string           // "Honda Financial Services"
  contractType: enum             // warranty, maintenance_plan, service_agreement
}
```

#### **Contract Period**
```typescript
{
  startDate: Date                // When coverage begins
  endDate: Date                  // When coverage ends
  expiresInDays: number          // Calculated: days until expiration
}
```

#### **Renewal Configuration**
```typescript
{
  renewalType: enum              // auto_renew, manual_renew, non_renewable
  renewalReminderDays: number    // Days before renewal to remind (default: 60)
  autoRenewDate: Date            // When auto-renewal will occur
}
```

#### **Cost Information**
```typescript
{
  costType: enum                 // one_time, monthly, annual, per_service
  costAmount: number             // Cost per period
  totalPaid: number              // Lifetime cost paid
  nextPaymentDate: Date          // When next payment is due
  nextPaymentAmount: number      // Amount of next payment
}
```

#### **Coverage Details**
```typescript
{
  coverageSummary: string        // "Covers powertrain and electrical systems"
  coverageDetails: json          // Structured coverage info
  exclusions: string             // "Excludes wear items and cosmetic damage"
  deductible: number             // Per-claim deductible
}
```

#### **Provider Information**
```typescript
{
  providerPhone: string          // "1-800-555-1234"
  providerEmail: string          // "service@provider.com"
  providerWebsite: string        // "https://provider.com"
  accountNumber: string          // Your account number
  policyNumber: string           // Policy/contract number
}
```

#### **Service Request Info**
```typescript
{
  claimInstructions: string      // How to file a claim
  serviceRequestPhone: string    // Phone for service requests
  serviceRequestEmail: string    // Email for service requests
  serviceRequestUrl: string      // Online portal URL
}
```

#### **Risk Indicators**
```typescript
{
  hasRequiredServiceOverdue: boolean  // Required maintenance missed
  atRiskOfVoid: boolean              // Contract at risk of being voided
}
```

**Relationships:**
- ✅ Linked to one or more assets (many-to-many)
- ✅ Has required maintenance tasks
- ✅ Tracks service records under contract
- ✅ Stores contract documents
- ✅ Generates reminders

---

### 2. AssetContract (Junction Model)

**Purpose:** Many-to-many relationship between Assets and Contracts

**Why Needed:**
- One contract can cover multiple assets (e.g., home warranty covers HVAC + appliances)
- One asset can have multiple contracts (e.g., car has warranty + maintenance plan)

**Fields:**
```typescript
{
  assetId: string
  contractId: string
  
  // Coverage specifics for this asset
  coverageStartDate: Date        // May differ from contract start
  coverageEndDate: Date          // May differ from contract end
  isFullyCovered: boolean        // Full or partial coverage
  partialCoverageNotes: string   // "Only covers engine, not transmission"
}
```

---

### 3. ContractRequirement Model

**Purpose:** Maintenance tasks required to keep contract valid

**This is HUGE value** - tracks what you MUST do to avoid voiding coverage

**Fields:**
```typescript
{
  contractId: string
  maintenanceTaskId: string
  
  // Requirement Details
  isRequired: boolean            // Required vs recommended
  requirementDescription: string // "Annual HVAC inspection required"
  consequenceIfMissed: string    // "Warranty void if missed"
  
  // Compliance Status
  isCompliant: boolean           // Currently compliant?
  lastComplianceCheck: Date      // When last checked
  daysUntilDue: number          // Days until required service due
  isOverdue: boolean            // Is required service overdue?
}
```

**Example:**
```
Contract: HVAC 5-Year Service Agreement
Required Maintenance:
1. Annual Inspection
   - Required: Yes
   - Consequence if missed: "Warranty void"
   - Status: ✅ Compliant (last done 3 months ago)
   - Next due: 9 months

2. Filter Replacement (every 6 months)
   - Required: Yes
   - Consequence if missed: "Coverage suspended"
   - Status: ⚠️  Due in 2 weeks
   - Next due: 14 days
```

---

### 4. Contract-Aware Maintenance Tasks

**Enhanced MaintenanceTask Model:**

**New Fields:**
```typescript
{
  // Contract Relationship
  isCoveredByContract: boolean       // Service is covered by contract
  isRequiredByContract: boolean      // Service is required by contract
  coveringContractId: string         // Which contract covers this
  requiringContractId: string        // Which contract requires this
  
  // Cost
  isCoveredCost: boolean            // Cost covered by contract
}
```

**Task States:**

1. **Covered by Contract ✅**
   ```
   Task: Oil Change
   Status: ✅ Covered by maintenance plan
   Cost: $0 out of pocket
   Provider: Must use authorized dealer
   ```

2. **Required to Keep Contract Valid ⚠️**
   ```
   Task: HVAC Annual Service
   Status: ⚠️  Required under contract
   Consequence: Warranty void if missed
   Due: In 30 days
   ```

3. **Both Covered AND Required ✅⚠️**
   ```
   Task: Annual Inspection
   Status: ✅ Covered by contract
   Status: ⚠️  Required to maintain warranty
   Cost: $0 (covered)
   Due: March 15
   ```

---

## 🔔 Smart Reminders (Contract-Specific)

### Reminder Types

#### 1. **📅 Maintenance Due (Covered)**
```
Title: "Free Oil Change Available"
Message: "Your maintenance plan covers an oil change. Schedule now!"
Type: maintenance_covered
Lead Time: 14 days before due
```

#### 2. **⏳ Contract Expiring Soon**
```
Title: "Extended Warranty Expiring"
Message: "Your Honda warranty expires in 60 days. Review renewal options."
Type: contract_expiring
Lead Time: 90, 60, 30 days before expiration
```

#### 3. **🔁 Renewal Coming Up**
```
Title: "Auto-Renewal in 30 Days"
Message: "Your HVAC service plan will auto-renew for $599 on Nov 1."
Type: contract_renewal
Lead Time: 30 days before renewal
```

#### 4. **⚠️ Required Service Not Logged**
```
Title: "Required Service Overdue - Warranty at Risk"
Message: "Annual inspection was due 5 days ago. Schedule now to avoid voiding warranty."
Type: required_service_overdue
Priority: Critical
```

#### 5. **💸 Price Increase / Renewal Cost Reminder**
```
Title: "Renewal Cost: $599"
Message: "Your maintenance plan renews in 30 days. New rate: $599/year (was $549)."
Type: renewal_cost
Lead Time: 30 days before renewal
```

#### 6. **🚨 Contract at Risk**
```
Title: "WARRANTY AT RISK"
Message: "Required HVAC service is 10 days overdue. Your warranty may be void."
Type: contract_at_risk
Priority: Critical
Frequency: Daily until resolved
```

### Lead Times

**Contract Expiration:**
- 90 days before: "Expiring soon"
- 60 days before: "Consider renewal"
- 30 days before: "Expiring this month"
- 7 days before: "Expires this week"
- On expiration: "Coverage ended"

**Auto-Renewal:**
- 60 days before: "Auto-renewal coming"
- 30 days before: "Renewal charge in 30 days"
- 14 days before: "Renewal charge in 2 weeks"
- 7 days before: "Last chance to cancel"
- 1 day before: "Renewal tomorrow"

**Required Service:**
- 30 days before due: "Required service upcoming"
- 14 days before due: "Required service in 2 weeks"
- On due date: "Required service due today"
- 1 day overdue: "Required service overdue"
- 7 days overdue: "WARRANTY AT RISK"
- 14 days overdue: "WARRANTY LIKELY VOID"

---

## 📊 Dashboard Views That Matter

### 1. 🔍 Asset View

**For a Given Asset:**

```
Asset: Home HVAC System

Active Contracts: 2
├─ Extended Warranty (expires Nov 2027)
│  ✅ Covered: All parts and labor
│  ❌ Not covered: Filters, refrigerant
│  ⚠️  Required: Annual inspection
│  💰 Cost: $1,200 (paid)
│
└─ Maintenance Plan (expires Dec 2025)
   ✅ Covered: 2 inspections/year, filter changes
   ⚠️  Required: Use authorized provider
   💰 Cost: $25/month

Coverage Status: ✅ Fully covered
Next Required Service: Annual inspection (due in 45 days)
Contract Expiration Risk: ⚠️  Maintenance plan expires in 10 months
Total Contract Value: $1,500/year
```

**Key Metrics:**
- Active contracts count
- Coverage status (fully/partially/not covered)
- Next required service
- Days until contract expiration
- Total annual contract cost
- Compliance status

---

### 2. 📜 Contract View

**For a Given Contract:**

```
Contract: HVAC 5-Year Service Agreement
Provider: ABC HVAC Services
Type: Service Agreement
Status: ✅ Active

Coverage Period:
├─ Start: Jan 1, 2023
├─ End: Dec 31, 2027
└─ Remaining: 1 year, 10 months

Covered Assets: 1
└─ Home HVAC System

Required Maintenance Tasks: 2
├─ Annual Inspection
│  ⚠️  Due in 45 days
│  ✅ Compliant (last done 10 months ago)
│
└─ Filter Replacement (every 6 months)
   ✅ Due in 3 months
   ✅ Compliant (last done 3 months ago)

Past Service Events: 8
├─ 2025: 4 services ($0 out of pocket)
├─ 2024: 3 services ($0 out of pocket)
└─ 2023: 1 service ($0 out of pocket)

Cost Summary:
├─ Total Paid: $1,200 (one-time)
├─ Services Received: $1,600 value
└─ Savings: $400

Renewal:
├─ Type: Manual renewal
├─ Renewal Date: Dec 31, 2027
└─ Estimated Cost: $1,500
```

**Key Metrics:**
- Contract status
- Days until expiration
- Covered assets
- Required maintenance compliance
- Service history under contract
- Total cost vs. value received
- Renewal information

---

### 3. 🚨 Risk View (Underrated but Powerful)

**System-Wide Risk Dashboard:**

```
🚨 CONTRACTS AT RISK (2)

Critical Issues:
├─ HVAC Warranty
│  ⚠️  Required annual inspection 5 days overdue
│  💥 Risk: Warranty void
│  🔧 Action: Schedule inspection immediately
│
└─ Car Extended Warranty
   ⚠️  Required oil change 2 days overdue
   💥 Risk: Coverage suspended
   🔧 Action: Complete oil change ASAP

⏳ CONTRACTS EXPIRING IN NEXT 90 DAYS (3)

├─ Lawn Care Service Agreement (expires in 15 days)
│  💰 Renewal cost: $599
│  🔁 Auto-renew: No
│  🔧 Action: Decide on renewal
│
├─ Car Maintenance Plan (expires in 45 days)
│  💰 Renewal cost: $899
│  🔁 Auto-renew: Yes
│  🔧 Action: Review or cancel
│
└─ Pest Control Contract (expires in 82 days)
   💰 Renewal cost: $299
   🔁 Auto-renew: Yes
   🔧 Action: No action needed

❌ LAPSED COVERAGE (1)

└─ Appliance Warranty (expired 30 days ago)
   💰 Renewal cost: $399
   🔧 Action: Renew or accept risk

🔁 AUTO-RENEWALS COMING UP (2)

├─ Security System Monitoring (renews in 10 days)
│  💰 Charge: $29.99/month
│  🔧 Action: Cancel if not needed
│
└─ Pool Maintenance (renews in 25 days)
   💰 Charge: $149/month
   🔧 Action: Review pricing
```

**Risk Categories:**

1. **Critical Issues** (Red)
   - Required service overdue
   - Contract at risk of void
   - Immediate action needed

2. **Expiring Soon** (Yellow)
   - Contracts expiring in 90 days
   - Renewal decisions needed
   - Cost planning required

3. **Lapsed Coverage** (Orange)
   - Expired contracts
   - Assets without coverage
   - Renewal opportunities

4. **Auto-Renewals** (Blue)
   - Upcoming automatic charges
   - Cancellation deadlines
   - Cost awareness

---

## 💡 Real-World Example

### Asset: Home HVAC System

**Contract: 5-Year Service Agreement (ends Nov 2027)**

#### **Contract Details:**
```
Provider: ABC HVAC Services
Type: Service Agreement
Cost: $1,200 (one-time payment)
Coverage: All parts and labor
Exclusions: Filters, refrigerant
```

#### **Required Maintenance:**
```
1. Annual Inspection
   - Frequency: Once per year
   - Required: Yes
   - Consequence if missed: "Warranty void"
   - Last completed: Jan 15, 2025
   - Next due: Jan 15, 2026

2. Filter Replacement
   - Frequency: Every 6 months
   - Required: Yes
   - Consequence if missed: "Coverage suspended"
   - Last completed: Oct 1, 2025
   - Next due: Apr 1, 2026
```

#### **System Behavior:**

**30 Days Before Inspection Due:**
```
📅 Reminder: "HVAC Annual Inspection Due Soon"
Message: "Your required annual inspection is due in 30 days.
         This service is required to maintain your warranty.
         Schedule now to avoid coverage issues."
Type: maintenance_required
Priority: High
```

**If Inspection Missed:**
```
⚠️  Alert: "Required Service Overdue - Warranty at Risk"
Message: "Your HVAC annual inspection was due 5 days ago.
         Your warranty may be void if not completed soon.
         Schedule immediately to protect your coverage."
Type: contract_at_risk
Priority: Critical
Frequency: Daily until resolved
```

**60 Days Before Contract Expiration:**
```
⏳ Reminder: "Service Agreement Expiring Soon"
Message: "Your HVAC service agreement expires in 60 days (Nov 2027).
         Review renewal options now.
         Estimated renewal cost: $1,500"
Type: contract_expiring
Priority: Medium
```

**Before Auto-Renew:**
```
🔁 Alert: "Auto-Renewal in 30 Days"
Message: "Your service plan will auto-renew for $1,500 on Nov 1.
         Review coverage or cancel by Oct 15."
Type: contract_renewal
Priority: High
```

---

## 🗄️ Data Model (High Level)

### Entity Relationships

```
Asset
  ├─ MaintenanceTask (many)
  ├─ ServiceRecord (many)
  └─ AssetContract (many)
       └─ ServiceContract

ServiceContract
  ├─ AssetContract (many)
  │    └─ Asset
  ├─ ContractRequirement (many)
  │    └─ MaintenanceTask
  ├─ ServiceRecord (many)
  ├─ Document (many)
  └─ Reminder (many)

MaintenanceTask
  ├─ ServiceRecord (many)
  ├─ ContractRequirement (many)
  │    └─ ServiceContract
  └─ Reminder (many)

ServiceRecord
  ├─ Asset
  ├─ MaintenanceTask (optional)
  ├─ ServiceContract (optional)
  └─ Document (many)
```

### Key Relationships

**Asset ⟷ ServiceContract (Many-to-Many)**
- Via AssetContract junction table
- One contract can cover multiple assets
- One asset can have multiple contracts

**ServiceContract ⟷ MaintenanceTask (Requirements)**
- Via ContractRequirement table
- Contract specifies required maintenance
- Tracks compliance status

**ServiceRecord ⟷ ServiceContract**
- Service can be covered by contract
- Tracks contract coverage and claims
- Calculates out-of-pocket costs

**Reminder ⟷ ServiceContract**
- Contract expiration reminders
- Renewal reminders
- Required service reminders
- Auto-renewal alerts

---

## 🎯 Value Proposition

### What This Solves

**Before ServiceTag:**
- ❌ Lose track of warranties
- ❌ Forget required maintenance
- ❌ Miss renewal deadlines
- ❌ Pay for covered services
- ❌ Void warranties accidentally
- ❌ Surprise auto-renewal charges
- ❌ Don't know what's covered

**With ServiceTag:**
- ✅ All contracts in one place
- ✅ Automatic required service reminders
- ✅ Renewal alerts with lead time
- ✅ Know what's covered before service
- ✅ Compliance tracking prevents voids
- ✅ Auto-renewal warnings
- ✅ Clear coverage status per asset

### Key Benefits

1. **Never Void a Warranty**
   - Tracks required maintenance
   - Alerts before deadlines
   - Shows compliance status

2. **Maximize Contract Value**
   - Know what's covered
   - Use covered services
   - Track savings vs. cost

3. **Avoid Surprise Charges**
   - Auto-renewal warnings
   - Price increase alerts
   - Renewal cost planning

4. **Make Informed Decisions**
   - Contract value analysis
   - Coverage gap identification
   - Renewal recommendations

---

## 🚀 Implementation Priority

### Phase 1: Core Contract Tracking
- ✅ ServiceContract model
- ✅ AssetContract junction
- ✅ Basic contract CRUD
- ✅ Contract document storage
- ✅ Expiration tracking

### Phase 2: Contract Requirements
- ✅ ContractRequirement model
- ✅ Link maintenance to contracts
- ✅ Compliance tracking
- ✅ Required service alerts

### Phase 3: Smart Reminders
- ✅ Contract expiration reminders
- ✅ Renewal reminders
- ✅ Required service reminders
- ✅ Auto-renewal alerts
- ✅ Risk notifications

### Phase 4: Analytics & Insights
- ✅ Contract value analysis
- ✅ Coverage gap detection
- ✅ Cost tracking (covered vs. out-of-pocket)
- ✅ Renewal recommendations

---

**This feature transforms ServiceTag from a maintenance tracker into a complete asset + contract management system!** 🎉
