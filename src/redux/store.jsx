import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import healthCheckReducer from './slices/healthCheckSlice'
const rootReducer = combineReducers({
    healthCheck: healthCheckReducer
});

const store = configureStore({
    reducer: rootReducer
});

export function AppProvider({ children }) {
    return <Provider store={store}>{children}</Provider>;
}
