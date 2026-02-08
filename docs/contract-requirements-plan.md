# Service Contract Maintenance Requirements - Implementation Plan

## Overview
Enable users to define maintenance requirements within service contracts and automatically generate maintenance schedules based on the asset's in-service date.

## User Story
**As a user**, I want to:
1. Add an "In Service" date to my assets
2. Define required maintenance tasks within a service contract
3. Have the system automatically generate maintenance schedules based on:
   - The contract requirements
   - The asset's in-service date
   - The maintenance intervals specified

**Future Enhancement**: Use AI to read contract documents and automatically extract maintenance requirements.

---

## Data Model Changes

### ✅ Already Implemented
1. **Asset.inServiceDate** - Added to track when asset was put into service
2. **ContractRequirement** model - Links contracts to maintenance tasks
3. **MaintenanceTask** model - Defines recurring maintenance with intervals

### Schema Relationships
```
ServiceContract
    ↓ (hasMany)
ContractRequirement
    ↓ (belongsTo)
MaintenanceTask
    ↓ (belongsTo)
Asset (with inServiceDate)
```

---

## Implementation Steps

### Phase 1: UI for Contract Requirements (Current Focus)

#### 1.1 Update Assets Page
- [x] Add "In Service Date" field to Asset model
- [ ] Add "In Service Date" input to Add Asset modal
- [ ] Add "In Service Date" input to Edit Asset modal
- [ ] Display "In Service Date" in Asset Details view
- [ ] Default to purchaseDate if not specified

#### 1.2 Update Service Contracts Page
- [ ] Add "Manage Requirements" button to each contract card
- [ ] Create "Contract Requirements" modal/page
- [ ] Show list of maintenance requirements for the contract
- [ ] Add "Add Requirement" functionality
- [ ] Edit/Delete requirement functionality

#### 1.3 Contract Requirements Interface
**View Requirements:**
- Display table of all requirements for a contract
- Show: Task Name, Interval, Required/Recommended, Compliance Status
- Filter by: Required vs Recommended, Compliant vs Non-compliant

**Add Requirement:**
- Select existing MaintenanceTask OR create new one
- Mark as Required or Recommended
- Add description of requirement
- Specify consequence if missed (e.g., "Warranty void")
- Set interval (days, miles, hours)

**Generate Schedule:**
- Button to "Generate Maintenance Schedule"
- Uses asset's inServiceDate as baseline
- Creates recurring tasks based on intervals
- Links tasks to contract requirements

### Phase 2: Schedule Generation Logic

#### 2.1 Schedule Generator Function
```typescript
generateMaintenanceSchedule(
  contractId: string,
  assetId: string,
  inServiceDate: Date
): MaintenanceTask[]
```

**Logic:**
1. Get all ContractRequirements for the contract
2. For each requirement:
   - Get the maintenance task template
   - Calculate first due date from inServiceDate + interval
   - Create MaintenanceTask instance
   - Link to asset and contract requirement
   - Set nextDueDate, isRequired, etc.

#### 2.2 Due Date Calculation
- **Time-based**: inServiceDate + intervalDays
- **Usage-based**: Track from current mileage/hours
- **Hybrid**: Whichever comes first

### Phase 3: Compliance Tracking

#### 3.1 Compliance Checker
- Check if maintenance was completed on time
- Update ContractRequirement.isCompliant
- Calculate ContractRequirement.daysUntilDue
- Flag ContractRequirement.isOverdue

#### 3.2 Warnings & Alerts
- Show non-compliant requirements on contract card
- Create reminders for upcoming required maintenance
- Highlight contracts at risk of voiding

---

## UI Mockups

### Contract Card - Enhanced
```
┌─────────────────────────────────────────────┐
│ HVAC Annual Maintenance Plan                │
│ 🔧 Maintenance Plan                         │
│                                              │
│ Provider: Local Air Pros                    │
│ ✅ Active  🔄 Auto-Renew                    │
│                                              │
│ 📋 Requirements: 4 tasks                    │
│    ✅ 3 Compliant  ⚠️ 1 Due Soon            │
│                                              │
│ [View Details] [Manage Requirements] [Edit] │
└─────────────────────────────────────────────┘
```

### Contract Requirements Modal
```
┌─────────────────────────────────────────────────────┐
│ Contract Requirements - HVAC Maintenance Plan       │
│ ─────────────────────────────────────────────────── │
│                                                      │
│ [+ Add Requirement]  [Generate Schedule]            │
│                                                      │
│ ┌──────────────────────────────────────────────┐   │
│ │ Task Name          │ Interval │ Status       │   │
│ ├──────────────────────────────────────────────┤   │
│ │ Spring Tune-up     │ 365 days │ ✅ Compliant │   │
│ │ Fall Inspection    │ 365 days │ ✅ Compliant │   │
│ │ Filter Change      │ 90 days  │ ⚠️ Due Soon  │   │
│ │ Coil Cleaning      │ 180 days │ ✅ Compliant │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ Linked Asset: HVAC System                           │
│ In Service Date: 2020-05-15                         │
│ Next Schedule Generation: 2025-01-01                │
│                                                      │
│ [Close]                                              │
└─────────────────────────────────────────────────────┘
```

