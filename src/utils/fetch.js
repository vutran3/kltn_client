import instance from "../config/axios.config";
export const getDataApi = async (uri, params, headers) => {
    const res = await instance.get(uri, { params, headers });
    return res;
};

export const postDataApi = async (uri, data, headers) => {
    const res = await instance.post(uri, data, headers);
    return res;
};

export const patchDataApi = async (uri, data) => {
    const res = await instance.patch(uri, data);
    return res;
};

export const deleteDataApi = async (uri, data) => {
    const res = await instance.delete(uri, { data });
    return res;
};
