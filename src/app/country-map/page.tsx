"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { ToolLayout } from "@/components/tool-layout";
import {
  Download,
  Globe,
  MapPin,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  Settings,
  Check,
  Copy,
  Image,
  Map as MapIcon,
  Building2,
  Waves,
  Trees,
  Palette,
  AlertTriangle,
} from "lucide-react";
import * as d3Geo from "d3-geo";
import * as topojsonClient from "topojson-client";
import * as topojsonServer from "topojson-server";

/* ─── Types ─── */

interface CountryFeature {
  type: "Feature";
  id: string;
  properties: { name: string };
  geometry: any;
}

interface CityData {
  name: string;
  country: string;
  lat: number;
  lon: number;
  population?: number;
}


/* ─── Major World Cities (subset for overlay) ─── */

const MAJOR_CITIES: CityData[] = [
  // Asia
  { name: "Tokyo", country: "Japan", lat: 35.68, lon: 139.69, population: 13960000 },
  { name: "Delhi", country: "India", lat: 28.61, lon: 77.21, population: 11030000 },
  { name: "Shanghai", country: "China", lat: 31.23, lon: 121.47, population: 24870000 },
  { name: "Beijing", country: "China", lat: 39.90, lon: 116.40, population: 21540000 },
  { name: "Mumbai", country: "India", lat: 19.08, lon: 72.88, population: 12440000 },
  { name: "Dhaka", country: "Bangladesh", lat: 23.81, lon: 90.41, population: 8910000 },
  { name: "Osaka", country: "Japan", lat: 34.69, lon: 135.50, population: 2753000 },
  { name: "Karachi", country: "Pakistan", lat: 24.86, lon: 67.01, population: 14910000 },
  { name: "Istanbul", country: "Turkey", lat: 41.01, lon: 28.98, population: 15460000 },
  { name: "Kolkata", country: "India", lat: 22.57, lon: 88.36, population: 14850000 },
  { name: "Manila", country: "Philippines", lat: 14.60, lon: 120.98, population: 13920000 },
  { name: "Guangzhou", country: "China", lat: 23.13, lon: 113.26, population: 13500000 },
  { name: "Seoul", country: "South Korea", lat: 37.57, lon: 126.98, population: 9776000 },
  { name: "Jakarta", country: "Indonesia", lat: -6.21, lon: 106.85, population: 10560000 },
  { name: "Taipei", country: "Taiwan", lat: 25.03, lon: 121.57, population: 2602000 },
  { name: "Bangkok", country: "Thailand", lat: 13.76, lon: 100.50, population: 10540000 },
  { name: "Ho Chi Minh", country: "Vietnam", lat: 10.82, lon: 106.63, population: 8990000 },
  { name: "Singapore", country: "Singapore", lat: 1.35, lon: 103.82, population: 5686000 },
  { name: "Kuala Lumpur", country: "Malaysia", lat: 3.14, lon: 101.69, population: 1768000 },
  { name: "Dubai", country: "UAE", lat: 25.20, lon: 55.27, population: 3400000 },
  { name: "Riyadh", country: "Saudi Arabia", lat: 24.71, lon: 46.68, population: 7680000 },
  { name: "Tehran", country: "Iran", lat: 35.69, lon: 51.39, population: 8694000 },
  { name: "Baghdad", country: "Iraq", lat: 33.31, lon: 44.37, population: 8126000 },
  { name: "Lahore", country: "Pakistan", lat: 31.55, lon: 74.35, population: 11130000 },
  { name: "Chengdu", country: "China", lat: 30.57, lon: 104.07, population: 16330000 },
  // Europe
  { name: "London", country: "United Kingdom", lat: 51.51, lon: -0.13, population: 8982000 },
  { name: "Paris", country: "France", lat: 48.86, lon: 2.35, population: 2161000 },
  { name: "Madrid", country: "Spain", lat: 40.42, lon: -3.70, population: 3223000 },
  { name: "Berlin", country: "Germany", lat: 52.52, lon: 13.41, population: 3645000 },
  { name: "Moscow", country: "Russia", lat: 55.76, lon: 37.62, population: 12500000 },
  { name: "Rome", country: "Italy", lat: 41.90, lon: 12.50, population: 2873000 },
  { name: "Madrid", country: "Spain", lat: 40.42, lon: -3.70, population: 3223000 },
  { name: "Bucharest", country: "Romania", lat: 44.43, lon: 26.10, population: 1883000 },
  { name: "Warsaw", country: "Poland", lat: 52.23, lon: 21.01, population: 1794000 },
  { name: "Budapest", country: "Hungary", lat: 47.50, lon: 19.04, population: 1752000 },
  { name: "Vienna", country: "Austria", lat: 48.21, lon: 16.37, population: 1911000 },
  { name: "Prague", country: "Czech Republic", lat: 50.08, lon: 14.44, population: 1309000 },
  { name: "Athens", country: "Greece", lat: 37.98, lon: 23.73, population: 664000 },
  { name: "Lisbon", country: "Portugal", lat: 38.72, lon: -9.14, population: 545000 },
  { name: "Amsterdam", country: "Netherlands", lat: 52.37, lon: 4.90, population: 872000 },
  { name: "Brussels", country: "Belgium", lat: 50.85, lon: 4.35, population: 1209000 },
  { name: "Stockholm", country: "Sweden", lat: 59.33, lon: 18.07, population: 975000 },
  { name: "Copenhagen", country: "Denmark", lat: 55.68, lon: 12.57, population: 794000 },
  { name: "Helsinki", country: "Finland", lat: 60.17, lon: 24.94, population: 653000 },
  { name: "Oslo", country: "Norway", lat: 59.91, lon: 10.75, population: 694000 },
  { name: "Dublin", country: "Ireland", lat: 53.35, lon: -6.26, population: 1228000 },
  { name: "Zurich", country: "Switzerland", lat: 47.38, lon: 8.54, population: 434000 },
  // Africa
  { name: "Lagos", country: "Nigeria", lat: 6.52, lon: 3.38, population: 15390000 },
  { name: "Cairo", country: "Egypt", lat: 30.04, lon: 31.24, population: 9540000 },
  { name: "Kinshasa", country: "DR Congo", lat: -4.44, lon: 15.27, population: 14340000 },
  { name: "Johannesburg", country: "South Africa", lat: -26.20, lon: 28.05, population: 5635000 },
  { name: "Nairobi", country: "Kenya", lat: -1.29, lon: 36.82, population: 4397000 },
  { name: "Addis Ababa", country: "Ethiopia", lat: 9.02, lon: 38.75, population: 3352000 },
  { name: "Dar es Salaam", country: "Tanzania", lat: -6.79, lon: 39.28, population: 4365000 },
  { name: "Casablanca", country: "Morocco", lat: 33.57, lon: -7.59, population: 3752000 },
  { name: "Algiers", country: "Algeria", lat: 36.75, lon: 3.04, population: 3416000 },
  { name: "Accra", country: "Ghana", lat: 5.60, lon: -0.19, population: 2291000 },
  { name: "Luanda", country: "Angola", lat: -8.84, lon: 13.23, population: 8330000 },
  { name: "Maputo", country: "Mozambique", lat: -25.97, lon: 32.57, population: 1102000 },
  // Americas
  { name: "New York", country: "United States", lat: 40.71, lon: -74.01, population: 8336000 },
  { name: "Los Angeles", country: "United States", lat: 34.05, lon: -118.24, population: 3979000 },
  { name: "Chicago", country: "United States", lat: 41.88, lon: -87.63, population: 2693000 },
  { name: "Houston", country: "United States", lat: 29.76, lon: -95.37, population: 2320000 },
  { name: "Toronto", country: "Canada", lat: 43.65, lon: -79.38, population: 2794000 },
  { name: "Mexico City", country: "Mexico", lat: 19.43, lon: -99.13, population: 9210000 },
  { name: "São Paulo", country: "Brazil", lat: -23.55, lon: -46.63, population: 12330000 },
  { name: "Buenos Aires", country: "Argentina", lat: -34.60, lon: -58.38, population: 3076000 },
  { name: "Lima", country: "Peru", lat: -12.05, lon: -77.04, population: 8852000 },
  { name: "Bogotá", country: "Colombia", lat: 4.71, lon: -74.07, population: 7413000 },
  { name: "Santiago", country: "Chile", lat: -33.45, lon: -70.67, population: 5614000 },
  { name: "Miami", country: "United States", lat: 25.76, lon: -80.19, population: 467000 },
  { name: "San Francisco", country: "United States", lat: 37.77, lon: -122.42, population: 874000 },
  { name: "Vancouver", country: "Canada", lat: 49.28, lon: -123.12, population: 631500 },
  { name: "Montreal", country: "Canada", lat: 45.50, lon: -73.57, population: 1704000 },
  { name: "Havana", country: "Cuba", lat: 23.11, lon: -82.37, population: 2141000 },
  { name: "Guatemala City", country: "Guatemala", lat: 14.63, lon: -90.51, population: 1010000 },
  // Oceania
  { name: "Sydney", country: "Australia", lat: -33.87, lon: 151.21, population: 5312000 },
  { name: "Melbourne", country: "Australia", lat: -37.81, lon: 144.96, population: 5078000 },
  { name: "Auckland", country: "New Zealand", lat: -36.85, lon: 174.76, population: 1657000 },
  { name: "Brisbane", country: "Australia", lat: -27.47, lon: 153.03, population: 2514000 },
  { name: "Perth", country: "Australia", lat: -31.95, lon: 115.86, population: 2086000 },
];

