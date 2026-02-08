# Warranty Tracking (Done Right)

## 🎯 Overview

Warranties are now **first-class objects** in ServiceTag - not just notes on an asset. This is where the system gets **powerful**.

**Core Question Answered:**
> "What's covered, until when, and what do I need to do to keep it valid?"

---

## 🏆 Warranty as a First-Class Object

### Why This Matters

**Before (treating warranties as notes):**
- ❌ Buried in asset notes
- ❌ No expiration tracking
- ❌ No registration reminders
- ❌ No required maintenance linking
- ❌ No claim history
- ❌ Lose track and void coverage

**After (warranties as first-class objects):**
- ✅ Dedicated warranty entity
- ✅ Automatic expiration tracking
- ✅ Registration deadline reminders
- ✅ Required maintenance compliance
- ✅ Complete claim history
- ✅ Never void coverage accidentally

---

## 📋 Warranty Fields

### Basic Information
```typescript
{
  warrantyName: string              // "Honda 3-Year Warranty"
  warrantyType: enum                // manufacturer, extended, third_party, dealer, store, credit_card
  providerName: string              // "Honda Motor Company"
  warrantyNumber: string            // "W-123456789"
}
```

### Coverage Period
```typescript
{
  startDate: Date                   // When coverage begins
  endDate: Date                     // When coverage ends
  durationMonths: number            // Auto-calculated (36 months)
  daysRemaining: number             // Auto-calculated (547 days)
}
```

### Coverage Details (Plain Language)
```typescript
{
  coverageScope: string             // "Covers all parts and labor for defects"
  coverageDetails: json             // Structured coverage info
  exclusions: string                // "Does not cover wear items, cosmetic damage, or modifications"
  deductible: number                // $100 per claim
  maxClaimAmount: number            // $5,000 per claim
}
```

### Registration Status
```typescript
{
  registrationStatus: enum          // registered, registration_required, not_required, pending, expired
  registrationDeadline: Date        // Must register by this date
  registrationConfirmationNumber: string
  daysUntilRegistrationDeadline: number  // Auto-calculated
}
```

**This alone saves people money** - most people miss registration deadlines!

### Proof of Warranty
```typescript
{
  proofOfPurchaseUrl: string        // Receipt photo/PDF
  warrantyDocumentUrl: string       // Warranty certificate
  registrationConfirmationUrl: string  // Registration confirmation
}
```

### Claim Information
```typescript
{
  claimInstructions: string         // "Call 1-800-XXX-XXXX or visit website"
  claimPhone: string                // "1-800-555-1234"
  claimEmail: string                // "claims@provider.com"
  claimWebsite: string              // "https://claims.provider.com"
  totalClaimsMade: number           // 2 claims
  totalClaimValue: number           // $1,200 total claimed
}
```

### Required Maintenance
```typescript
{
  requiresRegularServicing: boolean      // true
  requiresAuthorizedProvider: boolean    // true (must use dealer)
  requiresProofOfMaintenance: boolean    // true (must keep receipts)
  maintenanceInstructions: string        // "Oil changes every 6 months at authorized dealer"
}
```

### Status & Risk
```typescript
{
  isActive: boolean                 // Currently active
  isExpired: boolean                // Past end date
  isAtRisk: boolean                 // Missing required maintenance
  riskReason: string                // "Required oil change 10 days overdue"
}
```

### Transferability
```typescript
{
  isTransferable: boolean           // Can transfer to new owner
  transferFee: number               // $50 transfer fee
  transferInstructions: string      // How to transfer warranty
}
```

### Extended Warranty Decision Window
```typescript
{
  hasExtendedWarrantyOption: boolean         // Extended warranty available
  extendedWarrantyDecisionDeadline: Date     // Must decide by this date
  extendedWarrantyEstimatedCost: number      // $1,200 for extended warranty
}
```

**Bonus Reminder:**
```
"Warranty ends in 30 days — consider inspection before expiry"
```

This alone saves people money by catching issues before coverage ends!

---

## ⚡ Warranty-Aware Maintenance

### This is Where It Gets Powerful

**Required Actions to Keep Warranty Valid:**

Some warranties require:
- ✅ Regular servicing (e.g., oil changes every 6 months)
- ✅ Authorized service providers (must use dealer)
- ✅ Proof of maintenance (keep all receipts)

### System Behavior

