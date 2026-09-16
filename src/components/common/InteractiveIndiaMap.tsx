import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  MapPin,
  Navigation,
  AlertTriangle,
  ShieldCheck,
  Crosshair,
  TrendingUp,
  Info,
  Building2,
  Search,
  Maximize2,
  Radio,
  History,
  Target,
  Flame,
  CheckCircle2,
  Clock,
  ExternalLink,
  Compass,
  Eye,
  Sliders,
  X,
  Send,
  Lock,
  ChevronDown,
  Globe
} from 'lucide-react';
import { InvestigationCase, AtmCandidate, RiskZone } from '../../types';
import {
  INDIA_MAJOR_HUBS,
  NATIONWIDE_ATM_DATA,
  ACTIVE_CYBER_THREATS,
  INDIA_STATES_DATA,
  GeoLocation,
  AtmNode,
  CyberThreatEvent,
} from '../../data/indiaGeoData';

export type MapStyleType = 'tactical' | 'dark' | 'light' | 'satellite' | 'terrain' | '3d';

interface InteractiveIndiaMapProps {
  currentCase?: InvestigationCase | null;
  allCases?: InvestigationCase[];
  riskZones?: RiskZone[];
  showAllHotspots?: boolean;
  selectedAtm?: AtmCandidate | null;
  onSelectAtm?: (atm: AtmCandidate) => void;
  heightClass?: string;
  initialMode?: 'current' | 'history';
}

interface TargetLocationInfo {
  name: string;
  subtitle: string;
  category: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  latitude: number;
  longitude: number;
  nearbyAtmCount: number;
  activeAlertsCount: number;
  suspiciousAmount?: number;
  lastEvent: string;
  status: string;
  details: { label: string; value: string; highlight?: boolean }[];
  atmCandidateRef?: AtmCandidate;
}

// Tile providers configuration
const TILE_PROVIDERS: Record<
  MapStyleType,
  { url: string; attribution: string; subdomains?: string[]; maxZoom?: number; maxNativeZoom?: number }
> = {
  tactical: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; OpenStreetMap',
    maxZoom: 18,
    maxNativeZoom: 16,
  },
  dark: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; OpenStreetMap',
    maxZoom: 18,
    maxNativeZoom: 16,
  },
  light: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; OpenStreetMap',
    maxZoom: 18,
    maxNativeZoom: 16,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; DigitalGlobe, Earthstar',
    maxZoom: 18,
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap &copy; OpenStreetMap',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 17,
  },
  '3d': {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &copy; OpenStreetMap',
    maxZoom: 18,
    maxNativeZoom: 16,
  },
};

// Default center of India
const INDIA_CENTER: [number, number] = [21.8, 79.5];
const DEFAULT_ZOOM = 4.8;

