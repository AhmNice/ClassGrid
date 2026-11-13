import { create } from "zustand";
import type { IRoom, IRoomCreate } from "../interface/room.interface";
import { handleRequest } from "../lib/request";
import api from "../lib/axios";

interface RoomState {
  rooms: IRoom[];
  loading: boolean;
  error: string | null;
}

interface RoomResponse<T = IRoom | IRoom[] | null> {
  success: boolean;
  message: string;
  data?: T | null;
  errors?: Array<{ field: string; message: string }>;
}

type RoomUpdate = Partial<IRoomCreate>;

interface RoomActions {
  createRoom: (payload: IRoomCreate) => Promise<RoomResponse<IRoom>>;
  getRooms: () => Promise<RoomResponse<IRoom[]>>;
  updateRoom: (roomId: string, payload: RoomUpdate) => Promise<RoomResponse<IRoom>>;
  deleteRoom: (roomId: string) => Promise<RoomResponse<null>>;
}

/** A room as the API sends it: JSON has no Date type, so dates are strings. */
type RawRoom = Omit<IRoom, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

const toRoom = (raw: RawRoom): IRoom => ({
  ...raw,
  createdAt: new Date(raw.createdAt ?? Date.now()),
  updatedAt: new Date(raw.updatedAt ?? raw.createdAt ?? Date.now()),
});

const FETCH_ERROR = "Could not load rooms. Try again.";
const CREATE_ERROR = "Could not add the room. Try again.";
const UPDATE_ERROR = "Could not update the room. Try again.";
const DELETE_ERROR = "Could not delete the room. Try again.";

/**
 * Pull a user-facing error message + field errors out of an Axios error,
 * preferring the API's message over the technical JS/Axios one.
 */
const resolveError = (
  error: any,
  fallback: string,
): { message: string; errors?: Array<{ field: string; message: string }> } => {
  const body = error?.response?.data;
  return {
    message: body?.message ?? fallback,
    errors: body?.errors,
  };
};

const initialState: RoomState = {
  rooms: [],
  loading: false,
  error: null,
};

export const useRoomStore = create<RoomState & RoomActions>((set) => ({
  ...initialState,

  getRooms: async () => {
    const result: RoomResponse<IRoom[]> = { success: false, message: "" };
    set({ loading: true, error: null });

    await handleRequest({
      request: () => api.get("/rooms"),
      onSuccess: (response) => {
        // Never let a missing or odd `data` put a non-array into the store.
        const raw = Array.isArray(response.data) ? (response.data as RawRoom[]) : [];
        const rooms = raw.map(toRoom);

        set({ rooms, loading: false, error: null });
        result.success = true;
        result.message = (response.message as string) ?? "";
        result.data = rooms;
      },
      onError: (error) => {
        const { message } = resolveError(error, FETCH_ERROR);
        set({ error: message, loading: false });
        result.success = false;
        result.message = message;
      },
      showToast: false,
    });

    return result;
  },

  createRoom: async (payload: IRoomCreate) => {
    const result: RoomResponse<IRoom> = { success: false, message: CREATE_ERROR };

    await handleRequest<RawRoom>({
      request: () => api.post("/rooms", payload),
      onSuccess: (response) => {
        if (!response.data) {
          result.message = CREATE_ERROR;
          return;
        }

        const room = toRoom(response.data);
        // Clear any stale fetch/create error when we succeed.
        set((state) => ({ rooms: [...state.rooms, room], error: null }));
        result.success = true;
        result.message = response.message ?? "Room added";
        result.data = room;
      },
      onError: (error) => {
        const { message, errors } = resolveError(error, CREATE_ERROR);
        result.success = false;
        result.message = message;
        result.errors = errors;
      },
      showToast: false,
    });

    return result;
  },

  updateRoom: async (roomId: string, payload: RoomUpdate) => {
    const result: RoomResponse<IRoom> = { success: false, message: UPDATE_ERROR };

    await handleRequest<RawRoom>({
      request: () => api.patch(`/rooms/${roomId}`, payload),
      onSuccess: (response) => {
        if (!response.data) {
          result.message = UPDATE_ERROR;
          return;
        }

        const room = toRoom(response.data);
        // Replace the matching room in-place rather than append.
        set((state) => ({
          rooms: state.rooms.map((r) => (r.id === room.id ? room : r)),
          error: null,
        }));
        result.success = true;
        result.message = response.message ?? "Room updated";
        result.data = room;
      },
      onError: (error) => {
        const { message, errors } = resolveError(error, UPDATE_ERROR);
        result.success = false;
        result.message = message;
        result.errors = errors;
      },
      showToast: false,
    });

    return result;
  },

  deleteRoom: async (roomId: string) => {
    const result: RoomResponse<null> = { success: false, message: DELETE_ERROR };

    await handleRequest({
      request: () => api.delete(`/rooms/${roomId}`),
      onSuccess: (response) => {
        // A delete response usually has no data, so don't require any. The
        // room is removed from the list, not replaced.
        set((state) => ({
          rooms: state.rooms.filter((r) => r.id !== roomId),
          error: null,
        }));
        result.success = true;
        result.message = (response.message as string) ?? "Room deleted";
      },
      onError: (error) => {
        const { message } = resolveError(error, DELETE_ERROR);
        result.success = false;
        result.message = message;
      },
      showToast: false,
    });

    return result;
  },
}));