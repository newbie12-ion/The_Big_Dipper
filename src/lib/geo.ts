// Small geo toolkit for the farm map.
//
// Everything the map draws is derived from real WGS-84 coordinates, so the
// hectares shown on screen are computed from the polygon on the map — not a
// hard-coded label. Two projections are used:
//
//   • equirectangular (metres, local)  — for areas and distances. At a 130 m
//     farm the error against a proper geodesic solver is well under 1 cm.
//   • Web Mercator (pixels)            — for placing raster satellite tiles,
//     which is the projection every XYZ tile server uses.

export interface LatLng {
  lat: number;
  lng: number;
}

/** Metres per degree of latitude (mean value, good to ~0.1% anywhere). */
const M_PER_DEG_LAT = 110574;

/** Metres per degree of longitude at a given latitude. */
export const metresPerDegreeLng = (lat: number) =>
  111320 * Math.cos((lat * Math.PI) / 180);

/**
 * Offset a point by a local ENU vector in metres.
 * `east` is +x, `north` is +y.
 */
export const offsetMetres = (
  origin: LatLng,
  east: number,
  north: number,
): LatLng => ({
  lat: origin.lat + north / M_PER_DEG_LAT,
  lng: origin.lng + east / metresPerDegreeLng(origin.lat),
});

/** Rotate a local metre vector clockwise-from-north by `degrees`. */
export const rotate = (east: number, north: number, degrees: number) => {
  const r = (degrees * Math.PI) / 180;
  return {
    east: east * Math.cos(r) - north * Math.sin(r),
    north: east * Math.sin(r) + north * Math.cos(r),
  };
};

/**
 * Signed area of a lat/lng ring in square metres (shoelace on a local
 * equirectangular projection anchored at the ring's own mean latitude).
 */
export const polygonAreaSqm = (ring: LatLng[]): number => {
  if (ring.length < 3) return 0;

  const meanLat = ring.reduce((sum, p) => sum + p.lat, 0) / ring.length;
  const kx = metresPerDegreeLng(meanLat);
  const points = ring.map((p) => ({ x: p.lng * kx, y: p.lat * M_PER_DEG_LAT }));

  let twiceArea = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    twiceArea += a.x * b.y - b.x * a.y;
  }

  return Math.abs(twiceArea) / 2;
};

export const sqmToHectares = (sqm: number) => sqm / 10000;

/** `0,125 ha` in Vietnamese, `0.125 ha` in English. */
export const formatHectares = (sqm: number, language: "vi" | "en") => {
  const ha = sqmToHectares(sqm);
  const text = ha.toFixed(ha < 1 ? 3 : 2);
  return language === "vi" ? text.replace(".", ",") : text;
};

export const formatSqm = (sqm: number, language: "vi" | "en") =>
  new Intl.NumberFormat(language === "vi" ? "vi-VN" : "en-US", {
    maximumFractionDigits: 0,
  }).format(sqm);

export const centroid = (ring: LatLng[]): LatLng => ({
  lat: ring.reduce((sum, p) => sum + p.lat, 0) / ring.length,
  lng: ring.reduce((sum, p) => sum + p.lng, 0) / ring.length,
});

// ── Web Mercator ───────────────────────────────────────────────────────────

export const TILE_SIZE = 256;

/** Project to absolute pixel coordinates at a given zoom level. */
export const project = (point: LatLng, zoom: number) => {
  const scale = TILE_SIZE * 2 ** zoom;
  const sinLat = Math.sin((point.lat * Math.PI) / 180);
  return {
    x: ((point.lng + 180) / 360) * scale,
    y:
      (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
  };
};

/** Ground resolution in metres per pixel at a latitude / zoom. */
export const metresPerPixel = (lat: number, zoom: number) =>
  (156543.03392 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;

/**
 * Esri World Imagery — public, no API key, note the `{z}/{y}/{x}` order.
 * Coverage over the Mekong Delta tops out at z18; higher zooms return blanks,
 * so callers should cap there and scale up instead.
 */
export const satelliteTileUrl = (z: number, x: number, y: number) =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;
