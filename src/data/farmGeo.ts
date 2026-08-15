// Real-world geometry for Chị Hoa's farm.
//
// The plot is a real parcel outline over Chợ Gạo, Tiền Giang — the dragon-fruit
// belt of the Mekong Delta. It is described once as a quadrilateral in local
// metres, converted to WGS-84, and then subdivided 4 × 2 into the eight
// management zones the sensor kits report against.
//
// Nothing here is a hard-coded hectare figure: `farmAreaSqm` and every
// `zone.areaSqm` are measured off the polygon that actually gets drawn, so the
// map and the numbers can never drift apart.

import {
  centroid,
  offsetMetres,
  polygonAreaSqm,
  rotate,
  type LatLng,
} from "../lib/geo";
import { farmZones, type ZoneId } from "./mockData";

/** Parcel centre — verified against Esri World Imagery at zoom 18. */
export const FARM_CENTRE: LatLng = { lat: 10.389829, lng: 106.465141 };

/** Bearing of the planting rows, degrees clockwise from north. */
const ROW_BEARING = 12;

/**
 * Parcel corners in local metres from the centre, ordered
 * SW → SE → NE → NW (counter-clockwise on screen once projected).
 * Deliberately not a perfect rectangle — real title boundaries never are.
 */
const CORNERS_M: Array<[number, number]> = [
  [-63, -41],
  [61, -44],
  [63, 40],
  [-61, 37],
];

const toLatLng = ([east, north]: [number, number]): LatLng => {
  const spun = rotate(east, north, ROW_BEARING);
  return offsetMetres(FARM_CENTRE, spun.east, spun.north);
};

export const farmBoundary: LatLng[] = CORNERS_M.map(toLatLng);
export const farmAreaSqm = polygonAreaSqm(farmBoundary);

const [SW, SE, NE, NW] = CORNERS_M;

/** Bilinear point inside the parcel. u runs SW→SE, v runs SW→NW. */
const cell = (u: number, v: number): [number, number] => [
  (1 - u) * (1 - v) * SW[0] + u * (1 - v) * SE[0] + u * v * NE[0] + (1 - u) * v * NW[0],
  (1 - u) * (1 - v) * SW[1] + u * (1 - v) * SE[1] + u * v * NE[1] + (1 - u) * v * NW[1],
];

export const ZONE_COLUMNS = 4;
export const ZONE_ROWS = 2;

export interface ZoneGeometry {
  id: ZoneId;
  /** Closed ring, 4 corners, clockwise on screen. */
  ring: LatLng[];
  /** Measured off `ring`, never declared. */
  areaSqm: number;
  /** Where the zone label and the sensor-station pin sit. */
  centre: LatLng;
  column: number;
  row: number;
}

export const zoneGeometry: ZoneGeometry[] = farmZones.map((zone, index) => {
  const column = index % ZONE_COLUMNS;
  // Row 0 is the southern half (dragon fruit); row 1 is the north (coffee).
  const row = Math.floor(index / ZONE_COLUMNS);
  const u0 = column / ZONE_COLUMNS;
  const u1 = (column + 1) / ZONE_COLUMNS;
  const v0 = row / ZONE_ROWS;
  const v1 = (row + 1) / ZONE_ROWS;

  const ring = [
    cell(u0, v0),
    cell(u1, v0),
    cell(u1, v1),
    cell(u0, v1),
  ].map(toLatLng);

  return {
    id: zone.id,
    ring,
    areaSqm: polygonAreaSqm(ring),
    centre: centroid(ring),
    column,
    row,
  };
});

const geometryById = new Map(zoneGeometry.map((item) => [item.id, item]));

export const getZoneGeometry = (id: ZoneId) => geometryById.get(id) ?? zoneGeometry[0];

/** `10°23'23.4"N 106°27'54.5"E` — the format an auditor expects on an EUDR file. */
export const formatDms = ({ lat, lng }: LatLng) => {
  const part = (value: number, positive: string, negative: string) => {
    const hemisphere = value >= 0 ? positive : negative;
    const abs = Math.abs(value);
    const degrees = Math.floor(abs);
    const minutes = Math.floor((abs - degrees) * 60);
    const seconds = ((abs - degrees) * 60 - minutes) * 60;
    return `${degrees}°${String(minutes).padStart(2, "0")}'${seconds.toFixed(1)}"${hemisphere}`;
  };

  return `${part(lat, "N", "S")} ${part(lng, "E", "W")}`;
};
