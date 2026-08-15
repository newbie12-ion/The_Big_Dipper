// AgriTrust — seed data for the simulated backend.
// Everything user-facing is bilingual { vi, en }.
//
// Sensor reality check (see research/sensor-station-research.md):
//   • The kit measures soil moisture, soil EC, soil/air temp and humidity.
//   • There is NO NPK sensor. NPK only ever appears as a fertiliser *product*
//     or inside the semiannual lab panel — never as a live reading.
//   • Rain comes from the co-op gauge 1.2 km away, not from the kit.
//   • One kit represents a whole zone (0.5 ha), not a single bed.

export type Lang = 'vi' | 'en'

export interface Bilingual {
  vi: string
  en: string
}

export type EventType = 'water' | 'fertilizer' | 'spray' | 'scan' | 'sensor' | 'lab'

export interface LedgerEvent {
  id: string
  type: EventType
  title: Bilingual
  detail: Bilingual
  time: string
  hash: string
  block: number
}

/** Ledger hashes are displayed as `0x` + the first 20 hex chars. */
const H = (hex: string) => `0x${hex}`

// ---------------------------------------------------------------------------
// Farm / plot
// ---------------------------------------------------------------------------

export const farmer = {
  name: 'Nguyễn Văn Tám',
  coop: { vi: 'HTX Thanh Long Chợ Gạo', en: 'Cho Gao Dragon Fruit Co-op' },
  memberSince: 2019,
  phone: '+84 90 xxx 4412',
}

export const plot = {
  id: 'plot-001',
  name: { vi: 'Vườn thanh long Chợ Gạo', en: 'Cho Gao dragon fruit plot' },
  crop: { vi: 'Thanh long ruột trắng', en: 'White-flesh dragon fruit' },
  areaHa: 0.5,
  gps: '10.3654° N, 106.4231° E',
  address: { vi: 'Chợ Gạo, Tiền Giang', en: 'Cho Gao, Tien Giang' },
  plantedYear: 2019,
  pillars: 620,
}

// ---------------------------------------------------------------------------
// Sensor station (one kit = one zone)
// ---------------------------------------------------------------------------

export const device = {
  id: 'A-102',
  network: 'LoRaWAN',
  battery: 87,
  zone: { vi: 'Đại diện Khu 1 · 0.5 ha', en: 'Represents Zone 1 · 0.5 ha' },
}

/** Rain is NOT measured on the kit — it is read off the co-op gauge 1.2 km away. */
export const coopRain = {
  name: { vi: 'Vũ kế HTX Chợ Gạo', en: 'Cho Gao Co-op rain gauge' },
  distanceKm: 1.2,
  mm24h: 0,
}

/** What the station actually measures — used by the sensor screen legend. */
export const sensorChannels: { id: string; label: Bilingual; unit: string }[] = [
  { id: 'moisture', label: { vi: 'Độ ẩm đất', en: 'Soil moisture' }, unit: '%' },
  { id: 'ec', label: { vi: 'Độ dẫn điện đất (EC)', en: 'Soil EC' }, unit: 'dS/m' },
  { id: 'temp', label: { vi: 'Nhiệt độ không khí', en: 'Air temperature' }, unit: '°C' },
  { id: 'humidity', label: { vi: 'Độ ẩm không khí', en: 'Air humidity' }, unit: '%' },
]

// ---------------------------------------------------------------------------
// Ledger — exactly 14 seed records, newest first
// ---------------------------------------------------------------------------

