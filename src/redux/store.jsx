import { combineReducers, configureStore } from "@reduxjs/toolkit";
import countReducer from "./slices/countSlice";
import productReducer from "./slices/productSlice";
import { Provider } from "react-redux";

const rootReducer = combineReducers({
    count: countReducer,
    product: productReducer
});

const store = configureStore({
    reducer: rootReducer
});

export function AppProvider({ children }) {
    return <Provider store={store}>{children}</Provider>;
}
