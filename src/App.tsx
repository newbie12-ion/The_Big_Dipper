import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { PhoneFrame } from "./components/PhoneFrame";
import { trackDeploymentHealth } from "./lib/backend";
import {
  CertificateScreen,
  FarmScreen,
  HomeDashboardScreen,
  MarketScreen,
  PlotDetailScreen,
  ProfileScreen,
  SatelliteScreen,
  ScanAnalyzingScreen,
  ScanCaptureScreen,
  ScanResultScreen,
  SensorsScreen,
  TimelineScreen,
  WelcomeScreen,
} from "./screens/FarmerScreens";
import {
  ExporterBatchListScreen,
  ExporterPurchaseScreen,
  ExporterVerifyScreen,
} from "./screens/ExporterScreens";
import { useAppStore } from "./store/appStore";

const PlotSelectionSync = () => {
  const params = useParams();
  const setSelectedPlotId = useAppStore((state) => state.setSelectedPlotId);

  useEffect(() => {
    if (params.plotId === "plot-dragon" || params.plotId === "plot-coffee") {
      setSelectedPlotId(params.plotId);
    }
  }, [params.plotId, setSelectedPlotId]);

  return null;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<WelcomeScreen />} />
    <Route path="/farmer/home" element={<HomeDashboardScreen />} />
    <Route path="/farmer/scan" element={<ScanCaptureScreen />} />
    <Route path="/farmer/scan/analyzing" element={<ScanAnalyzingScreen />} />
    <Route path="/farmer/scan/result" element={<ScanResultScreen />} />
    <Route path="/farmer/farm" element={<FarmScreen />} />
    <Route
      path="/farmer/farm/plot/:plotId"
      element={
        <>
          <PlotSelectionSync />
          <PlotDetailScreen />
        </>
      }
    />
    <Route
      path="/farmer/farm/plot/:plotId/sensors"
      element={
        <>
          <PlotSelectionSync />
          <SensorsScreen />
        </>
      }
    />
    <Route
      path="/farmer/farm/plot/:plotId/timeline"
      element={
        <>
          <PlotSelectionSync />
          <TimelineScreen />
        </>
      }
    />
    <Route
      path="/farmer/farm/plot/:plotId/satellite"
      element={
        <>
          <PlotSelectionSync />
          <SatelliteScreen />
        </>
      }
    />
    <Route
      path="/farmer/farm/plot/:plotId/certificate"
      element={
        <>
          <PlotSelectionSync />
          <CertificateScreen />
        </>
      }
    />
    <Route path="/farmer/market" element={<MarketScreen />} />
    <Route path="/farmer/profile" element={<ProfileScreen />} />
    <Route path="/exporter" element={<ExporterBatchListScreen />} />
    <Route path="/exporter/verify" element={<ExporterVerifyScreen />} />
    <Route path="/exporter/purchase" element={<ExporterPurchaseScreen />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const RouteGate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const language = useAppStore((state) => state.language);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const setRole = useAppStore((state) => state.setRole);

  useEffect(() => {
    if (!language && location.pathname.startsWith("/exporter")) {
      setLanguage("en");
      setRole("exporter");
      return;
    }

    if (!language && location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, [language, location.pathname, navigate, setLanguage, setRole]);

  return null;
};

function App() {
  const location = useLocation();
  const language = useAppStore((state) => state.language ?? "vi");
  const setRole = useAppStore((state) => state.setRole);
  const role = location.pathname.startsWith("/exporter") ? "exporter" : "farmer";

  useEffect(() => {
    setRole(role);
  }, [role, setRole]);

  useEffect(() => {
    void trackDeploymentHealth();
  }, []);

  return (
    <PhoneFrame role={role} scanLabel={language === "vi" ? "Quét" : "Scan"}>
      <RouteGate />
      <AppRoutes />
    </PhoneFrame>
  );
}

export default App;
