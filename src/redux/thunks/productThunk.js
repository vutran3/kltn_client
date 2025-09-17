import { createAsyncThunk } from "@reduxjs/toolkit";
import { deleteDataApi, getDataApi, patchDataApi, postDataApi } from "../../utils/fetch";

export const getProducts = createAsyncThunk("getProducts", async () => {
    try {
        const res = await getDataApi("/products?populate=field");
        return res.data;
    } catch (error) {
        throw error;
    }
});

export const createProduct = createAsyncThunk("createProduct", async (data, { dispatch }) => {
    try {
        const res = await postDataApi("/products", data);
        dispatch(getProducts());
        return res.data;
    } catch (error) {
        throw error;
    }
});

export const updateProduct = createAsyncThunk("updateProduct", async ({ productId, data }, { dispatch }) => {
    try {
        const res = await patchDataApi(`/products/${productId}`, data);
        dispatch(getProducts());
        return res.data;
    } catch (error) {
        throw error;
    }
});

export const deleteProduct = createAsyncThunk("deleteProduct", async (productId, { dispatch }) => {
    try {
        const res = await deleteDataApi(`/products/${productId}`);
        dispatch(getProducts());
        return res.data;
    } catch (error) {
        throw error;
    }
});
