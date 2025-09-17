import { createSlice } from "@reduxjs/toolkit";
import { getFields } from "../thunks/fieldThunk";

const initialState = {
    data: {},
    isLoading: false,
    error: null
};

const fieldSlice = createSlice({
    name: "field",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getFields.fulfilled, (state, action) => {
            state.data = action.payload;
        });
    }
});

export default fieldSlice.reducer;