**1. Link Required Maintenance to Warranty**
```typescript
// WarrantyRequirement model
{
  warrantyId: string
  maintenanceTaskId: string
  isRequired: boolean                    // Required vs recommended
  requirementDescription: string         // "Oil change every 6 months"
  consequenceIfMissed: string           // "Warranty void if missed"
  mustUseAuthorizedProvider: boolean    // Must use dealer
  isCompliant: boolean                  // Currently compliant
  daysUntilDue: number                  // 45 days until due
  isOverdue: boolean                    // false
}
```

**2. Flag Overdue Tasks as "Warranty at Risk"**
```
⚠️  WARNING: Warranty at Risk

Required oil change is 5 days overdue.
Your Honda warranty may be void if not completed soon.

Action: Schedule service at authorized dealer immediately.
```

**3. Attach Service Receipts to Warranty Timeline**
```
Warranty Timeline:
├─ Jan 1, 2023: Warranty starts
├─ Jun 15, 2023: Oil change (✅ receipt attached)
├─ Dec 10, 2023: Oil change (✅ receipt attached)
├─ Jun 5, 2024: Oil change (✅ receipt attached)
├─ Dec 1, 2024: Oil change (✅ receipt attached)
└─ Jan 1, 2026: Warranty ends

Status: ✅ Fully compliant
Next required: Oil change (due Jun 2025)
```

---

## 🔔 Smart Warranty Reminders

### Reminder Types

#### 1. **⏳ Warranty Expiring Soon**
```
Lead times: 90 / 60 / 30 days before expiration

Example:
Title: "Honda Warranty Expiring in 30 Days"
Message: "Your warranty expires on Jan 1, 2026. Consider a final inspection to catch any issues before coverage ends."
Type: warranty_expiring
Priority: Medium
```

#### 2. **📋 Registration Deadline** (Common Miss!)
```
Lead times: 14 / 7 / 3 / 1 days before deadline

Example:
Title: "Warranty Registration Due in 7 Days"
Message: "You must register your warranty by Dec 31 to activate coverage. Register now to avoid losing protection."
Type: warranty_registration_deadline
Priority: Critical
```

**This is HUGE** - most people miss registration deadlines and lose coverage!

#### 3. **⚠️ Required Maintenance Not Logged**
```
Example:
Title: "Required Service Overdue - Warranty at Risk"
Message: "Your required oil change was due 5 days ago. Complete service at an authorized dealer to protect your warranty."
Type: warranty_required_maintenance
Priority: Critical
Frequency: Daily until resolved
```

#### 4. **🔁 Extended Warranty Decision Window**
```
Lead times: 60 / 30 / 14 days before deadline

Example:
Title: "Extended Warranty Decision Deadline in 30 Days"
Message: "Your manufacturer warranty ends in 60 days. Extended warranty available for $1,200. Decide by Jan 1."
Type: warranty_extended_decision
Priority: Medium
```

#### 5. **🚨 Warranty at Risk**
```
Example:
Title: "WARRANTY AT RISK - Immediate Action Required"
Message: "Required maintenance is 10 days overdue. Your warranty may already be void. Contact dealer immediately."
Type: warranty_at_risk
Priority: Critical
Frequency: Daily
```

### Bonus Reminder

**"Warranty ends in 30 days — consider inspection before expiry"**

This alone saves people money by:
- Finding issues before coverage ends
- Getting repairs done for free
- Avoiding out-of-pocket costs

---

## 📊 Warranty + Contract + Maintenance View

### Example: Washing Machine

```
Asset: Samsung Washing Machine

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WARRANTIES (2)

1. Manufacturer Warranty
   ├─ Provider: Samsung
   ├─ Type: Manufacturer
   ├─ Coverage: Parts and labor
   ├─ Period: Aug 2024 - Aug 2026 (2 years)
   ├─ Status: 🟢 Active (547 days remaining)
   ├─ Registration: ✅ Registered
   └─ Claims: 0

2. Extended Warranty
   ├─ Provider: Best Buy
   ├─ Type: Extended
   ├─ Coverage: Parts, labor, and accidental damage
   ├─ Period: Aug 2026 - Aug 2029 (3 years)
   ├─ Status: 🟡 Future (starts after manufacturer warranty)
   ├─ Cost: $299 (paid)
   └─ Claims: 0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REQUIRED MAINTENANCE

1. Clean Filter
   ├─ Frequency: Every 6 months
   ├─ Required by: Manufacturer warranty
   ├─ Consequence if missed: "Warranty void"
   ├─ Last completed: Oct 1, 2025
   ├─ Next due: Apr 1, 2026
   └─ Status: 🟢 Due in 2 weeks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DASHBOARD STATUS

Coverage Status: 🟢 Covered until 2029
Next Required Service: Filter cleaning (due in 2 weeks)
Registration Status: ✅ All warranties registered
Warranty Risk: ⚠️  Registration pending for extended warranty (14 days left)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALERTS

⚠️  Extended Warranty Registration Due
    You have 14 days to register your Best Buy extended warranty.
    Register now to activate coverage starting Aug 2026.
    
    Action: Visit bestbuy.com/register
```

