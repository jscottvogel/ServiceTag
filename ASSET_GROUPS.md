# Asset Groups - Hierarchical & Categorical Organization

## 🎯 Overview

**Asset Groups** allow you to organize assets in flexible ways:
- **Hierarchical** - Home → Kitchen → Appliances
- **Categorical** - Gas Appliances = {Stove, Water Heater, Furnace}
- **Both!** - Assets can belong to multiple groups

---

## 📁 Use Cases

### 1. **Location-Based Hierarchy**

```
Home
├─ Kitchen
│  ├─ Refrigerator
│  ├─ Dishwasher
│  ├─ Stove
│  └─ Microwave
│
├─ Garage
│  ├─ 2020 Honda Civic
│  ├─ Lawn Mower
│  ├─ Snow Blower
│  └─ Power Tools
│     ├─ Drill
│     ├─ Saw
│     └─ Sander
│
└─ Basement
   ├─ Furnace
   ├─ Water Heater
   └─ Washer/Dryer
```

### 2. **Category-Based Grouping**

```
Gas Appliances
├─ Stove (also in Kitchen)
├─ Water Heater (also in Basement)
├─ Furnace (also in Basement)
└─ Gas Dryer (also in Basement)

Power Tools
├─ Drill (also in Garage)
├─ Saw (also in Garage)
├─ Sander (also in Garage)
└─ Nail Gun (also in Workshop)
```

### 3. **System-Based Grouping**

```
HVAC System
├─ Furnace
├─ Air Conditioner
├─ Thermostat
└─ Ductwork

Plumbing System
├─ Water Heater
├─ Sump Pump
├─ Water Softener
└─ Well Pump
```

### 4. **Multi-Group Membership**

**Example: Gas Stove**
```
Gas Stove belongs to:
1. Home → Kitchen (location hierarchy)
2. Gas Appliances (category)
3. Kitchen Appliances (category)

Primary Group: Kitchen
Secondary Groups: Gas Appliances, Kitchen Appliances
```

---

## 🗂️ Data Model

### AssetGroup

```typescript
{
  // Group Information
  name: string                    // "Kitchen", "Gas Appliances", "HVAC System"
  description: string             // "All kitchen appliances and fixtures"
  groupType: enum                 // location, category, system, custom
  
  // Visual
  icon: string                    // "🍳", "🔥", "❄️"
  color: string                   // "#FF5733"
  imageUrl: string                // Group photo
  
  // Hierarchy Support
  parentGroupId: string           // Parent group (null for root)
  parentGroup: AssetGroup         // Reference to parent
  childGroups: AssetGroup[]       // Child groups
  
  // Hierarchy Metadata
  level: number                   // 0 = root, 1 = first level, 2 = second level
  path: string                    // "Home/Kitchen/Appliances"
  isRootGroup: boolean            // true for top-level groups
  
  // Group Statistics (calculated)
  assetCount: number              // 12 assets in this group
  totalValue: number              // $15,000 total value
  totalMaintenanceCost: number    // $2,500 lifetime maintenance
  
  // Health Rollup
  healthyAssetCount: number       // 8 healthy assets
  attentionAssetCount: number     // 3 need attention
  criticalAssetCount: number      // 1 critical
  
  // Display Order
  sortOrder: number               // For custom ordering
  
  // Relationships
  assets: AssetGroupMembership[]  // Assets in this group
}
```

### AssetGroupMembership (Junction)

```typescript
{
  assetId: string
  asset: Asset
  
  groupId: string
  group: AssetGroup
  
  // Membership Details
  isPrimary: boolean              // Primary group for this asset
  addedAt: Date                   // When added to group
  notes: string                   // "Moved from garage to kitchen"
}
```

---

## 💡 Examples

### Example 1: Location Hierarchy

