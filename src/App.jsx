import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
import MetricVisualizer from "./pages/MetricVisualizer";

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="/metric-visualizer" element={<MetricVisualizer/>} />
            </Route>
        </Routes>
    );
}

export default App;
