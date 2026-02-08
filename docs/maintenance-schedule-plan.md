# Maintenance Schedule View - Implementation Plan

## Overview
Create a comprehensive maintenance schedule view that shows all upcoming and overdue maintenance tasks, organized by asset with expandable/collapsible sections.

## User Requirements

### Primary View
- **Grouped by Asset** - Each asset has its own section
- **Expandable/Collapsible** - Click to show/hide maintenance tasks
- **Past Due Highlighted** - Required tasks that are overdue shown prominently
- **Upcoming Tasks** - Shows what's coming up in the next 30/60/90 days

### Key Features
1. **Priority Filtering**
   - Show only overdue
   - Show only required
   - Show all (including recommended)

2. **Time Filtering**
   - Overdue
   - Due this week
   - Due this month
   - Due in 3 months
   - All upcoming

3. **Visual Indicators**
   - 🔴 Overdue & Required
   - 🟡 Due Soon & Required
   - 🟢 Upcoming & Required
   - ⚪ Recommended tasks

4. **Task Information**
   - Task name
   - Due date
   - Days overdue/until due
   - Priority (high/medium/low)
   - Required vs Recommended
   - Linked contract (if applicable)
   - Estimated cost

---

## UI Design

### Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Maintenance Schedule                                         │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│ │ 🔴 3     │ │ 🟡 5     │ │ 🟢 12    │ │ ⚪ 8     │       │
│ │ Overdue  │ │ Due Soon │ │ Upcoming │ │ Optional │       │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│ Filters: [All Assets ▼] [All Priorities ▼] [Next 30 Days ▼]│
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ 🔴 OVERDUE REQUIRED MAINTENANCE (3)                      ││
│ │ ──────────────────────────────────────────────────────── ││
│ │                                                           ││
│ │ ▼ 2023 Tesla Model Y (2 overdue)                        ││
│ │   ┌─────────────────────────────────────────────────┐   ││
│ │   │ 🔴 Cabin Air Filter - 5 days overdue             │   ││
│ │   │ Due: Feb 2, 2026 | Priority: Low | Required      │   ││
│ │   │ Contract: N/A | Est. Cost: $120                  │   ││
│ │   │ [Mark Complete] [Reschedule] [View Details]      │   ││
│ │   └─────────────────────────────────────────────────┘   ││
│ │                                                           ││
│ │ ▼ HVAC System (1 overdue)                               ││
│ │   ┌─────────────────────────────────────────────────┐   ││
│ │   │ 🔴 Spring Tune-up - 10 days overdue              │   ││
│ │   │ Due: Jan 28, 2026 | Priority: High | Required    │   ││
│ │   │ Contract: HVAC Maintenance Plan | Est. Cost: $150│   ││
│ │   │ ⚠️ WARNING: Contract compliance at risk           │   ││
│ │   │ [Mark Complete] [Reschedule] [View Details]      │   ││
│ │   └─────────────────────────────────────────────────┘   ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ 🟡 DUE SOON (Next 30 Days) - 5 Tasks                     ││
│ │ ──────────────────────────────────────────────────────── ││
│ │                                                           ││
│ │ ▶ 2023 Tesla Model Y (1 task)                           ││
│ │                                                           ││
│ │ ▼ Samsung Smart Refrigerator (2 tasks)                  ││
│ │   ┌─────────────────────────────────────────────────┐   ││
│ │   │ 🟡 Replace Water Filter - Due in 14 days         │   ││
│ │   │ Due: Feb 21, 2026 | Priority: Medium | Required  │   ││
│ │   │ Contract: Appliance Protection Plan              │   ││
│ │   │ [Mark Complete] [Reschedule] [View Details]      │   ││
│ │   └─────────────────────────────────────────────────┘   ││
│ │   ┌─────────────────────────────────────────────────┐   ││
│ │   │ ⚪ Clean Coils - Due in 25 days                  │   ││
│ │   │ Due: Mar 3, 2026 | Priority: Low | Recommended   │   ││
│ │   │ [Mark Complete] [Reschedule] [View Details]      │   ││
│ │   └─────────────────────────────────────────────────┘   ││
│ └──────────────────────────────────────────────────────────┘│
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ 🟢 UPCOMING (31-90 Days) - 12 Tasks                      ││
│ │ ──────────────────────────────────────────────────────── ││
│ │                                                           ││
│ │ ▶ 2023 Tesla Model Y (4 tasks)                          ││
│ │ ▶ HVAC System (3 tasks)                                 ││
│ │ ▶ MacBook Pro M3 (2 tasks)                              ││
│ └──────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Component Structure