```typescript
// Create root group
const home = await client.models.AssetGroup.create({
  name: "Home",
  groupType: "location",
  icon: "🏠",
  level: 0,
  path: "Home",
  isRootGroup: true,
  sortOrder: 1
})

// Create child group
const kitchen = await client.models.AssetGroup.create({
  name: "Kitchen",
  groupType: "location",
  icon: "🍳",
  parentGroupId: home.id,
  level: 1,
  path: "Home/Kitchen",
  isRootGroup: false,
  sortOrder: 1
})

// Create grandchild group
const appliances = await client.models.AssetGroup.create({
  name: "Appliances",
  groupType: "location",
  icon: "🔌",
  parentGroupId: kitchen.id,
  level: 2,
  path: "Home/Kitchen/Appliances",
  isRootGroup: false,
  sortOrder: 1
})

// Add asset to group
await client.models.AssetGroupMembership.create({
  assetId: refrigerator.id,
  groupId: appliances.id,
  isPrimary: true,
  addedAt: new Date()
})
```

### Example 2: Category Group

```typescript
// Create category group (no parent)
const gasAppliances = await client.models.AssetGroup.create({
  name: "Gas Appliances",
  description: "All appliances that use natural gas",
  groupType: "category",
  icon: "🔥",
  color: "#FF6B35",
  level: 0,
  isRootGroup: true,
  sortOrder: 1
})

// Add multiple assets
await client.models.AssetGroupMembership.create({
  assetId: stove.id,
  groupId: gasAppliances.id,
  isPrimary: false  // Stove's primary group is "Kitchen"
})

await client.models.AssetGroupMembership.create({
  assetId: waterHeater.id,
  groupId: gasAppliances.id,
  isPrimary: false  // Water heater's primary group is "Basement"
})

await client.models.AssetGroupMembership.create({
  assetId: furnace.id,
  groupId: gasAppliances.id,
  isPrimary: false  // Furnace's primary group is "HVAC System"
})
```

### Example 3: Multi-Group Asset

```typescript
// Gas Stove belongs to multiple groups
const stove = await client.models.Asset.create({
  name: "Gas Stove",
  category: "Appliance",
  manufacturer: "GE",
  model: "JGB735SPSS"
})

// Primary group: Kitchen (location)
await client.models.AssetGroupMembership.create({
  assetId: stove.id,
  groupId: kitchen.id,
  isPrimary: true
})

// Secondary group: Gas Appliances (category)
await client.models.AssetGroupMembership.create({
  assetId: stove.id,
  groupId: gasAppliances.id,
  isPrimary: false
})

// Secondary group: Kitchen Appliances (category)
await client.models.AssetGroupMembership.create({
  assetId: stove.id,
  groupId: kitchenAppliances.id,
  isPrimary: false
})
```

---

## 📊 Dashboard Views

### Group List View

```
MY ASSET GROUPS

📍 LOCATIONS
├─ 🏠 Home (45 assets)
│  ├─ 🍳 Kitchen (12 assets) - 1 needs attention
│  ├─ 🚗 Garage (8 assets) - All healthy
│  ├─ 🏠 Basement (6 assets) - 2 need attention
│  └─ 🛏️  Bedrooms (4 assets) - All healthy
│
├─ 🏢 Office (3 assets) - All healthy
└─ 🏡 Rental Property (15 assets) - 3 need attention

🏷️ CATEGORIES
├─ 🔥 Gas Appliances (5 assets) - 1 needs attention
├─ 🔌 Power Tools (12 assets) - All healthy
├─ 🚗 Vehicles (3 assets) - 1 needs attention
└─ 🌿 Lawn Equipment (6 assets) - All healthy

⚙️ SYSTEMS
├─ ❄️  HVAC System (4 assets) - 1 needs attention
├─ 💧 Plumbing System (5 assets) - All healthy
└─ ⚡ Electrical System (3 assets) - All healthy
```

### Group Detail View

