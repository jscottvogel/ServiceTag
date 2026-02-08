import type { Schema } from '../../amplify/data/resource'
import { V6Client } from '@aws-amplify/api-graphql'

export const seedDatabase = async (client: V6Client<Schema>) => {
    console.log('🌱 Starting database seed...')

    try {
        // 1. Create Asset Groups
        console.log('Creating groups...')
        // Create Home Group (unused var removed)
        await client.models.AssetGroup.create({
            name: 'Home',
            description: 'Main residence and associated items',
            groupType: 'location'
        })

        const garageGroup = await client.models.AssetGroup.create({
            name: 'Garage',
            description: 'Vehicles and tools',
            groupType: 'location'
        })

        // Create Office Group (unused var removed)
        await client.models.AssetGroup.create({
            name: 'Home Office',
            description: 'Computers and electronics',
            groupType: 'location'
        })

        // 2. Create Assets
        console.error('Creating assets (forcing log)...')
        const tesla = await client.models.Asset.create({
            name: 'Tesla Model Y',
            category: 'Vehicle',
            status: 'active',
            manufacturer: 'Tesla',
            model: 'Model Y'
        })
        console.error('Tesla created response:', JSON.stringify(tesla));

        if (!tesla.data?.id) {
            console.error('FATAL: Tesla ID is missing!');
            throw new Error('Tesla ID missing');
        }
        const teslaId = tesla.data.id;
        console.error('Tesla ID verified:', teslaId);

        if (tesla.data && garageGroup.data) {
            console.error('Creating Tesla group membership...');
            try {
                const membership = await client.models.AssetGroupMembership.create({
                    assetId: teslaId,
                    groupId: (garageGroup.data as any).id,
                    isPrimary: true
                });
                console.error('Membership created:', membership);
            } catch (e) {
                console.error('Failed to create membership:', e);
            }
        }


        // Placeholders for disabled assets (commented out to avoid unused vars)
        // const fridge = { data: null }
        // const macbook = { data: null }
        // const hvac = { data: null }

        // 3. Create Maintenance Tasks
        console.error('Creating maintenance tasks...')

        // Tesla Tasks
        try {
            console.error('Creating Task 1 (Tire Rotation) for Asset ID:', teslaId);
            const task1 = await client.models.MaintenanceTask.create({
                taskName: 'Tire Rotation',
                description: 'Rotate tires every 6,250 miles',
                assetId: teslaId,
                priority: 'medium',
                intervalType: 'usage',
                intervalMiles: 6250,
                estimatedCost: 50.00,
                isActive: true,
                isOverdue: false,
                nextDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().split('T')[0],
            })
            console.error('Task 1 created result:', JSON.stringify(task1));
        } catch (error) {
            console.error('Failed to create Task 1:', error);
        }

        try {
            console.log('Creating Task 2 (Cabin Air Filter)...');
            await client.models.MaintenanceTask.create({
                taskName: 'Cabin Air Filter',
                description: 'Replace HEPA filter',
                assetId: teslaId, // Use verified teslaId instead of unsafe assertion
                priority: 'low',
                intervalType: 'time',
                intervalDays: 730, // 2 years
                estimatedCost: 120.00,
                isActive: true,
                isOverdue: true,
                nextDueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0], // Overdue by 5 days
            })
            console.log('Task 2 created');
        } catch (error) {
            console.error('Failed to create Task 2:', error);
        }

        // Fridge Tasks (disabled)
        /*
        await client.models.MaintenanceTask.create({
            taskName: 'Replace Water Filter',
            description: 'Replace HAF-QIN filter',
            assetId: (fridge.data as any)?.id!,
            priority: 'medium',
            intervalType: 'time',
            intervalDays: 180,
            estimatedCost: 45.00,
            isActive: true,
            nextDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45).toISOString(), // Due in 45 days
        })
        */

        // HVAC Tasks
        // HVAC Tasks (disabled)
        // const hvacSpringTask = { data: null }
        /*
        const hvacSpringTask = await client.models.MaintenanceTask.create({ ... })
        await client.models.MaintenanceTask.create({ ... })
        await client.models.MaintenanceTask.create({ ... })
        */

        // Tesla additional tasks
        await client.models.MaintenanceTask.create({
            taskName: 'Brake Fluid Check',
            description: 'Check and replace brake fluid if needed',
            assetId: teslaId, // Use verified teslaId instead of unsafe assertion
            priority: 'medium',
            intervalType: 'time',
            intervalDays: 730, // 2 years
            estimatedCost: 80.00,
            isActive: true,
            nextDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 75).toISOString().split('T')[0], // Due in 75 days
        })

        // Fridge additional tasks disabled
        /*
        await client.models.MaintenanceTask.create({ ... })
        */

        // 4. Create Warranties
        console.log('Creating warranties...')

        // Tesla Warranty
        await client.models.Warranty.create({
            warrantyName: 'Basic Vehicle Limited Warranty',
            warrantyType: 'manufacturer',
            provider: 'Tesla',
            assetId: teslaId, // Use verified teslaId
            startDate: '2023-06-15',
            endDate: '2027-06-15', // 4 years
            isActive: true,
            registrationStatus: 'registered',
            coverageScope: 'Bumper to bumper coverage'
        })

        // Other Warranties disabled
        /*
        await client.models.Warranty.create(...)
        */

        // 5. Create Service Contracts
        console.log('Creating contracts...')

        // Contracts disabled
        // const hvacContract = { data: null }
        /*
        const hvacContract = await client.models.ServiceContract.create(...)
        */

        // Create Contract Requirement linking Spring Tune-up to HVAC contract (commented out)
        /*
        if (false && hvacContract.data && hvacSpringTask.data) {
            await client.models.ContractRequirement.create({
                contractId: (hvacContract.data as any).id,
                maintenanceTaskId: (hvacSpringTask.data as any).id,
                isRequired: true,
                requirementDescription: 'Annual spring tune-up required by maintenance plan',
                consequenceIfMissed: 'Contract may be voided and warranty claims denied',
                isCompliant: false, // Task is overdue
                isOverdue: true,
                daysUntilDue: -10,
            })
        }
        */

        // Tesla Extended Warranty
        await client.models.ServiceContract.create({
            contractName: 'Tesla Extended Service Agreement',
            contractType: 'extended_warranty',
            provider: 'Tesla',
            contractNumber: 'TSL-ESA-123456',
            assetId: teslaId, // Use verified teslaId
            startDate: '2027-06-15',
            endDate: '2031-06-15',
            isActive: true,
            annualCost: 2500.00,
            autoRenew: false,
            coverageScope: 'Extends coverage beyond basic warranty. Covers battery, drive unit, and all major components. Does not cover tire wear or cosmetic damage.',
        })

        // Home Appliance Protection Plan
        // Home Appliance Protection Plan (disabled)
        /*
        await client.models.ServiceContract.create({
           ...
        })
        */

        // AppleCare+ and Old HVAC (disabled)
        /*
        await client.models.ServiceContract.create({...})
        await client.models.ServiceContract.create({...})
        */

        // Expiring Soon Contract
        const expiringDate = new Date()
        expiringDate.setDate(expiringDate.getDate() + 25) // Expires in 25 days

        await client.models.ServiceContract.create({
            contractName: 'Vehicle Roadside Assistance',
            contractType: 'subscription',
            provider: 'AAA Premium',
            contractNumber: 'AAA-2024-12345',
            assetId: teslaId, // Use verified teslaId
            startDate: '2024-02-07',
            endDate: expiringDate.toISOString().split('T')[0],
            isActive: true,
            monthlyPayment: 12.99,
            annualCost: 155.88,
            autoRenew: false,
            coverageScope: 'Towing up to 100 miles, battery service, flat tire service, lockout service, fuel delivery',
        })

        // 6. Create Documents
        console.log('Creating documents...')
        await client.models.Document.create({
            title: 'Tesla Model Y Owner\'s Manual',
            documentType: 'manual',
            assetId: teslaId, // Use verified teslaId
            fileUrl: 'https://www.tesla.com/ownersmanual/modely/en_us/',
            description: 'Digital owner\'s manual',
            uploadDate: new Date().toISOString()
        })

        // Fridge Receipt (disabled)
        /*
        await client.models.Document.create({...})
        */

        console.log('✅ Database seeded successfully!')
        return { success: true, count: 'Created sample data for Assets, Groups, Tasks, Warranties, and Contracts.' }
    } catch (error) {
        console.error('❌ Error seeding database:', error)
        throw error
    }
}

