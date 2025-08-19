import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    value: 0
};

const countSlice = createSlice({
    name: "count",
    initialState,
    reducers: {
        increase(state, action) {
            state.value += 1;
        },
        decrease(state, action) {
            state.value -= 1;
        }
    }
});

export const { increase, decrease } = countSlice.actions;
export default countSlice.reducer;
