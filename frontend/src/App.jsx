import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import UserSegments from "./pages/UserSegments";
import FeatureUsage from "./pages/FeatureUsage";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="segments" element={<UserSegments />} />
        <Route path="features" element={<FeatureUsage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
