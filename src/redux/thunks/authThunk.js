import { createAsyncThunk } from "@reduxjs/toolkit";

export const login = createAsyncThunk("login", async () => {
    try {
        return new Promise((resolve, reject) => {
            try {
                setTimeout(() => {
                    resolve({
                        msg: "Đăng nhập thành công",
                        data: {
                            username: "tranducvu234",
                            email: "tranducvu234@gmail.com",
                            token: {
                                accessToken: "AT_abc",
                                refreshToken: "RF_abc"
                            }
                        }
                    });
                }, [1000]);
            } catch (error) {
                reject(error);
            }
        });
    } catch (error) {
        throw error;
    }
});

export const getUserInfo = createAsyncThunk("getUserInfo", async ({ accessToken, refreshToken }) => {
    try {
        return new Promise((resolve, reject) => {
            try {
                if (accessToken && refreshToken) {
                    setTimeout(() => {
                        resolve({
                            msg: "Lấy dữ liệu thành công",
                            data: {
                                username: "tranducvu234",
                                email: "tranducvu234@gmail.com"
                            }
                        });
                    }, [200]);
                } else {
                    resolve({
                        msg: "Token hết hạn",
                        data: {}
                    });
                }
            } catch (error) {
                reject(error);
            }
        });
    } catch (error) {
        throw error;
    }
});