/* ─── Constants ─── */

const TOPOJSON_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-10m.json";
const SVG_WIDTH = 960;
const SVG_HEIGHT = 500;
const STREET_SVG_SIZE = 800;

/* ─── Color Palettes for Street Map ─── */
const STREET_PALETTES: Record<string, { bg: string; roads: string; water: string; buildings: string; parks: string; label: string; accent: string }> = {
  sage:   { bg: "#f5f3ee", roads: "#b5b0a8", water: "#9aab9e", buildings: "#d4d1c8", parks: "#c5d4b8", label: "#6b6860", accent: "#8a9a7e" },
  navy:   { bg: "#f0f2f5", roads: "#8899aa", water: "#5577aa", buildings: "#c0c8d0", parks: "#8aaab0", label: "#3a4a5a", accent: "#4a6a8a" },
  warm:   { bg: "#faf5f0", roads: "#c4a882", water: "#7a9ab0", buildings: "#d8cbb8", parks: "#b8cc98", label: "#7a6850", accent: "#c48040" },
  mono:   { bg: "#f8f8f8", roads: "#999999", water: "#b0b0b0", buildings: "#d0d0d0", parks: "#e0e0e0", label: "#444444", accent: "#666666" },
  dark:   { bg: "#1a1d23", roads: "#555e6a", water: "#3a5a8a", buildings: "#2a2e35", parks: "#2a3a2a", label: "#a0a8b0", accent: "#6a8ab0" },
};

/* ─── Poster Layout Options ─── */
const POSTER_MODES = [
  { label: "None", value: 0 },
  { label: "Poster (2:3)", value: 1, w: 800, h: 1200, mapH: 800, pad: 60, bottomH: 340 },
  { label: "Poster (A3)", value: 2, w: 840, h: 1188, mapH: 780, pad: 50, bottomH: 358 },
  { label: "Wide (3:2)", value: 3, w: 1200, h: 800, mapH: 600, pad: 40, bottomH: 160 },
];

/* ─── Main Page ─── */

