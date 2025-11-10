import { PrismaClient, Plan, Role, SubscriberStatus } from '@prisma/client';
import { SUBSCRIBERS_DATA, STAFF_USERS_DATA } from './mockData';
import { Subscriber, StaffUser, SubscriberStatus as FrontendSubscriberStatus, Role as FrontendRole } from './types';
import { hash } from 'argon2';

const prisma = new PrismaClient();

// --- Data Mapping Utilities ---
const planMap: { [key: string]: Plan } = {
    '1m': Plan.ONE_MONTH,
    '3m': Plan.THREE_MONTHS,
    '6m': Plan.SIX_MONTHS,
    '12m': Plan.ONE_YEAR,
};

// Map from frontend string enum (e.g., "Admin") to Prisma enum (e.g., Role.ADMIN)
const roleMap: { [key in FrontendRole]: Role } = {
    [FrontendRole.Admin]: Role.ADMIN,
    [FrontendRole.Support]: Role.SUPPORT,
};

// Add map for SubscriberStatus
const statusMap: { [key in FrontendSubscriberStatus]: SubscriberStatus } = {
    [FrontendSubscriberStatus.Active]: SubscriberStatus.ACTIVE,
    [FrontendSubscriberStatus.Expiring]: SubscriberStatus.EXPIRING,
    [FrontendSubscriberStatus.Expired]: SubscriberStatus.EXPIRED,
    [FrontendSubscriberStatus.Cancelled]: SubscriberStatus.CANCELLED,
    [FrontendSubscriberStatus.Trial]: SubscriberStatus.TRIAL,
};


async function main() {
    console.log(`Start seeding ...`);

    // --- Seed Staff Users ---
    for (const user of STAFF_USERS_DATA) {
        const staffUser = user as StaffUser; // Ensure type

        // Hash the password using argon2
        const hashedPassword = await hash('password_placeholder_123');

        const dbUser = await prisma.user.upsert({
            where: { email: staffUser.email },
            update: {
                name: staffUser.name,
                role: roleMap[staffUser.role] || Role.SUPPORT,
                avatar: staffUser.avatar,
                password: hashedPassword,
            },
            create: {
                id: staffUser.id,
                email: staffUser.email,
                name: staffUser.name,
                password: hashedPassword,
                role: roleMap[staffUser.role] || Role.SUPPORT,
                avatar: staffUser.avatar,
            },
        });
        console.log(`Created or updated user: ${dbUser.name} (ID: ${dbUser.id})`);
    }

    // Get the first admin user to assign as creator for subscribers
    const adminUser = await prisma.user.findFirst({
        where: { role: Role.ADMIN },
    });

    if (!adminUser) {
        console.error("Could not find an admin user to assign subscribers to. Aborting subscriber seed.");
        return;
    }

    // --- Seed Subscribers ---
    for (const sub of SUBSCRIBERS_DATA) {
        const subscriber = sub as Subscriber;
        const dbSub = await prisma.subscriber.upsert({
            where: { email: subscriber.email },
            update: {
                fullName: subscriber.fullName,
                phoneNumber: subscriber.phoneNumber,
                plan: planMap[subscriber.plan] || Plan.ONE_MONTH,
                startDate: new Date(subscriber.startDate),
                endDate: new Date(subscriber.endDate),
                status: statusMap[subscriber.status] || SubscriberStatus.CANCELLED,
                notes: subscriber.notes,
            },
            create: {
                id: subscriber.id,
                fullName: subscriber.fullName,
                email: subscriber.email,
                phoneNumber: subscriber.phoneNumber,
                plan: planMap[subscriber.plan] || Plan.ONE_MONTH,
                startDate: new Date(subscriber.startDate),
                endDate: new Date(subscriber.endDate),
                status: statusMap[subscriber.status] || SubscriberStatus.CANCELLED,
                notes: subscriber.notes,
                createdById: adminUser.id,
            },
        });
        console.log(`Created or updated subscriber: ${dbSub.fullName} (ID: ${dbSub.id})`);
    }

    console.log(`Seeding finished.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