```
🔥 Gas Appliances

Description: All appliances that use natural gas
Type: Category
Assets: 5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ASSETS IN THIS GROUP

1. Gas Stove (GE JGB735SPSS)
   Location: Home → Kitchen
   Status: 🟢 Healthy
   Last Service: 2 months ago
   Next Due: Oil change (in 4 months)

2. Water Heater (Rheem 50 Gal)
   Location: Home → Basement
   Status: 🟡 Attention needed
   Last Service: 8 months ago
   Next Due: Annual inspection (overdue 5 days)

3. Furnace (Carrier 58MVC)
   Location: Home → Basement
   Status: 🟢 Healthy
   Last Service: 1 month ago
   Next Due: Filter change (in 2 months)

4. Gas Dryer (Whirlpool WGD5000DW)
   Location: Home → Basement
   Status: 🟢 Healthy
   Last Service: 3 months ago
   Next Due: Vent cleaning (in 9 months)

5. Gas Fireplace (Napoleon GD82)
   Location: Home → Living Room
   Status: 🟢 Healthy
   Last Service: 6 months ago
   Next Due: Annual inspection (in 6 months)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GROUP STATISTICS

Total Value: $8,500
Total Maintenance Cost: $1,200
Average Age: 4.2 years

Health Summary:
├─ 🟢 Healthy: 4 assets (80%)
├─ 🟡 Attention: 1 asset (20%)
└─ 🔴 Critical: 0 assets (0%)

Upcoming Maintenance:
├─ This week: 0 tasks
├─ This month: 1 task
└─ Next 3 months: 3 tasks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GROUP ACTIONS

[+] Add Asset to Group
[📊] View Group Analytics
[🔧] Schedule Group Maintenance
[📄] Export Group Report
```

### Hierarchical Tree View

```
🏠 Home (45 assets)
│
├─ 🍳 Kitchen (12 assets)
│  ├─ 🔌 Appliances (8 assets)
│  │  ├─ Refrigerator
│  │  ├─ Dishwasher
│  │  ├─ Stove
│  │  ├─ Microwave
│  │  ├─ Coffee Maker
│  │  ├─ Toaster
│  │  ├─ Blender
│  │  └─ Food Processor
│  │
│  └─ 💡 Fixtures (4 assets)
│     ├─ Sink
│     ├─ Faucet
│     ├─ Garbage Disposal
│     └─ Range Hood
│
├─ 🚗 Garage (8 assets)
│  ├─ 🚙 Vehicles (2 assets)
│  │  ├─ 2020 Honda Civic
│  │  └─ 2018 Toyota Tacoma
│  │
│  └─ 🔧 Tools (6 assets)
│     ├─ Lawn Mower
│     ├─ Snow Blower
│     ├─ Drill
│     ├─ Saw
│     ├─ Sander
│     └─ Air Compressor
│
└─ 🏠 Basement (6 assets)
   ├─ ❄️  HVAC (2 assets)
   │  ├─ Furnace
   │  └─ Air Conditioner
   │
   └─ 💧 Plumbing (4 assets)
      ├─ Water Heater
      ├─ Sump Pump
      ├─ Water Softener
      └─ Washer/Dryer
```

---

## 🎯 Key Features

### 1. **Flexible Organization**
- ✅ Hierarchical (nested groups)
- ✅ Categorical (flat groups)
- ✅ Multi-group membership
- ✅ Primary + secondary groups

### 2. **Group Types**
- 📍 **Location** - Home, Garage, Office
- 🏷️ **Category** - Gas Appliances, Power Tools
- ⚙️ **System** - HVAC, Plumbing, Electrical
- ✨ **Custom** - User-defined

### 3. **Automatic Statistics**
- Asset count
- Total value
- Total maintenance cost
- Health rollup (healthy/attention/critical)

