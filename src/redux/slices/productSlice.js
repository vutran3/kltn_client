import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchData } from "../thunks/productThunk";

const initialState = {
    data: [],
    isLoading: false,
    error: null
};

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchData.fulfilled, (state, action) => {
            state.data = action.payload;
        });
    }
});

export default productSlice.reducer;
