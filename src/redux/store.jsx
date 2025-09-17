import { combineReducers, configureStore } from "@reduxjs/toolkit";
import countReducer from "./slices/countSlice";
import productReducer from "./slices/productSlice";
import { Provider } from "react-redux";
<<<<<<< Updated upstream

const rootReducer = combineReducers({
    count: countReducer,
    product: productReducer
=======
import healthCheckReducer from "./slices/healthCheckSlice";
import productReduce from "./slices/productSlice";
import fieldReduce from "./slices/fieldSlice";
import deviceReduce from "./slices/deviceSlice";

const rootReducer = combineReducers({
    healthCheck: healthCheckReducer,
    product: productReduce,
    field: fieldReduce,
    device: deviceReduce
>>>>>>> Stashed changes
});

const store = configureStore({
    reducer: rootReducer
});

export function AppProvider({ children }) {
    return <Provider store={store}>{children}</Provider>;
}
