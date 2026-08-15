import { LocalizedText } from "../lib/i18n";

export type PlotId = "plot-dragon" | "plot-coffee";
export type EventType =
  | "scan"
  | "irrigation"
  | "sensor"
  | "fertilizer"
  | "spray"
  | "certificate"
  | "sale";

export interface FarmerProfile {
  name: string;
  location: string;
  cooperative: string;
  areaHectares: number;
  memberSince: string;
  plotCount: number;
  avatarUrl: string;
}

export interface PlotSummary {
  id: PlotId;
  crop: LocalizedText;
  area: string;
  plantingDate: string;
  healthStatus: LocalizedText;
  soilMoisture: number;
  badgeTone: "good" | "warn" | "alert";
  icon: string;
}

export interface ScanScenario {
  id: string;
  imageUrl: string;
  plantName: LocalizedText;
  shortLabel: LocalizedText;
  diagnosis: LocalizedText;
  severity: LocalizedText;
  confidence: number;
  treatment: LocalizedText[];
  care: LocalizedText[];
  prevention: LocalizedText[];
  affectsPlotId: PlotId;
}

export interface LedgerEvent {
  id: string;
  type: EventType;
  title: LocalizedText;
  detail: LocalizedText;
  timestamp: string;
  hash: string;
  blockNumber: number;
}

export interface NotificationItem {
  id: string;
  title: LocalizedText;
  body: LocalizedText;
  tone: "green" | "amber" | "blue";
  timestamp: string;
}

export interface WeatherCard {
  temperature: string;
  humidity: string;
  rainfall: string;
  summary: LocalizedText;
}

export interface ExportBatch {
  id: string;
  crop: LocalizedText;
  cooperative: string;
  weight: string;
  marketPrice: number;
  premiumPrice: number;
  badges: string[];
  origin: LocalizedText;
}

