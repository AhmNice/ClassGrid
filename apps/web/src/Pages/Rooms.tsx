import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { School } from "lucide-react";
import AddRoomModal, {
  type RoomCreateData,
  type RoomUpdateData,
} from "../components/modal/AddRoomModal";
import TitleCard from "../components/TitleCard";
import type { IRoom, RoomFilterState } from "../interface/room.interface";
import MainLayout from "../layout/MainLayout";
import { useAuthStore } from "../store/auth.store";
import RoomFilters from "../components/room/RoomFilters";
import {
  DEFAULT_ROOM_FILTERS,
  filterRooms,
  hasActiveFilters,
} from "../utils/room.filters";
import { ROOM_TYPE_LABELS } from "../types/roomTypes";
import RoomFiltersSkeleton from "../components/Loader/RoomFiltersSkeleton";
import { useRoomStore } from "../store/room.store";
import ConfirmModal from "../components/modal/ConfirmModal";
import { schoolName } from "../utils/general";

const TH = "px-space-md py-space-sm text-left text-xs font-medium";
const TD = "px-space-md py-space-sm align-middle";

const Rooms = () => {
  // `null` = closed. `{}` = adding. `{ room }` = editing that room.
  const [modal, setModal] = useState<{ room?: IRoom } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ room: IRoom } | null>(
    null,
  );

  const schoolId = useAuthStore((state) => state.user?.schoolId) ?? null;

  // Loading and error come from the store, so there is one source of truth.
  const isFetching = useRoomStore((s) => s.loading);
  const error = useRoomStore((s) => s.error);
  const rooms = useRoomStore((s) => s.rooms);
  const getRooms = useRoomStore((s) => s.getRooms);
  const createRoom = useRoomStore((s) => s.createRoom);
  const updateRoom = useRoomStore((s) => s.updateRoom);
  const deleteRoom = useRoomStore((s) => s.deleteRoom);

  // True once the first fetch has finished, so we don't flash "No rooms yet".
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!schoolId) return;

    let cancelled = false;
    setTimeout(() => setLoaded(false), 0);
    getRooms().finally(() => {
      if (!cancelled) setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [schoolId, getRooms]);

  // Only show the skeleton on the first load (or an empty refetch); later
  // refetches keep showing stale data so the table doesn't flash.
  const showSkeleton = !loaded || (isFetching && rooms.length === 0);

  const [filters, setFilters] = useState<RoomFilterState>(DEFAULT_ROOM_FILTERS);

  // `.slice()` guards against `filterRooms` returning `rooms` directly.
  const visible = filterRooms(rooms, filters)
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  // Creating sends the whole room; editing sends only the fields that changed.
  // A failed result goes back to the modal, which shows field errors inline.
  const handleSaveRoom = async (data: RoomCreateData | RoomUpdateData) => {
    const editing = modal?.room;

    const result = editing
      ? await updateRoom(editing.id, data as RoomUpdateData)
      : await createRoom(data as RoomCreateData);

    if (!result.success) {
      return {
        success: false,
        message: result.message,
        errors: result.errors,
      };
    }

    toast.success(result.message || (editing ? "Room updated" : "Room added"));
    return result;
  };

  const handleDeleteRoom = async () => {
    if (!itemToDelete) return;
    const { room } = itemToDelete;
    setItemToDelete(null);

    const result = await deleteRoom(room.id);
    if (result.success) {
      toast.success(result.message || "Room deleted");
    } else {
      toast.error(result.message || "Could not delete the room");
    }
  };

  return (
    <MainLayout>
      <section className="flex flex-col gap-3">
        <TitleCard
          title="Rooms & Physical Facilities Directory"
          description={`Manage classrooms, specialized laboratories, capacity thresholds, installed scientific equipment, and strict spatial collision parameters for ${schoolName}.`}
          actionLabel="Add new Room"
          secondaryAction={null}
          onButtonClick={() => setModal({})}
        />

        {showSkeleton ? (
          <RoomFiltersSkeleton />
        ) : (
          <RoomFilters filters={filters} rooms={rooms} onChange={setFilters} />
        )}

        {modal && schoolId && (
          <AddRoomModal
            key={modal.room?.id ?? "new"}
            schoolId={schoolId}
            room={modal.room}
            onClose={() => setModal(null)}
            onSubmit={handleSaveRoom}
          />
        )}

        {itemToDelete && (
          <ConfirmModal
            title="Delete room?"
            message={`This will permanently remove "${itemToDelete.room.name}". This cannot be undone.`}
            confirmLabel="Delete"
            destructive
            onConfirm={handleDeleteRoom}
            onClose={() => setItemToDelete(null)}
          />
        )}

        {/* Render Skeleton while Loading */}
        {showSkeleton ? (
          <div className="overflow-x-auto rounded-sm border border-outline-variant/40 bg-surface">
            <table className="w-full table-auto text-left text-sm border-collapse">
              <caption className="sr-only">Rooms loading</caption>
              <thead className="bg-surface-container text-on-surface-variant">
                <tr>
                  <th scope="col" className={TH}>
                    Room
                  </th>
                  <th scope="col" className={TH}>
                    Type
                  </th>
                  <th scope="col" className={TH}>
                    Capacity
                  </th>
                  <th scope="col" className={TH}>
                    Status
                  </th>
                  <th scope="col" className={`${TH} text-right`}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className={TD}>
                      <div className="h-4 w-32 rounded-sm bg-surface-container-high" />
                    </td>
                    <td className={TD}>
                      <div className="h-4 w-24 rounded-sm bg-surface-container-high" />
                    </td>
                    <td className={TD}>
                      <div className="h-4 w-12 rounded-sm bg-surface-container-high" />
                    </td>
                    <td className={TD}>
                      <div className="h-6 w-16 rounded-full bg-surface-container-high" />
                    </td>
                    <td className={TD}>
                      <div className="flex justify-end gap-2">
                        <div className="h-8 w-14 rounded-sm bg-surface-container-high" />
                        <div className="h-8 w-16 rounded-sm bg-surface-container-high" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : error && rooms.length === 0 ? (
          /* LOAD ERROR */
          <div
            role="alert"
            className="flex flex-col items-center justify-center rounded-sm border border-dashed border-outline-variant bg-surface px-4 py-16 text-center"
          >
            <p className="mb-4 text-sm text-on-surface-variant">{error}</p>
            <button
              type="button"
              onClick={() => getRooms()}
              className="cursor-pointer rounded-sm border border-outline-variant px-space-md py-space-sm text-sm font-medium text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Try again
            </button>
          </div>
        ) : visible.length > 0 ? (
          /* Normal Room List */
          <div className="overflow-x-auto rounded-sm border border-outline-variant/40 bg-surface">
            <table className="w-full table-auto text-left text-sm border-collapse">
              <caption className="sr-only">Rooms</caption>
              <thead className="bg-surface-container text-on-surface-variant">
                <tr>
                  <th scope="col" className={TH}>
                    Room
                  </th>
                  <th scope="col" className={TH}>
                    Type
                  </th>
                  <th scope="col" className={TH}>
                    Capacity
                  </th>
                  <th scope="col" className={TH}>
                    Status
                  </th>
                  <th scope="col" className={`${TH} text-right`}>
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline-variant/40">
                {visible.map((room) => (
                  <tr
                    key={room.id}
                    className="transition-colors hover:bg-surface-container-low motion-reduce:transition-none"
                  >
                    <th
                      scope="row"
                      className={[
                        TD,
                        "text-left font-medium",
                        room.isActive
                          ? "text-on-surface"
                          : "text-on-surface-variant",
                      ].join(" ")}
                    >
                      {room.name}
                    </th>
                    <td className={`${TD} text-on-surface`}>
                      {ROOM_TYPE_LABELS[room.type]}
                    </td>
                    <td className={`${TD} font-mono text-on-surface`}>
                      {room.capacity ?? (
                        <span
                          className="text-on-surface-variant"
                          title="No fixed capacity"
                        >
                          —<span className="sr-only">No fixed capacity</span>
                        </span>
                      )}
                    </td>
                    <td className={TD}>
                      <span
                        className={[
                          "rounded-full px-space-sm py-space-xs text-xs font-medium",
                          room.isActive
                            ? "bg-success-container text-on-success-container"
                            : "bg-surface-container text-on-surface-variant",
                        ].join(" ")}
                      >
                        {room.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={TD}>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setModal({ room })}
                          aria-label={`Edit ${room.name}`}
                          className="cursor-pointer rounded-sm border border-outline-variant px-space-md py-space-xs text-sm font-medium text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete({ room })}
                          aria-label={`Delete ${room.name}`}
                          className="cursor-pointer rounded-sm bg-error-container px-space-md py-space-xs text-sm font-medium text-on-error-container transition-colors hover:bg-error-container/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-reduce:transition-none"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center rounded-sm border border-outline-variant/40 bg-surface px-4 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container text-on-surface-variant mb-4">
              <School size={24} aria-hidden="true" />
            </div>
            <h3 className="text-sm font-medium text-on-surface mb-1">
              {hasActiveFilters(filters)
                ? "No rooms match your filters"
                : "No rooms added yet"}
            </h3>
            <p className="text-sm text-on-surface-variant max-w-sm mb-6">
              {hasActiveFilters(filters)
                ? "Try adjusting your search query or filter criteria to find what you're looking for."
                : "Get started by adding your first classroom, lab, or facility to the directory."}
            </p>
            {hasActiveFilters(filters) ? (
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_ROOM_FILTERS)}
                className="cursor-pointer rounded-sm border border-outline-variant px-space-md py-space-sm text-sm font-medium text-on-surface transition-colors hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Clear filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setModal({})}
                className="cursor-pointer rounded-sm bg-primary px-space-md py-space-sm text-sm font-medium text-on-primary transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Add new Room
              </button>
            )}
          </div>
        )}
      </section>
    </MainLayout>
  );
};

export default Rooms;
