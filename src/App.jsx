import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
import MetricVisualizer from "./pages/MetricVisualizer";
import QualityCheck from "./pages/QualityCheck";
import ProduceManager from "./pages/ProduceManager";

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="/metric-visualizer" element={<MetricVisualizer />} />
                <Route path="/quality-check" element={<QualityCheck />} />
                <Route path="/produce-manager" element={<ProduceManager />} />
            </Route>
        </Routes>
    );
}

export default App;