export const seedLedger: LedgerEvent[] = [
  {
    id: 'e1',
    type: 'water',
    title: { vi: 'Tưới nhỏ giọt Khu 1', en: 'Drip irrigation Zone 1' },
    detail: { vi: '25 phút · 1.8 m³ · độ ẩm 52% → 66%', en: '25 min · 1.8 m³ · moisture 52% → 66%' },
    time: '14/08 · 06:15',
    hash: H('9f4c1e77a208b35d6c04'),
    block: 47921,
  },
  {
    id: 'e2',
    type: 'sensor',
    title: { vi: 'Đồng bộ dữ liệu trạm A-102', en: 'Station A-102 data sync' },
    detail: { vi: 'Độ ẩm 61% · EC 1.12 dS/m · 31.4 °C', en: 'Moisture 61% · EC 1.12 dS/m · 31.4 °C' },
    time: '13/08 · 18:00',
    hash: H('3b81d0a6f4592ce7104b'),
    block: 47908,
  },
  {
    id: 'e3',
    type: 'sensor',
    title: { vi: 'Lắp đặt trạm cảm biến A-102', en: 'Sensor station A-102 installed' },
    detail: { vi: 'Độ ẩm đất, EC, nhiệt độ, LoRaWAN', en: 'Soil moisture, EC, temp, LoRaWAN' },
    time: '13/08 · 09:20',
    hash: H('c17a45e903bd28f6710e'),
    block: 47893,
  },
  {
    id: 'e4',
    type: 'spray',
    title: { vi: 'Phun sinh học phòng đốm nâu', en: 'Biological spray — brown spot' },
    detail: {
      vi: 'Trichoderma · 12 L · cách ly 3 ngày',
      en: 'Trichoderma · 12 L · 3-day pre-harvest interval',
    },
    time: '12/08 · 16:40',
    hash: H('7e2f9b04ac516d38e2a1'),
    block: 47880,
  },
  {
    id: 'e5',
    type: 'scan',
    title: { vi: 'Quét chẩn đoán lá', en: 'Leaf diagnostic scan' },
    detail: { vi: 'Đốm nâu nhẹ · độ tin cậy 91%', en: 'Mild brown spot · 91% confidence' },
    time: '11/08 · 10:05',
    hash: H('a05c73e1b8f4029d6c37'),
    block: 47861,
  },
  {
    id: 'e6',
    type: 'fertilizer',
    title: { vi: 'Bón phân NPK 20-20-15', en: 'NPK 20-20-15 fertiliser applied' },
    detail: { vi: '40 kg · rải quanh gốc · 620 trụ', en: '40 kg · broadcast at base · 620 pillars' },
    time: '09/08 · 07:30',
    hash: H('2c6e08b1f739a4d05e82'),
    block: 47849,
  },
  {
    id: 'e7',
    type: 'lab',
    title: { vi: 'Kết quả phân tích đất định kỳ', en: 'Semiannual soil lab panel' },
    detail: {
      vi: 'N-P-K, pH, chất hữu cơ · SGS Cần Thơ · PDF đã băm',
      en: 'N-P-K, pH, organic matter · SGS Can Tho · PDF hashed',
    },
    time: '04/08 · 14:30',
    hash: H('05e9b7f2a13c48d6e2f0'),
    block: 47834,
  },
  {
    id: 'e8',
    type: 'water',
    title: { vi: 'Tưới nhỏ giọt Khu 1', en: 'Drip irrigation Zone 1' },
    detail: { vi: '30 phút · 2.1 m³', en: '30 min · 2.1 m³' },
    time: '02/08 · 06:00',
    hash: H('61b3fa08c25d97e4013a'),
    block: 47818,
  },
  {
    id: 'e9',
    type: 'spray',
    title: { vi: 'Phun dưỡng lá', en: 'Foliar nutrient spray' },
    detail: { vi: 'Canxi-Bo · 10 L · cách ly 0 ngày', en: 'Calcium-boron · 10 L · 0-day PHI' },
    time: '30/07 · 17:10',
    hash: H('d94e2107b6cf8305a1e6'),
    block: 47799,
  },
  {
    id: 'e10',
    type: 'scan',
    title: { vi: 'Quét kiểm tra trái non', en: 'Young fruit inspection scan' },
    detail: { vi: 'Không phát hiện bệnh · 96%', en: 'No disease detected · 96%' },
    time: '28/07 · 09:45',
    hash: H('4f70c8b93e21ad506fb2'),
    block: 47784,
  },
  {
    id: 'e11',
    type: 'fertilizer',
    title: { vi: 'Bón phân hữu cơ vi sinh', en: 'Microbial organic fertiliser' },
    detail: { vi: '120 kg · ủ hoai · 620 trụ', en: '120 kg · composted · 620 pillars' },
    time: '25/07 · 07:00',
    hash: H('8a13e5f7024bc69d31e0'),
    block: 47767,
  },
  {
    id: 'e12',
    type: 'water',
    title: { vi: 'Tưới nhỏ giọt Khu 1', en: 'Drip irrigation Zone 1' },
    detail: { vi: '20 phút · 1.4 m³', en: '20 min · 1.4 m³' },
    time: '22/07 · 06:20',
    hash: H('e07d3fa91c845b620e13'),
    block: 47750,
  },
  {
    id: 'e13',
    type: 'spray',
    title: { vi: 'Phun phòng rệp sáp', en: 'Mealybug preventive spray' },
    detail: { vi: 'Dầu khoáng · 15 L · cách ly 7 ngày', en: 'Mineral oil · 15 L · 7-day PHI' },
    time: '18/07 · 16:55',
    hash: H('36c9b18e407fda25931c'),
    block: 47733,
  },
  {
    id: 'e14',
    type: 'scan',
    title: { vi: 'Đăng ký lô đất · Định vị GPS', en: 'Plot registration · GPS geolocation' },
    detail: {
      vi: 'Ranh giới 6 điểm · 0.5 ha · hồ sơ EUDR',
      en: '6-point boundary · 0.5 ha · EUDR record',
    },
    time: '15/07 · 08:30',
    hash: H('1d48ea6039fb7c25801e'),
    block: 47718,
  },
]

