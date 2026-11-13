import { Prisma } from "@/generated/prisma/client.js";
import { prisma } from "@/lib/prisma.js";
import type { IPaginatedResult } from "@/types/pagination.js";
import type {
  IRoom,
  IRoomCreate,
  IRoomListQuery,
  IRoomTimetableQuery,
  IRoomUpdate,
} from "./room.interface.js";

export interface IRoomRepo {
  createRoom(data: IRoomCreate): Promise<IRoom>;
  findDuplicate(
    schoolId: string,
    name: string,
    excludeId?: string,
  ): Promise<IRoom | null>;
  getRooms(query: IRoomListQuery): Promise<IPaginatedResult<IRoom>>;
  getRoomById(id: string): Promise<IRoom | null>;
  updateRoom(id: string, data: IRoomUpdate): Promise<IRoom | null>;
  deleteRoom(id: string): Promise<boolean>;
  getRoomTimetable(
    roomId: string,
    query: IRoomTimetableQuery,
  ): Promise<unknown[]>;
}

const isNotFound = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2025";

export class RoomRepo implements IRoomRepo {
  async createRoom(data: IRoomCreate): Promise<IRoom> {
    return await prisma.room.create({ data });
  }

  async findDuplicate(
    schoolId: string,
    name: string,
    excludeId?: string,
  ): Promise<IRoom | null> {
    return await prisma.room.findFirst({
      where: {
        schoolId,
        name: { equals: name, mode: "insensitive" },
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    });
  }

  async getRooms(query: IRoomListQuery): Promise<IPaginatedResult<IRoom>> {
    const search = query.query?.trim();
    const where: Prisma.RoomWhereInput = {
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
        orderBy: { [query.sortBy as string]: query.sortOrder },
      }),
      prisma.room.count({ where }),
    ]);
    return { items, total, page: query.page, limit: query.limit };
  }

  async getRoomById(id: string): Promise<IRoom | null> {
    return await prisma.room.findUnique({ where: { id } });
  }

  async updateRoom(id: string, data: IRoomUpdate): Promise<IRoom | null> {
    try {
      return await prisma.room.update({ where: { id }, data });
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  }

  async deleteRoom(id: string): Promise<boolean> {
    try {
      await prisma.room.delete({ where: { id } });
      return true;
    } catch (error) {
      if (isNotFound(error)) return false;
      throw error;
    }
  }
  async getRoomTimetable(
    roomId: string,
    query: IRoomTimetableQuery,
  ): Promise<unknown[]> {
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