const imageUrl = (prompt: string, imageSize = "portrait_4_3") =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=${imageSize}`;

const makeHash = (seed: string) =>
  seed.padEnd(64, "0").slice(0, 64).toLowerCase();

export const farmerProfile: FarmerProfile = {
  name: "Chị Hoa",
  location: "Tiền Giang, Việt Nam",
  cooperative: "Mekong Fresh Cooperative",
  areaHectares: 0.7,
  memberSince: "2021",
  plotCount: 2,
  avatarUrl: imageUrl(
    "friendly Vietnamese woman farmer in a sun hat, dragon fruit orchard background, clean flat illustration, vibrant green and amber palette, mobile app avatar",
    "square_hd",
  ),
};

export const plots: PlotSummary[] = [
  {
    id: "plot-dragon",
    crop: { vi: "Thanh long", en: "Dragon fruit" },
    area: "0.4 ha",
    plantingDate: "12 Mar 2025",
    healthStatus: { vi: "Cần chú ý", en: "Needs attention" },
    soilMoisture: 41,
    badgeTone: "warn",
    icon: "🍈",
  },
  {
    id: "plot-coffee",
    crop: { vi: "Cà phê", en: "Coffee" },
    area: "0.3 ha",
    plantingDate: "28 Jun 2024",
    healthStatus: { vi: "Ổn định", en: "Stable" },
    soilMoisture: 63,
    badgeTone: "good",
    icon: "☕",
  },
];

export const weatherCard: WeatherCard = {
  temperature: "31°C",
  humidity: "72%",
  rainfall: "12 mm",
  summary: {
    vi: "Nắng gián đoạn, có thể mưa nhẹ chiều nay",
    en: "Sunny spells with a light shower risk this afternoon",
  },
};

export const nearbyAlert: LocalizedText = {
  vi: "Đốm nâu phát hiện gần bạn",
  en: "Anthracnose detected near your farm",
};

export const scanScenarios: ScanScenario[] = [
  {
    id: "dragon-anthracnose",
    imageUrl: imageUrl(
      "close-up dragon fruit leaf with brown fungal spots, agricultural diagnosis sample, realistic macro photo, natural daylight",
    ),
    plantName: { vi: "Thanh long", en: "Dragon fruit" },
    shortLabel: {
      vi: "Lá thanh long bị đốm nâu",
      en: "Dragon fruit leaf with brown spots",
    },
    diagnosis: { vi: "Bệnh đốm nâu", en: "Anthracnose" },
    severity: { vi: "Mức độ trung bình", en: "Moderate severity" },
    confidence: 94,
    treatment: [
      {
        vi: "Phun gốc đồng 1.5 ml/lít vào sáng sớm, lặp lại sau 5 ngày.",
        en: "Spray a copper-based treatment at 1.5 ml/L early morning and repeat in 5 days.",
      },
      {
        vi: "Cắt bỏ lá bị nặng và tiêu hủy ngoài vườn.",
        en: "Remove heavily infected leaves and dispose of them outside the plot.",
      },
    ],
    care: [
      {
        vi: "Tưới 2 ngày/lần khi độ ẩm đất dưới 48%.",
        en: "Water every 2 days when soil moisture drops below 48%.",
      },
      {
        vi: "Bón kali cao trước kỳ ra hoa, tránh dư đạm.",
        en: "Use a high-potassium feed before flowering and avoid excess nitrogen.",
      },
    ],
    prevention: [
      {
        vi: "Tăng thông thoáng tán, không tưới lên lá lúc chiều muộn.",
        en: "Improve canopy airflow and avoid late-day leaf wetting.",
      },
      {
        vi: "Theo dõi điểm bệnh sau mưa trong 7 ngày tới.",
        en: "Inspect lesion spread after rainfall over the next 7 days.",
      },
    ],
    affectsPlotId: "plot-dragon",
  },
  {
    id: "coffee-healthy",
    imageUrl: imageUrl(
      "healthy coffee leaf close-up, lush green, agricultural sample photo, realistic lighting",
    ),
    plantName: { vi: "Cà phê", en: "Coffee" },
    shortLabel: { vi: "Lá cà phê khỏe mạnh", en: "Healthy coffee leaf" },
    diagnosis: { vi: "Không phát hiện bệnh", en: "No disease detected" },
    severity: { vi: "Tình trạng tốt", en: "Healthy" },
    confidence: 97,
    treatment: [
      {
        vi: "Tiếp tục lịch chăm sóc hiện tại.",
        en: "Continue the current care schedule.",
      },
    ],
    care: [
      {
        vi: "Giữ độ ẩm ổn định 58-68% trong giai đoạn quả phát triển.",
        en: "Keep soil moisture stable between 58-68% during bean development.",
      },
    ],
    prevention: [
      {
        vi: "Theo dõi côn trùng lá non mỗi tuần.",
        en: "Check new leaves weekly for insect pressure.",
      },
    ],
    affectsPlotId: "plot-coffee",
  },
  {
    id: "rice-yellowing",
    imageUrl: imageUrl(
      "rice leaves with yellowing due to nutrient stress, field diagnosis photo, realistic agronomy scene",
    ),
    plantName: { vi: "Lúa", en: "Rice" },
    shortLabel: { vi: "Lúa vàng lá", en: "Yellowing rice" },
    diagnosis: { vi: "Thiếu đạm nhẹ", en: "Mild nitrogen deficiency" },
    severity: { vi: "Mức độ nhẹ", en: "Low severity" },
    confidence: 88,
    treatment: [
      {
        vi: "Bón bổ sung ure theo liều địa phương trong 3 ngày tới.",
        en: "Apply a supplemental urea dressing at the local recommended rate within 3 days.",
      },
    ],
    care: [
      {
        vi: "Giữ mực nước mặt ruộng ổn định và quan sát màu lá.",
        en: "Maintain shallow standing water and monitor leaf color.",
      },
    ],
    prevention: [
      {
        vi: "So sánh màu lá với bảng chuẩn trước mỗi lần bón.",
        en: "Compare leaf color to a field chart before each fertilizer round.",
      },
    ],
    affectsPlotId: "plot-dragon",
  },
  {
    id: "unknown-plant",
    imageUrl: imageUrl(
      "mystery tropical weed in farmland, handheld phone photo, agricultural field sample, realistic",
    ),
    plantName: { vi: "Chưa xác định", en: "Unknown species" },
    shortLabel: { vi: "Cây lạ trong vườn", en: "Unknown plant" },
    diagnosis: { vi: "Khả năng là cỏ dại", en: "Likely weed species" },
    severity: { vi: "Cần kiểm tra", en: "Needs review" },
    confidence: 71,
    treatment: [
      {
        vi: "Chụp gần hơn mặt lá và thân để nhận diện lại.",
        en: "Capture a closer photo of the leaf and stem for a better match.",
      },
    ],
    care: [
      {
        vi: "Không xử lý hóa chất trước khi xác minh.",
        en: "Do not spray chemicals until the species is confirmed.",
      },
    ],
    prevention: [
      {
        vi: "Dọn cỏ quanh luống trước mùa mưa.",
        en: "Clear weeds around the beds before the rainy season.",
      },
    ],
    affectsPlotId: "plot-dragon",
  },
];

export const sensorHistory = [
  { hour: "00:00", moisture: 58 },
  { hour: "04:00", moisture: 55 },
  { hour: "08:00", moisture: 52 },
  { hour: "12:00", moisture: 48 },
  { hour: "16:00", moisture: 44 },
  { hour: "20:00", moisture: 41 },
  { hour: "Now", moisture: 41 },
];

export const seededLedgerEvents: LedgerEvent[] = [
  {
    id: "evt-01",
    type: "certificate",
    title: { vi: "Tạo hồ sơ lô đất", en: "Plot profile created" },
    detail: {
      vi: "Hồ sơ GPS và thành viên hợp tác xã đã được chuẩn hóa cho EUDR.",
      en: "GPS profile and cooperative membership normalized for EUDR.",
    },
    timestamp: "06:30",
    hash: makeHash("9f12a6bd0ac14a2eec84d3473bb1f7c4e6f0d8a91c3b67ef"),
    blockNumber: 48231,
  },
  {
    id: "evt-02",
    type: "sensor",
    title: { vi: "Đồng bộ cảm biến đất", en: "Soil sensor synced" },
    detail: {
      vi: "Bộ kit #A-102 gửi bộ dữ liệu LoRaWAN đầu ngày.",
      en: "Kit #A-102 sent the morning LoRaWAN sensor packet.",
    },
    timestamp: "07:10",
    hash: makeHash("17af5ed23c4691ceaf7109cd8df51d3eb0a1237f58d9ce61"),
    blockNumber: 48236,
  },
  {
    id: "evt-03",
    type: "fertilizer",
    title: { vi: "Bón kali giai đoạn ra nụ", en: "Potassium feed applied" },
    detail: {
      vi: "12 kg KNO3 cho lô thanh long.",
      en: "12 kg of KNO3 applied to the dragon fruit plot.",
    },
    timestamp: "08:40",
    hash: makeHash("412a8fe2b9e03ab71cd4660f8d544833ea195e28dd3f1ce9"),
    blockNumber: 48244,
  },
  {
    id: "evt-04",
    type: "spray",
    title: { vi: "Phun sinh học định kỳ", en: "Biological spray logged" },
    detail: {
      vi: "Phun vi sinh phòng nấm sau mưa.",
      en: "Microbial protective spray applied after rainfall.",
    },
    timestamp: "09:15",
    hash: makeHash("334cdaf2ff0106a91e88c7a1bd3ea63184fd7aa42170cb69"),
    blockNumber: 48251,
  },
  {
    id: "evt-05",
    type: "sensor",
    title: { vi: "Nhiệt độ vượt 30°C", en: "Temperature passed 30°C" },
    detail: {
      vi: "Nhiệt độ: 31°C, độ ẩm: 72%.",
      en: "Temperature: 31°C, humidity: 72%.",
    },
    timestamp: "10:20",
    hash: makeHash("da1931ef9d2c4741a61d8c36df7e0bc11baad4c1ca8862af"),
    blockNumber: 48255,
  },
  {
    id: "evt-06",
    type: "irrigation",
    title: { vi: "Tưới nhỏ giọt chu kỳ sáng", en: "Morning drip irrigation" },
    detail: {
      vi: "Bơm vận hành 12 phút cho luống số 2.",
      en: "Pump ran for 12 minutes on row 2.",
    },
    timestamp: "11:05",
    hash: makeHash("6fc5f02f730a44bdb1aac9895771c2fb0e55601796a41f25"),
    blockNumber: 48261,
  },
  {
    id: "evt-07",
    type: "sensor",
    title: { vi: "Độ ẩm đất giảm", en: "Soil moisture dropped" },
    detail: {
      vi: "Độ ẩm xuống 44%, sắp tới ngưỡng cần tưới.",
      en: "Soil moisture fell to 44%, approaching irrigation threshold.",
    },
    timestamp: "12:50",
    hash: makeHash("9ced3ddff2aa6e1186b2417b5d004af39e4c6a8718314582"),
    blockNumber: 48269,
  },
  {
    id: "evt-08",
    type: "certificate",
    title: { vi: "Cập nhật hồ sơ tuân thủ", en: "Compliance record updated" },
    detail: {
      vi: "Biểu mẫu GlobalGAP được điền tự động từ sổ tay điện tử.",
      en: "GlobalGAP form auto-filled from the digital ledger.",
    },
    timestamp: "13:10",
    hash: makeHash("830cb0d1fe3a4cf62d1a25ab3b3a524e4569cb8f3271d7ac"),
    blockNumber: 48274,
  },
  {
    id: "evt-09",
    type: "scan",
    title: { vi: "Nhận diện cây cà phê", en: "Coffee plant identified" },
    detail: {
      vi: "AI xác nhận lá khỏe mạnh, 97% tin cậy.",
      en: "AI confirmed healthy coffee foliage at 97% confidence.",
    },
    timestamp: "14:00",
    hash: makeHash("66fe712aa82ecf41384cadf1513394f52b8ed393b81026fd"),
    blockNumber: 48280,
  },
  {
    id: "evt-10",
    type: "spray",
    title: { vi: "Khử khuẩn dụng cụ", en: "Tool sanitation recorded" },
    detail: {
      vi: "Dụng cụ cắt tỉa được khử khuẩn sau xử lý.",
      en: "Pruning tools sanitized after treatment work.",
    },
    timestamp: "15:20",
    hash: makeHash("2fd46c5414ef2c86b791a5df60d9b1971a631dba930c5c67"),
    blockNumber: 48288,
  },
  {
    id: "evt-11",
    type: "sensor",
    title: { vi: "Gió tăng, mưa có thể đến", en: "Wind increase detected" },
    detail: {
      vi: "Rủi ro mưa nhẹ trong 6 giờ tới.",
      en: "Light rain risk flagged in the next 6 hours.",
    },
    timestamp: "16:05",
    hash: makeHash("a4c1917c8f90a126b35af6228e2e89ca78489e7bd15fc620"),
    blockNumber: 48294,
  },
  {
    id: "evt-12",
    type: "certificate",
    title: { vi: "Tạo mã QR truy xuất", en: "Traceability QR generated" },
    detail: {
      vi: "Liên kết kiểm chứng cho nhà nhập khẩu đã sẵn sàng.",
      en: "Verification link for importers is now ready.",
    },
    timestamp: "17:45",
    hash: makeHash("5dc4e11a0d4d9735b0ab67414bf4dc9e92c77ce188bb2e55"),
    blockNumber: 48301,
  },
];

export const baseNotifications: NotificationItem[] = [
  {
    id: "note-01",
    title: { vi: "Cảnh báo bệnh gần bạn", en: "Disease alert near your farm" },
    body: {
      vi: "3 vườn trong bán kính 5 km vừa ghi nhận đốm nâu.",
      en: "Three farms within 5 km logged anthracnose this week.",
    },
    tone: "amber",
    timestamp: "09:30",
  },
  {
    id: "note-02",
    title: { vi: "Độ ẩm thấp", en: "Moisture is low" },
    body: {
      vi: "Độ ẩm lô thanh long giảm xuống 41%.",
      en: "Dragon fruit plot moisture dropped to 41%.",
    },
    tone: "blue",
    timestamp: "12:48",
  },
  {
    id: "note-03",
    title: { vi: "Chứng nhận tăng tiến độ", en: "Certificate readiness increased" },
    body: {
      vi: "Biểu mẫu GlobalGAP đã tự động cập nhật.",
      en: "The GlobalGAP draft updated automatically.",
    },
    tone: "green",
    timestamp: "13:12",
  },
];

export const exporterBatches: ExportBatch[] = [
  {
    id: "batch-dragon",
    crop: { vi: "Thanh long", en: "Dragon fruit" },
    cooperative: "Mekong Fresh Cooperative",
    weight: "500 kg",
    marketPrice: 25000,
    premiumPrice: 30500,
    badges: ["GlobalGAP", "EUDR"],
    origin: { vi: "Tiền Giang, Việt Nam", en: "Tien Giang, Vietnam" },
  },
  {
    id: "batch-coffee",
    crop: { vi: "Cà phê", en: "Coffee" },
    cooperative: "Central Highlands Growers",
    weight: "1,200 kg",
    marketPrice: 62000,
    premiumPrice: 71900,
    badges: ["Rainforest", "EUDR"],
    origin: { vi: "Đắk Lắk, Việt Nam", en: "Dak Lak, Vietnam" },
  },
];

export const certificateRows = [
  {
    label: { vi: "GlobalGAP readiness", en: "GlobalGAP readiness" },
    status: "ready",
  },
  {
    label: { vi: "EUDR geolocation", en: "EUDR geolocation" },
    status: "ready",
  },
  {
    label: { vi: "Certifier review", en: "Certifier review" },
    status: "pending",
  },
] as const;

export const satelliteInsights = {
  climate: {
    vi: "Nhiệt đới gió mùa, phù hợp thanh long quanh năm",
    en: "Tropical monsoon climate, suitable for dragon fruit year-round",
  },
  advisory: {
    vi: "Mưa nhẹ 48 giờ tới, nên trì hoãn phun nếu không khẩn cấp.",
    en: "Light rain is likely within 48 hours, so defer spraying unless urgent.",
  },
  forecast: [
    { day: "Mon", temp: "31°", rain: "20%" },
    { day: "Tue", temp: "30°", rain: "35%" },
    { day: "Wed", temp: "29°", rain: "55%" },
    { day: "Thu", temp: "30°", rain: "30%" },
    { day: "Fri", temp: "32°", rain: "10%" },
    { day: "Sat", temp: "31°", rain: "15%" },
    { day: "Sun", temp: "30°", rain: "45%" },
  ],
};

export const analysisStages: LocalizedText[] = [
  { vi: "Đang nhận diện cây...", en: "Identifying crop species..." },
  { vi: "Kiểm tra 47 loại bệnh...", en: "Checking 47 disease classes..." },
  { vi: "So sánh dữ liệu vùng...", en: "Comparing with regional field data..." },
];

export const buildScanEvent = (scenario: ScanScenario): LedgerEvent => ({
  id: `evt-scan-${scenario.id}`,
  type: "scan",
  title: {
    vi: `AI phát hiện ${scenario.diagnosis.vi}`,
    en: `AI detected ${scenario.diagnosis.en}`,
  },
  detail: {
    vi: `${scenario.plantName.vi} được nhận diện với độ tin cậy ${scenario.confidence}%.`,
    en: `${scenario.plantName.en} identified with ${scenario.confidence}% confidence.`,
  },
  timestamp: "18:05",
  hash: makeHash(`scan${scenario.id}e4af3a9c7b12f65d8ea21b78c0`),
  blockNumber: 48307,
});

export const buildPumpEvent = (turnOn: boolean): LedgerEvent => ({
  id: turnOn ? "evt-pump-on" : "evt-pump-off",
  type: "irrigation",
  title: {
    vi: turnOn ? "Bật bơm tưới" : "Tắt bơm tưới",
    en: turnOn ? "Irrigation pump turned on" : "Irrigation pump turned off",
  },
  detail: {
    vi: turnOn
      ? "Bộ kit #A-102 kích hoạt bơm, độ ẩm đang tăng."
      : "Bơm dừng sau chu kỳ tưới ngắn.",
    en: turnOn
      ? "Kit #A-102 activated the pump and moisture is rising."
      : "The pump stopped after a short irrigation cycle.",
  },
  timestamp: turnOn ? "18:08" : "18:19",
  hash: makeHash(`${turnOn ? "pump-on" : "pump-off"}87acf41d6b9ea02451f`),
  blockNumber: turnOn ? 48309 : 48311,
});

export const soldNotification: NotificationItem = {
  id: "note-sold",
  title: { vi: "Lô hàng đã bán +22%", en: "Batch sold at +22%" },
  body: {
    vi: "Người mua EU đã thanh toán trực tiếp cho chị Hoa, không qua trung gian.",
    en: "The EU buyer paid Chị Hoa directly with no middlemen involved.",
  },
  tone: "green",
  timestamp: "18:25",
};

export const pumpNotification: NotificationItem = {
  id: "note-pump",
  title: { vi: "Bơm tưới đang chạy", en: "Irrigation pump is running" },
  body: {
    vi: "Độ ẩm lô thanh long đang phục hồi theo thời gian thực.",
    en: "Dragon fruit plot moisture is recovering in real time.",
  },
  tone: "blue",
  timestamp: "18:09",
};

export const scanLoggedNotification: NotificationItem = {
  id: "note-scan",
  title: { vi: "Chẩn đoán đã ghi vào chuỗi", en: "Diagnosis logged on-chain" },
  body: {
    vi: "Bản ghi AI đã tăng độ sẵn sàng chứng nhận.",
    en: "The AI diagnosis record increased certificate readiness.",
  },
  tone: "green",
  timestamp: "18:06",
};
