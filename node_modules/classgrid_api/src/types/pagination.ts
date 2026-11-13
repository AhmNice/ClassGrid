export interface IListQuery {
  query?: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface IPaginatedResult<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
}

export const normalizeListQuery = (
  query: Partial<IListQuery> = {},
): IListQuery => ({
  query: query.query?.trim() || undefined,
  page: query.page ?? 1,
  limit: Math.min(query.limit ?? 20, 100),
  sortBy: query.sortBy ?? "name",
  sortOrder: query.sortOrder ?? "asc",
});
