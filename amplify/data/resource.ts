/**
 * @fileoverview Enhanced Amplify Gen 2 Data Schema for Asset & Maintenance Management
 * @description Defines the data models for assets, maintenance schedules,
 * service history, reminders, templates, documents, cost tracking, and service contracts.
 * 
 * @requires @aws-amplify/backend
 */

import { type ClientSchema, a, defineData } from '@aws-amplify/backend'

/**
 * Data schema definition
 * @description Defines all data models with relationships and authorization rules
 */
const schema = a.schema({
    /**
     * Asset Profile Model
     * @description Represents a physical asset (vehicle, equipment, appliance, etc.)
     * that requires maintenance tracking
     */
    Asset: a
        .model({
            // Basic Information
            name: a.string().required(),
            category: a.string().required(), // e.g., "Vehicle", "Equipment", "Appliance"

            // Purchase Information
            purchaseDate: a.date(),
            purchasePrice: a.float(),
            inServiceDate: a.date(), // When asset was put into service (for contract maintenance schedules)

            // Manufacturer Details
            manufacturer: a.string(),
            model: a.string(),
            serialNumber: a.string(),

            // Additional Information
            notes: a.string(),
            location: a.string(), // e.g., "Garage", "Workshop"
            imageUrl: a.string(),

            // Usage Tracking
            currentMileage: a.integer(), // For vehicles
            currentHours: a.integer(), // For equipment

            // Status
            status: a.enum(['active', 'inactive', 'sold', 'retired']),

            // Health Status (calculated)
            healthStatus: a.enum(['excellent', 'good', 'attention', 'critical']),
            healthScore: a.integer(), // 0-100
            lastHealthCheck: a.datetime(),

            // Contract Coverage Status
            hasActiveContract: a.boolean(),
            contractCoverageStatus: a.enum(['fully_covered', 'partially_covered', 'not_covered', 'expired']),

            // Cost Tracking
            totalMaintenanceCost: a.float(), // Lifetime maintenance cost
            yearlyMaintenanceCost: a.float(), // Current year cost
            averageMonthlySpend: a.float(),

            // Relationships
            maintenanceTasks: a.hasMany('MaintenanceTask', 'assetId'),
            serviceRecords: a.hasMany('ServiceRecord', 'assetId'),
            reminders: a.hasMany('Reminder', 'assetId'),
            documents: a.hasMany('Document', 'assetId'),
            costSummaries: a.hasMany('CostSummary', 'assetId'),
            healthChecks: a.hasMany('HealthCheck', 'assetId'),
            serviceContracts: a.hasMany('AssetContract', 'assetId'),
            warranties: a.hasMany('AssetWarranty', 'assetId'),
            warrantyClaims: a.hasMany('WarrantyClaim', 'assetId'),
            groups: a.hasMany('AssetGroupMembership', 'assetId'),

            // Metadata
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),

    /**
     * Asset Group Model
     * @description Organizes assets into hierarchical or categorical groups
     * Examples: "Home" → "Kitchen" → "Appliances", or "Gas Appliances" = {Stove, Water Heater, Furnace}
     */
    AssetGroup: a
        .model({
            // Group Information
            name: a.string().required(),
            description: a.string(),
            groupType: a.enum([
                'location',      // Home, Garage, Workshop, Office
                'category',      // Gas Appliances, Power Tools, Vehicles
                'system',        // HVAC System, Plumbing System
                'custom'         // User-defined
            ]),

            // Visual
            icon: a.string(),
            color: a.string(),
            imageUrl: a.string(),

            // Hierarchy Support
            parentGroupId: a.id(),
            parentGroup: a.belongsTo('AssetGroup', 'parentGroupId'),
            childGroups: a.hasMany('AssetGroup', 'parentGroupId'),

            // Hierarchy Metadata
            level: a.integer(), // 0 = root, 1 = first level, etc.
            path: a.string(), // e.g., "Home/Kitchen/Appliances"
            isRootGroup: a.boolean(),

            // Group Statistics (calculated)
            assetCount: a.integer(),
            totalValue: a.float(),
            totalMaintenanceCost: a.float(),

            // Health Rollup
            healthyAssetCount: a.integer(),
            attentionAssetCount: a.integer(),
            criticalAssetCount: a.integer(),

            // Display Order
            sortOrder: a.integer(),

            // Relationships
            assets: a.hasMany('AssetGroupMembership', 'groupId'),

            // Metadata
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),

    /**
     * Asset Group Membership Model
     * @description Many-to-many relationship between Assets and Groups
     * Allows assets to belong to multiple groups (e.g., "Kitchen" AND "Gas Appliances")
     */
    AssetGroupMembership: a
        .model({
            assetId: a.id().required(),
            asset: a.belongsTo('Asset', 'assetId'),

            groupId: a.id().required(),
            group: a.belongsTo('AssetGroup', 'groupId'),

            // Membership Details
            isPrimary: a.boolean(), // Primary group for this asset
            addedAt: a.datetime(),
            notes: a.string(),

            // Metadata
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),

    /**
     * Service Contract Model
     * @description Represents warranties, maintenance plans, service agreements
     */
    ServiceContract: a
        .model({
            // Contract Information
            contractName: a.string().required(),
            providerName: a.string().required(),
            contractType: a.enum([
                'warranty',
                'extended_warranty',
                'maintenance_plan',
                'service_agreement',
                'subscription',
                'insurance_rider'
            ]),

            // Contract Period
            startDate: a.date().required(),
            endDate: a.date().required(),

            // Renewal Configuration
            renewalType: a.enum(['auto_renew', 'manual_renew', 'non_renewable']),
            renewalReminderDays: a.integer(), // Days before renewal to remind
            autoRenewDate: a.date(),

            // Cost Information
            costType: a.enum(['one_time', 'monthly', 'annual', 'per_service']),
            costAmount: a.float(),
            totalPaid: a.float(), // Lifetime cost paid
            nextPaymentDate: a.date(),
            nextPaymentAmount: a.float(),

            // Coverage Details
            coverageSummary: a.string(), // Plain language description
            coverageDetails: a.json(), // Structured coverage info
            exclusions: a.string(),
            deductible: a.float(),

            // Provider Information
            providerPhone: a.string(),
            providerEmail: a.string(),
            providerWebsite: a.string(),
            accountNumber: a.string(),
            policyNumber: a.string(),

            // Service Request Info
            claimInstructions: a.string(),
            serviceRequestPhone: a.string(),
            serviceRequestEmail: a.string(),
            serviceRequestUrl: a.string(),

            // Contract Documents
            contractDocumentUrl: a.string(),
            termsDocumentUrl: a.string(),

            // Status
            isActive: a.boolean(),
            isCancelled: a.boolean(),
            cancellationDate: a.date(),
            cancellationReason: a.string(),

            // Risk Indicators
            expiresInDays: a.integer(), // Calculated field
            hasRequiredServiceOverdue: a.boolean(),
            atRiskOfVoid: a.boolean(),

            // Relationships
            coveredAssets: a.hasMany('AssetContract', 'contractId'),
            requiredMaintenanceTasks: a.hasMany('ContractRequirement', 'contractId'),
            serviceRecords: a.hasMany('ServiceRecord', 'contractId'),
            documents: a.hasMany('Document', 'contractId'),
            reminders: a.hasMany('Reminder', 'contractId'),

            // Metadata
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),

    /**
     * Warranty Model (First-Class Object)
     * @description Dedicated warranty tracking with registration, claims, and compliance
     */
    Warranty: a
        .model({
            // Warranty Information
            warrantyName: a.string().required(),
            warrantyType: a.enum([
                'manufacturer',
                'extended',
                'third_party',
                'dealer',
                'store',
                'credit_card'
            ]),

            // Provider Details
            providerName: a.string().required(),
            providerPhone: a.string(),
            providerEmail: a.string(),
            providerWebsite: a.string(),
            warrantyNumber: a.string(),

            // Coverage Period
            startDate: a.date().required(),
            endDate: a.date().required(),
            durationMonths: a.integer(), // Auto-calculated
            daysRemaining: a.integer(), // Auto-calculated

            // Coverage Details
            coverageScope: a.string(), // Plain language: "Covers all parts and labor"
            coverageDetails: a.json(), // Structured coverage info
            exclusions: a.string(), // "Does not cover wear items, cosmetic damage"
            deductible: a.float(),
            maxClaimAmount: a.float(),

            // Registration Status
            registrationStatus: a.enum([
                'registered',
                'registration_required',
                'not_required',
                'pending',
                'expired'
            ]),
            registrationDeadline: a.date(),
            registrationConfirmationNumber: a.string(),
            daysUntilRegistrationDeadline: a.integer(),

            // Proof of Warranty
            proofOfPurchaseUrl: a.string(), // Receipt
            warrantyDocumentUrl: a.string(), // Warranty certificate
            registrationConfirmationUrl: a.string(),

            // Claim Information
            claimInstructions: a.string(),
            claimPhone: a.string(),
            claimEmail: a.string(),
            claimWebsite: a.string(),
            totalClaimsMade: a.integer(),
            totalClaimValue: a.float(),

            // Required Maintenance
            requiresRegularServicing: a.boolean(),
            requiresAuthorizedProvider: a.boolean(),
            requiresProofOfMaintenance: a.boolean(),
            maintenanceInstructions: a.string(),

            // Status & Risk
            isActive: a.boolean(),
            isExpired: a.boolean(),
            isAtRisk: a.boolean(), // Missing required maintenance
            riskReason: a.string(), // "Required service overdue"

            // Transferability
            isTransferable: a.boolean(),
            transferFee: a.float(),
            transferInstructions: a.string(),

            // Cost
            purchasePrice: a.float(),
            purchaseDate: a.date(),

            // Decision Window
            hasExtendedWarrantyOption: a.boolean(),
            extendedWarrantyDecisionDeadline: a.date(),
            extendedWarrantyEstimatedCost: a.float(),

            // Relationships
            coveredAssets: a.hasMany('AssetWarranty', 'warrantyId'),
            requiredMaintenanceTasks: a.hasMany('WarrantyRequirement', 'warrantyId'),
            claims: a.hasMany('WarrantyClaim', 'warrantyId'),
            serviceRecords: a.hasMany('ServiceRecord', 'warrantyId'),
            documents: a.hasMany('Document', 'warrantyId'),
            reminders: a.hasMany('Reminder', 'warrantyId'),

            // Metadata
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),

    /**
     * Asset-Warranty Junction Model
     * @description Many-to-many relationship between Assets and Warranties
     */
    AssetWarranty: a
        .model({
            assetId: a.id().required(),
            asset: a.belongsTo('Asset', 'assetId'),

            warrantyId: a.id().required(),
            warranty: a.belongsTo('Warranty', 'warrantyId'),

            // Coverage specifics for this asset
            coverageStartDate: a.date(),
            coverageEndDate: a.date(),
            isFullyCovered: a.boolean(),
            partialCoverageNotes: a.string(),

            // Metadata
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),

    /**
     * Warranty Requirement Model
     * @description Maintenance tasks required to keep warranty valid
     */
    WarrantyRequirement: a
        .model({
            warrantyId: a.id().required(),
            warranty: a.belongsTo('Warranty', 'warrantyId'),

            maintenanceTaskId: a.id().required(),
            maintenanceTask: a.belongsTo('MaintenanceTask', 'maintenanceTaskId'),

            // Requirement Details
            isRequired: a.boolean(), // Required vs recommended
            requirementDescription: a.string(),
            consequenceIfMissed: a.string(), // e.g., "Warranty void"
            mustUseAuthorizedProvider: a.boolean(),

            // Compliance Status
            isCompliant: a.boolean(),
            lastComplianceCheck: a.datetime(),
            daysUntilDue: a.integer(),
            isOverdue: a.boolean(),

            // Metadata
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),

    /**
     * Warranty Claim Model
     * @description Tracks warranty claims and repairs
     */
    WarrantyClaim: a
        .model({
            warrantyId: a.id().required(),
            warranty: a.belongsTo('Warranty', 'warrantyId'),

            assetId: a.id().required(),
            asset: a.belongsTo('Asset', 'assetId'),

            // Claim Information
            claimNumber: a.string(),
            claimDate: a.date().required(),
            claimStatus: a.enum([
                'submitted',
                'under_review',
                'approved',
                'denied',
                'completed',
                'appealed'
            ]),

            // Issue Details
            issueDescription: a.string().required(),
            issueCategory: a.string(),
            failureDate: a.date(),

            // Resolution
            resolutionDate: a.date(),
            resolutionDescription: a.string(),
            repairShop: a.string(),
            technicianName: a.string(),

            // Cost
            estimatedCost: a.float(),
            approvedAmount: a.float(),
            actualCost: a.float(),
            amountPaidByWarranty: a.float(),
            amountPaidOutOfPocket: a.float(),

            // Denial Info
            denialReason: a.string(),
            appealDate: a.date(),
            appealStatus: a.string(),

            // Documentation
            claimDocumentUrls: a.json(), // Array of document URLs
            photoUrls: a.json(), // Photos of issue
            receiptUrls: a.json(), // Repair receipts

            // Linked Service Record
            serviceRecordId: a.id(),
            serviceRecord: a.belongsTo('ServiceRecord', 'serviceRecordId'),

            // Metadata
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),

    /**
     * Asset-Contract Junction Model
     * @description Many-to-many relationship between Assets and Contracts
     */
    AssetContract: a
        .model({
            assetId: a.id().required(),
            asset: a.belongsTo('Asset', 'assetId'),

            contractId: a.id().required(),
            contract: a.belongsTo('ServiceContract', 'contractId'),

            // Coverage specifics for this asset
            coverageStartDate: a.date(),
            coverageEndDate: a.date(),
            isFullyCovered: a.boolean(),
            partialCoverageNotes: a.string(),

            // Metadata
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),

    /**
     * Contract Requirement Model
     * @description Maintenance tasks required to keep contract valid
     */
    ContractRequirement: a
        .model({
            contractId: a.id().required(),
            contract: a.belongsTo('ServiceContract', 'contractId'),

            maintenanceTaskId: a.id().required(),
            maintenanceTask: a.belongsTo('MaintenanceTask', 'maintenanceTaskId'),

            // Requirement Details
            isRequired: a.boolean(), // Required vs recommended
            requirementDescription: a.string(),
            consequenceIfMissed: a.string(), // e.g., "Warranty void"

            // Compliance Status
            isCompliant: a.boolean(),
            lastComplianceCheck: a.datetime(),
            daysUntilDue: a.integer(),
            isOverdue: a.boolean(),

            // Metadata
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),

    /**
     * Maintenance Task Model
     * @description Defines a recurring maintenance task for an asset
     */
    MaintenanceTask: a
        .model({
            // Task Information
            taskName: a.string().required(),
            description: a.string(),
            category: a.string(), // e.g., "Oil Change", "Filter", "Inspection"

            // Interval Configuration
            intervalType: a.enum(['time', 'usage', 'date', 'hybrid']),

            // Time-based interval (in days)
            intervalDays: a.integer(),

            // Usage-based interval
            intervalMiles: a.integer(), // For vehicles
            intervalHours: a.integer(), // For equipment

            // Date-specific
            specificDate: a.date(), // For annual inspections
            specificMonth: a.integer(), // Month (1-12) for yearly tasks
            specificDay: a.integer(), // Day of month for monthly tasks

            // Task Source
            isManufacturerRecommended: a.boolean(),
            manufacturerReference: a.string(),
            isFromTemplate: a.boolean(),
            templateId: a.id(),

            // Contract Relationship
            isCoveredByContract: a.boolean(),
            isRequiredByContract: a.boolean(),
            coveringContractId: a.id(),
            requiringContractId: a.id(),

            // Last Completed
            lastCompletedDate: a.date(),
            lastCompletedMileage: a.integer(),
            lastCompletedHours: a.integer(),

            // Next Due
            nextDueDate: a.date(),
            nextDueMileage: a.integer(),
            nextDueHours: a.integer(),

            // Status Indicators
            daysUntilDue: a.integer(),
            isOverdue: a.boolean(),
            daysOverdue: a.integer(),
            urgencyLevel: a.enum(['none', 'upcoming', 'due', 'overdue', 'critical']),

            // Cost Estimation
            estimatedCost: a.float(),
            estimatedDuration: a.integer(), // in minutes
            actualAverageCost: a.float(), // From service history
            isCoveredCost: a.boolean(), // Covered by contract

            // Status
            isActive: a.boolean(),
            priority: a.enum(['low', 'medium', 'high', 'critical']),

            // Relationships
            assetId: a.id().required(),
            asset: a.belongsTo('Asset', 'assetId'),
            serviceRecords: a.hasMany('ServiceRecord', 'maintenanceTaskId'),
            reminders: a.hasMany('Reminder', 'maintenanceTaskId'),
            contractRequirements: a.hasMany('ContractRequirement', 'maintenanceTaskId'),
            warrantyRequirements: a.hasMany('WarrantyRequirement', 'maintenanceTaskId'),

            // Metadata
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),

    /**
     * Service Record Model
     * @description Logs a completed maintenance service
     */
    ServiceRecord: a
        .model({
            // Service Information
            serviceName: a.string().required(),
            serviceDate: a.date().required(),

            // Who performed the service
            performedBy: a.enum(['self', 'shop', 'dealer', 'mobile']),
            shopName: a.string(),
            technicianName: a.string(),

            // Contract Relationship
            wasContractCovered: a.boolean(),
            contractId: a.id(),
            contract: a.belongsTo('ServiceContract', 'contractId'),
            claimNumber: a.string(),

            // Cost Information
            laborCost: a.float(),
            partsCost: a.float(),
            totalCost: a.float(),
            amountCoveredByContract: a.float(),
            amountPaidOutOfPocket: a.float(),

            // Details
            notes: a.string(),
            workPerformed: a.string(),
            partsReplaced: a.json(), // Array of parts

            // Attachments
            receiptUrl: a.string(),
            photoUrls: a.json(), // Array of photo URLs
            invoiceUrl: a.string(),

            // Asset State at Service
            mileageAtService: a.integer(),
            hoursAtService: a.integer(),

            // Quality & Warranty
            warrantyInfo: a.string(),
            warrantyExpiration: a.date(),
            serviceRating: a.integer(), // 1-5 stars

            // Relationships
            assetId: a.id().required(),
            asset: a.belongsTo('Asset', 'assetId'),
            maintenanceTaskId: a.id(),
            maintenanceTask: a.belongsTo('MaintenanceTask', 'maintenanceTaskId'),
            warrantyId: a.id(),
            warranty: a.belongsTo('Warranty', 'warrantyId'),
            warrantyClaims: a.hasMany('WarrantyClaim', 'serviceRecordId'),
            documents: a.hasMany('Document', 'serviceRecordId'),

            // Metadata
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),

    /**
     * Reminder Model
     * @description Manages smart reminders for upcoming maintenance and contracts
     */
    Reminder: a
        .model({
            // Reminder Information
            title: a.string().required(),
            message: a.string(),
            reminderType: a.enum([
                'maintenance_due',
                'maintenance_covered',
                'maintenance_required',
                'contract_expiring',
                'contract_renewal',
                'required_service_overdue',
                'renewal_cost',
                'contract_at_risk',
                'warranty_expiring',
                'warranty_registration_deadline',
                'warranty_required_maintenance',
                'warranty_extended_decision',
                'warranty_at_risk'
            ]),

            // Due Information
            dueDate: a.date(),
            dueMileage: a.integer(),
            dueHours: a.integer(),

            // Lead Time Configuration
            leadTimeDays: a.integer(), // Days before due date
            leadTimeMiles: a.integer(), // Miles before due
            leadTimeHours: a.integer(), // Hours before due

            // Reminder Status
            status: a.enum(['pending', 'sent', 'acknowledged', 'snoozed', 'completed', 'dismissed']),

            // Notification Preferences
            sendEmail: a.boolean(),
            sendPush: a.boolean(),
            sendCalendar: a.boolean(),

            // Snooze Information
            snoozedUntil: a.date(),
            snoozeCount: a.integer(),

            // Escalation
            isOverdue: a.boolean(),
            overdueBy: a.integer(), // Days overdue
            isCritical: a.boolean(), // Contract at risk, etc.

            // Sent Information
            lastSentAt: a.datetime(),
            sentCount: a.integer(),

            // Relationships
            assetId: a.id().required(),
            asset: a.belongsTo('Asset', 'assetId'),
            maintenanceTaskId: a.id(),
            maintenanceTask: a.belongsTo('MaintenanceTask', 'maintenanceTaskId'),
            contractId: a.id(),
            contract: a.belongsTo('ServiceContract', 'contractId'),
            warrantyId: a.id(),
            warranty: a.belongsTo('Warranty', 'warrantyId'),

            // Metadata
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),

    /**
     * Task Template Model
     * @description Reusable maintenance task templates
     */
    TaskTemplate: a
        .model({
            // Template Information
            name: a.string().required(),
            description: a.string(),
            category: a.string(), // e.g., "Car - Basic Maintenance", "Home - Annual Safety"

            // Template Type
            isPublic: a.boolean(), // System templates vs user templates
            isSystemTemplate: a.boolean(),

            // Icon & Display
            icon: a.string(),
            color: a.string(),

            // Template Tasks (JSON array)
            tasks: a.json().required(), // Array of task definitions

            // Usage Statistics
            timesUsed: a.integer(),
            lastUsed: a.datetime(),

            // Metadata
            createdBy: a.string(),
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),

    /**
     * Document Model
     * @description Stores manuals, warranties, receipts, contracts, and other documentation
     */
    Document: a
        .model({
            // Document Information
            title: a.string().required(),
            description: a.string(),
            documentType: a.enum([
                'manual',
                'warranty',
                'receipt',
                'invoice',
                'insurance',
                'registration',
                'inspection',
                'contract',
                'terms',
                'claim',
                'other'
            ]),

            // File Information
            fileUrl: a.string().required(),
            fileName: a.string(),
            fileSize: a.integer(), // in bytes
            mimeType: a.string(),

            // Document Details
            issueDate: a.date(),
            expirationDate: a.date(),
            documentNumber: a.string(),

            // Warranty Specific
            warrantyProvider: a.string(),
            warrantyCoverage: a.string(),
            warrantyValue: a.float(),

            // Tags & Search
            tags: a.json(), // Array of tags
            searchableText: a.string(), // OCR text for search

            // Status
            isExpired: a.boolean(),
            needsRenewal: a.boolean(),

            // Relationships
            assetId: a.id().required(),
            asset: a.belongsTo('Asset', 'assetId'),
            serviceRecordId: a.id(),
            serviceRecord: a.belongsTo('ServiceRecord', 'serviceRecordId'),
            contractId: a.id(),
            contract: a.belongsTo('ServiceContract', 'contractId'),
            warrantyId: a.id(),
            warranty: a.belongsTo('Warranty', 'warrantyId'),

            // Metadata
            uploadedAt: a.datetime(),
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),

    /**
     * Cost Summary Model
     * @description Aggregated cost tracking and analytics
     */
    CostSummary: a
        .model({
            // Summary Period
            year: a.integer().required(),
            month: a.integer(), // 1-12, null for yearly summary

            // Asset Reference
            assetId: a.id().required(),
            asset: a.belongsTo('Asset', 'assetId'),

            // Cost Breakdown
            totalCost: a.float(),
            laborCost: a.float(),
            partsCost: a.float(),
            contractCoveredCost: a.float(),
            outOfPocketCost: a.float(),

            // Service Counts
            serviceCount: a.integer(),
            selfServiceCount: a.integer(),
            shopServiceCount: a.integer(),
            contractCoveredCount: a.integer(),

            // Category Breakdown (JSON)
            costByCategory: a.json(), // { "Oil Change": 150, "Tires": 600 }

            // Comparisons
            previousPeriodCost: a.float(),
            percentageChange: a.float(),

            // Projections
            projectedYearlyCost: a.float(),

            // Metadata
            calculatedAt: a.datetime(),
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),

    /**
     * Health Check Model
     * @description Tracks asset health assessments
     */
    HealthCheck: a
        .model({
            // Check Information
            checkDate: a.datetime().required(),
            healthScore: a.integer().required(), // 0-100
            healthStatus: a.enum(['excellent', 'good', 'attention', 'critical']),

            // Factors
            overdueTasksCount: a.integer(),
            upcomingTasksCount: a.integer(),
            criticalIssuesCount: a.integer(),
            contractRisksCount: a.integer(),

            // Details (JSON)
            issues: a.json(), // Array of issues found
            recommendations: a.json(), // Array of recommendations
            contractRisks: a.json(), // Contract-related risks

            // Metrics
            daysSinceLastService: a.integer(),
            averageTaskCompletionRate: a.float(),
            contractComplianceRate: a.float(),

            // Relationships
            assetId: a.id().required(),
            asset: a.belongsTo('Asset', 'assetId'),

            // Metadata
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),

    /**
     * User Profile Model
     * @description Stores user preferences and settings
     */
    UserProfile: a
        .model({
            username: a.string().required(),
            email: a.string().required(),
            displayName: a.string(),
            avatar: a.string(),

            // Notification Preferences
            emailNotifications: a.boolean(),
            pushNotifications: a.boolean(),
            calendarSync: a.boolean(),

            // Reminder Preferences
            defaultLeadTimeDays: a.integer(), // Default: 14 days
            reminderFrequency: a.enum(['daily', 'weekly', 'biweekly']),
            contractRenewalReminderDays: a.integer(), // Default: 60 days

            // Display Preferences
            preferredUnits: a.enum(['imperial', 'metric']),
            timezone: a.string(),
            currency: a.string(),

            // Dashboard Preferences
            showHealthStatus: a.boolean(),
            showCostTracking: a.boolean(),
            showContractStatus: a.boolean(),
            dashboardLayout: a.json(),

            // Metadata
            preferences: a.json(),
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),

    /**
     * Activity Log Model
     * @description Tracks user actions for audit trail
     */
    Activity: a
        .model({
            type: a.string().required(),
            title: a.string().required(),
            description: a.string(),
            userId: a.string().required(),
            metadata: a.json(),
            timestamp: a.datetime(),
            owner: a.string(),
        })
        .authorization((allow) => [
            allow.owner(),
            allow.authenticated().to(['read']),
        ]),
})

export type Schema = ClientSchema<typeof schema>

export const data = defineData({
    schema,
    authorizationModes: {
        defaultAuthorizationMode: 'userPool',
    },
})
