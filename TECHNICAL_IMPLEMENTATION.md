# Technical Implementation Guide - Product Differentiators

## 🎯 Overview

This document outlines the technical implementation of ServiceTag's four key differentiators:
1. "Set it once, forget it" auto-scheduling
2. Privacy-first, no data selling
3. Designed for normal people
4. Offline-first architecture

---

## 1. ⚡ "Set It Once, Forget It" Auto-Scheduling

### Architecture

#### Automatic Interval Calculation

**When Service is Logged:**
```typescript
/**
 * Auto-calculates next due date/mileage/hours when service is logged
 */
async function logService(serviceData: ServiceRecordInput) {
  // 1. Create service record
  const service = await client.models.ServiceRecord.create(serviceData)
  
  // 2. Get associated maintenance task
  const task = await client.models.MaintenanceTask.get({
    id: serviceData.maintenanceTaskId
  })
  
  // 3. Calculate next due based on interval type
  const nextDue = calculateNextDue(task, serviceData)
  
  // 4. Update maintenance task
  await client.models.MaintenanceTask.update({
    id: task.id,
    lastCompletedDate: serviceData.serviceDate,
    lastCompletedMileage: serviceData.mileageAtService,
    lastCompletedHours: serviceData.hoursAtService,
    nextDueDate: nextDue.date,
    nextDueMileage: nextDue.mileage,
    nextDueHours: nextDue.hours
  })
  
  // 5. Create new reminder
  await createReminder(task, nextDue)
  
  // 6. Dismiss old reminder
  await dismissOldReminder(task.id)
}

/**
 * Calculates next due date/mileage/hours based on interval type
 */
function calculateNextDue(
  task: MaintenanceTask,
  service: ServiceRecord
): NextDue {
  switch (task.intervalType) {
    case 'time':
      return {
        date: addDays(service.serviceDate, task.intervalDays),
        mileage: null,
        hours: null
      }
    
    case 'usage':
      return {
        date: null,
        mileage: service.mileageAtService + task.intervalMiles,
        hours: service.hoursAtService + task.intervalHours
      }
    
    case 'date':
      return calculateDateSpecific(task, service.serviceDate)
    
    case 'hybrid':
      return calculateHybrid(task, service)
  }
}

/**
 * Hybrid interval: whichever comes first
 */
function calculateHybrid(
  task: MaintenanceTask,
  service: ServiceRecord
): NextDue {
  const timeBasedDate = addDays(service.serviceDate, task.intervalDays)
  const usageBasedMileage = service.mileageAtService + task.intervalMiles
  const usageBasedHours = service.hoursAtService + task.intervalHours
  
  return {
    date: timeBasedDate,
    mileage: usageBasedMileage,
    hours: usageBasedHours
  }
}
```

#### Smart Reminder Creation

**Automatic Reminder Scheduling:**
```typescript
/**
 * Creates reminders with configurable lead times
 */
async function createReminder(
  task: MaintenanceTask,
  nextDue: NextDue
) {
  const userProfile = await getUserProfile()
  const leadTimeDays = userProfile.defaultLeadTimeDays || 14
  
  // Create advance reminder (2 weeks before)
  await client.models.Reminder.create({
    assetId: task.assetId,
    maintenanceTaskId: task.id,
    title: `${task.taskName} due soon`,
    message: `Your ${task.taskName} is due in ${leadTimeDays} days`,
    dueDate: nextDue.date,
    dueMileage: nextDue.mileage,
    dueHours: nextDue.hours,
    leadTimeDays: leadTimeDays,
    status: 'pending',
    sendEmail: userProfile.emailNotifications,
    sendPush: userProfile.pushNotifications,
    sendCalendar: userProfile.calendarSync
  })
}
```

#### Background Jobs

**Reminder Processor (runs daily):**
```typescript
/**
 * Processes pending reminders and sends notifications
 * Runs via AWS EventBridge (cron: daily at 8 AM)
 */
export async function processReminders() {
  const now = new Date()
  
  // Get all pending reminders
  const reminders = await client.models.Reminder.list({
    filter: { status: { eq: 'pending' } }
  })
  
  for (const reminder of reminders.data) {
    // Check if reminder should be sent
    if (shouldSendReminder(reminder, now)) {
      await sendReminderNotifications(reminder)
      
      // Update reminder status
      await client.models.Reminder.update({
        id: reminder.id,
        status: 'sent',
        lastSentAt: now,
        sentCount: (reminder.sentCount || 0) + 1
      })
    }
    
    // Check if overdue
    if (isOverdue(reminder, now)) {
      await client.models.Reminder.update({
        id: reminder.id,
        isOverdue: true,
        overdueBy: calculateDaysOverdue(reminder, now)
      })
      
      // Send overdue notification (daily)
      await sendOverdueNotification(reminder)
    }
  }
}

function shouldSendReminder(reminder: Reminder, now: Date): boolean {
  const leadTime = reminder.leadTimeDays || 14
  const dueDate = new Date(reminder.dueDate)
  const reminderDate = subDays(dueDate, leadTime)
  
  return now >= reminderDate && reminder.status === 'pending'
}
```