export const deleteAllData = async (client: V6Client<Schema>) => {
    console.log('🗑️ Starting database cleanup...')

    try {
        let totalDeleted = 0

        // Delete in reverse order of dependencies to avoid foreign key issues

        // 1. Delete Documents
        console.log('Deleting documents...')
        const documents = await client.models.Document.list({})
        for (const doc of documents.data) {
            await client.models.Document.delete({ id: doc.id })
            totalDeleted++
        }
        console.log(`Deleted ${documents.data.length} documents`)

        // 2. Delete Service Records
        console.log('Deleting service records...')
        const serviceRecords = await client.models.ServiceRecord.list({})
        for (const record of serviceRecords.data) {
            await client.models.ServiceRecord.delete({ id: record.id })
            totalDeleted++
        }
        console.log(`Deleted ${serviceRecords.data.length} service records`)

        // 3. Delete Maintenance Tasks
        console.log('Deleting maintenance tasks...')
        const tasks = await client.models.MaintenanceTask.list({})
        for (const task of tasks.data) {
            await client.models.MaintenanceTask.delete({ id: task.id })
            totalDeleted++
        }
        console.log(`Deleted ${tasks.data.length} maintenance tasks`)

        // 4. Delete Warranty Claims
        console.log('Deleting warranty claims...')
        const claims = await client.models.WarrantyClaim.list({})
        for (const claim of claims.data) {
            await client.models.WarrantyClaim.delete({ id: claim.id })
            totalDeleted++
        }
        console.log(`Deleted ${claims.data.length} warranty claims`)

        // 5. Delete Warranty Requirements
        console.log('Deleting warranty requirements...')
        const requirements = await client.models.WarrantyRequirement.list({})
        for (const req of requirements.data) {
            await client.models.WarrantyRequirement.delete({ id: req.id })
            totalDeleted++
        }
        console.log(`Deleted ${requirements.data.length} warranty requirements`)

        // 6. Delete Asset Warranties (junction table)
        console.log('Deleting asset warranties...')
        const assetWarranties = await client.models.AssetWarranty.list({})
        for (const aw of assetWarranties.data) {
            await client.models.AssetWarranty.delete({ id: aw.id })
            totalDeleted++
        }
        console.log(`Deleted ${assetWarranties.data.length} asset warranties`)

        // 7. Delete Warranties
        console.log('Deleting warranties...')
        const warranties = await client.models.Warranty.list({})
        for (const warranty of warranties.data) {
            await client.models.Warranty.delete({ id: warranty.id })
            totalDeleted++
        }
        console.log(`Deleted ${warranties.data.length} warranties`)

        // 8. Delete Asset Contracts (junction table)
        console.log('Deleting asset contracts...')
        const assetContracts = await client.models.AssetContract.list({})
        for (const ac of assetContracts.data) {
            await client.models.AssetContract.delete({ id: ac.id })
            totalDeleted++
        }
        console.log(`Deleted ${assetContracts.data.length} asset contracts`)

        // 9. Delete Service Contracts
        console.log('Deleting service contracts...')
        const contracts = await client.models.ServiceContract.list({})
        for (const contract of contracts.data) {
            await client.models.ServiceContract.delete({ id: contract.id })
            totalDeleted++
        }
        console.log(`Deleted ${contracts.data.length} service contracts`)

        // 10. Delete Contract Requirements
        console.log('Deleting contract requirements...')
        const contractReqs = await client.models.ContractRequirement.list({})
        for (const req of contractReqs.data) {
            await client.models.ContractRequirement.delete({ id: req.id })
            totalDeleted++
        }
        console.log(`Deleted ${contractReqs.data.length} contract requirements`)

        // 11. Delete Asset Group Memberships (junction table)
        console.log('Deleting asset group memberships...')
        const memberships = await client.models.AssetGroupMembership.list({})
        for (const membership of memberships.data) {
            await client.models.AssetGroupMembership.delete({ id: membership.id })
            totalDeleted++
        }
        console.log(`Deleted ${memberships.data.length} asset group memberships`)

        // 12. Delete Assets
        console.log('Deleting assets...')
        const assets = await client.models.Asset.list({})
        for (const asset of assets.data) {
            await client.models.Asset.delete({ id: asset.id })
            totalDeleted++
        }
        console.log(`Deleted ${assets.data.length} assets`)

        // 13. Delete Asset Groups
        console.log('Deleting asset groups...')
        const groups = await client.models.AssetGroup.list({})
        for (const group of groups.data) {
            await client.models.AssetGroup.delete({ id: group.id })
            totalDeleted++
        }
        console.log(`Deleted ${groups.data.length} asset groups`)

        // 14. Delete Reminders
        console.log('Deleting reminders...')
        const reminders = await client.models.Reminder.list({})
        for (const reminder of reminders.data) {
            await client.models.Reminder.delete({ id: reminder.id })
            totalDeleted++
        }
        console.log(`Deleted ${reminders.data.length} reminders`)

        console.log(`✅ Database cleanup complete! Deleted ${totalDeleted} total records.`)
        return { success: true, count: totalDeleted, message: `Deleted ${totalDeleted} records` }
    } catch (error) {
        console.error('❌ Error deleting data:', error)
        throw error
    }
}
