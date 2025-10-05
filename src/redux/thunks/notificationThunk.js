import { createAsyncThunk } from "@reduxjs/toolkit";
import { getDataApi, putDataApi, deleteDataApi } from "../../utils/fetch";

export const fetchNotification = createAsyncThunk(
    'notifications/fetch',
    async ({ page = 1, limit = 20, read = 'all', sort = '-ctime' } = {}, { rejectWithValue }) => {
        try {
            const { data } = await getDataApi('/notification', { page, limit, read, sort });
            console.log("notifi:::", data)
            return data
        } catch (e) {
            return rejectWithValue(e?.response?.data || { message: e.message });
        }
    }
);

export const markRead = createAsyncThunk('notifications/markRead', async (ids, { rejectWithValue }) => {
    try {
        const payload = Array.isArray(ids) ?? ids.length ? { ids } : {}
        const { data } = await putDataApi('/notification/mark-read', payload)
        return data
    } catch (e) {
        return rejectWithValue(e?.response?.data || { message: e.message })
    }
});


export const deleteNotifi = createAsyncThunk('notifications/delete', async ({ id, option }, { rejectWithValue }) => {
    let result;
    try {
        if (id) {
            result = await deleteDataApi(`notification/delete${id ? `/${id}` : ''}?option=${option}`)
        }else {
            result = await deleteDataApi(`notification/delete-all?option=${option}`)
        }
        const {data} = result
        return data;
    } catch (e) {
        return rejectWithValue(e?.response?.data || { message: e.message })
    }
});