
export const selectHealthRows = (state) => state.healthCheck.rows
export const selectHealthLoading = (state) => state.healthCheck.isLoading;
export const selectHealthPagination = (state) => state.healthCheck.pagination;
export const selectHealthError = (state) => state.healthCheck.error;