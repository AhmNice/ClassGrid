import { prisma } from "@/lib/prisma.js";
import bcrypt from "bcrypt";
/**
 * One-time setup for a school deployment. Run it once after the migrations:
 *
 *   SCHOOL_NAME="St. Jude College" SCHOOL_ADMIN_EMAIL=head@school.com \
 *   npx tsx scripts/create-school.ts
 *
 * Optional: SCHOOL_ADDRESS, SCHOOL_PHONE, SCHOOL_EMAIL
 */
const DEFAULT_WORKING_DAYS = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
];
async function main() {
    const name = process.env.SCHOOL_NAME?.trim();
    const adminEmail = process.env.SCHOOL_ADMIN_EMAIL?.trim().toLowerCase();
    if (!name || !adminEmail) {
        throw new Error("SCHOOL_NAME and SCHOOL_ADMIN_EMAIL are required.");
    }
    // One school per deployment. If it exists, leave it alone so a re-run can
    // never overwrite what the admin has changed in the app.
    if ((await prisma.school.count()) > 0) {
        console.log("A school already exists. Nothing to do.");
        return;
    }
    const defaultPasswordHash = await bcrypt.hash(process.env.ADMIN_DEFAULT_PASSWORD ?? "Admin@123", 12);
    // The school and its admin are created together or not at all.
    const school = await prisma.$transaction(async (tx) => {
        const created = await tx.school.create({
            data: {
                name,
                address: process.env.SCHOOL_ADDRESS ?? null,
                phone: process.env.SCHOOL_PHONE ?? null,
                email: process.env.SCHOOL_EMAIL ?? null,
                workingDays: DEFAULT_WORKING_DAYS,
            },
        });
        await tx.user.create({
            data: {
                firstName: "Admin",
                lastName: "User",
                email: adminEmail,
                role: "ADMIN",
                schoolId: created.id,
                passwordHash: defaultPasswordHash,
            },
        });
        return created;
    });
    console.log(`Created "${school.name}" (${school.id}) with admin ${adminEmail}.`);
    console.log("Next: send the admin a set-password link.");
}
main()
    .catch((error) => {
    console.error("Failed to create school:", error);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma.$disconnect();
});