export const InteractiveIndiaMap: React.FC<InteractiveIndiaMapProps> = ({
  currentCase,
  riskZones = [],
  selectedAtm,
  onSelectAtm,
  heightClass = 'h-[560px]',
  initialMode = 'current',
}) => {
  // The current Complaint API does not provide the legacy
  // investigation-intelligence fields used by this map.
  // Keep the component safe until real location/ATM intelligence
  // is available from the backend.
  const safeAtmCandidates: AtmCandidate[] = Array.isArray(currentCase?.atmCandidates)
    ? currentCase.atmCandidates
    : [];

  const hasCaseMapData = Boolean(
    currentCase?.incidentLocation &&
    currentCase?.predictedCashoutRegion &&
    Array.isArray(currentCase?.atmCandidates)
  );

  // Mode: ON = Current Case Target | OFF = Nationwide Intelligence
  const [isCurrentCaseMode, setIsCurrentCaseMode] = useState<boolean>(initialMode === 'current');

  // Map Style & 2D/3D state
  const [mapStyle, setMapStyle] = useState<MapStyleType>('tactical');
  const [is3DMode, setIs3DMode] = useState<boolean>(false);
  const [showStyleMenu, setShowStyleMenu] = useState<boolean>(false);
  const [showLayersMenu, setShowLayersMenu] = useState<boolean>(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<
    Array<{
      id: string;
      title: string;
      subtitle: string;
      type: 'CITY' | 'ATM' | 'THREAT' | 'STATE';
      lat: number;
      lng: number;
      riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      rawItem: any;
    }>
  >([]);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Layer Toggles
  const [layers, setLayers] = useState({
    atms: true,
    threats: true,
    criticalOnly: false,
    cities: true,
    heatmaps: true,
    routes: true,
    grid: true,
  });

  // Current Target Location Information (Panel)
  const [targetLocation, setTargetLocation] = useState<TargetLocationInfo | null>(null);
  const [actionAlertSent, setActionAlertSent] = useState<string | null>(null);

  // Map reference & zoom state
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const targetLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routeLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const [currentZoom, setCurrentZoom] = useState<number>(5);

  // -------------------------------------------------------------
  // 1. INITIALIZE LEAFLET MAP
  // -------------------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Fix default marker icon assets
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapContainerRef.current, {
      center: INDIA_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: true,
      fadeAnimation: true,
      zoomAnimation: true,
    });

    // Add base tile layer
    const provider = TILE_PROVIDERS[mapStyle];
    const tileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      subdomains: provider.subdomains || ['a', 'b', 'c'],
      maxZoom: provider.maxZoom || 19,
      maxNativeZoom: provider.maxNativeZoom,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Layer groups for dynamic rendering
    const markerGroup = L.layerGroup().addTo(map);
    const targetLayerGroup = L.layerGroup().addTo(map);
    const routeLayerGroup = L.layerGroup().addTo(map);

    markerGroupRef.current = markerGroup;
    targetLayerGroupRef.current = targetLayerGroup;
    routeLayerGroupRef.current = routeLayerGroup;

    mapInstanceRef.current = map;

    // Track zoom
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    // Invalidate map size on layout mount
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // -------------------------------------------------------------
  // 2. SWITCH MAP TILE STYLES DYNAMICALLY
  // -------------------------------------------------------------
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const provider = TILE_PROVIDERS[mapStyle];

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    const newTileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      subdomains: provider.subdomains || ['a', 'b', 'c'],
      maxZoom: provider.maxZoom || 19,
      maxNativeZoom: provider.maxNativeZoom,
    }).addTo(map);

    // Keep base layer at bottom
    newTileLayer.bringToBack();
    tileLayerRef.current = newTileLayer;
  }, [mapStyle]);

  // -------------------------------------------------------------
  // 3. TARGET LOCATION HANDLER (FlyTo + Ring + Panel)
  // -------------------------------------------------------------
  const handleFocusLocation = useCallback(
    (info: TargetLocationInfo, targetZoom: number = 13) => {
      setTargetLocation(info);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([info.latitude, info.longitude], targetZoom, {
          duration: 1.4,
          easeLinearity: 0.25,
        });
      }

      // Draw Target Crosshair & Radar Halo Ring
      if (targetLayerGroupRef.current) {
        targetLayerGroupRef.current.clearLayers();

        // 3km Outer Threat Radius Circle
        const radiusCircle = L.circle([info.latitude, info.longitude], {
          radius: 2500,
          color: info.riskLevel === 'CRITICAL' ? '#ef4444' : info.riskLevel === 'HIGH' ? '#f97316' : '#06b6d4',
          fillColor: info.riskLevel === 'CRITICAL' ? '#ef4444' : '#06b6d4',
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '4, 4',
        });
        targetLayerGroupRef.current.addLayer(radiusCircle);

        // Target Crosshair HTML Marker
        const targetCrosshairHtml = `
          <div class="relative flex items-center justify-center w-14 h-14 pointer-events-none -ml-7 -mt-7">
            <div class="absolute inset-0 rounded-full border-2 border-dashed ${
              info.riskLevel === 'CRITICAL' ? 'border-red-500' : 'border-cyan-400'
            } animate-spin" style="animation-duration: 8s;"></div>
            <div class="absolute w-8 h-8 rounded-full bg-${
              info.riskLevel === 'CRITICAL' ? 'red-500' : 'cyan-400'
            }/20 animate-ping"></div>
            <div class="w-3.5 h-3.5 rounded-full ${
              info.riskLevel === 'CRITICAL' ? 'bg-red-500 ring-4 ring-red-500/40' : 'bg-cyan-400 ring-4 ring-cyan-400/40'
            } shadow-lg"></div>
          </div>
        `;

        const crosshairIcon = L.divIcon({
          html: targetCrosshairHtml,
          className: 'target-crosshair-icon',
          iconSize: [56, 56],
          iconAnchor: [28, 28],
        });

        const targetMarker = L.marker([info.latitude, info.longitude], {
          icon: crosshairIcon,
          zIndexOffset: 1000,
        });

        targetLayerGroupRef.current.addLayer(targetMarker);
      }
    },
    []
  );

  // -------------------------------------------------------------
  // 4. MAP RESET TO INDIA OVERVIEW
  // -------------------------------------------------------------
  const handleResetIndiaView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(INDIA_CENTER, DEFAULT_ZOOM, {
        duration: 1.2,
      });
    }
    if (targetLayerGroupRef.current) {
      targetLayerGroupRef.current.clearLayers();
    }
    setTargetLocation(null);
  };

  // -------------------------------------------------------------
  // 5. EXTERNAL PROP SYNC: SELECTED ATM
  // -------------------------------------------------------------
  useEffect(() => {
    if (selectedAtm && isCurrentCaseMode && hasCaseMapData) {
      const nearbyAtms = safeAtmCandidates.length;
      handleFocusLocation(
        {
          name: selectedAtm.name,
          subtitle: `${selectedAtm.bank} • #${selectedAtm.rank} Priority Target`,
          category: 'TARGET ATM CANDIDATE',
          riskLevel: selectedAtm.riskLevel || 'CRITICAL',
          latitude: selectedAtm.latitude,
          longitude: selectedAtm.longitude,
          nearbyAtmCount: nearbyAtms,
          activeAlertsCount: 3,
          suspiciousAmount: currentCase?.predictedCashoutRegion?.estimatedCashoutAmount || 0,
          lastEvent: '2 min ago',
          status: selectedAtm.surveillanceStatus || 'POLICE SURVEILLANCE ACTIVE',
          atmCandidateRef: selectedAtm,
          details: [
            { label: 'Bank Name', value: selectedAtm.bank, highlight: true },
            { label: 'Withdrawal Likelihood', value: `${selectedAtm.withdrawalLikelihood}%`, highlight: true },
            { label: 'Confidence Score', value: `${selectedAtm.predictionConfidence}%` },
            { label: 'Distance from Hub', value: `${selectedAtm.distanceKm} km` },
            { label: 'Exact Address', value: selectedAtm.address },
            { label: 'Surveillance Status', value: selectedAtm.surveillanceStatus || 'Live CCTV Feed Sync' },
            { label: 'Landmark', value: selectedAtm.nearbyLandmark || 'Commercial Center' },
          ],
        },
        14
      );
    }
  }, [selectedAtm, isCurrentCaseMode, currentCase, safeAtmCandidates, hasCaseMapData, handleFocusLocation]);

  // -------------------------------------------------------------
  // 6. RENDER DYNAMIC MARKERS, CLUSTERS & ROUTES
  // -------------------------------------------------------------
  useEffect(() => {
    if (!mapInstanceRef.current || !markerGroupRef.current || !routeLayerGroupRef.current) return;

    const markerGroup = markerGroupRef.current;
    const routeGroup = routeLayerGroupRef.current;
    markerGroup.clearLayers();
    routeGroup.clearLayers();

    const zoom = currentZoom;
    const isLowZoom = zoom <= 6; // Low/Medium zoom -> Clustering
    const isHighZoom = zoom >= 7; // High zoom -> Individual ATM markers

    // -------------------------------------------------------------
    // A. CURRENT CASE MODE (Target Region, ATMs, Trajectory)
    // -------------------------------------------------------------
    if (isCurrentCaseMode && currentCase && hasCaseMapData) {
      const incidentLat = currentCase.incidentLocation.latitude;
      const incidentLng = currentCase.incidentLocation.longitude;
      const cashoutLat = safeAtmCandidates[0]?.latitude || 11.2588;
      const cashoutLng = safeAtmCandidates[0]?.longitude || 75.7804;

      // 1. Money Trail Polyline / Arc
      if (layers.routes) {
        const routeCoords: [number, number][] = [
          [incidentLat, incidentLng],
          [28.6139, 77.2090], // Delhi layer
          [cashoutLat, cashoutLng], // Kozhikode cashout
        ];

        const polyline = L.polyline(routeCoords, {
          color: '#f59e0b',
          weight: 3,
          dashArray: '8, 6',
          opacity: 0.85,
        });
        routeGroup.addLayer(polyline);

        // Pulsing Trajectory Node
        const pulseIcon = L.divIcon({
          html: `<div class="w-3 h-3 rounded-full bg-amber-400 cyber-marker-pulse-orange shadow-lg -ml-1.5 -mt-1.5"></div>`,
          className: 'trail-pulse-icon',
          iconSize: [12, 12],
        });
        const midPoint = L.marker([28.6139, 77.2090], { icon: pulseIcon });
        routeGroup.addLayer(midPoint);
      }

      // 2. Incident Origin Marker
      const originHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group -ml-4 -mt-4">
          <div class="absolute w-8 h-8 rounded-full bg-cyan-500/20 cyber-marker-pulse-cyan"></div>
          <div class="w-8 h-8 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center shadow-xl text-cyan-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24m0 5.66-4.24 4.24m14.14 0-4.24-4.24m0-5.66 4.24-4.24"/></svg>
          </div>
          <div class="absolute -bottom-5 whitespace-nowrap bg-slate-900/90 text-cyan-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-cyan-500/40 shadow">
            ORIGIN: ${currentCase.incidentLocation.city.toUpperCase()}
          </div>
        </div>
      `;

      const originMarker = L.marker([incidentLat, incidentLng], {
        icon: L.divIcon({ html: originHtml, className: 'origin-marker', iconSize: [32, 32] }),
      });

      originMarker.on('click', () => {
        handleFocusLocation(
          {
            name: `Complaint Origin: ${currentCase.incidentLocation.city}`,
            subtitle: `${currentCase.incidentLocation.district}, ${currentCase.incidentLocation.state}`,
            category: 'INCIDENT ORIGIN (COMPLAINT FILED)',
            riskLevel: 'HIGH',
            latitude: incidentLat,
            longitude: incidentLng,
            nearbyAtmCount: 18,
            activeAlertsCount: 4,
            suspiciousAmount: currentCase.reportedFraudAmount,
            lastEvent: `${currentCase.incidentDate} at ${currentCase.incidentTime}`,
            status: 'COMPLAINT REGISTERED',
            details: [
              { label: 'Victim Name', value: currentCase.victim.name },
              { label: 'Reported Loss', value: `₹${currentCase.reportedFraudAmount.toLocaleString('en-IN')}`, highlight: true },
              { label: 'Fraud Typology', value: currentCase.fraudType },
              { label: 'Initial Txn ID', value: currentCase.initialTransactionId },
              { label: 'Sender Bank', value: currentCase.initialSenderBank },
              { label: 'Incident Location', value: currentCase.incidentLocation.address },
            ],
          },
          13
        );
      });
      markerGroup.addLayer(originMarker);

      // 3. Predicted Cash-Out Staging Zone Halo
      if (layers.heatmaps) {
        const cashoutHalo = L.circle([cashoutLat, cashoutLng], {
          radius: 12000,
          color: '#ef4444',
          fillColor: '#ef4444',
          fillOpacity: 0.16,
          weight: 1.5,
          dashArray: '6, 6',
        });
        markerGroup.addLayer(cashoutHalo);
      }

      // 4. Predicted Cashout Hub Marker
      const cashoutHubHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group -ml-5 -mt-5">
          <div class="absolute w-12 h-12 rounded-full bg-red-500/25 cyber-marker-pulse-red"></div>
          <div class="w-10 h-10 rounded-full bg-slate-950 border-2 border-red-500 flex items-center justify-center shadow-2xl text-red-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg>
          </div>
          <div class="absolute -bottom-6 whitespace-nowrap bg-red-950/95 text-red-200 font-mono text-[9.5px] font-bold px-2 py-0.5 rounded border border-red-700 shadow">
            CASHOUT ZONE: ${currentCase.predictedCashoutRegion.city.toUpperCase()} (${currentCase.predictedCashoutRegion.confidencePercentage}%)
          </div>
        </div>
      `;

      const cashoutHubMarker = L.marker([cashoutLat, cashoutLng], {
        icon: L.divIcon({ html: cashoutHubHtml, className: 'cashout-marker', iconSize: [40, 40] }),
        zIndexOffset: 500,
      });

      cashoutHubMarker.on('click', () => {
        handleFocusLocation(
          {
            name: `Target Zone: ${currentCase.predictedCashoutRegion.city}`,
            subtitle: `${currentCase.predictedCashoutRegion.district}, ${currentCase.predictedCashoutRegion.state}`,
            category: 'PREDICTED CASHOUT EXTRACTION ZONE',
            riskLevel: 'CRITICAL',
            latitude: cashoutLat,
            longitude: cashoutLng,
            nearbyAtmCount: safeAtmCandidates.length,
            activeAlertsCount: 6,
            suspiciousAmount: currentCase.predictedCashoutRegion.estimatedCashoutAmount,
            lastEvent: 'Off-peak ATM surge detected',
            status: 'POLICE AMBUSH & SURVEILLANCE ACTIVE',
            details: [
              { label: 'Confidence Score', value: `${currentCase.predictedCashoutRegion.confidencePercentage}%`, highlight: true },
              { label: 'Remaining Pool', value: `₹${currentCase.predictedCashoutRegion.estimatedCashoutAmount.toLocaleString('en-IN')}`, highlight: true },
              { label: 'Cashout Window', value: currentCase.predictedCashoutRegion.predictedWindowHours },
              { label: 'District Hub', value: currentCase.predictedCashoutRegion.district },
              { label: 'Key Intelligence', value: currentCase.predictedCashoutRegion.keySignals[0] || 'Coordinated mule withdrawal pattern' },
            ],
          },
          13
        );
      });
      markerGroup.addLayer(cashoutHubMarker);

      // 5. Candidate ATMs
      if (layers.atms) {
        safeAtmCandidates.forEach((atm) => {
          const isSelected = selectedAtm?.id === atm.id;
          const atmColor = isSelected ? '#10b981' : atm.withdrawalLikelihood > 80 ? '#ef4444' : '#f59e0b';

          const atmMarkerHtml = `
            <div class="relative flex items-center justify-center cursor-pointer group -ml-3 -mt-3 transition-transform hover:scale-125">
              ${isSelected ? '<div class="absolute w-8 h-8 rounded-full bg-emerald-500/30 animate-ping"></div>' : ''}
              <div class="w-6 h-6 rounded-full bg-slate-900 border ${
                isSelected ? 'border-emerald-400 ring-2 ring-emerald-400/50' : 'border-slate-700'
              } flex items-center justify-center shadow-lg" style="background-color: ${atmColor}">
                <span class="text-[9px] font-mono font-bold text-slate-950">#${atm.rank}</span>
              </div>
              <div class="absolute -bottom-4 whitespace-nowrap bg-slate-900/90 text-[8.5px] font-mono text-slate-200 px-1 rounded shadow">
                ${atm.bank.split(' ')[0]} • ${atm.withdrawalLikelihood}%
              </div>
            </div>
          `;

          const atmMarker = L.marker([atm.latitude, atm.longitude], {
            icon: L.divIcon({ html: atmMarkerHtml, className: 'atm-candidate-marker', iconSize: [24, 24] }),
          });

          atmMarker.on('click', () => {
            onSelectAtm?.(atm);
            handleFocusLocation(
              {
                name: atm.name,
                subtitle: `${atm.bank} • Rank #${atm.rank} (${atm.withdrawalLikelihood}% Probability)`,
                category: 'TARGET ATM CANDIDATE',
                riskLevel: atm.withdrawalLikelihood > 80 ? 'CRITICAL' : 'HIGH',
                latitude: atm.latitude,
                longitude: atm.longitude,
                nearbyAtmCount: safeAtmCandidates.length,
                activeAlertsCount: 2,
                suspiciousAmount: currentCase.predictedCashoutRegion.estimatedCashoutAmount,
                lastEvent: '2 min ago',
                status: atm.surveillanceStatus || 'POLICE CCTV SURVEILLANCE',
                atmCandidateRef: atm,
                details: [
                  { label: 'Bank Name', value: atm.bank },
                  { label: 'Withdrawal Likelihood', value: `${atm.withdrawalLikelihood}%`, highlight: true },
                  { label: 'Confidence Score', value: `${atm.predictionConfidence}%` },
                  { label: 'Distance from Center', value: `${atm.distanceKm} km` },
                  { label: 'Exact Address', value: atm.address },
                  { label: 'Surveillance', value: atm.surveillanceStatus || 'Active Police CCTV' },
                ],
              },
              15
            );
          });
          markerGroup.addLayer(atmMarker);
        });
      }
    }

    // -------------------------------------------------------------
    // B. NATIONWIDE INTELLIGENCE MODE (Clusters, ATMs, Threats)
    // -------------------------------------------------------------
    if (!isCurrentCaseMode) {
      // 1. Regional City Clusters (at low/medium zoom)
      if (isLowZoom && layers.cities) {
        INDIA_MAJOR_HUBS.forEach((hub) => {
          if (layers.criticalOnly && hub.riskLevel !== 'CRITICAL') return;

          const isCritical = hub.riskLevel === 'CRITICAL';
          const isHigh = hub.riskLevel === 'HIGH';
          const badgeColor = isCritical ? 'bg-red-500' : isHigh ? 'bg-amber-500' : 'bg-cyan-500';
          const haloColor = isCritical ? 'border-red-500/40 bg-red-500/10' : 'border-cyan-500/40 bg-cyan-500/10';

          const clusterHtml = `
            <div class="relative flex items-center justify-center cursor-pointer group -ml-8 -mt-8">
              <!-- Threat Halo Glow -->
              ${layers.heatmaps ? `<div class="absolute w-20 h-20 rounded-full ${haloColor} ${isCritical ? 'cyber-marker-pulse-red' : 'cyber-marker-pulse-cyan'} pointer-events-none"></div>` : ''}
              
              <!-- Cluster Pill Badge -->
              <div class="bg-slate-900/95 border border-slate-700/80 rounded-full px-2.5 py-1.5 flex items-center gap-1.5 shadow-2xl backdrop-blur-md group-hover:scale-110 transition-transform">
                <span class="w-2.5 h-2.5 rounded-full ${badgeColor} ${isCritical ? 'animate-ping' : ''}"></span>
                <span class="text-[11px] font-mono font-bold text-white tracking-wide">${hub.name}</span>
                <span class="bg-slate-800 text-cyan-300 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-cyan-800/40">
                  ${hub.atmCount} ATMs
                </span>
              </div>
            </div>
          `;

          const clusterMarker = L.marker([hub.latitude, hub.longitude], {
            icon: L.divIcon({ html: clusterHtml, className: 'hub-cluster-icon', iconSize: [64, 64] }),
          });

          clusterMarker.on('click', () => {
            handleFocusLocation(
              {
                name: `${hub.name} Cyber Intelligence Hub`,
                subtitle: `${hub.district}, ${hub.state}`,
                category: `REGIONAL CLUSTER • ${hub.category}`,
                riskLevel: hub.riskLevel,
                latitude: hub.latitude,
                longitude: hub.longitude,
                nearbyAtmCount: hub.atmCount,
                activeAlertsCount: hub.activeAlerts,
                suspiciousAmount: hub.suspiciousTxnAmount,
                lastEvent: hub.lastActivity,
                status: hub.threatSummary,
                details: [
                  { label: 'Monitored ATMs', value: `${hub.atmCount} ATMs Active`, highlight: true },
                  { label: 'Active Threat Alerts', value: `${hub.activeAlerts} Live Alerts`, highlight: isCritical },
                  { label: 'Suspicious Volume', value: `₹${hub.suspiciousTxnAmount.toLocaleString('en-IN')}`, highlight: true },
                  { label: 'State & District', value: `${hub.district}, ${hub.state}` },
                  { label: 'Primary Modus', value: hub.threatSummary },
                  { label: 'Last Intercept Log', value: hub.lastActivity },
                ],
              },
              10
            );
          });
          markerGroup.addLayer(clusterMarker);
        });
      }

      // 2. Individual ATMs (At High Zoom or all filtered)
      if (layers.atms) {
        // Combined ATMs dataset: mockCases + nationwide dataset
        const atmsToRender = isHighZoom ? NATIONWIDE_ATM_DATA : NATIONWIDE_ATM_DATA.slice(0, 15);

        atmsToRender.forEach((atm) => {
          if (layers.criticalOnly && atm.riskLevel !== 'CRITICAL') return;

          const isCritical = atm.riskLevel === 'CRITICAL';
          const isIntercepted = atm.status === 'INTERCEPTED';
          const pinColor = isIntercepted
            ? '#10b981'
            : isCritical
            ? '#ef4444'
            : atm.riskLevel === 'HIGH'
            ? '#f59e0b'
            : '#06b6d4';

          const atmHtml = `
            <div class="relative flex items-center justify-center cursor-pointer group -ml-3 -mt-3">
              ${isCritical ? `<div class="absolute w-8 h-8 rounded-full bg-red-500/20 cyber-marker-pulse-red pointer-events-none"></div>` : ''}
              <div class="w-6 h-6 rounded-full flex items-center justify-center shadow-lg border border-white/60 transition-transform group-hover:scale-125" style="background-color: ${pinColor}">
                <svg class="w-3.5 h-3.5 text-slate-950" fill="currentColor" viewBox="0 0 24 24"><path d="M4 10h16v10H4zM2 6h20v2H2z"/></svg>
              </div>
              <div class="hidden group-hover:block absolute -top-6 whitespace-nowrap bg-slate-950 text-slate-100 font-mono text-[9px] px-1.5 py-0.5 rounded border border-slate-700 shadow-xl z-50">
                ${atm.bank} • ${atm.city}
              </div>
            </div>
          `;

          const marker = L.marker([atm.latitude, atm.longitude], {
            icon: L.divIcon({ html: atmHtml, className: 'atm-marker-node', iconSize: [24, 24] }),
          });

          marker.on('click', () => {
            handleFocusLocation(
              {
                name: atm.name,
                subtitle: `${atm.bank} • ${atm.city}, ${atm.state}`,
                category: `ATM NODE • ${atm.status.replace(/_/g, ' ')}`,
                riskLevel: atm.riskLevel,
                latitude: atm.latitude,
                longitude: atm.longitude,
                nearbyAtmCount: 14,
                activeAlertsCount: isCritical ? 4 : 1,
                suspiciousAmount: 2400000,
                lastEvent: atm.lastActivity,
                status: atm.surveillanceStatus,
                details: [
                  { label: 'ATM ID', value: atm.id, highlight: true },
                  { label: 'Bank Name', value: atm.bank },
                  { label: 'Withdrawal Likelihood', value: `${atm.withdrawalLikelihood}%`, highlight: isCritical },
                  { label: 'Status', value: atm.status.replace(/_/g, ' ') },
                  { label: 'Address', value: atm.address },
                  { label: 'Nearby Landmark', value: atm.nearbyLandmark },
                  { label: 'Surveillance Mode', value: atm.surveillanceStatus },
                ],
              },
              14
            );
          });
          markerGroup.addLayer(marker);
        });
      }

      // 3. Active Cyber Threat Markers
      if (layers.threats) {
        ACTIVE_CYBER_THREATS.forEach((threat) => {
          if (layers.criticalOnly && threat.severity !== 'CRITICAL') return;

          const isCritical = threat.severity === 'CRITICAL';
          const threatColor = isCritical ? '#ef4444' : '#f97316';

          const threatHtml = `
            <div class="relative flex items-center justify-center cursor-pointer group -ml-4 -mt-4">
              <div class="absolute w-9 h-9 rounded-full ${isCritical ? 'bg-red-500/30 cyber-marker-pulse-red' : 'bg-amber-500/30 cyber-marker-pulse-orange'}"></div>
              <div class="w-8 h-8 rounded-full bg-slate-950 border-2 border-${isCritical ? 'red-500' : 'amber-500'} flex items-center justify-center shadow-2xl text-${isCritical ? 'red-400' : 'amber-400'} group-hover:scale-110 transition-transform">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              </div>
            </div>
          `;

          const marker = L.marker([threat.latitude, threat.longitude], {
            icon: L.divIcon({ html: threatHtml, className: 'cyber-threat-node', iconSize: [32, 32] }),
            zIndexOffset: 800,
          });

          marker.on('click', () => {
            handleFocusLocation(
              {
                name: threat.title,
                subtitle: `${threat.city}, ${threat.state} • ${threat.type.replace(/_/g, ' ')}`,
                category: `ACTIVE CYBER THREAT • ${threat.severity}`,
                riskLevel: threat.severity,
                latitude: threat.latitude,
                longitude: threat.longitude,
                nearbyAtmCount: 22,
                activeAlertsCount: 5,
                suspiciousAmount: threat.lossEstimate,
                lastEvent: threat.timestamp,
                status: threat.status.replace(/_/g, ' '),
                details: [
                  { label: 'Threat ID', value: threat.id, highlight: true },
                  { label: 'Threat Category', value: threat.type.replace(/_/g, ' ') },
                  { label: 'Severity Level', value: threat.severity, highlight: isCritical },
                  { label: 'Loss Estimate', value: threat.lossEstimate ? `₹${threat.lossEstimate.toLocaleString('en-IN')}` : 'N/A', highlight: true },
                  { label: 'Affected Accounts', value: threat.affectedAccounts ? `${threat.affectedAccounts} Accounts` : 'Multiple' },
                  { label: 'Intelligence Intel', value: threat.description },
                  { label: 'Investigation Status', value: threat.status.replace(/_/g, ' ') },
                ],
              },
              13
            );
          });
          markerGroup.addLayer(marker);
        });
      }
    }
  }, [
    isCurrentCaseMode,
    currentCase,
    selectedAtm,
    currentZoom,
    layers,
    onSelectAtm,
    handleFocusLocation,
  ]);

  // -------------------------------------------------------------
  // 7. SEARCH AUTOCOMPLETE LOGIC
  // -------------------------------------------------------------
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const q = query.toLowerCase();
    const results: Array<{
      id: string;
      title: string;
      subtitle: string;
      type: 'CITY' | 'ATM' | 'THREAT' | 'STATE';
      lat: number;
      lng: number;
      riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      rawItem: any;
    }> = [];

    // Search Cities & Hubs
    INDIA_MAJOR_HUBS.forEach((hub) => {
      if (hub.name.toLowerCase().includes(q) || hub.state.toLowerCase().includes(q) || hub.district.toLowerCase().includes(q)) {
        results.push({
          id: `city-${hub.name}`,
          title: hub.name,
          subtitle: `${hub.district}, ${hub.state} (${hub.atmCount} ATMs)`,
          type: 'CITY',
          lat: hub.latitude,
          lng: hub.longitude,
          riskLevel: hub.riskLevel,
          rawItem: hub,
        });
      }
    });

    // Search ATMs
    NATIONWIDE_ATM_DATA.forEach((atm) => {
      if (
        atm.name.toLowerCase().includes(q) ||
        atm.city.toLowerCase().includes(q) ||
        atm.bank.toLowerCase().includes(q) ||
        atm.id.toLowerCase().includes(q) ||
        atm.address.toLowerCase().includes(q)
      ) {
        results.push({
          id: atm.id,
          title: atm.name,
          subtitle: `${atm.bank} • ${atm.city}, ${atm.state}`,
          type: 'ATM',
          lat: atm.latitude,
          lng: atm.longitude,
          riskLevel: atm.riskLevel,
          rawItem: atm,
        });
      }
    });

    // Search Threat Events
    ACTIVE_CYBER_THREATS.forEach((threat) => {
      if (
        threat.title.toLowerCase().includes(q) ||
        threat.city.toLowerCase().includes(q) ||
        threat.type.toLowerCase().includes(q) ||
        threat.description.toLowerCase().includes(q)
      ) {
        results.push({
          id: threat.id,
          title: threat.title,
          subtitle: `${threat.city} • ${threat.type.replace(/_/g, ' ')}`,
          type: 'THREAT',
          lat: threat.latitude,
          lng: threat.longitude,
          riskLevel: threat.severity,
          rawItem: threat,
        });
      }
    });

    // Search States
    INDIA_STATES_DATA.forEach((st) => {
      if (st.name.toLowerCase().includes(q) || st.capital.toLowerCase().includes(q)) {
        results.push({
          id: `state-${st.code}`,
          title: `${st.name} State`,
          subtitle: `Capital: ${st.capital} • ${st.totalAtms} ATMs Monitored`,
          type: 'STATE',
          lat: st.latitude,
          lng: st.longitude,
          riskLevel: st.threatLevel,
          rawItem: st,
        });
      }
    });

    setSearchResults(results.slice(0, 8));
    setIsSearchOpen(true);
  };

  const handleSelectSearchResult = (res: (typeof searchResults)[0]) => {
    setIsSearchOpen(false);
    setSearchQuery(res.title);

    if (res.type === 'CITY') {
      const hub = res.rawItem as GeoLocation;
      handleFocusLocation(
        {
          name: `${hub.name} Cyber Intelligence Hub`,
          subtitle: `${hub.district}, ${hub.state}`,
          category: `REGIONAL CLUSTER • ${hub.category}`,
          riskLevel: hub.riskLevel,
          latitude: hub.latitude,
          longitude: hub.longitude,
          nearbyAtmCount: hub.atmCount,
          activeAlertsCount: hub.activeAlerts,
          suspiciousAmount: hub.suspiciousTxnAmount,
          lastEvent: hub.lastActivity,
          status: hub.threatSummary,
          details: [
            { label: 'Monitored ATMs', value: `${hub.atmCount} ATMs Active`, highlight: true },
            { label: 'Active Threat Alerts', value: `${hub.activeAlerts} Live Alerts` },
            { label: 'Suspicious Volume', value: `₹${hub.suspiciousTxnAmount.toLocaleString('en-IN')}`, highlight: true },
            { label: 'Primary Modus', value: hub.threatSummary },
          ],
        },
        11
      );
    } else if (res.type === 'ATM') {
      const atm = res.rawItem as AtmNode;
      handleFocusLocation(
        {
          name: atm.name,
          subtitle: `${atm.bank} • ${atm.city}, ${atm.state}`,
          category: `ATM NODE • ${atm.status.replace(/_/g, ' ')}`,
          riskLevel: atm.riskLevel,
          latitude: atm.latitude,
          longitude: atm.longitude,
          nearbyAtmCount: 12,
          activeAlertsCount: 2,
          lastEvent: atm.lastActivity,
          status: atm.surveillanceStatus,
          details: [
            { label: 'ATM ID', value: atm.id, highlight: true },
            { label: 'Bank Name', value: atm.bank },
            { label: 'Address', value: atm.address },
            { label: 'Surveillance Mode', value: atm.surveillanceStatus },
          ],
        },
        15
      );
    } else if (res.type === 'THREAT') {
      const threat = res.rawItem as CyberThreatEvent;
      handleFocusLocation(
        {
          name: threat.title,
          subtitle: `${threat.city}, ${threat.state}`,
          category: `CYBER THREAT • ${threat.severity}`,
          riskLevel: threat.severity,
          latitude: threat.latitude,
          longitude: threat.longitude,
          nearbyAtmCount: 18,
          activeAlertsCount: 4,
          suspiciousAmount: threat.lossEstimate,
          lastEvent: threat.timestamp,
          status: threat.status.replace(/_/g, ' '),
          details: [
            { label: 'Category', value: threat.type.replace(/_/g, ' ') },
            { label: 'Loss Estimate', value: threat.lossEstimate ? `₹${threat.lossEstimate.toLocaleString('en-IN')}` : 'N/A', highlight: true },
            { label: 'Description', value: threat.description },
          ],
        },
        13
      );
    } else {
      handleFocusLocation(
        {
          name: res.title,
          subtitle: res.subtitle,
          category: 'STATE JURISDICTION',
          riskLevel: res.riskLevel,
          latitude: res.lat,
          longitude: res.lng,
          nearbyAtmCount: 1400,
          activeAlertsCount: 12,
          lastEvent: 'Live telemetry active',
          status: 'MONITORED REGION',
          details: [
            { label: 'Region Name', value: res.title },
            { label: 'Threat Status', value: res.riskLevel },
          ],
        },
        7
      );
    }
  };

  // -------------------------------------------------------------
  // 8. ACTION SIMULATOR: DISPATCH PATROL / FREEZE
  // -------------------------------------------------------------
  const handleTriggerAction = (actionText: string) => {
    setActionAlertSent(actionText);
    setTimeout(() => {
      setActionAlertSent(null);
    }, 3500);
  };

  return (
    <div
      className={`relative w-full ${heightClass} bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl select-none transition-colors group font-['Plus_Jakarta_Sans',_'Inter',_sans-serif] ${
        is3DMode ? 'map-perspective-3d' : ''
      }`}
    >
      {/* ------------------------------------------------------------- */}
      {/* TOP HEADER HUD & SEARCH BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col md:flex-row md:items-center justify-between gap-2.5 pointer-events-none">
        
        {/* Left: Mode Title + Search Input */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap w-full md:w-auto">
          {/* Main Title Badge */}
          <div className="bg-slate-950/95 border border-slate-700/80 px-3 py-1.5 rounded-xl flex items-center gap-2.5 shadow-2xl backdrop-blur-md">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isCurrentCaseMode ? 'bg-cyan-400 animate-ping' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <div className="flex flex-col">
              <span className="text-[11px] font-mono font-bold text-white tracking-wider flex items-center gap-1.5 font-['Space_Grotesk']">
                {isCurrentCaseMode ? (
                  <>
                    <Target className="w-3.5 h-3.5 text-cyan-400" />
                    <span>CASE CASHOUT TARGET</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>INDIA CYBER INTELLIGENCE MAP</span>
                  </>
                )}
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                {isCurrentCaseMode
                  ? hasCaseMapData
                    ? `${safeAtmCandidates.length} Predicted ATMs in ${
                        currentCase?.predictedCashoutRegion?.city || 'Region'
                      }`
                    : 'Complaint intelligence data not available'
                  : `${NATIONWIDE_ATM_DATA.length}+ ATMs • ${ACTIVE_CYBER_THREATS.length} Active Cyber Threats`}
              </span>
            </div>
          </div>

          {/* Search Box with Autocomplete */}
          <div className="relative flex-1 sm:w-64">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search Indian city, ATM, threat, state..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setIsSearchOpen(true);
                }}
                className="w-full bg-slate-950/95 border border-slate-700/80 hover:border-cyan-500/80 focus:border-cyan-400 rounded-xl pl-8 pr-7 py-1.5 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none shadow-2xl backdrop-blur-md transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {isSearchOpen && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute top-full left-0 right-0 mt-1.5 bg-slate-950/95 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden z-[1050] max-h-60 overflow-y-auto"
                >
                  {searchResults.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => handleSelectSearchResult(res)}
                      className="p-2.5 hover:bg-slate-900 border-b border-slate-800/60 last:border-b-0 cursor-pointer flex items-center justify-between gap-2 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            res.riskLevel === 'CRITICAL'
                              ? 'bg-red-500'
                              : res.riskLevel === 'HIGH'
                              ? 'bg-amber-500'
                              : 'bg-cyan-400'
                          }`}
                        />
                        <div className="truncate">
                          <div className="font-bold text-slate-100 truncate text-[11px]">{res.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">{res.subtitle}</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold uppercase shrink-0">
                        {res.type}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Primary Mode Toggle (Current Case vs Nationwide) & HUD Controls */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          {/* Mode Switcher */}
          <div className="bg-slate-950/95 border border-slate-700/80 p-1 rounded-xl shadow-2xl flex items-center gap-1 backdrop-blur-md">
            <button
              onClick={() => {
                setIsCurrentCaseMode(false);
                handleResetIndiaView();
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer ${
                !isCurrentCaseMode
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Show nationwide threat & ATM map"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>NATIONWIDE</span>
            </button>

            <button
              onClick={() => {
                setIsCurrentCaseMode(true);
                if (currentCase && hasCaseMapData && safeAtmCandidates.length > 0) {
                  const lat = safeAtmCandidates[0].latitude;
                  const lng = safeAtmCandidates[0].longitude;
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1.2 });
                  }
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all cursor-pointer ${
                isCurrentCaseMode
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Focus active case cashout & money trail"
            >
              <Target className="w-3.5 h-3.5" />
              <span>ACTIVE CASE ({safeAtmCandidates.length})</span>
            </button>
          </div>

          {/* Map Style Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowStyleMenu(!showStyleMenu);
                setShowLayersMenu(false);
              }}
              className="bg-slate-950/95 hover:bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-cyan-400 px-3 py-1.5 rounded-xl font-mono text-xs flex items-center gap-1.5 shadow-2xl backdrop-blur-md cursor-pointer transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span className="capitalize">{mapStyle}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Map Style Menu */}
            <AnimatePresence>
              {showStyleMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-44 bg-slate-950 border border-slate-700 rounded-xl p-2 shadow-2xl z-[1050] backdrop-blur-xl space-y-1 font-mono text-xs"
                >
                  <div className="text-[10px] text-slate-400 font-bold px-2 py-1 uppercase tracking-wider border-b border-slate-800">
                    MAP STYLE
                  </div>
                  {(['tactical', 'dark', 'light', 'satellite', 'terrain', '3d'] as MapStyleType[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setMapStyle(st);
                        if (st === '3d') {
                          setIs3DMode(true);
                        } else {
                          setIs3DMode(false);
                        }
                        setShowStyleMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer capitalize ${
                        mapStyle === st
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <span>{st}</span>
                      {mapStyle === st && <span className="text-[11px]">◉</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2D / 3D Toggle */}
          <button
            onClick={() => {
              setIs3DMode(!is3DMode);
              if (!is3DMode) {
                setMapStyle('3d');
              }
            }}
            className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xl backdrop-blur-md ${
              is3DMode
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/20'
                : 'bg-slate-950/95 text-slate-300 border-slate-700 hover:text-cyan-400 hover:bg-slate-900'
            }`}
            title="Toggle 2D Top-Down / 3D Perspective View"
          >
            <span>{is3DMode ? '3D ACTIVE' : '2D VIEW'}</span>
          </button>

          {/* Layers Selector Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLayersMenu(!showLayersMenu);
                setShowStyleMenu(false);
              }}
              className="bg-slate-950/95 hover:bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-cyan-400 p-2 rounded-xl shadow-2xl backdrop-blur-md cursor-pointer transition-colors"
              title="Layer Overlays"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Layers Dropdown */}
            <AnimatePresence>
              {showLayersMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-slate-950 border border-slate-700 rounded-xl p-2.5 shadow-2xl z-[1050] backdrop-blur-xl space-y-1.5 font-mono text-xs"
                >
                  <div className="text-[10px] text-slate-400 font-bold px-1 uppercase tracking-wider border-b border-slate-800 pb-1">
                    INTELLIGENCE LAYERS
                  </div>

                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 cursor-pointer text-slate-200">
                    <span>ATM Locations</span>
                    <input
                      type="checkbox"
                      checked={layers.atms}
                      onChange={(e) => setLayers((p) => ({ ...p, atms: e.target.checked }))}
                      className="accent-cyan-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 cursor-pointer text-slate-200">
                    <span>Cyber Threat Alerts</span>
                    <input
                      type="checkbox"
                      checked={layers.threats}
                      onChange={(e) => setLayers((p) => ({ ...p, threats: e.target.checked }))}
                      className="accent-cyan-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 cursor-pointer text-slate-200">
                    <span>Critical Alerts Only</span>
                    <input
                      type="checkbox"
                      checked={layers.criticalOnly}
                      onChange={(e) => setLayers((p) => ({ ...p, criticalOnly: e.target.checked }))}
                      className="accent-red-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 cursor-pointer text-slate-200">
                    <span>Regional City Hubs</span>
                    <input
                      type="checkbox"
                      checked={layers.cities}
                      onChange={(e) => setLayers((p) => ({ ...p, cities: e.target.checked }))}
                      className="accent-cyan-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 cursor-pointer text-slate-200">
                    <span>Heatmap & Halos</span>
                    <input
                      type="checkbox"
                      checked={layers.heatmaps}
                      onChange={(e) => setLayers((p) => ({ ...p, heatmaps: e.target.checked }))}
                      className="accent-amber-500"
                    />
                  </label>

                  {isCurrentCaseMode && (
                    <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 cursor-pointer text-slate-200">
                      <span>Money Trail Route</span>
                      <input
                        type="checkbox"
                        checked={layers.routes}
                        onChange={(e) => setLayers((p) => ({ ...p, routes: e.target.checked }))}
                        className="accent-amber-500"
                      />
                    </label>
                  )}

                  <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 cursor-pointer text-slate-200">
                    <span>Tactical Grid Lines</span>
                    <input
                      type="checkbox"
                      checked={layers.grid}
                      onChange={(e) => setLayers((p) => ({ ...p, grid: e.target.checked }))}
                      className="accent-cyan-500"
                    />
                  </label>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MAP CANVAS CONTAINER & HARDWARE 3D PERSPECTIVE WRAPPER */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`w-full h-full relative overflow-hidden ${
          is3DMode ? 'map-viewport-3d' : 'map-viewport-2d'
        }`}
      >
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Tactical Coordinate Grid Overlay (when enabled) */}
        {layers.grid && mapStyle === 'tactical' && (
          <div
            className="absolute inset-0 pointer-events-none opacity-25 z-[400]"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(6, 182, 212, 0.15) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(6, 182, 212, 0.15) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FLOATING TARGET INTELLIGENCE DETAIL PANEL */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {targetLocation && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-[1020] top-20 left-3 bottom-14 max-w-sm w-[92%] sm:w-88 bg-slate-950/95 border border-cyan-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Action dispatched toast inside panel */}
            {actionAlertSent && (
              <div className="absolute inset-x-0 top-0 bg-emerald-500 text-slate-950 font-bold text-xs p-2 text-center font-mono animate-bounce z-50 flex items-center justify-center gap-1.5 shadow-lg">
                <CheckCircle2 className="w-4 h-4" />
                <span>{actionAlertSent}</span>
              </div>
            )}

            <div className="space-y-3 overflow-y-auto pr-1">
              {/* Top Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-2.5">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 block uppercase">
                    {targetLocation.category}
                  </span>
                  <h3 className="font-['Space_Grotesk'] text-base font-bold text-white leading-tight mt-0.5">
                    {targetLocation.name}
                  </h3>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">{targetLocation.subtitle}</div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      targetLocation.riskLevel === 'CRITICAL'
                        ? 'bg-red-950 text-red-300 border border-red-800'
                        : targetLocation.riskLevel === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                    }`}
                  >
                    {targetLocation.riskLevel} RISK
                  </span>
                  <button
                    onClick={() => setTargetLocation(null)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Summary Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center font-mono">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">NEARBY ATMs</span>
                  <span className="text-sm font-bold text-cyan-300">{targetLocation.nearbyAtmCount}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-400 block">ACTIVE ALERTS</span>
                  <span className="text-sm font-bold text-red-400">{targetLocation.activeAlertsCount}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 truncate">
                  <span className="text-[9px] text-slate-400 block">LAST EVENT</span>
                  <span className="text-xs font-bold text-amber-300 block truncate">{targetLocation.lastEvent}</span>
                </div>
              </div>

              {/* Key Intel Data Rows */}
              <div className="space-y-1.5 text-xs">
                {targetLocation.details.map((row, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-2 border-b border-slate-900 pb-1 text-[11px]"
                  >
                    <span className="text-slate-400 font-medium shrink-0">{row.label}:</span>
                    <span
                      className={`text-right font-mono ${
                        row.highlight ? 'text-amber-300 font-bold' : 'text-slate-200'
                      }`}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Tactical Dispatch Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={() => handleTriggerAction(`Patrol Alert Dispatched to ${targetLocation.name}`)}
                className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-['Space_Grotesk'] font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>DISPATCH ALERT</span>
              </button>

              <button
                onClick={() => handleTriggerAction('Freeze Request Submitted via Section 102 CrPC')}
                className="px-3 py-2 rounded-xl bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 font-['Space_Grotesk'] font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                title="Freeze linked mule accounts"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>FREEZE</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* FLOATING MAP NAVIGATION CONTROLS (Bottom Right) */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute bottom-3 right-3 z-[1000] flex flex-col gap-1.5 bg-slate-950/95 border border-slate-700/80 p-1.5 rounded-xl shadow-2xl backdrop-blur-md">
        
        {/* Zoom In (+) */}
        <button
          onClick={() => {
            if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
          }}
          title="Zoom In (+)"
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out (-) */}
        <button
          onClick={() => {
            if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
          }}
          title="Zoom Out (-)"
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Reset India View */}
        <button
          onClick={handleResetIndiaView}
          title="Reset to Full India View"
          className="p-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-cyan-400 transition-colors cursor-pointer border-t border-slate-800"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Target Active Cashout Hub */}
        {currentCase && hasCaseMapData && safeAtmCandidates.length > 0 && (
          <button
            onClick={() => {
              const lat = safeAtmCandidates[0].latitude;
              const lng = safeAtmCandidates[0].longitude;
              if (mapInstanceRef.current) {
                mapInstanceRef.current.flyTo([lat, lng], 13, { duration: 1.2 });
              }
            }}
            title="Focus Target Cashout Region"
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-200 hover:text-amber-400 transition-colors cursor-pointer"
          >
            <Crosshair className="w-4 h-4 text-amber-400" />
          </button>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM INTELLIGENCE STATUS & LEGEND OVERLAY (Bottom Left) */}
      {/* ------------------------------------------------------------- */}
      <div className="absolute bottom-3 left-3 z-[1000] hidden sm:flex items-center gap-3 bg-slate-950/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300 shadow-2xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block ring-2 ring-red-500/30" />
          <span>Critical Threat</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block ring-2 ring-amber-400/30" />
          <span>Active Watch / High Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block ring-2 ring-cyan-400/30" />
          <span>Monitored ATM</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block ring-2 ring-emerald-400/30" />
          <span>Intercepted</span>
        </div>
      </div>
    </div>
  );
};
