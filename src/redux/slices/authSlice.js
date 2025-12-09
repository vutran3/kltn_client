import { createSlice } from "@reduxjs/toolkit";
import { getUserInfo, login, registerUser } from "../thunks/authThunk";

const initialState = {
    data: {},
    isLoading: false,
    error: null
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        logout: (state) => {
            state.data = {};
            state.error = null;
            state.isLoading = false;

            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("userId");

            window.location.href = "/";
        }
    },
    extraReducers: (builder) => {
        // LOGIN
        builder.addCase(login.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(login.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error = null;

            const { user, token } = action.payload.data;
            state.data = user;

            localStorage.setItem("accessToken", token.accessToken);
            localStorage.setItem("refreshToken", token.refreshToken);
            localStorage.setItem("userId", user?._id || user?.id || "");
        });
        builder.addCase(login.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || "Đăng nhập thất bại";
        });

        // REGISTER
        builder.addCase(registerUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(registerUser.fulfilled, (state, action) => {
            state.isLoading = false;
            const { user, token } = action.payload.data;
            state.data = user;

            localStorage.setItem("accessToken", token.accessToken);
            localStorage.setItem("refreshToken", token.refreshToken);
            localStorage.setItem("userId", user?._id || user?.id || "");
        });
        builder.addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload || "Đăng ký thất bại";
        });

        // GET-ME
        builder.addCase(getUserInfo.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(getUserInfo.fulfilled, (state, action) => {
            state.isLoading = false;
            state.data = action.payload.data || {};
        });
        builder.addCase(getUserInfo.rejected, (state) => {
            state.isLoading = false;
            state.data = {};
        });
    }
});

export const { setIsLoading, logout } = authSlice.actions;
export default authSlice.reducer;
