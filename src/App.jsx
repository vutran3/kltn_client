import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
import MetricVisualizer from "./pages/MetricVisualizer";
import QualityCheck from "./pages/QualityCheck";
import ProduceManager from "./pages/ProduceManager";
import DeviceControl from "./pages/DeviceControl";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { useDispatch, useSelector } from "react-redux";
import { selectAuth } from "./redux/selector";
import { useEffect, useState } from "react";
import { getUserInfo } from "./redux/thunks/authThunk";
import { setIsLoading } from "./redux/slices/authSlice";

function App() {
    const dispatch = useDispatch();
    const { data, isLoading } = useSelector(selectAuth);

    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        dispatch(setIsLoading(true));
        dispatch(
            getUserInfo({
                accessToken,
                refreshToken
            })
        );
    }, []);

    if (isLoading) return null;

    return (
        <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route element={Object.keys(data).length > 0 ? <Layout /> : <SignIn />}>
                <Route index element={<Home />} />
                <Route path="/metric-visualizer" element={<MetricVisualizer />} />
                <Route path="/quality-check" element={<QualityCheck />} />
                <Route path="/device-controller" element={<DeviceControl />} />
                <Route path="/produce-manager" element={<ProduceManager />} />
                <Route path="*" element={<ProduceManager />} />
            </Route>
        </Routes>
    );
}

export default App;