### 4. **Visual Organization**
- Icons (🏠, 🔥, ⚙️)
- Colors (#FF5733)
- Images
- Custom sorting

### 5. **Smart Features**
- Path tracking ("Home/Kitchen/Appliances")
- Level tracking (0, 1, 2, ...)
- Root group identification
- Parent/child relationships

---

## 💡 Use Case Examples

### Use Case 1: Homeowner

```
Groups:
├─ Home
│  ├─ Kitchen
│  ├─ Garage
│  ├─ Basement
│  └─ Bedrooms
│
├─ Gas Appliances (cross-cutting)
├─ HVAC System (cross-cutting)
└─ Plumbing System (cross-cutting)

Benefits:
- View all kitchen appliances
- View all gas appliances (for gas safety inspection)
- View HVAC system components together
- Track maintenance by location or system
```

### Use Case 2: Landlord with Multiple Properties

```
Groups:
├─ Property 1 (123 Main St)
│  ├─ Kitchen
│  ├─ Bathrooms
│  └─ HVAC
│
├─ Property 2 (456 Oak Ave)
│  ├─ Kitchen
│  ├─ Bathrooms
│  └─ HVAC
│
└─ Property 3 (789 Elm Rd)
   ├─ Kitchen
   ├─ Bathrooms
   └─ HVAC

Benefits:
- Track maintenance per property
- Compare costs across properties
- Schedule property-specific inspections
```

### Use Case 3: DIY Enthusiast

```
Groups:
├─ Workshop
│  ├─ Power Tools
│  ├─ Hand Tools
│  └─ Workbenches
│
├─ Garage
│  ├─ Vehicles
│  ├─ Lawn Equipment
│  └─ Storage
│
├─ Battery-Powered Tools (cross-cutting)
└─ Gas-Powered Equipment (cross-cutting)

Benefits:
- Track all battery-powered tools (for battery compatibility)
- Track all gas equipment (for fuel/oil maintenance)
- Organize by location and type
```

---

## 🚀 Implementation

### Create Group Hierarchy

```typescript
// Root: Home
const home = await createGroup({
  name: "Home",
  groupType: "location",
  icon: "🏠",
  level: 0,
  isRootGroup: true
})

// Child: Kitchen
const kitchen = await createGroup({
  name: "Kitchen",
  groupType: "location",
  icon: "🍳",
  parentGroupId: home.id,
  level: 1,
  path: "Home/Kitchen"
})

// Grandchild: Appliances
const appliances = await createGroup({
  name: "Appliances",
  groupType: "location",
  icon: "🔌",
  parentGroupId: kitchen.id,
  level: 2,
  path: "Home/Kitchen/Appliances"
})
```

### Add Asset to Multiple Groups

```typescript
// Add stove to Kitchen (primary)
await addAssetToGroup(stove.id, kitchen.id, { isPrimary: true })

// Add stove to Gas Appliances (secondary)
await addAssetToGroup(stove.id, gasAppliances.id, { isPrimary: false })

// Add stove to Kitchen Appliances (secondary)
await addAssetToGroup(stove.id, kitchenAppliances.id, { isPrimary: false })
```

### Query Assets by Group

```typescript
// Get all assets in Kitchen
const kitchenAssets = await getGroupAssets(kitchen.id)

// Get all assets in Gas Appliances
const gasAssets = await getGroupAssets(gasAppliances.id)

// Get all groups for an asset
const stoveGroups = await getAssetGroups(stove.id)
```

---

## 📊 Benefits

### Organization
- ✅ Flexible grouping (location + category + system)
- ✅ Multi-group membership
- ✅ Hierarchical nesting
- ✅ Visual organization (icons, colors)

### Insights
- ✅ Group-level statistics
- ✅ Health rollup
- ✅ Cost tracking per group
- ✅ Maintenance scheduling by group

### Efficiency
- ✅ Bulk operations on groups
- ✅ Group-based filtering
- ✅ Quick navigation
- ✅ Smart categorization

---

**Asset Groups provide the flexible organization you need to manage assets your way!** 🎉
