import { createAsyncThunk } from "@reduxjs/toolkit";
import { getDataApi } from "../../utils/fetch";

export const getDevices = createAsyncThunk("device/getDevices", async (params, { rejectWithValue }) => {
    try {
        const res = await getDataApi("/devices", params);
        return res.data;
    } catch (err) {
        const msg = err?.response?.data?.message || "Không thể tải danh sách thiết bị";
        return rejectWithValue(msg);
    }
});

export const getMyDevices = createAsyncThunk("device/getMyDevices", async (params, { rejectWithValue }) => {
    try {
        const res = await getDataApi("/devices/my", params);
        return res.data;
    } catch (err) {
        const msg = err?.response?.data?.message || "Không thể tải danh sách thiết bị";
        return rejectWithValue(msg);
    }
});

export const getUnassignedDevices = createAsyncThunk(
    "device/getUnassignedDevices",
    async (params, { rejectWithValue }) => {
        try {
            const res = await getDataApi("/devices/unassigned", params);
            return res.data;
        } catch (err) {
            const msg = err?.response?.data?.message || "Không thể tải danh sách thiết bị chưa gán";
            return rejectWithValue(msg);
        }
    }
);