---

## 📅 Warranty Timeline (Super Useful)

### Chronological View Per Asset

```
Asset: 2020 Honda Civic

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WARRANTY TIMELINE

Jan 15, 2020
├─ 🛒 Purchase
├─ 💰 Price: $22,000
└─ 📍 Location: Honda of Springfield

Jan 15, 2020
├─ ✅ Manufacturer Warranty Starts
├─ Coverage: 3 years / 36,000 miles
└─ Provider: Honda Motor Company

Feb 1, 2020
├─ ✅ Warranty Registered
└─ Confirmation: W-123456789

Jun 15, 2020
├─ 🔧 Oil Change (5,000 miles)
├─ Provider: Honda Dealer
├─ Cost: $0 (covered by warranty)
└─ ✅ Receipt attached

Dec 10, 2020
├─ 🔧 Oil Change (10,000 miles)
├─ Provider: Honda Dealer
├─ Cost: $0 (covered by warranty)
└─ ✅ Receipt attached

Mar 5, 2021
├─ 🔧 Brake Inspection (15,000 miles)
├─ Provider: Honda Dealer
├─ Cost: $0 (covered by warranty)
└─ ✅ Receipt attached

Jun 20, 2021
├─ 🔧 Oil Change (20,000 miles)
├─ Provider: Honda Dealer
├─ Cost: $0 (covered by warranty)
└─ ✅ Receipt attached

Sep 15, 2021
├─ ⚠️  Warranty Claim #1
├─ Issue: Transmission noise
├─ Status: Approved
├─ Repair: Transmission replacement
├─ Cost: $0 (covered by warranty)
├─ Value: $3,500
└─ ✅ Claim documents attached

Dec 1, 2021
├─ 🔧 Oil Change (25,000 miles)
├─ Provider: Honda Dealer
├─ Cost: $0 (covered by warranty)
└─ ✅ Receipt attached

Jan 15, 2023
├─ ⏰ Manufacturer Warranty Expires
└─ Total value received: $3,800

Jan 15, 2023
├─ ✅ Extended Warranty Starts
├─ Provider: Honda Care
├─ Coverage: 2 years / 24,000 miles
├─ Cost: $1,200
└─ Deductible: $100 per claim

Jun 5, 2023
├─ 🔧 Oil Change (30,000 miles)
├─ Provider: Independent shop
├─ Cost: $45 (not covered)
└─ ✅ Receipt attached

Jan 15, 2025
└─ ⏰ Extended Warranty Expires

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUMMARY

Total Warranties: 2
Total Claims: 1
Total Warranty Value Received: $3,800
Total Warranty Cost: $1,200
Net Savings: $2,600

Current Status: No active warranty
Recommendation: Consider purchasing extended warranty for peace of mind
```

### This is Gold For:

1. **Claims**
   - Complete service history
   - Proof of required maintenance
   - All receipts attached
   - Claim history

2. **Resale**
   - Show buyer complete maintenance history
   - Prove warranty compliance
   - Demonstrate care and maintenance
   - Increase resale value

3. **Insurance**
   - Proof of value
   - Maintenance documentation
   - Claim history
   - Coverage verification

---

## 🗄️ Data Model Add-On

### New Entities

#### 1. **Warranty** (First-Class Object)
```typescript
{
  id: string
  warrantyName: string
  warrantyType: enum
  providerName: string
  startDate: Date
  endDate: Date
  registrationStatus: enum
  requiresRegularServicing: boolean
  isAtRisk: boolean
  // ... 30+ fields
}
```