export default function CountryMapPage() {
  const [geoFeatures, setGeoFeatures] = useState<CountryFeature[]>([]);
  const [countryList, setCountryList] = useState<{ id: string; name: string }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedProjection, setSelectedProjection] = useState<string>("natural-earth");
  const [showCities, setShowCities] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [copied, setCopied] = useState(false);
  const [admin1Raw, setAdmin1Raw] = useState<any[]>([]);
  const [showBorders, setShowBorders] = useState(true);
  // Street map state
  const [mapMode, setMapMode] = useState<"country" | "street">("country");
  const [streetQuery, setStreetQuery] = useState("");
  const [streetLoading, setStreetLoading] = useState(false);
  const [streetError, setStreetError] = useState<string | null>(null);
  const [streetCityName, setStreetCityName] = useState("");
  const [streetCoords, setStreetCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [streetData, setStreetData] = useState<any>(null);
  const [streetPalette, setStreetPalette] = useState("sage");
  const [streetShowBuildings, setStreetShowBuildings] = useState(true);
  const [streetShowWater, setStreetShowWater] = useState(true);
  const [streetShowParks, setStreetShowParks] = useState(true);
  const [streetShowLabels, setStreetShowLabels] = useState(true);
  const [streetPosterSize, setStreetPosterSize] = useState(0);
  const [streetSearchResults, setStreetSearchResults] = useState<any[]>([]);
  const [streetZoom, setStreetZoom] = useState(14);
  const svgRef = useRef<SVGSVGElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Fetch and parse topojson
  useEffect(() => {
    async function fetchMap() {
      try {
        setLoading(true);
        const resp = await fetch(TOPOJSON_URL);
        if (!resp.ok) throw new Error("Failed to fetch map data");
        const topo = (await resp.json()) as any;
        const geo = topojsonClient.feature(topo, topo.objects.countries) as any;
        const features = geo.features as CountryFeature[];
        // Deduplicate: keep only the largest feature per name (main country, not tiny islands)
        const deduped = features
          .slice()
          .sort((a, b) => d3Geo.geoArea(b as any) - d3Geo.geoArea(a as any))
          .filter((f, _idx, arr) => arr.findIndex((x) => x.properties.name === f.properties.name) === _idx);
        setGeoFeatures(deduped);
        const areaMap = new globalThis.Map(deduped.map((f) => [f.properties.name, d3Geo.geoArea(f as any)]));
        const list = deduped
          .map((f) => ({ id: f.id, name: f.properties.name || `Country ${f.id}` }))
          .sort((a, b) => {
            const aArea = areaMap.get(a.name) || 0;
            const bArea = areaMap.get(b.name) || 0;
            if (Math.abs(aArea - bArea) > 0.01) return bArea - aArea;
            return a.name.localeCompare(b.name);
          });
        setCountryList(list);
        setError(null);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMap();
  }, []);

  // Projection
  const projection = useMemo(() => {
    let base: d3Geo.GeoProjection;
    switch (selectedProjection) {
      case "mercator":
        base = d3Geo.geoMercator();
        break;
      case "orthographic":
        base = d3Geo.geoOrthographic();
        break;
      case "equirectangular":
        base = d3Geo.geoEquirectangular();
        break;
      default:
        base = d3Geo.geoNaturalEarth1();
    }
    // City selected → zoom to city area
    if (selectedCity) {
      const cityScale = selectedProjection === "orthographic" ? 500
        : selectedProjection === "mercator" ? 3000
        : selectedProjection === "equirectangular" ? 3000
        : 2500;
      return base
        .center([selectedCity.lon, selectedCity.lat])
        .scale(cityScale)
        .translate([SVG_WIDTH / 2, SVG_HEIGHT / 2]);
    }
    // Country selected → fit to country or state
    if (selectedCountry !== "all") {
      // State selected → fit to state
      if (selectedState !== "all" && admin1Raw.length > 0) {
        const stateFeature = admin1Raw.find((f: any) => f.properties.name === selectedState);
        if (stateFeature) {
          const pad = 40;
          return base.fitExtent(
            [[pad, pad + 20], [SVG_WIDTH - pad, SVG_HEIGHT - pad]],
            stateFeature
          );
        }
      }
      // Fit to country
      const feature = geoFeatures.find((f) => f.id === selectedCountry);
      if (feature) {
        const pad = 40;
        return base.fitExtent(
          [[pad, pad + 20], [SVG_WIDTH - pad, SVG_HEIGHT - pad]],
          feature
        );
      }
    }
    // World view
    const scale = selectedProjection === "orthographic" ? 200 : 153;
    return base.scale(scale).translate([SVG_WIDTH / 2, SVG_HEIGHT / 2]);
  }, [selectedCountry, selectedCity, selectedState, admin1Raw, geoFeatures, selectedProjection, zoomLevel]);

  const pathGenerator = useMemo(() => d3Geo.geoPath(projection), [projection]);

  // Reset zoom and state when selection changes
  useEffect(() => { setZoomLevel(1); setSelectedState("all"); }, [selectedCountry, selectedCity, selectedProjection]);

  // Fetch admin-1 (state/province) boundaries when a country is selected
  useEffect(() => {
    if (selectedCountry === "all" && !selectedCity) {
      setAdmin1Raw([]);
      return;
    }
    const ADMIN1_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson";
    fetch(ADMIN1_URL)
      .then((r) => r.json())
      .then((geo: any) => {
        const targetName = selectedCountry !== "all"
          ? countryList.find((c) => c.id === selectedCountry)?.name
          : selectedCity?.country;
        if (!targetName) return;
        const filtered = geo.features.filter((f: any) => f.properties.admin === targetName);
        setAdmin1Raw(filtered);
      })
      .catch(() => setAdmin1Raw([]));
  }, [selectedCountry, selectedCity, countryList]);

  // Recompute admin-1 borders mesh whenever projection changes (zoom/pan)
  const admin1BordersPath = useMemo(() => {
    if (admin1Raw.length === 0) return "";
    const features = selectedState !== "all"
      ? admin1Raw.filter((f: any) => f.properties.name === selectedState)
      : admin1Raw;
    if (features.length === 0) return "";
    const featureCollection = { type: "FeatureCollection" as const, features };
    const topo = topojsonServer.topology({ states: featureCollection as any });
    const mesh = topojsonClient.mesh(topo as any, (topo as any).objects.states, (a: any, b: any) => a !== b);
    return pathGenerator(mesh as any) || "";
  }, [admin1Raw, selectedState, pathGenerator]);

  /* ─── Street Map Functions ─── */

  // Search for city (Nominatim geocoding)
  const handleStreetSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setStreetSearchResults([]); return; }
    try {
      const resp = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=8`, {
        headers: { "User-Agent": "StockPulse-MapGenerator/1.0" },
      });
      const data = await resp.json();
      setStreetSearchResults(data);
    } catch { setStreetSearchResults([]); }
  }, []);

  // Fetch OSM data via Overpass API
  const fetchStreetData = useCallback(async (lat: number, lon: number, zoom: number) => {
    setStreetLoading(true);
    setStreetError(null);
    const radius = Math.round(1000 * Math.pow(2, 18 - zoom)); // meters based on zoom
    const query = `[out:json][timeout:30];(
      way["highway"](around:${radius},${lat},${lon});
      ${streetShowBuildings ? `way["building"](around:${radius},${lat},${lon});` : ""}
      ${streetShowWater ? `way["natural"="water"](around:${radius},${lat},${lon});way["waterway"](around:${radius},${lat},${lon});` : ""}
      ${streetShowParks ? `way["leisure"="park"](around:${radius},${lat},${lon});way["landuse"="grass"](around:${radius},${lat},${lon});` : ""}
    );out body;>;out skel qt;`;
    // Try multiple Overpass API mirrors for reliability
    const endpoints = [
      "https://overpass-api.de/api/interpreter",
      "https://overpass.kumi.systems/api/interpreter",
    ];
    for (const url of endpoints) {
      try {
        const resp = await fetch(url, {
          method: "POST",
          body: `data=${encodeURIComponent(query)}`,
        });
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const osm = await resp.json();
        setStreetData(osm);
        setStreetLoading(false);
        return;
      } catch (e) {
        console.warn(`Overpass mirror ${url} failed, trying next...`, e);
      }
    }
    // All mirrors failed
    console.error("All Overpass API mirrors failed");
    setStreetError("Failed to fetch map data. Please try again in a moment.");
    setStreetLoading(false);
  }, [streetShowBuildings, streetShowWater, streetShowParks]);

  // Auto-fetch when zoom changes (debounced)
  useEffect(() => {
    if (mapMode === "street" && streetCoords) {
      const timer = setTimeout(() => {
        fetchStreetData(streetCoords.lat, streetCoords.lon, streetZoom);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [streetZoom, streetCoords, mapMode, fetchStreetData]);

  // Convert OSM data to SVG paths
  const streetSvgElements = useMemo(() => {
    if (!streetData || !streetCoords) return { roads: "", buildings: "", water: "", parks: "", labels: "" };
    const pal = STREET_PALETTES[streetPalette] || STREET_PALETTES.sage;
    const nodeMap = new globalThis.Map<number, [number, number]>();
    (streetData.elements || []).forEach((el: any) => {
      if (el.type === "node") nodeMap.set(el.id, [el.lon, el.lat]);
    });
    const project = (lon: number, lat: number): [number, number] => {
      const x = (lon - streetCoords.lon) * 111320 * Math.cos((streetCoords.lat * Math.PI) / 180);
      const y = (lat - streetCoords.lat) * 110540;
      const scale = 800 / (3000 * Math.pow(2, 18 - streetZoom));
      return [400 + x * scale, 400 + y * scale];
    };
    let roads = "";
    let buildings = "";
    let water = "";
    let parks = "";
    let labels = "";
    (streetData.elements || []).forEach((el: any) => {
      if (el.type !== "way" || !el.nodes) return;
      const points = el.nodes.map((nid: number) => nodeMap.get(nid)).filter(Boolean) as [number, number][];
      if (points.length < 2) return;
      const pathData = points.map((p, i) => {
        const [x, y] = project(p[0], p[1]);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
      const tags = el.tags || {};
      if (tags.highway) {
        const w = ["motorway", "trunk", "primary"].includes(tags.highway) ? 1.5 : ["secondary", "tertiary"].includes(tags.highway) ? 1.0 : 0.6;
        roads += `<path d="${pathData}" fill="none" stroke="${pal.roads}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />\n`;
      } else if (tags.building) {
        buildings += `<path d="${pathData} Z" fill="${pal.buildings}" stroke="${pal.roads}" stroke-width="0.3" />\n`;
      } else if (tags.natural === "water" || tags.waterway) {
        water += `<path d="${pathData} Z" fill="${pal.water}" opacity="0.6" />\n`;
      } else if (tags.leisure === "park" || tags.landuse === "grass") {
        parks += `<path d="${pathData} Z" fill="${pal.parks}" opacity="0.5" />\n`;
      }
    });
    // Add city center label
    labels = `<text x="400" y="790" text-anchor="middle" font-size="16" fill="${pal.label}" font-family="Georgia, serif" font-weight="700" letter-spacing="2">${streetCityName.toUpperCase()}</text>`;
    labels += `<text x="400" y="810" text-anchor="middle" font-size="9" fill="${pal.label}" font-family="monospace" opacity="0.6">${streetCoords.lat.toFixed(4)}° N / ${streetCoords.lon.toFixed(4)}° E</text>`;
    return { roads, buildings, water, parks, labels };
  }, [streetData, streetCoords, streetPalette, streetZoom, streetCityName]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (mapMode === "street") {
      setStreetZoom((z) => Math.min(18, Math.max(10, z + (e.deltaY > 0 ? -1 : 1))));
    } else {
      setZoomLevel((prev) => {
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        return Math.min(10, Math.max(0.2, prev + delta));
      });
    }
  }, [mapMode]);

  // Unified search results: countries + cities
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return { countries: countryList.slice(0, 20), cities: MAJOR_CITIES.slice(0, 10) };
    const countries = countryList.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 15);
    const cities = MAJOR_CITIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)
    ).slice(0, 15);
    return { countries, cities };
  }, [countryList, searchQuery]);

  // Cities for selected country or all
  const visibleCities = useMemo(() => {
    if (!showCities) return [];
    // City selected → show that city + nearby cities
    if (selectedCity) {
      return MAJOR_CITIES.filter((c) => {
        if (c.name === selectedCity.name) return true;
        // Show cities within ~500km
        const dlat = Math.abs(c.lat - selectedCity.lat);
        const dlon = Math.abs(c.lon - selectedCity.lon);
        return dlat < 5 && dlon < 5;
      });
    }
    // Country selected
    if (selectedCountry !== "all") {
      const feature = geoFeatures.find((f) => f.id === selectedCountry);
      const countryName = feature?.properties.name || "";
      return MAJOR_CITIES.filter(
        (c) =>
          c.country === countryName ||
          c.country.toLowerCase() === countryName.toLowerCase()
      );
    }
    // World
    return MAJOR_CITIES;
  }, [selectedCountry, selectedCity, geoFeatures, showCities]);

  const selectedCountryName = selectedCountry === "all" && !selectedCity
    ? "World"
    : selectedCity
      ? `${selectedCity.name}, ${selectedCity.country}`
      : countryList.find((c) => c.id === selectedCountry)?.name || "";

  // SVG Export
  const handleExportSVG = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Build a clean SVG with only relevant content
    const pathGen = d3Geo.geoPath(projection);
    let pathsStr = "";
    let citiesStr = "";
    const titleText = selectedCity
      ? `${selectedCity.name} City Map`
      : selectedState !== "all"
        ? `${selectedState}, ${selectedCountryName}`
        : `${selectedCountryName} Map`;
    const targetName = selectedCountry !== "all"
      ? countryList.find((c) => c.id === selectedCountry)?.name
      : selectedCity?.country;

    if (selectedCity || selectedCountry !== "all") {
      if (selectedState !== "all" && admin1Raw.length > 0) {
        // Export ONLY the selected state
        const stateFeature = admin1Raw.find((f: any) => f.properties.name === selectedState);
        if (stateFeature) {
          const d = pathGen(stateFeature as any);
          if (d) {
            pathsStr += `    <path d="${d}" fill="#7f8c9b" stroke="#5a6c7d" stroke-width="0.6" stroke-linejoin="round" />\n`;
          }
        }
      } else if (targetName) {
        // Export ONLY the selected country
        const feature = geoFeatures.find((f) => f.properties.name === targetName);
        if (feature) {
          const d = pathGen(feature as any);
          if (d) {
            pathsStr += `    <path d="${d}" fill="#7f8c9b" stroke="#5a6c7d" stroke-width="0.6" stroke-linejoin="round" />\n`;
          }
        }
      }
    } else {
      // World view — export all
      geoFeatures.forEach((f) => {
        const d = pathGen(f as any);
        if (d) {
          pathsStr += `    <path d="${d}" fill="#7f8c9b" stroke="#5a6c7d" stroke-width="0.6" stroke-linejoin="round" />\n`;
        }
      });
    }

    // State/province internal borders for export (mesh — no external edges)
    let admin1Str = "";
    if (showBorders && admin1BordersPath) {
      admin1Str = `  <path d=\"${admin1BordersPath}\" fill=\"none\" stroke=\"#ffffff\" stroke-width=\"0.7\" />\n`;
    }

    // City markers — only the selected city
    if (selectedCity && showCities) {
      const coords = projection([selectedCity.lon, selectedCity.lat]);
      if (coords) {
        citiesStr += `    <circle cx="${coords[0]}" cy="${coords[1]}" r="3.5" fill="#e74c3c" opacity="0.85" />\n`;
        citiesStr += `    <circle cx="${coords[0]}" cy="${coords[1]}" r="1.5" fill="#fff" />\n`;
        citiesStr += `    <text x="${coords[0] + 6}" y="${coords[1] + 1}" font-size="8" fill="#333" font-family="sans-serif" font-weight="600">${selectedCity.name}</text>\n`;
      }
    }

    const svgStr = `<?xml version="1.0" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}" width="${SVG_WIDTH}" height="${SVG_HEIGHT}">
  <rect width="${SVG_WIDTH}" height="${SVG_HEIGHT}" fill="#fafafa" />
  <g>
${pathsStr}  </g>
${admin1Str}  <g>
${citiesStr}  </g>
  <text x="${SVG_WIDTH / 2}" y="22" text-anchor="middle" font-size="14" fill="#666" font-family="sans-serif" font-weight="700">${titleText}</text>
</svg>`;

    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const label = selectedCity
      ? `${selectedCity.name.toLowerCase().replace(/\s+/g, "-")}-city`
      : selectedCountry === "all" ? "world" : countryList.find(c => c.id === selectedCountry)?.name.toLowerCase().replace(/\s+/g, "-") || "map";
    link.download = `${label}-map.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [selectedCountry, selectedCity, countryList, geoFeatures, projection, visibleCities, showCities]);

  const handleCopySVG = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    navigator.clipboard.writeText(source).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  // PNG Export
  const handleExportPNG = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new window.Image();
    img.onload = () => {
      const scale = 2; // 2x resolution for crisp output
      const canvas = document.createElement("canvas");
      canvas.width = SVG_WIDTH * scale;
      canvas.height = SVG_HEIGHT * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(scale, scale);
      ctx.fillStyle = "#fafafa";
      ctx.fillRect(0, 0, SVG_WIDTH, SVG_HEIGHT);
      ctx.drawImage(img, 0, 0, SVG_WIDTH, SVG_HEIGHT);
      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = pngUrl;
        const label = selectedCity
          ? `${selectedCity.name.toLowerCase().replace(/\s+/g, "-")}-city`
          : selectedCountry === "all" ? "world" : countryList.find(c => c.id === selectedCountry)?.name.toLowerCase().replace(/\s+/g, "-") || "map";
        link.download = `${label}-map.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
    };
    img.src = url;
  }, [selectedCountry, selectedCity, countryList]);

  return (
    <ToolLayout>
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <main className="flex flex-1 flex-col overflow-y-auto min-h-0">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-border bg-bg px-5 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Globe className="h-4 w-4 text-accent" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-text-primary">
                {mapMode === "country" ? "Country Map Generator" : "City Street Map"}
              </h2>
              <p className="text-[11px] text-text-muted">
                {mapMode === "country" ? "Create vector country & city maps from Natural Earth data" : "Generate minimalist street-level map posters from OpenStreetMap"}
              </p>
            </div>
            {/* Mode Switcher */}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-0.5">
              <button
                onClick={() => setMapMode("country")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  mapMode === "country"
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <Globe className="h-3 w-3" /> Country
              </button>
              <button
                onClick={() => setMapMode("street")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  mapMode === "street"
                    ? "bg-accent text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <MapIcon className="h-3 w-3" /> Street
              </button>
            </div>
          </div>

          {/* Toolbar */}
          {mapMode === "country" ? (
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-2.5">
            <button onClick={() => { setSelectedCountry("all"); setSelectedCity(null); }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                selectedCountry === "all" && !selectedCity
                  ? "bg-accent text-white shadow-md shadow-accent/20 border border-accent"
                  : "bg-surface text-text-primary border border-border hover:border-accent hover:text-accent"
              }`}>
              <Globe className="h-3.5 w-3.5" /> World
            </button>
            {selectedCity && (
              <button onClick={() => setSelectedCity(null)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold bg-accent/10 text-accent border border-accent/30 transition-all hover:bg-accent/20">
                <MapPin className="h-3.5 w-3.5" /> {selectedCity.name} <span className="text-text-muted ml-1">✕</span>
              </button>
            )}
            <div className="flex items-center gap-1 rounded-xl border border-border bg-surface">
              <button onClick={() => setZoomLevel((z) => Math.max(0.2, z - 0.2))}
                className="flex h-8 w-8 items-center justify-center rounded-l-xl text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent">
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[40px] text-center text-[10px] font-bold text-text-primary">{Math.round(zoomLevel * 100)}%</span>
              <button onClick={() => setZoomLevel((z) => Math.min(10, z + 0.2))}
                className="flex h-8 w-8 items-center justify-center rounded-r-xl text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent">
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex-1" />
          </div>
          ) : (
          /* Street Map Toolbar */
          <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-2.5">
            <div className="relative flex-1 max-w-md">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
                <Search className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                <input
                  type="text"
                  value={streetQuery}
                  onChange={(e) => { setStreetQuery(e.target.value); handleStreetSearch(e.target.value); }}
                  placeholder="Search city (e.g. Dresden, Dhaka, Tokyo)..."
                  className="flex-1 bg-transparent text-xs text-text-primary outline-none placeholder:text-text-muted"
                />
                {streetQuery && (
                  <button onClick={() => { setStreetQuery(""); setStreetSearchResults([]); }} className="text-text-muted hover:text-text-primary">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              {streetSearchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-border bg-bg-secondary shadow-2xl">
                  {streetSearchResults.map((r: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => {
                        setStreetCityName(r.display_name.split(",")[0]);
                        setStreetCoords({ lat: parseFloat(r.lat), lon: parseFloat(r.lon) });
                        setStreetQuery(r.display_name.split(",")[0]);
                        setStreetSearchResults([]);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-text-primary hover:bg-accent/5 border-b border-border last:border-b-0"
                    >
                      <MapPin className="h-3 w-3 shrink-0 text-text-muted" />
                      <span className="truncate">{r.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {streetCityName && (
              <div className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold bg-accent/10 text-accent border border-accent/30">
                <MapPin className="h-3.5 w-3.5" /> {streetCityName}
                <button onClick={() => { setStreetCityName(""); setStreetCoords(null); setStreetData(null); setStreetQuery(""); }} className="ml-1 text-text-muted hover:text-text-primary">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {streetCoords && (
              <div className="flex items-center gap-1 rounded-xl border border-border bg-surface">
                <button onClick={() => setStreetZoom((z) => Math.max(10, z - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-l-xl text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent">
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="min-w-[40px] text-center text-[10px] font-bold text-text-primary">Zoom {streetZoom}</span>
                <button onClick={() => setStreetZoom((z) => Math.min(18, z + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-r-xl text-text-secondary transition-colors hover:bg-accent/10 hover:text-accent">
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <div className="flex-1" />
          </div>
          )}

          {/* Map */}
          {mapMode === "country" ? (
          <div ref={mapContainerRef} onWheel={handleWheel} className="flex-1 flex items-center justify-center p-3 bg-bg-secondary/30 overflow-auto">
            {loading ? (
              <div className="flex flex-col items-center gap-3 text-text-muted">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                <p className="text-sm">Loading Natural Earth data...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-3 text-danger">
                <p className="text-sm font-medium">{error}</p>
                <button onClick={() => window.location.reload()}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-semibold text-text-primary hover:border-accent">
                  <RotateCcw className="h-3.5 w-3.5" /> Retry
                </button>
              </div>
            ) : (
              <div className="w-full rounded-2xl border border-border bg-bg shadow-lg">
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
                  className="block w-full h-auto"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center top" }}
                >
                  <defs>
                    <linearGradient id="country-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#5a6c7d" />
                      <stop offset="100%" stopColor="#3d5068" />
                    </linearGradient>
                    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
                      <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.15" />
                    </filter>
                  </defs>
                  <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="#f5f7fa" />

                  <g>
                    {geoFeatures
                      .filter((feature) => {
                        if (selectedCountry === "all" && !selectedCity) return true;
                        const targetName = selectedCountry !== "all"
                          ? countryList.find((c) => c.id === selectedCountry)?.name
                          : selectedCity?.country;
                        return feature.properties.name === targetName;
                      })
                      .filter((feature, _idx, arr) => {
                        // Deduplicate: keep only first feature per name
                        return arr.findIndex((f) => f.properties.name === feature.properties.name) === _idx;
                      })
                      .map((feature, idx) => {
                        return (
                          <path
                            key={`${feature.id}-${idx}`}
                            d={pathGenerator(feature as any) || ""}
                            fill={selectedState !== "all" ? "#b0b8c0" : "url(#country-gradient)"}
                            stroke="#2c3e50"
                            strokeWidth={1.2}
                            strokeLinejoin="round"
                            filter="url(#shadow)"
                          />
                        );
                      })}
                  </g>
                  {/* Selected state highlight */}
                  {selectedState !== "all" && admin1Raw.length > 0 && (
                    <g>
                      {admin1Raw
                        .filter((f: any) => f.properties.name === selectedState)
                        .map((feature: any, idx: number) => (
                          <path
                            key={`state-${idx}`}
                            d={pathGenerator(feature as any) || ""}
                            fill="url(#country-gradient)"
                            stroke="#2c3e50"
                            strokeWidth={1.4}
                            strokeLinejoin="round"
                            filter="url(#shadow)"
                          />
                        ))}
                    </g>
                  )}
                  {/* State/province internal borders (mesh — no external edges) */}
                  {showBorders && admin1BordersPath && (
                    <path
                      d={admin1BordersPath}
                      fill="none"
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth={0.6}
                      strokeLinejoin="round"
                    />
                  )}
                  {/* City dots */}
                  {selectedCity
                    ? (() => {
                        const coords = projection([selectedCity.lon, selectedCity.lat]);
                        if (!coords) return null;
                        return (
                          <g>
                            <circle cx={coords[0]} cy={coords[1]} r={3.5} fill="#e74c3c" opacity={0.85} />
                            <circle cx={coords[0]} cy={coords[1]} r={1.5} fill="#fff" />
                            <text
                              x={coords[0] + 6}
                              y={coords[1] + 1}
                              fontSize={8}
                              fill="#333"
                              fontFamily="sans-serif"
                              fontWeight={600}
                            >
                              {selectedCity.name}
                            </text>
                          </g>
                        );
                      })()
                    : null}
                  {/* Title */}
                  <text
                    x={SVG_WIDTH / 2}
                    y={22}
                    textAnchor="middle"
                    fontSize={14}
                    fill="#666"
                    fontFamily="sans-serif"
                    fontWeight={700}
                  >
                    {selectedCity ? `${selectedCity.name} City Map` : `${selectedCountryName} Map`}
                  </text>
                </svg>
              </div>
            )}
          </div>
          ) : (
          /* Street Map View */
          <div ref={mapContainerRef} onWheel={handleWheel} className="flex-1 flex items-center justify-center p-3 bg-bg-secondary/30 overflow-auto">
            {streetLoading ? (
              <div className="flex flex-col items-center gap-3 text-text-muted">
                <Loader2 className="h-8 w-8 animate-spin text-accent" />
                <p className="text-sm">Fetching OpenStreetMap data...</p>
                <p className="text-[10px] text-text-muted">This may take a moment for detailed areas</p>
              </div>
            ) : streetError ? (
              <div className="flex flex-col items-center gap-3 text-text-muted">
                <AlertTriangle className="h-10 w-10 text-text-secondary" />
                <p className="text-sm font-medium text-text-secondary">{streetError}</p>
                <button
                  onClick={() => streetCoords && fetchStreetData(streetCoords.lat, streetCoords.lon, streetZoom)}
                  className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-medium text-text-primary transition-colors hover:bg-accent/10 hover:text-accent">
                  Retry
                </button>
              </div>
            ) : !streetCoords ? (
              <div className="flex flex-col items-center gap-3 text-text-muted">
                <MapIcon className="h-12 w-12 text-accent/30" />
                <p className="text-sm font-medium">Search for a city to generate a street map</p>
                <p className="text-[10px] text-text-muted">Try: Dresden, Dhaka, Tokyo, New York, Paris...</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-bg shadow-lg overflow-hidden">
                {(() => {
                  const pal = STREET_PALETTES[streetPalette] || STREET_PALETTES.sage;
                  const pm = POSTER_MODES[streetPosterSize] as any;
                  const isPoster = streetPosterSize > 0 && pm && pm.w;
                  const svgW = isPoster ? pm.w : STREET_SVG_SIZE;
                  const svgH = isPoster ? pm.h : STREET_SVG_SIZE;
                  const mapOffsetY = isPoster ? pm.pad : 0;
                  const mapH = isPoster ? pm.mapH : STREET_SVG_SIZE;
                  return (
                    <svg
                      ref={svgRef}
                      viewBox={`0 0 ${svgW} ${svgH}`}
                      className="block w-full h-auto max-h-[75vh]"
                      style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center top" }}
                    >
                      {/* Background */}
                      <rect width={svgW} height={svgH} fill={pal.bg} />

                      {/* Poster decorative border */}
                      {isPoster && (
                        <>
                          <rect x="20" y="20" width={svgW - 40} height={svgH - 40}
                            fill="none" stroke={pal.accent} strokeWidth="0.8" opacity="0.4" />
                          <rect x="28" y="28" width={svgW - 56} height={svgH - 56}
                            fill="none" stroke={pal.accent} strokeWidth="0.4" opacity="0.25" />
                          {/* Corner decorations */}
                          <circle cx="40" cy="40" r="3" fill={pal.accent} opacity="0.3" />
                          <circle cx={svgW - 40} cy="40" r="3" fill={pal.accent} opacity="0.3" />
                          <circle cx="40" cy={svgH - 40} r="3" fill={pal.accent} opacity="0.3" />
                          <circle cx={svgW - 40} cy={svgH - 40} r="3" fill={pal.accent} opacity="0.3" />
                          {/* Decorative line above title */}
                          <line x1={svgW / 2 - 80} y1={mapOffsetY + mapH + 30}
                            x2={svgW / 2 + 80} y2={mapOffsetY + mapH + 30}
                            stroke={pal.accent} strokeWidth="0.6" opacity="0.4" />
                          {/* City name */}
                          <text x={svgW / 2} y={mapOffsetY + mapH + 65}
                            textAnchor="middle" fontSize="28" fill={pal.label}
                            fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700"
                            letterSpacing="4">
                            {streetCityName.toUpperCase()}
                          </text>
                          {/* Coordinates */}
                          {streetCoords && (
                            <text x={svgW / 2} y={mapOffsetY + mapH + 92}
                              textAnchor="middle" fontSize="11" fill={pal.label}
                              fontFamily="'Courier New', monospace" opacity="0.55"
                              letterSpacing="1">
                              {streetCoords.lat.toFixed(4)}° N / {streetCoords.lon.toFixed(4)}° E
                            </text>
                          )}
                          {/* Country / Region */}
                          <text x={svgW / 2} y={mapOffsetY + mapH + 115}
                            textAnchor="middle" fontSize="9" fill={pal.label}
                            fontFamily="'Courier New', monospace" opacity="0.4"
                            letterSpacing="3">
                            {streetCityName.split(",")[0].toUpperCase()}
                          </text>
                          {/* Decorative line below subtitle */}
                          <line x1={svgW / 2 - 40} y1={mapOffsetY + mapH + 130}
                            x2={svgW / 2 + 40} y2={mapOffsetY + mapH + 130}
                            stroke={pal.accent} strokeWidth="0.4" opacity="0.3" />
                          {/* Palette name */}
                          <text x={svgW / 2} y={svgH - 40}
                            textAnchor="middle" fontSize="8" fill={pal.label}
                            fontFamily="'Courier New', monospace" opacity="0.3"
                            letterSpacing="2">
                            {streetPalette.toUpperCase()}
                          </text>
                        </>
                      )}

                      {/* Map area (clipped to poster content area) */}
                      <g transform={`translate(0, ${mapOffsetY})`} clipPath="url(#mapClip)">
                        <defs>
                          <clipPath id="mapClip">
                            <rect x="0" y="0" width={svgW} height={mapH} />
                          </clipPath>
                        </defs>
                        <g dangerouslySetInnerHTML={{ __html: streetSvgElements.parks }} />
                        <g dangerouslySetInnerHTML={{ __html: streetSvgElements.water }} />
                        <g dangerouslySetInnerHTML={{ __html: streetSvgElements.buildings }} />
                        <g dangerouslySetInnerHTML={{ __html: streetSvgElements.roads }} />
                        {!isPoster && <g dangerouslySetInnerHTML={{ __html: streetSvgElements.labels }} />}
                      </g>
                    </svg>
                  );
                })()}
              </div>
            )}
          </div>
          )}
        </main>

        {/* Right Sidebar */}
        <aside className="hidden w-[280px] shrink-0 flex-col overflow-y-auto min-h-0 border-l border-border bg-bg-secondary lg:flex">
          <div className="p-4">

            {mapMode === "country" ? (
            <>
            {/* SEARCH Section */}
            <SidebarSection title="Search" icon={<Search className="h-3 w-3" />}>
            <div className="relative">
              <div className="relative">
                <div className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
                  <Search className="h-3.5 w-3.5 shrink-0 text-text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Type country or city name..."
                    className="flex-1 bg-transparent text-xs text-text-primary outline-none placeholder:text-text-muted"
                  />
                  {searchQuery && (
                    <button onClick={() => { setSearchQuery(""); setSelectedCountry("all"); setSelectedCity(null); }} className="text-text-muted hover:text-text-primary">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                {showDropdown && searchResults.countries.length + searchResults.cities.length > 0 && (
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-border bg-bg-secondary shadow-2xl">
                    {/* World option */}
                    <button
                      onClick={() => { setSelectedCountry("all"); setSelectedCity(null); setShowDropdown(false); setSearchQuery(""); }}
                      className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-all border-b border-border ${
                        selectedCountry === "all" && !selectedCity ? "bg-accent/5 border-l-2 border-l-accent" : "hover:bg-accent/5"
                      }`}
                    >
                      <Globe className="h-3 w-3 text-accent" />
                      <span className={`flex-1 text-xs font-medium ${selectedCountry === "all" && !selectedCity ? "text-accent" : "text-text-primary"}`}>
                        World (All Countries)
                      </span>
                    </button>

                    {/* Countries */}
                    {searchResults.countries.length > 0 && (
                      <>
                        <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-text-muted bg-bg-secondary/50">
                          Countries
                        </div>
                        {searchResults.countries.map((c) => (
                          <button
                            key={c.name}
                            onClick={() => { setSelectedCountry(c.id); setSelectedCity(null); setShowDropdown(false); setSearchQuery(""); }}
                            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-all border-b border-border last:border-b-0 ${
                              selectedCountry === c.id ? "bg-accent/5 border-l-2 border-l-accent" : "hover:bg-accent/5"
                            }`}
                          >
                            <Globe className="h-3 w-3 shrink-0 text-text-muted" />
                            <span className={`flex-1 text-xs font-medium ${selectedCountry === c.id ? "text-accent" : "text-text-primary"}`}>
                              {c.name}
                            </span>
                          </button>
                        ))}
                      </>
                    )}

                    {/* Cities */}
                    {searchResults.cities.length > 0 && (
                      <>
                        <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-text-muted bg-bg-secondary/50">
                          Cities
                        </div>
                        {searchResults.cities.map((city, i) => (
                          <button
                            key={`${city.name}-${i}`}
                            onClick={() => { setSelectedCity(city); setSelectedCountry("all"); setShowDropdown(false); setSearchQuery(""); }}
                            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left transition-all border-b border-border last:border-b-0 ${
                              selectedCity?.name === city.name ? "bg-accent/5 border-l-2 border-l-accent" : "hover:bg-accent/5"
                            }`}
                          >
                            <MapPin className="h-3 w-3 shrink-0 text-text-muted" />
                            <span className={`flex-1 text-xs font-medium ${selectedCity?.name === city.name ? "text-accent" : "text-text-primary"}`}>
                              {city.name}
                            </span>
                            <span className="text-[10px] text-text-muted">{city.country}</span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            </SidebarSection>

            {/* STATE Selection */}
            {selectedCountry !== "all" && admin1Raw.length > 0 && (
            <SidebarSection title="State / Province" icon={<MapIcon className="h-3 w-3" />}>
              <div className="space-y-2">
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none"
                >
                  <option value="all">All States</option>
                  {[...new Set(admin1Raw.map((f: any) => f.properties.name))]
                    .sort()
                    .map((name: string) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                </select>
              </div>
            </SidebarSection>
            )}

            {/* MAP SETTINGS Section */}
            <SidebarSection title="Map Settings" icon={<Settings className="h-3 w-3" />}>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">Projection</label>
                  <select
                    value={selectedProjection}
                    onChange={(e) => setSelectedProjection(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-primary focus:border-accent focus:outline-none"
                  >
                    <option value="natural-earth">Natural Earth</option>
                    <option value="mercator">Mercator</option>
                    <option value="orthographic">Orthographic (Globe)</option>
                    <option value="equirectangular">Equirectangular</option>
                  </select>
                </div>
                <ToggleRow label="Show Cities" checked={showCities} onChange={setShowCities} />
                <ToggleRow label="Show State Borders" checked={showBorders} onChange={setShowBorders} />
              </div>
            </SidebarSection>

            {/* MAP INFO Section */}
            <SidebarSection title="Map Info" icon={<Globe className="h-3 w-3" />}>
              <div className="space-y-2 text-[11px] text-text-secondary">
                <InfoRow label="Source" value="Natural Earth" />
                <InfoRow label="Projection" value={selectedProjection === "natural-earth" ? "Natural Earth" : selectedProjection === "mercator" ? "Mercator" : selectedProjection === "orthographic" ? "Orthographic" : "Equirectangular"} />
                <InfoRow label="Countries" value={String(geoFeatures.length)} />
                <InfoRow label="Cities shown" value={String(visibleCities.length)} />
                <InfoRow label="Fill" value="Gray (#B0B0B0)" />
                <InfoRow label="Background" value="#FAFAFA" />
              </div>
            </SidebarSection>

            {/* EXPORT Section */}
            <SidebarSection title="Export" icon={<Download className="h-3 w-3" />}>
              <div className="space-y-3">
                <button onClick={handleExportPNG}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50">
                  <Image className="h-4 w-4" /> Download PNG
                </button>
                <button onClick={handleExportSVG}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-50">
                  <Download className="h-3.5 w-3.5" /> Download SVG
                </button>

                <button onClick={handleCopySVG}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-50">
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>
              </div>
            </SidebarSection>
            </>
            ) : (
            <>
                {/* STYLE Section */}
                <SidebarSection title="Style" icon={<Palette className="h-3 w-3" />}>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">Color Palette</label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {Object.entries(STREET_PALETTES).map(([name, pal]) => (
                          <button
                            key={name}
                            onClick={() => setStreetPalette(name)}
                            className={`flex flex-col items-center gap-1 rounded-lg border p-1.5 transition-all ${
                              streetPalette === name ? "border-accent ring-1 ring-accent" : "border-border hover:border-accent/50"
                            }`}
                          >
                            <div className="flex gap-0.5">
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: pal.bg, border: "1px solid #ddd" }} />
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: pal.roads }} />
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: pal.water }} />
                            </div>
                            <span className="text-[8px] font-medium capitalize text-text-muted">{name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </SidebarSection>

                {/* POSTER Section */}
                <SidebarSection title="Poster Layout" icon={<Image className="h-3 w-3" />}>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-text-muted">Layout</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {POSTER_MODES.map((pm) => (
                          <button
                            key={pm.value}
                            onClick={() => setStreetPosterSize(pm.value)}
                            className={`flex flex-col items-center gap-1 rounded-lg border p-2 transition-all text-[10px] font-medium ${
                              streetPosterSize === pm.value
                                ? "border-accent bg-accent/10 text-accent"
                                : "border-border text-text-secondary hover:border-accent/50"
                            }`}
                          >
                            <div className="flex items-center justify-center" style={{ width: 28, height: pm.value > 0 ? (pm.value === 3 ? 18 : 24) : 22 }}>
                              <div
                                className="border border-current rounded-sm"
                                style={{
                                  width: pm.value === 3 ? 24 : pm.value === 0 ? 20 : 18,
                                  height: pm.value === 3 ? 16 : pm.value === 0 ? 20 : 24,
                                  opacity: 0.5,
                                }}
                              />
                            </div>
                            <span>{pm.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {streetPosterSize > 0 && (
                      <div className="rounded-lg border border-accent/20 bg-accent/5 p-2">
                        <p className="text-[10px] text-accent font-medium">✨ Poster mode adds decorative border, city name, and coordinates</p>
                      </div>
                    )}
                  </div>
                </SidebarSection>

                {/* LAYERS Section */}
                <SidebarSection title="Layers" icon={<Building2 className="h-3 w-3" />}>
                  <div className="space-y-2">
                    <ToggleRow label="Buildings" checked={streetShowBuildings} onChange={setStreetShowBuildings} />
                    <ToggleRow label="Water" checked={streetShowWater} onChange={setStreetShowWater} />
                    <ToggleRow label="Parks" checked={streetShowParks} onChange={setStreetShowParks} />
                    <ToggleRow label="Labels" checked={streetShowLabels} onChange={setStreetShowLabels} />
                  </div>
                </SidebarSection>

                {/* MAP INFO Section */}
                <SidebarSection title="Map Info" icon={<Globe className="h-3 w-3" />}>
                  <div className="space-y-2 text-[11px] text-text-secondary">
                    <InfoRow label="Source" value="OpenStreetMap" />
                    <InfoRow label="City" value={streetCityName || "-"} />
                    <InfoRow label="Zoom" value={String(streetZoom)} />
                    <InfoRow label="Palette" value={streetPalette} />
                    {streetCoords && (
                      <InfoRow label="Coordinates" value={`${streetCoords.lat.toFixed(4)}, ${streetCoords.lon.toFixed(4)}`} />
                    )}
                  </div>
                </SidebarSection>

                {/* STREET EXPORT Section */}
                <SidebarSection title="Export" icon={<Download className="h-3 w-3" />}>
                  <div className="space-y-3">
                    <button
                      disabled={!streetCoords || streetLoading}
                      onClick={() => {
                        const svg = svgRef.current;
                        if (!svg) return;
                        const serializer = new XMLSerializer();
                        const source = serializer.serializeToString(svg);
                        const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `${(streetCityName || "city").toLowerCase().replace(/\s+/g, "-")}-street-map.svg`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(url);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-50">
                      <Download className="h-4 w-4" /> Download SVG
                    </button>
                    <button
                      disabled={!streetCoords || streetLoading}
                      onClick={() => {
                        const svg = svgRef.current;
                        if (!svg) return;
                        const serializer = new XMLSerializer();
                        const svgStr = serializer.serializeToString(svg);
                        const svgBlob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
                        const url = URL.createObjectURL(svgBlob);
                        const img = new window.Image();
                        img.onload = () => {
                          const canvas = document.createElement("canvas");
                          const size = STREET_SVG_SIZE * 2;
                          canvas.width = size;
                          canvas.height = size;
                          const ctx = canvas.getContext("2d");
                          if (!ctx) return;
                          ctx.scale(2, 2);
                          ctx.drawImage(img, 0, 0, STREET_SVG_SIZE, STREET_SVG_SIZE);
                          URL.revokeObjectURL(url);
                          canvas.toBlob((blob) => {
                            if (!blob) return;
                            const pngUrl = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = pngUrl;
                            link.download = `${(streetCityName || "city").toLowerCase().replace(/\s+/g, "-")}-street-map.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(pngUrl);
                          }, "image/png");
                        };
                        img.src = url;
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:border-accent hover:text-accent disabled:opacity-50">
                      <Image className="h-3.5 w-3.5" /> Download PNG
                    </button>
                  </div>
                </SidebarSection>
              </>
            )}

          </div>
        </aside>
      </div>
    </ToolLayout>
  );
}

/* ─── Sidebar Helpers ─── */

function SidebarSection({ title, icon, children, defaultOpen = true }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-4">
      <button onClick={() => setOpen(!open)} className="mb-3 flex w-full items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
        {icon}{title}<span className="flex-1 border-t border-border-subtle" />
        {open ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
      </button>
      {open && <div className="space-y-3">{children}</div>}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5">
      <p className="flex-1 text-xs font-medium text-text-primary">{label}</p>
      <button onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-border"}`}>
        <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-4" : ""}`} />
      </button>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="font-medium text-text-primary">{value}</span>
    </div>
  );
}
