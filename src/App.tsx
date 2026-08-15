import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, type ReactNode } from "react";
import { PhoneFrame } from "./components/PhoneFrame";
import { trackDeploymentHealth } from "./lib/backend";
import {
  CertificateScreen,
  FarmScreen,
  HomeDashboardScreen,
  MarketScreen,
  NotificationsScreen,
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
import { ExporterBatchListScreen, ExporterPurchaseScreen, ExporterVerifyScreen } from "./screens/ExporterScreens";
import { useAppStore } from "./store/appStore";

const PlotSelectionSync = () => {
  const { id } = useParams();
  const setSelectedPlotId = useAppStore((state) => state.setSelectedPlotId);
  useEffect(() => {
    if (id === "plot-dragon" || id === "plot-coffee") setSelectedPlotId(id);
  }, [id, setSelectedPlotId]);
  return null;
};

const ScanSelectionSync = () => {
  const { photoId } = useParams();
  const setSelectedScanId = useAppStore((state) => state.setSelectedScanId);
  useEffect(() => { if (photoId) setSelectedScanId(photoId); }, [photoId, setSelectedScanId]);
  return null;
};

const PlotRoute = ({ children }: { children: ReactNode }) => <><PlotSelectionSync />{children}</>;

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<WelcomeScreen />} />
    <Route path="/home" element={<HomeDashboardScreen />} />
    <Route path="/farm" element={<FarmScreen />} />
    <Route path="/plot/:id" element={<PlotRoute><PlotDetailScreen /></PlotRoute>} />
    <Route path="/plot/:id/sensors" element={<PlotRoute><SensorsScreen /></PlotRoute>} />
    <Route path="/plot/:id/timeline" element={<PlotRoute><TimelineScreen /></PlotRoute>} />
    <Route path="/plot/:id/satellite" element={<PlotRoute><SatelliteScreen /></PlotRoute>} />
    <Route path="/plot/:id/certificate" element={<PlotRoute><CertificateScreen /></PlotRoute>} />
    <Route path="/scan" element={<ScanCaptureScreen />} />
    <Route path="/scan/analyzing" element={<ScanAnalyzingScreen />} />
    <Route path="/scan/result/:photoId" element={<><ScanSelectionSync /><ScanResultScreen /></>} />
    <Route path="/market" element={<MarketScreen />} />
    <Route path="/notifications" element={<NotificationsScreen />} />
    <Route path="/profile" element={<ProfileScreen />} />
    <Route path="/exporter" element={<ExporterBatchListScreen />} />
    <Route path="/exporter/verify/:batchId" element={<ExporterVerifyScreen />} />
    <Route path="/exporter/purchase/:batchId" element={<ExporterPurchaseScreen />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const RouteGate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const langChosen = useAppStore((state) => state.langChosen);
  const chooseLang = useAppStore((state) => state.chooseLang);
  const setRole = useAppStore((state) => state.setRole);

  useEffect(() => {
    if (location.pathname.startsWith("/exporter")) {
      setRole("exporter");
      if (!langChosen) chooseLang("en");
      return;
    }
    setRole("farmer");
    if (!langChosen && location.pathname !== "/") navigate("/", { replace: true });
    if (langChosen && location.pathname === "/") navigate("/home", { replace: true });
  }, [chooseLang, langChosen, location.pathname, navigate, setRole]);
  return null;
};

function App() {
  const location = useLocation();
  const language = useAppStore((state) => state.lang);
  const role = location.pathname.startsWith("/exporter") ? "exporter" : "farmer";
  useEffect(() => { void trackDeploymentHealth(); }, []);

  return (
    <PhoneFrame role={role} scanLabel={language === "vi" ? "Quét" : "Scan"} language={language}>
      <RouteGate />
      <AppRoutes />
    </PhoneFrame>
  );
}

export default App;
