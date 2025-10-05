import { createSlice } from "@reduxjs/toolkit";
import { fetchNotification, markRead, deleteNotifi } from "../thunks/notificationThunk";
const initialState = {
    list: [],
    unread: 0,
    pagination: { totalResult: 0, page: 1, limit: 10, totalPages: 1, hasNext: false, hasPrev: false },
    filters: { read: 'all', sort: '-ctime' },
    status: 'idle',
    error: null,
    deleteStatus: 'idle',
    deleteErorr: null
};

function recalcPagination(pag) {
    const limit = pag.limit || 10;
    const totalPages = Math.max(1, Math.ceil((pag.totalPages || 0) / limit));
    const page = Math.min(pag.page || 1, totalPages);
    return {
        ...pag,
        page,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages
    }
}

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {
        pushRealTime(state, action) {
            const it = action.payload;
            if (!state.list.find(x => String(x._id) === String(it._id))) {
                state.list.unshift({ ...it, read: false });
                if (state.list.length > state.pagination.limit) state.list.pop();
                state.pagination.totalPages = (state.pagination.totalPages || 0) + 1;
                state.pagination = recalcPagination(state.pagination)
            }
            state.unread += 1
        },
        setFilters(state, action) {
            state.filters = { ...state.filters, ...action.payload };
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchNotification.pending, state => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchNotification.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.unread = action.payload.metadata.unread || 0;
                state.list = action.payload.metadata.results || [];
                state.pagination = action.payload.metadata.pagination || initialState.pagination;
            })
            .addCase(fetchNotification.rejected, (state, action) => {
                state.status = 'failed'; state.error = action.payload?.message || 'Error';
            })
            .addCase(markRead.fulfilled, (state, action) => {
                state.unread = action.payload.metadata.unread || 0;
                const ids = (action.meta.arg && Array.isArray(action.meta.arg)) ? action.meta.arg.map(String) : null
                state.list = state.list.map(it => ids ? (ids.includes(String(it._id)) ? { ...it, read: true } : it) : { ...it, read: true })
            })
            .addCase(deleteNotifi.pending, (state) => {
                state.deleteStatus = 'loading';
                state.deleteErorr = null;
            })
            .addCase(deleteNotifi.fulfilled, (state, action) => {
                state.deleteStatus = 'succeeded';
                const { id, option } = action.meta?.arg || {};

                if (option === 'all') {
                    state.list = [];
                    state.unread = 0;
                    state.pagination = recalcPagination({
                        ...state.pagination,
                        totalResult: 0,
                        page: 1,
                    });
                } else {
                    const idStr = String(id);
                    const removed = state.list.find(x => String(x._id) === idStr);
                    state.list = state.list.filter(x = String(removed._id) != idStr)
                    if (removed && removed.read === false && state.unread > 0) {
                        state.unread -= 1;
                    }
                    const nextTotal = Math.max(0, (state.pagination.totalPages || 0) - 1);
                    state.pagination = recalcPagination({
                        ...state.pagination,
                        totalResult: nextTotal
                    })
                }
                const unreadFromApi = action.payload?.metadata?.unread;
                if (typeof unreadFromApi === 'number') {
                    state.unread = unreadFromApi;
                }
            })
            .addCase(deleteNotifi.rejected, (state, action) => {
                state.deleteStatus = 'failed';
                state.deleteErorr = action.payload?.message || 'Delete error'
            })
    }
});


export const { pushRealTime, setFilters } = notificationSlice.actions;
export default notificationSlice.reducer;