export const seedLastBlock = 47921

// ---------------------------------------------------------------------------
// Certificate
// ---------------------------------------------------------------------------

export interface CertRequirement {
  id: string
  label: Bilingual
  done: boolean
}

export const certRequirements: CertRequirement[] = [
  { id: 'geo', label: { vi: 'Định vị GPS lô đất (EUDR)', en: 'Plot geolocation (EUDR)' }, done: true },
  { id: 'spray', label: { vi: 'Nhật ký phun thuốc', en: 'Spray diary' }, done: true },
  { id: 'water', label: { vi: 'Nhật ký tưới tiêu', en: 'Irrigation log' }, done: true },
  { id: 'lab', label: { vi: 'Phân tích đất định kỳ', en: 'Semiannual soil lab panel' }, done: true },
  { id: 'harvest', label: { vi: 'Hồ sơ thu hoạch', en: 'Harvest record' }, done: false },
]

/** The certificate is always a DRAFT — readiness is capped at 96%. */
export const certificate = {
  standard: { vi: 'Hồ sơ tuân thủ EUDR (bản nháp)', en: 'EUDR compliance dossier (draft)' },
  issuer: { vi: 'AgriTrust · HTX Chợ Gạo', en: 'AgriTrust · Cho Gao Co-op' },
  validity: { vi: 'Cần xác minh của bên thứ ba', en: 'Pending third-party verification' },
}

// ---------------------------------------------------------------------------
// Satellite / plot intelligence
// ---------------------------------------------------------------------------

export const satellite = {
  /** Plot boundary, relative 0–1 coords so the overlay scales to any viewport. */
  boundary: [
    { x: 0.16, y: 0.22 },
    { x: 0.54, y: 0.13 },
    { x: 0.86, y: 0.31 },
    { x: 0.82, y: 0.72 },
    { x: 0.44, y: 0.88 },
    { x: 0.14, y: 0.63 },
  ],
  /** NDVI hot-spots for the gradient overlay. value 0–1. */
  ndviZones: [
    { cx: 0.33, cy: 0.34, r: 0.18, value: 0.78 },
    { cx: 0.61, cy: 0.29, r: 0.15, value: 0.71 },
    { cx: 0.7, cy: 0.6, r: 0.2, value: 0.64 },
    { cx: 0.36, cy: 0.68, r: 0.16, value: 0.52 },
    { cx: 0.5, cy: 0.48, r: 0.13, value: 0.83 },
  ],
  ndviAvg: 0.7,
  climate: {
    vi: 'Nhiệt đới gió mùa — phù hợp thanh long',
    en: 'Tropical monsoon — well suited to dragon fruit',
  },
  rainRisk: {
    level: 'low' as 'low' | 'med' | 'high',
    note: {
      vi: 'Vũ kế HTX: 0 mm/24 h · khô ráo 3 ngày tới',
      en: 'Co-op gauge: 0 mm/24 h · dry for the next 3 days',
    },
  },
  capturedAt: { vi: 'Ảnh Sentinel-2 · 13/08', en: 'Sentinel-2 imagery · 13 Aug' },
}

