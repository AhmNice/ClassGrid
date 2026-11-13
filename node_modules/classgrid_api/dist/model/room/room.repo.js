import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
const isNotFound = (error) => error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025";
export class RoomRepo {
    async createRoom(data) {
        return await prisma.room.create({ data });
    }
    async findDuplicate(schoolId, name, excludeId) {
        return await prisma.room.findFirst({
            where: {
                schoolId,
                name: { equals: name, mode: "insensitive" },
                ...(excludeId ? { NOT: { id: excludeId } } : {}),
            },
        });
    }
    async getRooms(query) {
        const search = query.query?.trim();
        const where = {
            schoolId: query.schoolId,
            ...(query.isActive === undefined ? {} : { isActive: query.isActive }),
            ...(query.type === undefined ? {} : { type: query.type }),
            ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
        };
        const [items, total] = await prisma.$transaction([
            prisma.room.findMany({
                where,
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                orderBy: { [query.sortBy]: query.sortOrder },
            }),
            prisma.room.count({ where }),
        ]);
        return { items, total, page: query.page, limit: query.limit };
    }
    async getRoomById(id) {
        return await prisma.room.findUnique({ where: { id } });
    }
    async updateRoom(id, data) {
        try {
            return await prisma.room.update({ where: { id }, data });
        }
        catch (error) {
            if (isNotFound(error))
                return null;
            throw error;
        }
    }
    async deleteRoom(id) {
        try {
            await prisma.room.delete({ where: { id } });
            return true;
        }
        catch (error) {
            if (isNotFound(error))
                return false;
            throw error;
        }
    }
    async getRoomTimetable(roomId, query) {
        return await prisma.timetableEntry.findMany({
            where: {
                roomId,
                timetable: {
                    ...(query.timetableId
                        ? { id: query.timetableId }
                        : { termId: query.termId, status: "PUBLISHED" }),
                },
            },
            include: {
                period: true,
                timetable: true,
                assignment: {
                    include: {
                        teacher: true,
                        subject: true,
                        classArm: {
                            include: { classLevel: true },
                        },
                    },
                },
            },
            orderBy: [{ dayOfWeek: "asc" }, { period: { sequence: "asc" } }],
        });
    }
}
export const roomRepo = new RoomRepo();