#### Template Application

**One-Click Template Setup:**
```typescript
/**
 * Applies a template to an asset, creating all maintenance tasks
 */
async function applyTemplate(
  assetId: string,
  templateId: string
) {
  // Get template
  const template = await client.models.TaskTemplate.get({ id: templateId })
  
  // Create all tasks from template
  const tasks = template.tasks as TaskDefinition[]
  
  for (const taskDef of tasks) {
    await client.models.MaintenanceTask.create({
      assetId: assetId,
      taskName: taskDef.taskName,
      description: taskDef.description,
      category: taskDef.category,
      intervalType: taskDef.intervalType,
      intervalDays: taskDef.intervalDays,
      intervalMiles: taskDef.intervalMiles,
      intervalHours: taskDef.intervalHours,
      specificMonth: taskDef.specificMonth,
      specificDay: taskDef.specificDay,
      priority: taskDef.priority,
      estimatedCost: taskDef.estimatedCost,
      estimatedDuration: taskDef.estimatedDuration,
      isManufacturerRecommended: taskDef.isManufacturerRecommended,
      isFromTemplate: true,
      templateId: templateId,
      isActive: true
    })
  }
  
  // Update template usage stats
  await client.models.TaskTemplate.update({
    id: templateId,
    timesUsed: (template.timesUsed || 0) + 1,
    lastUsed: new Date()
  })
}
```

---

## 2. 🔒 Privacy-First, No Data Selling

### Architecture

#### Data Ownership

**User-Owned AWS Resources:**
```typescript
/**
 * Each user's data is stored in their own AWS account
 * We never have access to user data
 */

// amplify/backend.ts
import { defineBackend } from '@aws-amplify/backend'
import { auth } from './auth/resource'
import { data } from './data/resource'

export const backend = defineBackend({
  auth,
  data,
})

// User's data is stored in:
// - DynamoDB tables (in user's AWS account)
// - S3 buckets (in user's AWS account)
// - Cognito user pool (in user's AWS account)

// We provide the infrastructure code
// User deploys to THEIR AWS account
// We never see their data
```

#### End-to-End Encryption

**Data Encryption:**
```typescript
/**
 * All data encrypted at rest and in transit
 */

// DynamoDB encryption (automatic)
// - AWS-managed keys (default)
// - Customer-managed keys (optional)

// S3 encryption for documents/photos
const s3Config = {
  bucket: 'user-servicetag-documents',
  region: 'us-east-1',
  encryption: 'AES256', // Server-side encryption
  acl: 'private' // Private by default
}

// HTTPS/TLS for all API calls (automatic via AppSync)
```

#### Zero Third-Party Analytics

**No Tracking:**
```typescript
/**
 * NO third-party analytics or tracking
 */

// ❌ NO Google Analytics
// ❌ NO Facebook Pixel
// ❌ NO Mixpanel
// ❌ NO Segment
// ❌ NO Hotjar
// ❌ NO Any tracking scripts

// ✅ Only AWS CloudWatch for infrastructure monitoring
// ✅ Only error logging (no PII)
// ✅ Only aggregate usage stats (opt-in)
```

#### Data Export

**Complete Data Portability:**
```typescript
/**
 * Export all user data in standard formats
 */
async function exportUserData(format: 'json' | 'csv' | 'pdf') {
  // Get all user data
  const assets = await client.models.Asset.list()
  const tasks = await client.models.MaintenanceTask.list()
  const services = await client.models.ServiceRecord.list()
  const documents = await client.models.Document.list()
  
  switch (format) {
    case 'json':
      return exportAsJSON({
        assets: assets.data,
        maintenanceTasks: tasks.data,
        serviceRecords: services.data,
        documents: documents.data
      })
    
    case 'csv':
      return exportAsCSV({
        assets: assets.data,
        services: services.data
      })
    
    case 'pdf':
      return generatePDFReport({
        assets: assets.data,
        services: services.data
      })
  }
}

/**
 * Account deletion with complete data removal
 */
async function deleteAccount(userId: string) {
  // 1. Delete all user data
  await deleteAllUserRecords(userId)
  
  // 2. Delete S3 objects
  await deleteS3Objects(userId)
  
  // 3. Delete Cognito user
  await deleteCognitoUser(userId)
  
  // 4. Confirm deletion
  return { deleted: true, timestamp: new Date() }
}
```

---

## 3. 👥 Designed for Normal People