// ---------------------------------------------------------------------------
// Scan (leaf diagnosis) — result screen data
// ---------------------------------------------------------------------------

export const scanResult = {
  photoId: 'photo-001',
  diagnosis: { vi: 'Đốm nâu thanh long (nhẹ)', en: 'Dragon fruit brown spot (mild)' },
  confidence: 0.91,
  severity: { vi: 'Nhẹ · 6% diện tích cành', en: 'Mild · 6% of stem area' },
  actions: [
    {
      vi: 'Cắt bỏ cành bệnh, tiêu huỷ xa vườn',
      en: 'Prune affected stems and dispose away from the plot',
    },
    { vi: 'Phun Trichoderma sau 2 ngày nắng', en: 'Spray Trichoderma after 2 dry days' },
    { vi: 'Giảm tưới đêm để hạ ẩm tán', en: 'Reduce night irrigation to lower canopy humidity' },
  ],
}

// ---------------------------------------------------------------------------
// Market / batches
// ---------------------------------------------------------------------------

export type BatchStatus = 'draft' | 'listed' | 'sold'

export interface Batch {
  id: string
  name: Bilingual
  farm: Bilingual
  weightKg: number
  priceUsdPerKg: number
  grade: string
  harvest: string
  records: number
  live: boolean
}

/** `batch-001` is the farmer's own batch — its record count is driven by the live ledger. */
export const batches: Batch[] = [
  {
    id: 'batch-001',
    name: { vi: 'Thanh long ruột trắng · Lô 001', en: 'White dragon fruit · Batch 001' },
    farm: { vi: 'Vườn Nguyễn Văn Tám · Chợ Gạo', en: "Nguyen Van Tam's plot · Cho Gao" },
    weightKg: 1200,
    priceUsdPerKg: 1.85,
    grade: 'A',
    harvest: '18/08',
    records: 14,
    live: true,
  },
  {
    id: 'batch-002',
    name: { vi: 'Thanh long ruột đỏ · Lô 002', en: 'Red dragon fruit · Batch 002' },
    farm: { vi: 'Vườn Trần Thị Lành · Châu Thành', en: "Tran Thi Lanh's plot · Chau Thanh" },
    weightKg: 800,
    priceUsdPerKg: 2.4,
    grade: 'A',
    harvest: '20/08',
    records: 9,
    live: false,
  },
  {
    id: 'batch-003',
    name: { vi: 'Thanh long ruột trắng · Lô 003', en: 'White dragon fruit · Batch 003' },
    farm: { vi: 'Vườn Lê Văn Hùng · Gò Công', en: "Le Van Hung's plot · Go Cong" },
    weightKg: 1500,
    priceUsdPerKg: 1.62,
    grade: 'B',
    harvest: '22/08',
    records: 7,
    live: false,
  },
]

/**
 * Read-only mirrors for the non-live batches on the exporter verify page.
 * `batch-001` is intentionally absent — it reads the farmer's live ledger.
 */