### MaintenanceSchedule.tsx
Main page component with:
- Stats cards (overdue, due soon, upcoming, optional)
- Filter controls
- Grouped task sections
- Expandable asset groups

### Components to Create

**1. ScheduleStats.tsx**
- Display count of tasks by status
- Click to filter by status

**2. ScheduleFilters.tsx**
- Asset filter dropdown
- Priority filter dropdown
- Time range filter dropdown
- Search by task name

**3. TaskSection.tsx**
- Collapsible section for each status group
- Shows count in header
- Expandable asset groups within

**4. AssetTaskGroup.tsx**
- Asset name with task count
- Expandable/collapsible
- Lists all tasks for that asset
- Shows asset health status

**5. TaskCard.tsx**
- Task details (name, due date, priority)
- Status badge (overdue/due soon/upcoming)
- Required vs recommended indicator
- Contract link (if applicable)
- Action buttons
- Warning messages for contract compliance

---

## Data Structure

### Query Logic

```typescript
// Get all maintenance tasks
const tasks = await client.models.MaintenanceTask.list({
  filter: {
    isActive: { eq: true }
  }
})

// Group by status
const overdue = tasks.filter(t => 
  t.nextDueDate && new Date(t.nextDueDate) < new Date() && t.isRequired
)

const dueSoon = tasks.filter(t => {
  if (!t.nextDueDate) return false
  const daysUntil = daysBetween(new Date(), new Date(t.nextDueDate))
  return daysUntil >= 0 && daysUntil <= 30
})

const upcoming = tasks.filter(t => {
  if (!t.nextDueDate) return false
  const daysUntil = daysBetween(new Date(), new Date(t.nextDueDate))
  return daysUntil > 30 && daysUntil <= 90
})

// Group by asset
const groupedByAsset = tasks.reduce((acc, task) => {
  const assetId = task.assetId
  if (!acc[assetId]) acc[assetId] = []
  acc[assetId].push(task)
  return acc
}, {})
```

### Task Status Calculation

```typescript
function getTaskStatus(task: MaintenanceTask) {
  if (!task.nextDueDate) return 'no-date'
  
  const today = new Date()
  const dueDate = new Date(task.nextDueDate)
  const daysUntil = daysBetween(today, dueDate)
  
  if (daysUntil < 0) {
    return task.isRequired ? 'overdue-required' : 'overdue-optional'
  } else if (daysUntil <= 7) {
    return 'due-this-week'
  } else if (daysUntil <= 30) {
    return 'due-this-month'
  } else if (daysUntil <= 90) {
    return 'upcoming'
  } else {
    return 'future'
  }
}
```

---

## Features

### 1. Expandable/Collapsible Groups

**Section Level:**
- Click "OVERDUE REQUIRED MAINTENANCE" to expand/collapse all overdue tasks
- Click "DUE SOON" to expand/collapse all due soon tasks

**Asset Level:**
- Click asset name to expand/collapse tasks for that asset
- Shows task count in header: "2023 Tesla Model Y (2 tasks)"

### 2. Status Badges

```typescript
const statusBadges = {
  'overdue-required': { icon: '🔴', color: 'red', text: 'OVERDUE' },
  'overdue-optional': { icon: '🟠', color: 'orange', text: 'Overdue' },
  'due-this-week': { icon: '🟡', color: 'yellow', text: 'Due This Week' },
  'due-this-month': { icon: '🟡', color: 'yellow', text: 'Due Soon' },
  'upcoming': { icon: '🟢', color: 'green', text: 'Upcoming' },
  'recommended': { icon: '⚪', color: 'gray', text: 'Recommended' }
}
```