### Architecture

#### Simplified API Layer

**User-Friendly Abstractions:**
```typescript
/**
 * High-level API that hides complexity
 */

// ❌ Complex (fleet management style)
await client.models.Asset.create({
  assetIdentificationNumber: 'VIN123',
  assetClassificationCode: 'VEH-001',
  depreciationScheduleId: 'DEP-123',
  maintenanceProtocolId: 'PROT-456'
})

// ✅ Simple (normal people style)
await addAsset({
  name: '2020 Honda Civic',
  category: 'Vehicle',
  manufacturer: 'Honda',
  model: 'Civic'
})

/**
 * Helper functions for common tasks
 */
export const ServiceTagAPI = {
  // Add asset with template
  async addAssetWithTemplate(
    assetData: SimpleAssetInput,
    templateName: string
  ) {
    const asset = await client.models.Asset.create(assetData)
    const template = await findTemplateByName(templateName)
    await applyTemplate(asset.id, template.id)
    return asset
  },
  
  // Quick service log
  async logService(
    assetId: string,
    serviceName: string,
    cost: number,
    notes?: string
  ) {
    const service = await client.models.ServiceRecord.create({
      assetId,
      serviceName,
      serviceDate: new Date(),
      performedBy: 'self',
      totalCost: cost,
      notes
    })
    
    // Auto-update intervals
    await updateMaintenanceIntervals(assetId, service)
    
    return service
  },
  
  // Get "what needs attention"
  async getAttentionNeeded() {
    const assets = await client.models.Asset.list()
    return assets.data.filter(asset => 
      asset.healthStatus === 'attention' || 
      asset.healthStatus === 'critical'
    )
  }
}
```

#### Guided Onboarding

**Step-by-Step Setup:**
```typescript
/**
 * Onboarding flow for new users
 */
export const OnboardingFlow = {
  steps: [
    {
      id: 'welcome',
      title: 'Welcome to ServiceTag!',
      description: 'Track maintenance for all your stuff',
      action: 'Get Started'
    },
    {
      id: 'add-first-asset',
      title: 'What do you want to track?',
      options: ['Car', 'Home', 'Equipment', 'Other'],
      action: 'Next'
    },
    {
      id: 'asset-details',
      title: 'Tell us about it',
      fields: ['name', 'manufacturer', 'model'],
      optional: ['serialNumber', 'purchaseDate'],
      action: 'Next'
    },
    {
      id: 'choose-template',
      title: 'Pick a maintenance schedule',
      options: [
        { name: 'Basic', description: 'Essential maintenance only' },
        { name: 'Detailed', description: 'Comprehensive schedule' },
        { name: 'Custom', description: 'Create your own' }
      ],
      action: 'Finish'
    },
    {
      id: 'complete',
      title: 'All set!',
      description: "We'll remind you when maintenance is due",
      action: 'Go to Dashboard'
    }
  ]
}
```

#### Smart Defaults

**Pre-configured Settings:**
```typescript
/**
 * Sensible defaults for normal users
 */
export const DEFAULT_SETTINGS = {
  reminders: {
    leadTimeDays: 14, // 2 weeks before
    frequency: 'weekly',
    quietHours: { start: 22, end: 8 } // 10 PM - 8 AM
  },
  
  notifications: {
    email: true,
    push: true,
    calendar: false // Opt-in
  },
  
  display: {
    units: 'imperial', // miles, not km (US default)
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY'
  },
  
  templates: [
    'Car - Basic Maintenance',
    'Home - Annual Safety',
    'Equipment - Power Tools'
  ]
}
```

---

## 4. 📱 Offline-First Architecture

### Architecture

#### Local-First Data Storage

**IndexedDB for Browser:**
```typescript
/**
 * Local database using IndexedDB
 */
import Dexie, { Table } from 'dexie'

class ServiceTagDB extends Dexie {
  assets!: Table<Asset>
  maintenanceTasks!: Table<MaintenanceTask>
  serviceRecords!: Table<ServiceRecord>
  documents!: Table<Document>
  reminders!: Table<Reminder>
  
  constructor() {
    super('ServiceTagDB')
    
    this.version(1).stores({
      assets: '++id, name, category, status, owner',
      maintenanceTasks: '++id, assetId, taskName, nextDueDate, owner',
      serviceRecords: '++id, assetId, serviceDate, owner',
      documents: '++id, assetId, documentType, owner',
      reminders: '++id, assetId, dueDate, status, owner'
    })
  }
}

export const db = new ServiceTagDB()
```

