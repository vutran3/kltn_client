import { createAsyncThunk } from "@reduxjs/toolkit";
import instance from "../../config/axios.config";

export const fetchHealthResults = createAsyncThunk('healthResult/fetchList',
    async ({ page = 1, from = null, to = null, deviceId = "" } = {}, { rejectWithValue }) => {
        try {
            const res = await instance.get("/health-check/results", {
                params: {
                    page,
                    ...(from ? {from} : {}),
                    ...(to ? {to} : {}),
                    deviceId
                },
                timeout: 10000
            })
            return res.data
        } catch (err) {
            return rejectWithValue(err?.response?.data || { message: err.message })
        }
    }
)