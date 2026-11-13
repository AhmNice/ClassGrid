import { academicSessionRepo, } from "./academic-session.repo.js";
import { ApiError } from "@/utils/errorHandler.js";
import { schoolRepo } from "@/model/school/school.repo.js";
import { formatSchoolDate, formatSchoolDateRange, getSchoolToday, getTermProgress, getTotalSchoolWeeks, toUtcDay, } from "@/utils/dateHelper.js";
/* --------------------------------- helpers -------------------------------- */
/** Strips any time part so dates are always plain calendar days (UTC). */
const normalizeDay = (value) => (value ? toUtcDay(value) : value);
const hasDates = (term) => Boolean(term.startDate && term.endDate);
/** Collects errors, keeping only the first one per field. */
const collectErrors = () => {
    const errors = [];
    return {
        errors,
        add(field, message) {
            if (!errors.some((e) => e.field === field))
                errors.push({ field, message });
        },
    };
};
export class AcademicSessionService {
    repo;
    schoolRepo;
    constructor(repo, schoolRepo) {
        this.repo = repo;
        this.schoolRepo = schoolRepo;
    }
    /* ------------------------------- validation ------------------------------ */
    validateDates(start, end) {
        if (start && end && start >= end) {
            throw new ApiError(422, "Invalid session dates", [
                { field: "endDate", message: "End date must be after the start date" },
            ]);
        }
    }
    requireName(name) {
        const trimmed = name.trim();
        if (!trimmed) {
            throw new ApiError(422, "Invalid session", [
                { field: "name", message: "Enter a session name" },
            ]);
        }
        return trimmed;
    }
    /** A session's dates must still cover all of its terms. */
    validateTermsWithinSession(sessionStart, sessionEnd, terms) {
        const { errors, add } = collectErrors();
        for (const term of terms) {
            const label = term.name || "a term";
            if (sessionStart && term.startDate && term.startDate < sessionStart) {
                add("startDate", `Can't start after ${label} begins (${formatSchoolDate(term.startDate)})`);
            }
            if (sessionEnd && term.endDate && term.endDate > sessionEnd) {
                add("endDate", `Can't end before ${label} ends (${formatSchoolDate(term.endDate)})`);
            }
        }
        if (errors.length > 0) {
            throw new ApiError(422, "Session dates don't cover its terms", errors);
        }
    }
    /** Names must be unique per school, and sessions can't overlap in time. */
    async assertNoConflicts(schoolId, candidate) {
        const others = (await this.getAcademicSessions(schoolId)).filter((s) => s.id !== candidate.excludeId);
        const { errors, add } = collectErrors();
        if (candidate.name !== undefined &&
            others.some((s) => s.name.toLowerCase() === candidate.name.toLowerCase())) {
            add("name", `A session named "${candidate.name}" already exists`);
        }
        if (candidate.startDate && candidate.endDate) {
            const clash = others.find((s) => s.startDate &&
                s.endDate &&
                candidate.startDate <= s.endDate &&
                candidate.endDate >= s.startDate);
            if (clash) {
                add("endDate", `Overlaps ${clash.name} (${formatSchoolDateRange(clash.startDate, clash.endDate)})`);
            }
        }
        if (errors.length > 0) {
            throw new ApiError(409, "This session conflicts with an existing one", errors);
        }
    }
    /**
     * The checks above can still lose a race with another request. The database
     * unique indexes catch that, and this turns the failure into a proper error.
     */
    mapDbError(error) {
        if (error?.code !== "P2002")
            return error;
        const target = JSON.stringify(error.meta?.target ?? "");
        if (target.includes("name")) {
            return new ApiError(409, "This session conflicts with an existing one", [
                { field: "name", message: "A session with this name already exists" },
            ]);
        }
        return new ApiError(409, "The current session was changed by someone else. Try again.");
    }
    /* --------------------------------- queries ------------------------------- */
    async getAcademicSessions(schoolId) {
        return await this.repo.getAcademicSessions(schoolId);
    }
    async getAcademicSessionById(schoolId, id) {
        const session = await this.repo.getAcademicSessionById(id);
        return session && session.schoolId === schoolId ? session : null;
    }
    async currentAcademicSession(schoolId) {
        const session = await this.repo.getCurrentAcademicSession(schoolId);
        if (!session)
            return null;
        const allTerms = await this.repo.getTerms(session.id);
        const terms = allTerms
            .filter(hasDates)
            .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        // The running term comes from the dates, not from a stored flag that
        // nothing updates when a term ends. If none is running, show the next one,
        // or the last one if they have all finished.
        const today = getSchoolToday().toDate();
        const focusTerm = terms.find((t) => t.startDate <= today && today <= t.endDate) ??
            terms.find((t) => t.startDate > today) ??
            terms[terms.length - 1] ??
            null;
        const progress = focusTerm
            ? getTermProgress(focusTerm.startDate, focusTerm.endDate, today)
            : { totalWeeks: 0, currentWeek: 0 };
        // Teaching weeks only: the holidays between terms don't count.
        const instructionalWeeks = terms.reduce((sum, t) => sum + getTotalSchoolWeeks(t.startDate, t.endDate), 0);
        return {
            id: session.id,
            sessionName: session.name,
            dateRange: session.startDate && session.endDate
                ? formatSchoolDateRange(session.startDate, session.endDate)
                : "Dates not set",
            instructionalWeeks,
            termCount: allTerms.length,
            termLabel: focusTerm?.name ?? "",
            currentWeek: progress.currentWeek,
            totalWeeks: progress.totalWeeks,
            startDate: session.startDate,
            endDate: session.endDate,
            // TODO: take these from the timetable module once it exists.
            clashes: 0,
            locked: false,
            terms: terms,
        };
    }
    /* -------------------------------- commands ------------------------------- */
    async createAcademicSession(schoolId, data) {
        const school = await this.schoolRepo.getSchoolById(schoolId);
        if (!school) {
            throw new ApiError(404, "School not found");
        }
        const name = this.requireName(data.name);
        const startDate = normalizeDay(data.startDate);
        const endDate = normalizeDay(data.endDate);
        this.validateDates(startDate, endDate);
        await this.assertNoConflicts(schoolId, { name, startDate, endDate });
        // With isCurrent: true the repo unsets the old current session in the
        // same transaction.
        try {
            return await this.repo.createAcademicSession({
                ...data,
                schoolId,
                name,
                startDate,
                endDate,
            });
        }
        catch (error) {
            throw this.mapDbError(error);
        }
    }
    async updateAcademicSession(schoolId, id, data) {
        const existing = await this.getAcademicSessionById(schoolId, id);
        if (!existing)
            return null;
        // isCurrent: true is passed on (the repo switches it atomically). Turning
        // it off on the current session is refused below.
        const { isCurrent, ...fields } = data;
        if (isCurrent === false && existing.isCurrent) {
            throw new ApiError(422, "A school needs a current session", [
                { field: "isCurrent", message: "Make another session current instead" },
            ]);
        }
        const name = fields.name !== undefined ? this.requireName(fields.name) : undefined;
        // Validate the resulting dates, not just the ones in the payload.
        const startDate = fields.startDate !== undefined
            ? normalizeDay(fields.startDate)
            : existing.startDate;
        const endDate = fields.endDate !== undefined
            ? normalizeDay(fields.endDate)
            : existing.endDate;
        this.validateDates(startDate, endDate);
        await this.assertNoConflicts(schoolId, {
            name,
            startDate,
            endDate,
            excludeId: id,
        });
        this.validateTermsWithinSession(startDate, endDate, await this.repo.getTerms(id));
        try {
            return await this.repo.updateAcademicSession(id, {
                ...fields,
                ...(name !== undefined && { name }),
                ...(fields.startDate !== undefined && { startDate }),
                ...(fields.endDate !== undefined && { endDate }),
                ...(isCurrent === true && { isCurrent: true }),
            });
        }
        catch (error) {
            throw this.mapDbError(error);
        }
    }
    async activateAcademicSession(schoolId, id) {
        const existing = await this.getAcademicSessionById(schoolId, id);
        if (!existing)
            return null;
        if (existing.isCurrent)
            return existing;
        return await this.repo.activateAcademicSession(id);
    }
    async deleteAcademicSession(schoolId, id) {
        const existing = await this.getAcademicSessionById(schoolId, id);
        if (!existing)
            return false;
        if (existing.isCurrent) {
            throw new ApiError(409, "Can't delete the current session. Make another session current first.");
        }
        const terms = await this.repo.getTerms(id);
        if (terms.length > 0) {
            throw new ApiError(409, `This session still has ${terms.length} term(s). Remove them before deleting the session.`);
        }
        return await this.repo.deleteAcademicSession(id);
    }
}
export const academicSessionService = new AcademicSessionService(academicSessionRepo, schoolRepo);