### Add Requirement Modal
```
┌─────────────────────────────────────────────────────┐
│ Add Contract Requirement                            │
│ ─────────────────────────────────────────────────── │
│                                                      │
│ Maintenance Task:                                   │
│ ○ Select Existing Task                              │
│   [Dropdown: Spring Tune-up ▼]                      │
│                                                      │
│ ○ Create New Task                                   │
│   Task Name: [_________________]                    │
│   Description: [_________________]                  │
│   Interval Type: [Time-based ▼]                     │
│   Interval (days): [___]                            │
│                                                      │
│ Requirement Details:                                │
│ ☑ Required (uncheck for recommended)                │
│                                                      │
│ Description:                                         │
│ [Annual inspection required by contract]            │
│                                                      │
│ Consequence if Missed:                               │
│ [Contract may be voided]                            │
│                                                      │
│ [Cancel]  [Add Requirement]                         │
└─────────────────────────────────────────────────────┘
```

---

## API Functions Needed

### 1. Contract Requirements CRUD
```typescript
// Create requirement
createContractRequirement(
  contractId: string,
  maintenanceTaskId: string,
  details: RequirementDetails
)

// List requirements for contract
listContractRequirements(contractId: string)

// Update requirement
updateContractRequirement(requirementId: string, updates: Partial<Requirement>)

// Delete requirement
deleteContractRequirement(requirementId: string)
```

### 2. Schedule Generation
```typescript
// Generate maintenance schedule from contract
generateScheduleFromContract(
  contractId: string,
  assetId: string,
  startDate?: Date // defaults to inServiceDate
)

// Check compliance
checkContractCompliance(contractId: string)

// Get upcoming requirements
getUpcomingRequirements(contractId: string, daysAhead: number)
```

---

## Future Enhancements (AI Integration)

### Phase 4: AI Contract Reading
1. **Upload contract PDF/document**
2. **AI extracts maintenance requirements**
   - Task names
   - Intervals
   - Required vs recommended
   - Consequences
3. **User reviews and confirms**
4. **Auto-creates ContractRequirements**

### AI Prompt Example
```
Analyze this service contract and extract:
1. All maintenance tasks required
2. Frequency/interval for each task
3. Whether each task is required or recommended
4. Consequences of missing required maintenance
5. Any special conditions or notes

Format as JSON:
{
  "requirements": [
    {
      "taskName": "Spring Tune-up",
      "interval": "365 days",
      "isRequired": true,
      "consequence": "Contract may be voided"
    }
  ]
}
```

---

## Testing Scenarios

### Test Case 1: Basic Requirement
1. Create service contract
2. Add requirement: "Oil Change every 90 days"
3. Link to vehicle asset with inServiceDate
4. Generate schedule
5. Verify first task due date = inServiceDate + 90 days

### Test Case 2: Multiple Requirements
1. Contract with 4 requirements (different intervals)
2. Generate schedule
3. Verify all tasks created with correct due dates
4. Verify tasks are linked to contract requirements

### Test Case 3: Compliance Tracking
1. Complete a required maintenance task
2. Check compliance status
3. Verify requirement marked as compliant
4. Miss a required task deadline
5. Verify requirement marked as non-compliant

### Test Case 4: No In-Service Date
1. Asset without inServiceDate
2. Attempt to generate schedule
3. Should prompt user to set inServiceDate
4. Or default to purchaseDate

---

## Success Criteria

✅ Users can add "In Service Date" to assets
✅ Users can define maintenance requirements in contracts
✅ Users can specify intervals and required/recommended status
✅ System generates maintenance schedules automatically
✅ Schedules are based on in-service date + intervals
✅ Compliance status is tracked and displayed
✅ Non-compliant requirements are highlighted
✅ Users can view all requirements for a contract
✅ Users can edit/delete requirements

---

## Next Steps

**Immediate (This Session):**
1. ✅ Add inServiceDate to Asset model
2. Update Assets page to include inServiceDate field
3. Create Contract Requirements management UI
4. Implement basic requirement CRUD operations

**Short Term:**
1. Implement schedule generation logic
2. Add compliance tracking
3. Create warnings for non-compliance

**Long Term:**
1. AI contract reading integration
2. Predictive maintenance suggestions
3. Cost impact analysis of missed maintenance
