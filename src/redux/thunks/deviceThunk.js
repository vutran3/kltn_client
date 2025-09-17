import { createAsyncThunk } from "@reduxjs/toolkit";
import { getDataApi } from "../../utils/fetch";

export const getDevices = createAsyncThunk("getDevices", async () => {
    try {
        const res = await getDataApi("/devices");
        return res.data;
    } catch (error) {
        throw error;
    }
});
