
import type { Schema } from '../../amplify/data/resource'
import { V6Client } from '@aws-amplify/api-graphql'

export const seedDatabase = async (client: V6Client<Schema>) => {
    console.log('🌱 Starting database seed...')

    try {
        // --- 1. Create Asset Groups ---
        console.log('Creating groups...')

        // Location Groups
        const homeGroup = await client.models.AssetGroup.create({
            name: 'Home',
            description: 'Main Residence',
            groupType: 'location',
            icon: 'home'
        })

        const garageGroup = await client.models.AssetGroup.create({
            name: 'Garage',
            description: 'Vehicles and Tools',
            groupType: 'location',
            icon: 'warehouse',
            parentGroupId: homeGroup.data?.id
        })

        const kitchenGroup = await client.models.AssetGroup.create({
            name: 'Kitchen',
            description: 'Appliances and Fixtures',
            groupType: 'location',
            icon: 'kitchen',
            parentGroupId: homeGroup.data?.id
        })

        const backyardGroup = await client.models.AssetGroup.create({
            name: 'Backyard & Pool',
            description: 'Outdoor Equipment',
            groupType: 'location',
            icon: 'pool',
            parentGroupId: homeGroup.data?.id
        })

        // Category Groups (New)
        const vehiclesGroup = await client.models.AssetGroup.create({
            name: 'Vehicles',
            description: 'All Cars and Trucks',
            groupType: 'category',
            icon: 'car'
        })

        const appliancesGroup = await client.models.AssetGroup.create({
            name: 'Appliances',
            description: 'Major and Small Appliances',
            groupType: 'category',
            icon: 'blender'
        })


        // --- 2. Create Assets ---
        console.log('Creating assets...')

        // -- Vehicle: Tesla Model Y --
        const tesla = await client.models.Asset.create({
            name: 'Tesla Model Y',
            category: 'Vehicle',
            status: 'active',
            manufacturer: 'Tesla',
            model: 'Model Y',
            serialNumber: '5YJYY...',
            purchaseDate: '2023-06-15',
            purchasePrice: 52990.00,
            currentMileage: 12500,
            location: 'Garage'
        })
        const teslaId = tesla.data!.id

        if (garageGroup.data) {
            await client.models.AssetGroupMembership.create({
                assetId: teslaId,
                groupId: garageGroup.data.id,
                isPrimary: true
            })
        }
        if (vehiclesGroup.data) {
            await client.models.AssetGroupMembership.create({
                assetId: teslaId,
                groupId: vehiclesGroup.data.id,
                isPrimary: false
            })
        }

        // -- Vehicle: Toyota Camry (Second Car) --
        const camry = await client.models.Asset.create({
            name: 'Toyota Camry Hybrid',
            category: 'Vehicle',
            status: 'active',
            manufacturer: 'Toyota',
            model: 'Camry XLE',
            serialNumber: '4T1B...',
            purchaseDate: '2023-01-10',
            purchasePrice: 35000.00,
            currentMileage: 28500,
            location: 'Garage'
        })
        const camryId = camry.data!.id

        if (garageGroup.data) {
            await client.models.AssetGroupMembership.create({
                assetId: camryId,
                groupId: garageGroup.data.id,
                isPrimary: true
            })
        }
        if (vehiclesGroup.data) {
            await client.models.AssetGroupMembership.create({
                assetId: camryId,
                groupId: vehiclesGroup.data.id,
                isPrimary: false
            })
        }

        // -- House: Main Residence --
        const house = await client.models.Asset.create({
            name: '123 Maple Street',
            category: 'Real Estate',
            status: 'active',
            purchaseDate: '2018-04-20',
            purchasePrice: 450000.00,
            location: 'Home'
        })
        const houseId = house.data!.id

        // -- Asset: HVAC System --
        const hvac = await client.models.Asset.create({
            name: 'Central HVAC System',
            category: 'Mechanical',
            manufacturer: 'Trane',
            model: 'XR14',
            serialNumber: 'TRN-2018...',
            purchaseDate: '2018-04-20',
            status: 'active',
            location: 'Home'
        })
        const hvacId = hvac.data!.id

        if (homeGroup.data) {
            await client.models.AssetGroupMembership.create({
                assetId: hvacId,
                groupId: homeGroup.data.id,
                isPrimary: true
            })
        }

        // -- Appliance: Samsung Refrigerator --
        const fridge = await client.models.Asset.create({
            name: 'Smart Refrigerator',
            category: 'Appliance',
            manufacturer: 'Samsung',
            model: 'RF28...',
            serialNumber: 'SAMS123...',
            purchaseDate: '2022-11-25',
            purchasePrice: 2199.00,
            status: 'active',
            location: 'Kitchen'
        })
        const fridgeId = fridge.data!.id

        if (kitchenGroup.data) {
            await client.models.AssetGroupMembership.create({
                assetId: fridgeId,
                groupId: kitchenGroup.data.id,
                isPrimary: true
            })
        }
        if (appliancesGroup.data) {
            await client.models.AssetGroupMembership.create({
                assetId: fridgeId,
                groupId: appliancesGroup.data.id,
                isPrimary: false
            })
        }

        // -- Small Appliance: Espresso Machine --
        const espresso = await client.models.Asset.create({
            name: 'Barista Express',
            category: 'Small Appliance',
            manufacturer: 'Breville',
            model: 'BES870XL',
            purchaseDate: '2023-12-25',
            purchasePrice: 699.95,
            status: 'active',
            location: 'Kitchen'
        })
        const espressoId = espresso.data!.id

        if (kitchenGroup.data) {
            await client.models.AssetGroupMembership.create({
                assetId: espressoId,
                groupId: kitchenGroup.data.id,
                isPrimary: true
            })
        }
        if (appliancesGroup.data) {
            await client.models.AssetGroupMembership.create({
                assetId: espressoId,
                groupId: appliancesGroup.data.id,
                isPrimary: false
            })
        }

        // -- Small Appliance: Blender --
        const blender = await client.models.Asset.create({
            name: 'Professional Blender',
            category: 'Small Appliance',
            manufacturer: 'Vitamix',
            model: '5200',
            purchaseDate: '2020-08-15',
            purchasePrice: 399.00,
            status: 'active',
            location: 'Kitchen'
        })
        const blenderId = blender.data!.id

        if (kitchenGroup.data) {
            await client.models.AssetGroupMembership.create({
                assetId: blenderId,
                groupId: kitchenGroup.data.id,
                isPrimary: true
            })
        }
        if (appliancesGroup.data) {
            await client.models.AssetGroupMembership.create({
                assetId: blenderId,
                groupId: appliancesGroup.data.id,
                isPrimary: false
            })
        }

        // -- Pool: Hayward Pump --
        const poolPump = await client.models.Asset.create({
            name: 'Variable Speed Pool Pump',
            category: 'Pool Equipment',
            manufacturer: 'Hayward',
            model: 'TriStar VS',
            serialNumber: 'HWD987...',
            purchaseDate: '2021-05-10',
            purchasePrice: 1200.00,
            status: 'active',
            location: 'Backyard'
        })
        const pumpId = poolPump.data!.id

        if (backyardGroup.data) {
            await client.models.AssetGroupMembership.create({
                assetId: pumpId,
                groupId: backyardGroup.data.id,
                isPrimary: true
            })
        }

        // --- 3. Create Maintenance Tasks ---
        console.log('Creating maintenance tasks...')

        // Tesla Tasks
        await client.models.MaintenanceTask.create({
            taskName: 'Rotate Tires',
            description: 'Rotate tires every 6,250 miles',
            assetId: teslaId,
            priority: 'medium',
            intervalType: 'usage',
            intervalMiles: 6250,
            nextDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0], // Due soon
            isActive: true
        })

        await client.models.MaintenanceTask.create({
            taskName: 'Replace Cabin Air Filter',
            description: 'HEPA filter replacement',
            assetId: teslaId,
            priority: 'low',
            intervalType: 'time',
            intervalDays: 730,
            nextDueDate: '2025-06-15',
            isActive: true
        })

        // Camry Tasks (30k, 60k, 90k)
        await client.models.MaintenanceTask.create({
            taskName: '30,000 Mile Service',
            description: 'Major service: Oil change, tire rotation, cabin air filter, engine air filter, brake fluid check',
            assetId: camryId,
            priority: 'high',
            intervalType: 'usage',
            intervalMiles: 30000,
            nextDueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString().split('T')[0], // Estimated date
            isActive: true
        })

        await client.models.MaintenanceTask.create({
            taskName: '60,000 Mile Service',
            description: 'Major service: All 30k items + transmission fluid check, coolant check, drive belt inspection',
            assetId: camryId,
            priority: 'high',
            intervalType: 'usage',
            intervalMiles: 60000,
            isActive: true
        })

        await client.models.MaintenanceTask.create({
            taskName: '90,000 Mile Service',
            description: 'Major service: All 30k items + spark plugs (if iridium/platinum), comprehensive inspection',
            assetId: camryId,
            priority: 'high',
            intervalType: 'usage',
            intervalMiles: 90000,
            isActive: true
        })

        // HVAC Tasks (Spring/Fall Checkups)
        const springCheckup = await client.models.MaintenanceTask.create({
            taskName: 'Spring HVAC Tune-up',
            description: 'Prepare AC for summer. Check refrigerant, clean coils, test capacitor.',
            assetId: hvacId,
            priority: 'medium',
            intervalType: 'time',
            intervalDays: 365,
            nextDueDate: '2024-04-15',
            isActive: true,
            intervalNotes: 'Required by service contract'
        })

        const fallCheckup = await client.models.MaintenanceTask.create({
            taskName: 'Fall Furnace Tune-up',
            description: 'Prepare furnace for winter. Inspect burner, heat exchanger, and safety controls.',
            assetId: hvacId,
            priority: 'medium',
            intervalType: 'time',
            intervalDays: 365,
            nextDueDate: '2024-10-15',
            isActive: true,
            intervalNotes: 'Required by service contract'
        })

        await client.models.MaintenanceTask.create({
            taskName: 'Replace Air Filter',
            description: 'Replace 20x25x1 filters',
            assetId: hvacId,
            priority: 'high',
            intervalType: 'time',
            intervalDays: 90,
            nextDueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0], // Overdue
            isOverdue: true,
            isActive: true
        })

        // House General
        await client.models.MaintenanceTask.create({
            taskName: 'Clean Gutters',
            description: 'Clear leaves and debris',
            assetId: houseId,
            priority: 'medium',
            intervalType: 'time',
            intervalDays: 180,
            nextDueDate: '2024-11-01',
            isActive: true
        })

        // Fridge Tasks
        await client.models.MaintenanceTask.create({
            taskName: 'Replace Water Filter',
            description: 'Samsung HAF-QIN filter',
            assetId: fridgeId,
            priority: 'medium',
            intervalType: 'time',
            intervalDays: 180,
            nextDueDate: '2024-05-25',
            isActive: true
        })

        // Espresso Tasks
        await client.models.MaintenanceTask.create({
            taskName: 'Descaling Cycle',
            description: 'Run descaling solution through machine',
            assetId: espressoId,
            priority: 'medium',
            intervalType: 'time',
            intervalDays: 90,
            nextDueDate: '2024-03-25',
            isActive: true
        })

        // Pool Tasks
        await client.models.MaintenanceTask.create({
            taskName: 'Clean Pump Basket',
            description: 'Remove debris from pump basket',
            assetId: pumpId,
            priority: 'medium',
            intervalType: 'time',
            intervalDays: 7,
            nextDueDate: new Date().toISOString().split('T')[0], // Due today
            isActive: true
        })

        await client.models.MaintenanceTask.create({
            taskName: 'Backwash Filter',
            description: 'Clean sand filter',
            assetId: pumpId,
            priority: 'medium',
            intervalType: 'usage',
            intervalNotes: 'When pressure rises 10psi',
            isActive: true
        })


        // --- 4. Create Warranties ---
        console.log('Creating warranties...')

        // Tesla Warranty
        await client.models.Warranty.create({
            warrantyName: 'Tesla New Vehicle Limited Warranty',
            warrantyType: 'manufacturer',
            provider: 'Tesla',
            assetId: teslaId,
            startDate: '2023-06-15',
            endDate: '2027-06-15',
            isActive: true,
            coverageScope: 'Bumper-to-bumper'
        })

        // Camry Warranty
        await client.models.Warranty.create({
            warrantyName: 'Toyota Powertrain Warranty',
            warrantyType: 'manufacturer',
            provider: 'Toyota',
            assetId: camryId,
            startDate: '2023-01-10',
            endDate: '2028-01-10', // 5 years usually, but user asked for 100k miles emphasis
            isActive: true,
            coverageScope: 'Engine, transmission, transaxle, front-wheel-drive system, rear-wheel-drive. Limit: 100,000 miles.'
        })

        await client.models.Warranty.create({
            warrantyName: 'Toyota Hybrid Battery Warranty',
            warrantyType: 'manufacturer',
            provider: 'Toyota',
            assetId: camryId,
            startDate: '2023-01-10',
            endDate: '2033-01-10', // 10 years
            isActive: true,
            coverageScope: 'Hybrid battery control module, hybrid control module, inverter with converter. Limit: 150,000 miles.'
        })


        // Fridge Warranty
        await client.models.Warranty.create({
            warrantyName: 'Samsung Manufacturer Warranty',
            warrantyType: 'manufacturer',
            provider: 'Samsung',
            assetId: fridgeId,
            startDate: '2022-11-25',
            endDate: '2023-11-25',
            isActive: false, // Expired
            coverageScope: 'Parts and labor'
        })

        // Fridge Compressor Warranty (10 years)
        await client.models.Warranty.create({
            warrantyName: 'Digital Inverter Compressor Warranty',
            warrantyType: 'manufacturer',
            provider: 'Samsung',
            assetId: fridgeId,
            startDate: '2022-11-25',
            endDate: '2032-11-25',
            isActive: true,
            coverageScope: 'Digital Inverter Compressor part only'
        })

        // Pool Pump Warranty
        await client.models.Warranty.create({
            warrantyName: 'Hayward Expert Line Warranty',
            warrantyType: 'manufacturer',
            provider: 'Hayward',
            assetId: pumpId,
            startDate: '2021-05-10',
            endDate: '2024-05-10',
            isActive: true,
            coverageScope: 'Full unit replacement'
        })


        // --- 5. Create Service Contracts ---
        console.log('Creating service contracts...')

        // HVAC Service Contract
        const hvacContract = await client.models.ServiceContract.create({
            contractName: 'HVAC Comfort Club',
            contractType: 'maintenance_plan',
            provider: 'Climate Control Experts',
            contractNumber: 'CCE-2024-88',
            assetId: hvacId,
            startDate: '2024-01-01',
            endDate: '2024-12-31',
            isActive: true,
            annualCost: 189.00,
            autoRenew: true,
            coverageScope: 'Includes 2 seasonal tune-ups (Spring/Fall). Priority scheduling.',
            notes: '20% discount on all repair labor.'
        })

        // Link HVAC tasks to contract if schema allows (ContractRequirement)
        if (springCheckup.data && hvacContract.data) {
            await client.models.ContractRequirement.create({
                contractId: hvacContract.data.id,
                maintenanceTaskId: springCheckup.data.id,
                isRequired: true,
                requirementDescription: 'Spring Tune-up (Included in plan)'
            })
        }
        if (fallCheckup.data && hvacContract.data) {
            await client.models.ContractRequirement.create({
                contractId: hvacContract.data.id,
                maintenanceTaskId: fallCheckup.data.id,
                isRequired: true,
                requirementDescription: 'Fall Tune-up (Included in plan)'
            })
        }

        // Home Warranty (Covers house, appliances, pool)
        await client.models.ServiceContract.create({
            contractName: 'Total Home Protection',
            contractType: 'home_warranty',
            provider: 'American Home Shield',
            contractNumber: 'AHS-998877',
            assetId: houseId, // Linked to house, but covers others implicitly or explicitly
            startDate: '2024-01-01',
            endDate: '2025-01-01',
            isActive: true,
            annualCost: 650.00,
            deductible: 75.00,
            coverageScope: 'HVAC, Plumbing, Electrical, Appliances (Fridge, Oven, Dishwasher)',
            notes: 'Call 1-800-XXX-XXXX for service'
        })

        // Tesla Extended Service
        await client.models.ServiceContract.create({
            contractName: 'Tesla ESA',
            contractType: 'extended_warranty',
            provider: 'Tesla',
            assetId: teslaId,
            startDate: '2027-06-16',
            endDate: '2029-06-15',
            isActive: false, // Future
            annualCost: 2000.00,
            coverageScope: 'Extension of Basic Vehicle Warranty'
        })

        // AAA Subscription
        const expiringDate = new Date()
        expiringDate.setDate(expiringDate.getDate() + 25)

        await client.models.ServiceContract.create({
            contractName: 'Vehicle Roadside Assistance',
            contractType: 'subscription',
            provider: 'AAA Premium',
            contractNumber: 'AAA-2024-12345',
            assetId: teslaId,
            startDate: '2024-02-07',
            endDate: expiringDate.toISOString().split('T')[0],
            isActive: true,
            monthlyPayment: 12.99,
            annualCost: 155.88,
            autoRenew: false,
            coverageScope: 'Towing, battery, flat tire'
        })

        // --- 6. Create Documents ---
        console.log('Creating documents...')
        await client.models.Document.create({
            title: 'Tesla Model Y Owner\'s Manual',
            documentType: 'manual',
            assetId: teslaId,
            fileUrl: 'https://www.tesla.com/ownersmanual/modely/en_us/',
            description: 'Digital owner\'s manual',
            uploadDate: new Date().toISOString()
        })

        console.log('✅ Database seeded successfully!')
        return { success: true, count: 'Created comprehensive sample data.' }
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

        // 2. Delete Service Records
        console.log('Deleting service records...')
        const serviceRecords = await client.models.ServiceRecord.list({})
        for (const record of serviceRecords.data) {
            await client.models.ServiceRecord.delete({ id: record.id })
            totalDeleted++
        }

        // 3. Delete Maintenance Tasks
        console.log('Deleting maintenance tasks...')
        const tasks = await client.models.MaintenanceTask.list({})
        for (const task of tasks.data) {
            await client.models.MaintenanceTask.delete({ id: task.id })
            totalDeleted++
        }

        // 4. Delete Warranty Claims
        console.log('Deleting warranty claims...')
        const claims = await client.models.WarrantyClaim.list({})
        for (const claim of claims.data) {
            await client.models.WarrantyClaim.delete({ id: claim.id })
            totalDeleted++
        }

        // 5. Delete Warranty Requirements
        console.log('Deleting warranty requirements...')
        const requirements = await client.models.WarrantyRequirement.list({})
        for (const req of requirements.data) {
            await client.models.WarrantyRequirement.delete({ id: req.id })
            totalDeleted++
        }

        // 6. Delete Asset Warranties (junction table)
        console.log('Deleting asset warranties...')
        const assetWarranties = await client.models.AssetWarranty.list({})
        for (const aw of assetWarranties.data) {
            await client.models.AssetWarranty.delete({ id: aw.id })
            totalDeleted++
        }

        // 7. Delete Warranties
        console.log('Deleting warranties...')
        const warranties = await client.models.Warranty.list({})
        for (const warranty of warranties.data) {
            await client.models.Warranty.delete({ id: warranty.id })
            totalDeleted++
        }

        // 8. Delete Asset Contracts (junction table)
        console.log('Deleting asset contracts...')
        const assetContracts = await client.models.AssetContract.list({})
        for (const ac of assetContracts.data) {
            await client.models.AssetContract.delete({ id: ac.id })
            totalDeleted++
        }

        // 9. Delete Service Contracts
        console.log('Deleting service contracts...')
        const contracts = await client.models.ServiceContract.list({})
        for (const contract of contracts.data) {
            await client.models.ServiceContract.delete({ id: contract.id })
            totalDeleted++
        }

        // 10. Delete Contract Requirements
        console.log('Deleting contract requirements...')
        const contractReqs = await client.models.ContractRequirement.list({})
        for (const req of contractReqs.data) {
            await client.models.ContractRequirement.delete({ id: req.id })
            totalDeleted++
        }

        // 11. Delete Asset Group Memberships (junction table)
        console.log('Deleting asset group memberships...')
        const memberships = await client.models.AssetGroupMembership.list({})
        for (const membership of memberships.data) {
            await client.models.AssetGroupMembership.delete({ id: membership.id })
            totalDeleted++
        }

        // 12. Delete Assets
        console.log('Deleting assets...')
        const assets = await client.models.Asset.list({})
        for (const asset of assets.data) {
            await client.models.Asset.delete({ id: asset.id })
            totalDeleted++
        }

        // 13. Delete Asset Groups
        console.log('Deleting asset groups...')
        const groups = await client.models.AssetGroup.list({})
        for (const group of groups.data) {
            await client.models.AssetGroup.delete({ id: group.id })
            totalDeleted++
        }

        // 14. Delete Reminders
        console.log('Deleting reminders...')
        const reminders = await client.models.Reminder.list({})
        for (const reminder of reminders.data) {
            await client.models.Reminder.delete({ id: reminder.id })
            totalDeleted++
        }

        console.log(`✅ Database cleanup complete! Deleted ${totalDeleted} total records.`)
        return { success: true, count: totalDeleted, message: `Deleted ${totalDeleted} records` }
    } catch (error) {
        console.error('❌ Error deleting data:', error)
        throw error
    }
}
