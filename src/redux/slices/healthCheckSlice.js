import { createSlice } from "@reduxjs/toolkit";
import { fetchHealthResults } from "../thunks/healthCheckThunk";

const initialState = {
    rows: [],
    pagination: {page: 1, limit: 5, totalPages: 1, totalResult: 0},
    isLoading: false,
    error: null,
    lastQuery: {page: 1}
}


const healthCheckSlice = createSlice({
    name: 'healthCheck',
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchHealthResults.pending, (state, action) => {
            state.isLoading = true
            state.error = null
        })
        .addCase(fetchHealthResults.fulfilled, (state, action)=> {
            state.isLoading = false
            const meta = action?.payload.metadata || {}
            state.rows = meta.results || []
            state.pagination = meta.pagination || state.pagination
        })
        .addCase(fetchHealthResults.rejected, (state, action) => {
            state.isLoading = false
            state.error = action.payload?.message || "Fetch failed"
            state.rows = []
        })
    }
})


export default healthCheckSlice.reducer