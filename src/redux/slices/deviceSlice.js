import { createSlice } from "@reduxjs/toolkit";
import { getDevices } from "../thunks/deviceThunk";

const initialState = {
    data: {},
    isLoading: false,
    error: null
};

const deviceSlice = createSlice({
    name: "device",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getDevices.fulfilled, (state, action) => {
            state.data = action.payload;
        });
    }
});

export default deviceSlice.reducer;
