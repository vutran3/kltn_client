import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import healthCheckReducer from "./slices/healthCheckSlice";
import productReduce from "./slices/productSlice";
import fieldReduce from "./slices/fieldSlice";
import deviceReduce from "./slices/deviceSlice";
import notificationReducer from "./slices/notificationSlice";
import authReduce from "./slices/authSlice";

const rootReducer = combineReducers({
    healthCheck: healthCheckReducer,
    product: productReduce,
    field: fieldReduce,
    device: deviceReduce,
    notification: notificationReducer,
    auth: authReduce
});

const store = configureStore({
    reducer: rootReducer
});

export function AppProvider({ children }) {
    return <Provider store={store}>{children}</Provider>;
}