export const mirrorLedgers: Record<string, LedgerEvent[]> = {
  'batch-002': [
    {
      id: 'm2-1',
      type: 'water',
      title: { vi: 'Tưới nhỏ giọt', en: 'Drip irrigation' },
      detail: { vi: '35 phút · 2.4 m³', en: '35 min · 2.4 m³' },
      time: '13/08 · 06:05',
      hash: H('77ac014be3f8250d96a1'),
      block: 47899,
    },
    {
      id: 'm2-2',
      type: 'lab',
      title: { vi: 'Kết quả phân tích đất định kỳ', en: 'Semiannual soil lab panel' },
      detail: {
        vi: 'N-P-K, pH, chất hữu cơ · SGS Cần Thơ',
        en: 'N-P-K, pH, organic matter · SGS Can Tho',
      },
      time: '06/08 · 11:20',
      hash: H('e310b8d5affe27049c6b'),
      block: 47846,
    },
    {
      id: 'm2-3',
      type: 'spray',
      title: { vi: 'Phun sinh học', en: 'Biological spray' },
      detail: { vi: 'Trichoderma · 9 L · cách ly 3 ngày', en: 'Trichoderma · 9 L · 3-day PHI' },
      time: '01/08 · 17:30',
      hash: H('5cb70e2914df8a63d015'),
      block: 47812,
    },
    {
      id: 'm2-4',
      type: 'sensor',
      title: { vi: 'Lắp đặt trạm cảm biến B-207', en: 'Sensor station B-207 installed' },
      detail: { vi: 'Độ ẩm đất, EC, nhiệt độ, LoRaWAN', en: 'Soil moisture, EC, temp, LoRaWAN' },
      time: '26/07 · 08:40',
      hash: H('0b6f39e7c25a184d70fe'),
      block: 47775,
    },
    {
      id: 'm2-5',
      type: 'scan',
      title: { vi: 'Đăng ký lô đất · Định vị GPS', en: 'Plot registration · GPS geolocation' },
      detail: { vi: 'Ranh giới 5 điểm · 0.8 ha', en: '5-point boundary · 0.8 ha' },
      time: '19/07 · 09:10',
      hash: H('92d41c0af6be7350281d'),
      block: 47741,
    },
  ],
  'batch-003': [
    {
      id: 'm3-1',
      type: 'fertilizer',
      title: { vi: 'Bón phân NPK 16-16-8', en: 'NPK 16-16-8 fertiliser applied' },
      detail: { vi: '55 kg · 900 trụ', en: '55 kg · 900 pillars' },
      time: '12/08 · 07:15',
      hash: H('af02e79b1c3d56480ae2'),
      block: 47884,
    },
    {
      id: 'm3-2',
      type: 'water',
      title: { vi: 'Tưới nhỏ giọt', en: 'Drip irrigation' },
      detail: { vi: '40 phút · 3.0 m³', en: '40 min · 3.0 m³' },
      time: '05/08 · 06:30',
      hash: H('68e1d4903b7fca25107a'),
      block: 47840,
    },
    {
      id: 'm3-3',
      type: 'lab',
      title: { vi: 'Kết quả phân tích đất định kỳ', en: 'Semiannual soil lab panel' },
      detail: {
        vi: 'N-P-K, pH, chất hữu cơ · SGS Cần Thơ',
        en: 'N-P-K, pH, organic matter · SGS Can Tho',
      },
      time: '29/07 · 15:05',
      hash: H('c405a9f2e8b16d370f9c'),
      block: 47793,
    },
    {
      id: 'm3-4',
      type: 'scan',
      title: { vi: 'Đăng ký lô đất · Định vị GPS', en: 'Plot registration · GPS geolocation' },
      detail: { vi: 'Ranh giới 7 điểm · 1.1 ha', en: '7-point boundary · 1.1 ha' },
      time: '21/07 · 08:05',
      hash: H('3e7b02c1d95f4a86e207'),
      block: 47752,
    },
  ],
}

/** GPS shown on the exporter verify banner, per batch. */
export const batchGps: Record<string, string> = {
  'batch-001': plot.gps,
  'batch-002': '10.3891° N, 106.3577° E',
  'batch-003': '10.3122° N, 106.6408° E',
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export interface Notif {
  id: string
  icon: string
  title: Bilingual
  body: Bilingual
  time: string
  read: boolean
}

export const seedNotifs: Notif[] = [
  {
    id: 'n1',
    icon: '🌧️',
    title: { vi: 'Dự báo mưa', en: 'Rain forecast' },
    body: {
      vi: 'Vũ kế HTX Chợ Gạo: 0 mm/24 h. Nên tưới sáng mai.',
      en: 'Cho Gao Co-op gauge: 0 mm/24 h. Irrigate tomorrow morning.',
    },
    time: '14/08 · 05:40',
    read: true,
  },
  {
    id: 'n2',
    icon: '🔋',
    title: { vi: 'Trạm A-102', en: 'Station A-102' },
    body: { vi: 'Pin còn 87% · tín hiệu LoRaWAN tốt', en: 'Battery 87% · LoRaWAN signal good' },
    time: '13/08 · 18:02',
    read: true,
  },
]
