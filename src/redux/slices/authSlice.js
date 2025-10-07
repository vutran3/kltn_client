import { createSlice } from "@reduxjs/toolkit";
import { getUserInfo, login } from "../thunks/authThunk";

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
            window.location.reload();
        }
    },
    extraReducers: (builder) => {
        builder.addCase(login.fulfilled, (state, action) => {
            state.data = action.payload.data;
            const {
                token: { accessToken, refreshToken }
            } = action.payload.data;

            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
        });
        builder.addCase(getUserInfo.fulfilled, (state, action) => {
            state.data = action.payload.data;
            state.isLoading = false;
        });
    }
});

export const { setIsLoading, logout } = authSlice.actions;
export default authSlice.reducer;
