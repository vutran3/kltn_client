import { createAsyncThunk } from "@reduxjs/toolkit";
import { getDataApi } from "../../utils/fetch";

export const getFields = createAsyncThunk("getFields", async () => {
    try {
        const res = await getDataApi("/fields?populate=devices");
        return res.data;
    } catch (error) {
        throw error;
    }
});
