import { createAsyncThunk } from "@reduxjs/toolkit";
import { postDataApi, getDataApi } from "../../utils/fetch";

export const login = createAsyncThunk("auth/login", async ({ email, password }, { rejectWithValue }) => {
    try {
        const res = await postDataApi("/auth/login", { email, password });
        return res.data;
    } catch (err) {
        const msg = err?.response?.data?.message || "Đăng nhập thất bại";
        return rejectWithValue(msg);
    }
});

export const registerUser = createAsyncThunk(
    "auth/registerUser",
    async ({ name, email, password, phone }, { rejectWithValue }) => {
        try {
            const res = await postDataApi("/auth/register", { name, email, password, phone });
            return res.data;
        } catch (err) {
            const msg = err?.response?.data?.message || "Đăng ký thất bại";
            return rejectWithValue(msg);
        }
    }
);

export const getUserInfo = createAsyncThunk("auth/getUserInfo", async (_, { rejectWithValue }) => {
    try {
        const res = await getDataApi("/auth/get-me");
        return res.data;
    } catch (err) {
        const msg = err?.response?.data?.message || "Không thể lấy thông tin người dùng";
        return rejectWithValue(msg);
    }
});
