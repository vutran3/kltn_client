import { createSlice } from "@reduxjs/toolkit";
import { getDevices, getMyDevices, getUnassignedDevices } from "../thunks/deviceThunk";

const LS_KEY = "selectedDeviceId";

// Đọc localStorage an toàn (tránh lỗi SSR hoặc private mode)
function readLS(key) {
    try {
        return typeof window !== "undefined" ? localStorage.getItem(key) : null;
    } catch {
        return null;
    }
}
function writeLS(key, val) {
    if (val) localStorage.setItem(key, val);
    else localStorage.removeItem(key);
}

const initialState = {
    items: [],
    unassigned: [],
    pagination: null,
    unassignedPagination: null,
    isLoading: false,
    error: null,
    selectedId: readLS(LS_KEY) || ""
};

const deviceSlice = createSlice({
    name: "device",
    initialState,
    reducers: {
        setSelectedDeviceId: (state, action) => {
            state.selectedId = action.payload || "";
            writeLS(LS_KEY, state.selectedId);
        },
        resetDevices: (state) => {
            state.items = [];
            state.unassigned = [];
            state.pagination = null;
            state.unassignedPagination = null;
            state.error = null;
            state.isLoading = false;
            state.selectedId = "";
            writeLS(LS_KEY, "");
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getDevices.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getDevices.fulfilled, (state, action) => {
            state.isLoading = false;
            const payload = action.payload || {};
            console.log(payload);
            state.items = payload.items || payload.data || [];
            state.pagination = payload.pagination || null;

            const hasSelected = state.items.some((d) => d?.device_id === state.selectedId);
            if (!state.selectedId || !hasSelected) {
                const fallback = state.items[0]?.device_id || "";
                state.selectedId = readLS(LS_KEY) || fallback || "";
                writeLS(LS_KEY, state.selectedId);
            }
        });
        builder.addCase(getDevices.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || "Load devices failed";
        });

        builder.addCase(getMyDevices.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getMyDevices.fulfilled, (state, action) => {
            state.isLoading = false;

            const payload = action.payload || {};

            state.items = payload.data || payload.items || [];
            state.pagination = payload.pagination || null;

            const fromLs = readLS(LS_KEY) || "";
            const hasSelected = state.items.some((d) => d?.device_id === state.selectedId);
            if (!state.selectedId || !hasSelected) {
                const fallback = state.items[0]?.device_id || "";
                state.selectedId = fromLs || fallback || "";
                writeLS(LS_KEY, state.selectedId);
            }
        });
        builder.addCase(getMyDevices.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || "Load devices failed";
        });

        builder.addCase(getUnassignedDevices.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(getUnassignedDevices.fulfilled, (state, action) => {
            state.isLoading = false;
            const payload = action.payload || {};
            state.unassigned = payload.items || payload.data || [];
            state.unassignedPagination = payload.pagination || null;
        });
        builder.addCase(getUnassignedDevices.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || "Load unassigned devices failed";
        });

        builder.addCase("auth/logout", (state) => {
            state.items = [];
            state.unassigned = [];
            state.pagination = null;
            state.unassignedPagination = null;
            state.error = null;
            state.isLoading = false;
            state.selectedId = "";
            writeLS(LS_KEY, "");
        });
    }
});

export const { setSelectedDeviceId, resetDevices } = deviceSlice.actions;
export default deviceSlice.reducer;