**Offline Operations:**
```typescript
/**
 * All operations work offline-first
 */
export class OfflineFirstAPI {
  // Create asset (works offline)
  async createAsset(data: AssetInput) {
    // 1. Save to local DB immediately
    const localAsset = await db.assets.add({
      ...data,
      id: generateLocalId(),
      syncStatus: 'pending',
      createdAt: new Date()
    })
    
    // 2. Queue for sync
    await syncQueue.add({
      type: 'CREATE',
      model: 'Asset',
      data: localAsset
    })
    
    // 3. Sync when online (background)
    if (navigator.onLine) {
      this.syncInBackground()
    }
    
    return localAsset
  }
  
  // Read assets (always from local DB)
  async listAssets() {
    return await db.assets.toArray()
  }
  
  // Update asset (works offline)
  async updateAsset(id: string, data: Partial<Asset>) {
    // 1. Update local DB
    await db.assets.update(id, {
      ...data,
      syncStatus: 'pending',
      updatedAt: new Date()
    })
    
    // 2. Queue for sync
    await syncQueue.add({
      type: 'UPDATE',
      model: 'Asset',
      id,
      data
    })
    
    return await db.assets.get(id)
  }
}
```

#### Sync Strategy

**Background Sync:**
```typescript
/**
 * Syncs local changes to cloud when online
 */
export class SyncManager {
  private syncInProgress = false
  
  async sync() {
    if (this.syncInProgress || !navigator.onLine) {
      return
    }
    
    this.syncInProgress = true
    
    try {
      // 1. Get pending changes
      const pendingChanges = await syncQueue.getAll()
      
      // 2. Sync each change
      for (const change of pendingChanges) {
        await this.syncChange(change)
      }
      
      // 3. Pull remote changes
      await this.pullRemoteChanges()
      
      // 4. Clear sync queue
      await syncQueue.clear()
      
    } catch (error) {
      console.error('Sync failed:', error)
      // Retry later
      setTimeout(() => this.sync(), 60000) // 1 minute
    } finally {
      this.syncInProgress = false
    }
  }
  
  private async syncChange(change: SyncQueueItem) {
    switch (change.type) {
      case 'CREATE':
        await client.models[change.model].create(change.data)
        break
      case 'UPDATE':
        await client.models[change.model].update({
          id: change.id,
          ...change.data
        })
        break
      case 'DELETE':
        await client.models[change.model].delete({ id: change.id })
        break
    }
  }
  
  // Listen for online/offline events
  setupEventListeners() {
    window.addEventListener('online', () => {
      console.log('Back online, syncing...')
      this.sync()
    })
    
    window.addEventListener('offline', () => {
      console.log('Offline mode - changes will sync when online')
    })
  }
}
```

#### Service Worker for Offline Support

**PWA Configuration:**
```typescript
/**
 * Service worker for offline caching
 */
// service-worker.ts
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'

// Precache app shell
precacheAndRoute(self.__WB_MANIFEST)

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3
  })
)

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      {
        cacheWillUpdate: async ({ response }) => {
          return response.status === 200 ? response : null
        }
      }
    ]
  })
)

// Background sync for pending changes
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncPendingChanges())
  }
})
```

#### Data Export (Offline)

**Export Without Internet:**
```typescript
/**
 * Export data from local DB (no internet required)
 */
export async function exportDataOffline(format: 'json' | 'csv') {
  // Get all data from local DB
  const assets = await db.assets.toArray()
  const tasks = await db.maintenanceTasks.toArray()
  const services = await db.serviceRecords.toArray()
  
  if (format === 'json') {
    const data = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      assets,
      maintenanceTasks: tasks,
      serviceRecords: services
    }
    
    // Create downloadable file
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    
    downloadFile(blob, 'servicetag-export.json')
  }
  
  if (format === 'csv') {
    // Convert to CSV
    const csv = convertToCSV(services)
    const blob = new Blob([csv], { type: 'text/csv' })
    downloadFile(blob, 'servicetag-export.csv')
  }
}
```

---

## 🎯 Implementation Roadmap

### Phase 1: MVP (Weeks 1-4)
- ✅ Basic CRUD operations
- ✅ Template system
- ✅ Auto-interval calculation
- ✅ Local storage (IndexedDB)
- ✅ Basic reminders

### Phase 2: Enhanced Features (Weeks 5-8)
- ✅ Cloud sync
- ✅ Background jobs
- ✅ Push notifications
- ✅ Document storage
- ✅ Cost tracking

### Phase 3: Polish (Weeks 9-12)
- ✅ Offline-first refinement
- ✅ Data export
- ✅ Health monitoring
- ✅ Analytics dashboard
- ✅ Mobile app (React Native)

### Phase 4: Scale (Weeks 13+)
- ✅ Performance optimization
- ✅ Advanced sync strategies
- ✅ Family sharing
- ✅ API for integrations
- ✅ Self-hosted option

---

**All four differentiators are technically feasible and can be implemented with the current architecture!** 🚀
