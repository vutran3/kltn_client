import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchData = createAsyncThunk("fetchData", async () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve([{ title: "laptop" }, { title: "iphone" }]);
        }, 1000);
    });
});
