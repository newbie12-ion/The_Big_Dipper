import { useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  TILE_SIZE,
  metresPerPixel,
  project,
  satelliteTileUrl,
  type LatLng,
} from "../lib/geo";
import { farmBoundary, zoneGeometry } from "../data/farmGeo";
import { farmZones, type ZoneId } from "../data/mockData";
import { cx } from "./ui";

/**
 * Esri World Imagery stops serving real pixels over the Mekong Delta above
 * z18 — anything higher comes back blank, so we cap here and scale the tiles
 * up to fit instead.
 */
const TILE_ZOOM = 18;
const PADDING_PX = 22;

export type MapLayer = "satellite" | "moisture";

/** Moisture choropleth. Bands match the agronomy thresholds used on the zone screen. */
const moistureFill = (moisture: number) => {
  if (moisture < 45) return "#ef4444";
  if (moisture < 55) return "#f59e0b";
  return "#16a34a";
};

const niceScaleBar = (metresPerScreenPx: number) => {
  const candidates = [5, 10, 20, 25, 50, 100, 200];
  const target = candidates.find((m) => m / metresPerScreenPx >= 46) ?? 200;
  return { metres: target, px: target / metresPerScreenPx };
};

export const FarmMap = ({
  selectedZoneId,
  onSelectZone,
  layer,
  language,
}: {
  selectedZoneId: ZoneId | null;
  onSelectZone: (zoneId: ZoneId) => void;
  layer: MapLayer;
  language: "vi" | "en";
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(360);
  const [tilesBroken, setTilesBroken] = useState(false);

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const measure = () => setWidth(node.clientWidth || 360);
    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const height = Math.round(width * 0.82);

  const view = useMemo(() => {
    const points = farmBoundary.map((point) => project(point, TILE_ZOOM));
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));

    const scale = Math.min(
      (width - PADDING_PX * 2) / (maxX - minX),
      (height - PADDING_PX * 2) / (maxY - minY),
    );
    const originX = (minX + maxX) / 2;
    const originY = (minY + maxY) / 2;

    const toScreen = (point: LatLng) => {
      const world = project(point, TILE_ZOOM);
      return {
        x: (world.x - originX) * scale + width / 2,
        y: (world.y - originY) * scale + height / 2,
      };
    };

    // Tile range covering the viewport, in world-pixel space.
    const halfW = width / (2 * scale);
    const halfH = height / (2 * scale);
    const tileX0 = Math.floor((originX - halfW) / TILE_SIZE);
    const tileX1 = Math.floor((originX + halfW) / TILE_SIZE);
    const tileY0 = Math.floor((originY - halfH) / TILE_SIZE);
    const tileY1 = Math.floor((originY + halfH) / TILE_SIZE);

    const tiles: Array<{ key: string; url: string; left: number; top: number; size: number }> = [];
    for (let ty = tileY0; ty <= tileY1; ty += 1) {
      for (let tx = tileX0; tx <= tileX1; tx += 1) {
        tiles.push({
          key: `${tx}-${ty}`,
          url: satelliteTileUrl(TILE_ZOOM, tx, ty),
          left: (tx * TILE_SIZE - originX) * scale + width / 2,
          top: (ty * TILE_SIZE - originY) * scale + height / 2,
          size: TILE_SIZE * scale,
        });
      }
    }

    const metresPerScreenPx = metresPerPixel(farmBoundary[0].lat, TILE_ZOOM) / scale;

    return { toScreen, tiles, metresPerScreenPx };
  }, [width, height]);

  const ringPath = (ring: LatLng[]) =>
    `${ring
      .map((point, index) => {
        const { x, y } = view.toScreen(point);
        return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(" ")} Z`;

  const scaleBar = niceScaleBar(view.metresPerScreenPx);
  const showSatellite = layer === "satellite" && !tilesBroken;

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-[24px] bg-[#22331f]"
      style={{ height }}
    >
      {/* raster basemap */}
      {layer === "satellite" ? (
        <div className="absolute inset-0" aria-hidden>
          {view.tiles.map((tile) => (
            <img
              key={tile.key}
              src={tile.url}
              alt=""
              draggable={false}
              onError={() => setTilesBroken(true)}
              className="absolute select-none"
              style={{
                left: tile.left,
                top: tile.top,
                width: tile.size,
                height: tile.size,
              }}
            />
          ))}
        </div>
      ) : null}

      {/* offline / moisture-layer backdrop */}
      {!showSatellite ? (
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "repeating-linear-gradient(102deg, #24401f 0px, #24401f 7px, #2c4d25 7px, #2c4d25 15px)",
          }}
        />
      ) : null}

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${width} ${height}`}
        role="group"
        aria-label={
          language === "vi"
            ? "Bản đồ nông trại, chạm vào một khu để chọn"
            : "Farm map, tap a zone to select it"
        }
      >
        {/* parcel outline */}
        <path
          d={ringPath(farmBoundary)}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={2.5}
          strokeDasharray="7 4"
        />

        {zoneGeometry.map((geometry, index) => {
          const zone = farmZones[index];
          const isSelected = zone.id === selectedZoneId;
          const centre = view.toScreen(geometry.centre);
          const fill = layer === "moisture" ? moistureFill(zone.moisture) : "#ffffff";
          const fillOpacity = layer === "moisture" ? (isSelected ? 0.78 : 0.55) : isSelected ? 0.3 : 0.08;

          return (
            <g key={zone.id}>
              <path
                d={ringPath(geometry.ring)}
                fill={fill}
                fillOpacity={fillOpacity}
                stroke={isSelected ? "#ffffff" : "rgba(255,255,255,0.75)"}
                strokeWidth={isSelected ? 3.5 : 1.5}
                className="cursor-pointer transition-[fill-opacity]"
                role="button"
                tabIndex={0}
                aria-label={`${zone.name[language]} · ${zone.crop[language]} · ${zone.moisture}%`}
                aria-pressed={isSelected}
                onClick={() => onSelectZone(zone.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectZone(zone.id);
                  }
                }}
              />
              <text
                x={centre.x}
                y={centre.y - 2}
                textAnchor="middle"
                className="pointer-events-none select-none"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  fill: "#ffffff",
                  paintOrder: "stroke",
                  stroke: "rgba(0,0,0,0.55)",
                  strokeWidth: 3,
                  strokeLinejoin: "round",
                }}
              >
                {index + 1}
              </text>
              <text
                x={centre.x}
                y={centre.y + 12}
                textAnchor="middle"
                className="pointer-events-none select-none"
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  fill: "#ffffff",
                  paintOrder: "stroke",
                  stroke: "rgba(0,0,0,0.55)",
                  strokeWidth: 3,
                  strokeLinejoin: "round",
                }}
              >
                {zone.moisture}%
              </text>
            </g>
          );
        })}
      </svg>

      {/* north arrow */}
      <div className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 flex-col items-center justify-center rounded-full bg-black/45 text-[10px] font-bold leading-none text-white backdrop-blur">
        <span className="text-xs">▲</span>
        <span>N</span>
      </div>

      {/* scale bar */}
      <div className="pointer-events-none absolute bottom-3 left-3 flex flex-col gap-1">
        <div
          className="h-1.5 rounded-sm border border-white/80 bg-white/35"
          style={{ width: scaleBar.px }}
        />
        <span className="text-[10px] font-semibold text-white drop-shadow">
          {scaleBar.metres} m
        </span>
      </div>

      <p className="pointer-events-none absolute bottom-2 right-3 text-[9px] font-medium text-white/75">
        {showSatellite
          ? "Esri · Maxar"
          : language === "vi"
            ? "Sơ đồ khu canh tác"
            : "Schematic view"}
      </p>
    </div>
  );
};

/** Legend strip for the moisture layer. */
export const MoistureLegend = ({ language }: { language: "vi" | "en" }) => {
  const items = [
    { color: "#ef4444", label: language === "vi" ? "Dưới 45%" : "Under 45%" },
    { color: "#f59e0b", label: "45–55%" },
    { color: "#16a34a", label: language === "vi" ? "Trên 55%" : "Over 55%" },
  ];

  return (
    <div className="flex items-center gap-3">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-[11px] font-medium text-brand-muted">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
};

/** Small helper so the map and its controls stay visually in sync. */
export const LayerToggle = ({
  layer,
  onChange,
  language,
}: {
  layer: MapLayer;
  onChange: (layer: MapLayer) => void;
  language: "vi" | "en";
}) => {
  const options: Array<{ id: MapLayer; label: string }> = [
    { id: "satellite", label: language === "vi" ? "Vệ tinh" : "Satellite" },
    { id: "moisture", label: language === "vi" ? "Độ ẩm" : "Moisture" },
  ];

  return (
    <div className="inline-flex rounded-2xl border border-brand-line bg-white p-1">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          aria-pressed={layer === option.id}
          className={cx(
            "rounded-xl px-3 py-1.5 text-xs font-semibold transition",
            layer === option.id ? "bg-brand-green text-white" : "text-brand-muted",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
