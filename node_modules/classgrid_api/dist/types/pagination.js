export const normalizeListQuery = (query = {}) => ({
    query: query.query?.trim() || undefined,
    page: query.page ?? 1,
    limit: Math.min(query.limit ?? 20, 100),
    sortBy: query.sortBy ?? "name",
    sortOrder: query.sortOrder ?? "asc",
});