### 3. Contract Compliance Warnings

If a task is:
- Linked to a ContractRequirement
- Required by contract
- Overdue

Show warning:
```
⚠️ WARNING: Contract compliance at risk
Missing this maintenance may void your contract
```

### 4. Quick Actions

**Mark Complete:**
- Opens modal to record service
- Creates ServiceRecord
- Updates nextDueDate based on interval
- Updates ContractRequirement compliance status

**Reschedule:**
- Opens modal to change due date
- Updates nextDueDate
- Adds note explaining why rescheduled

**View Details:**
- Shows full task information
- Displays service history
- Shows contract requirements
- Links to asset page

---

## Sorting & Filtering

### Default Sort Order
1. Overdue required (by days overdue, descending)
2. Due soon required (by due date, ascending)
3. Upcoming required (by due date, ascending)
4. Recommended tasks (by due date, ascending)

### Filter Options

**By Asset:**
- All Assets
- Individual asset selection
- Asset category (Vehicle, Appliance, etc.)

**By Priority:**
- All Priorities
- High only
- Medium and High
- Required only

**By Time Range:**
- Overdue only
- Next 7 days
- Next 30 days
- Next 90 days
- All upcoming

**By Contract:**
- All tasks
- Contract-required only
- Non-contract tasks only
- Specific contract

---

## Mobile Responsiveness

### Desktop (>768px)
- 4 stat cards in a row
- Full task cards with all details
- Side-by-side action buttons

### Tablet (768px)
- 2 stat cards per row
- Condensed task cards
- Stacked action buttons

### Mobile (<768px)
- 1 stat card per row (scrollable)
- Minimal task cards
- Single action button (opens menu)
- Swipe to expand/collapse

---

## Integration Points

### Links to Other Pages

**From Task Card:**
- Asset name → Asset detail page
- Contract name → Contract detail page
- "View Details" → Task detail modal

**From Stats:**
- Click stat card → Filter by that status
- Example: Click "3 Overdue" → Show only overdue tasks

### Navigation

Add to sidebar:
```
📅 Maintenance Schedule
```

Or integrate into Dashboard as a widget:
```
Upcoming Maintenance (Next 30 Days)
[View Full Schedule →]
```

---

## Implementation Steps

### Phase 1: Basic View
1. Create MaintenanceSchedule.tsx page
2. Fetch all maintenance tasks
3. Group by status (overdue, due soon, upcoming)
4. Display in collapsible sections
5. Add to navigation

### Phase 2: Asset Grouping
1. Group tasks by asset within each section
2. Make asset groups expandable/collapsible
3. Show task count per asset
4. Display asset health status

### Phase 3: Filtering
1. Add filter controls
2. Implement asset filter
3. Implement priority filter
4. Implement time range filter
5. Add search functionality

### Phase 4: Actions
1. Implement "Mark Complete" modal
2. Implement "Reschedule" modal
3. Create ServiceRecord on completion
4. Update task due dates
5. Update contract compliance

### Phase 5: Contract Integration
1. Show contract name on tasks
2. Display compliance warnings
3. Link to contract requirements
4. Update ContractRequirement status

---

## Success Criteria

✅ Users can see all upcoming maintenance in one view
✅ Overdue required tasks are prominently displayed
✅ Tasks are grouped by asset (expandable/collapsible)
✅ Status is clearly indicated with colors and badges
✅ Users can filter by asset, priority, and time range
✅ Users can mark tasks complete from the schedule
✅ Contract-required tasks show compliance status
✅ Mobile-friendly responsive design
✅ Quick access from navigation or dashboard

---

## Future Enhancements

1. **Calendar View** - Show tasks on a calendar
2. **Print Schedule** - Generate PDF of upcoming maintenance
3. **Email Reminders** - Send notifications for due tasks
4. **Bulk Actions** - Mark multiple tasks complete
5. **Cost Projections** - Show estimated costs for upcoming maintenance
6. **Maintenance History** - Show completed tasks in timeline
7. **Recurring Task Templates** - Quick add common maintenance
8. **Smart Scheduling** - Suggest optimal dates based on usage
