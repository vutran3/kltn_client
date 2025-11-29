import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import MetricVisualizer from "./pages/MetricVisualizer";
import QualityCheck from "./pages/QualityCheck";
import ProduceManager from "./pages/ProduceManager";
import DeviceControl from "./pages/DeviceControl";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import { useDispatch, useSelector } from "react-redux";
import { selectAuth } from "./redux/selector";
import { useEffect } from "react";
import { getUserInfo } from "./redux/thunks/authThunk";
import { setIsLoading } from "./redux/slices/authSlice";
import { getMyDevices } from "./redux/thunks/deviceThunk";
import SoilEnvironmentDashboard from "./pages/SoilEnvironmentDashboard";
import "./styles/ai-advice.css";
import ProductDetailsDashboard from "./pages/DetailsProduct";

function App() {
    const dispatch = useDispatch();
    const { data, isLoading } = useSelector(selectAuth);

    useEffect(() => {
        dispatch(setIsLoading(true));

        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        const userId = localStorage.getItem("userId");

        if (accessToken && refreshToken && userId) {
            dispatch(getUserInfo()).finally(() => {
                dispatch(setIsLoading(false));
            });
            dispatch(getMyDevices());
        } else {
            dispatch(setIsLoading(false));
        }
    }, [dispatch]);

    if (isLoading) return null;

    const isAuthed = !!(data && Object.keys(data || {}).length > 0);

    return (
        <>
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            <Routes>
                <Route path="/products/:productId" element={<ProductDetailsDashboard />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route element={isAuthed ? <Layout /> : <SignIn />}>
                    <Route index element={<Home />} />
                    <Route path="/metric-visualizer" element={<MetricVisualizer />} />
                    <Route path="/quality-check" element={<QualityCheck />} />
                    <Route path="/env-quality-check" element={<SoilEnvironmentDashboard />} />
                    <Route path="/device-controller" element={<DeviceControl />} />
                    <Route path="/produce-manager" element={<ProduceManager />} />
                    <Route path="*" element={<ProduceManager />} />
                </Route>
            </Routes>
        </>
    );
}

export default App;