#### 2. **AssetWarranty** (Junction)
```typescript
{
  assetId: string
  warrantyId: string
  isFullyCovered: boolean
  partialCoverageNotes: string
}
```

#### 3. **WarrantyRequirement**
```typescript
{
  warrantyId: string
  maintenanceTaskId: string
  isRequired: boolean
  consequenceIfMissed: string
  isCompliant: boolean
  isOverdue: boolean
}
```

#### 4. **WarrantyClaim**
```typescript
{
  warrantyId: string
  assetId: string
  claimNumber: string
  claimDate: Date
  claimStatus: enum
  issueDescription: string
  amountPaidByWarranty: number
  amountPaidOutOfPocket: number
  denialReason: string
}
```

### Relationships

```
Asset ⟷ Warranty (many-to-many via AssetWarranty)
  - One warranty can cover multiple assets
  - One asset can have multiple warranties

Warranty ⟷ MaintenanceTask (via WarrantyRequirement)
  - Warranty specifies required maintenance
  - Tracks compliance status
  - Prevents warranty voids

Warranty ⟷ ServiceRecord
  - Service can be warranty-covered
  - Tracks warranty claims
  - Calculates out-of-pocket costs

Warranty ⟷ WarrantyClaim
  - Complete claim history
  - Tracks claim status
  - Documents denials and appeals
```

---

## 📸 Low-Friction Capture (Important!)

### To Make This Usable

**1. Photo Receipt → Auto-Fill Dates**
```
User takes photo of receipt
↓
OCR extracts:
- Purchase date
- Warranty start date
- Warranty end date
- Provider name
- Coverage details
↓
Auto-fills warranty form
↓
User reviews and confirms
```

**2. Manual Entry Fallback**
```
Simple form:
- What's covered? (text)
- Provider name
- Start date
- End date
- Registration required? (yes/no)
- Done!

Advanced fields optional
```

**3. Email Forwarding** (Future)
```
Forward warranty PDFs to:
warranty@servicetag.app

System:
- Extracts warranty info
- Creates warranty record
- Attaches PDF
- Sends confirmation
```

**4. Simple "Unknown Coverage" Notes**
```
Don't know all the details?
Add a basic warranty:

Name: "Washing machine warranty"
Provider: "Samsung"
Ends: "Sometime in 2026"
Notes: "Need to find paperwork"

Update details later when you find the documents
```

---

## 🎯 Value Proposition

### What This Solves

**Before:**
- ❌ Warranties buried in notes
- ❌ Miss registration deadlines → lose coverage
- ❌ Forget required maintenance → void warranty
- ❌ No claim history
- ❌ Can't prove compliance
- ❌ Lose thousands in coverage

**After:**
- ✅ Warranties as first-class objects
- ✅ Registration deadline reminders
- ✅ Required maintenance tracking
- ✅ Complete claim history
- ✅ Compliance proof
- ✅ Never void coverage accidentally

### Key Benefits

1. **Never Miss Registration**
   - Automatic deadline tracking
   - Multiple reminders
   - Confirmation number storage

2. **Never Void a Warranty**
   - Required maintenance tracking
   - Compliance monitoring
   - Risk alerts

3. **Maximize Warranty Value**
   - Pre-expiration inspection reminders
   - Catch issues before coverage ends
   - Complete claim history

4. **Resale Documentation**
   - Complete warranty timeline
   - Proof of maintenance
   - Increase resale value

---

## 🚀 Implementation Status

### ✅ Deployed Models

1. ✅ **Warranty** - First-class warranty entity
2. ✅ **AssetWarranty** - Many-to-many junction
3. ✅ **WarrantyRequirement** - Required maintenance tracking
4. ✅ **WarrantyClaim** - Complete claim history

### ✅ Enhanced Models

1. ✅ **Asset** - Added warranty relationships
2. ✅ **MaintenanceTask** - Added warranty requirements
3. ✅ **ServiceRecord** - Added warranty coverage tracking
4. ✅ **Reminder** - Added warranty reminder types
5. ✅ **Document** - Added warranty document linking

### 📊 Total Models: 17

**Complete system with:**
- Assets
- Warranties (NEW!)
- Service Contracts
- Maintenance Tasks
- Service Records
- Reminders
- Claims (NEW!)
- Documents
- Cost Tracking
- Health Monitoring

---

**Warranty tracking done right = Never void coverage, never miss deadlines, maximize value!** 🎉
