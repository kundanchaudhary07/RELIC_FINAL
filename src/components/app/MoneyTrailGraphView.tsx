import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Crosshair,
  ArrowRight,
  Shield,
  AlertTriangle,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  Navigation,
  X,
  CreditCard,
  Send,
  Activity,
  Info,
  Lock,
  Layers,
  FileSpreadsheet,
  Compass,
  DollarSign
} from 'lucide-react';
import { InvestigationCase, TransactionHop, AtmCandidate } from '../../types';

interface MoneyTrailGraphViewProps {
  currentCase: InvestigationCase;
}

// Known coordinates for Indian cities
const CITY_COORDINATES: Record<string, [number, number]> = {
  'Mumbai': [18.9438, 72.8233],
  'New Delhi': [28.6139, 77.2090],
  'Delhi': [28.6139, 77.2090],
  'Noida': [28.6280, 77.3649],
  'Gurugram': [28.4595, 77.0266],
  'Bengaluru': [12.9716, 77.5946],
  'Bangalore': [12.9716, 77.5946],
  'Hyderabad': [17.3850, 78.4867],
  'Kolkata': [22.5726, 88.3639],
  'Chennai': [13.0827, 80.2707],
  'Ahmedabad': [23.0225, 72.5714],
  'Surat': [21.1702, 72.8311],
  'Jamtara': [23.9575, 86.8016],
  'Mewat': [28.1065, 77.0125],
  'Nuh': [28.1065, 77.0125],
  'Mewat / Nuh': [28.1065, 77.0125],
  'Kozhikode': [11.2588, 75.7804],
  'Calicut': [11.2588, 75.7804],
  'Ernakulam': [9.9816, 76.2999],
  'Kochi': [9.9312, 76.2673],
  'Pune': [18.5204, 73.8567],
  'Jaipur': [26.9124, 75.7873],
  'Lucknow': [26.8467, 80.9462],
  'Patna': [25.5941, 85.1376],
  'Chandigarh': [30.7333, 76.7794],
  'Indore': [22.7196, 75.8577],
  'Guwahati': [26.1445, 91.7362],
  'Bhubaneswar': [20.2961, 85.8245],
  'Bhopal': [23.2599, 77.4126],
  'Ranchi': [23.3441, 85.3096],
  'Thiruvananthapuram': [8.5241, 76.9366],
  'Dehradun': [30.3165, 78.0322],
  'Srinagar': [34.0837, 74.7973],
  'Varanasi': [25.3176, 82.9739],
  'Kanpur': [26.4499, 80.3319],
  'Nagpur': [21.1458, 79.0882],
  'Vadodara': [22.3072, 73.1812],
  'Rajkot': [22.3039, 70.8022],
  'Amritsar': [31.6340, 74.8723],
  'Ludhiana': [30.9010, 75.8573],
  'Agra': [27.1767, 78.0081],
  'Meerut': [28.9845, 77.7064],
  'Ghaziabad': [28.6692, 77.4538],
  'Coimbatore': [11.0168, 76.9558],
  'Madurai': [9.9252, 78.1198],
  'Visakhapatnam': [17.6868, 83.2185],
  'Vijayawada': [16.5062, 80.6480],
};

export interface ProcessedGraphNode {
  id: string;
  hopIndex: number;
  nodeType: 'VICTIM' | 'MULE' | 'INTERMEDIATE' | 'ATM_CSP' | 'CASHOUT';
  roleLabel: string;
  accountHolderName: string;
  amount: number;
  accountNumber: string;
  bankName: string;
  bankType: string;
  ifsc: string;
  city: string;
  state: string;
  coordinates: [number, number];
  date: string;
  time: string;
  transactionType: string;
  status: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
  rawHop?: TransactionHop;
  atmCandidate?: AtmCandidate;
}

export interface ProcessedGraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  amount: number;
  channel: string;
  timestamp: string;
  sourceCoord: [number, number];
  targetCoord: [number, number];
}

export const MoneyTrailGraphView: React.FC<MoneyTrailGraphViewProps> = ({ currentCase }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  // User Interactive State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [is3DMode, setIs3DMode] = useState<boolean>(false);
  const [showAmountsOnEdges, setShowAmountsOnEdges] = useState<boolean>(true);
  const [showLocationLabels, setShowLocationLabels] = useState<boolean>(true);

  // Helper to determine node type & role label
  const getNodeMeta = (hop: TransactionHop, index: number, total: number) => {
    if (hop.hopType === 'VICTIM' || index === 0) {
      return {
        nodeType: 'VICTIM' as const,
        roleLabel: 'SOURCE / VICTIM',
        bankType: 'Originating Account',
        riskLevel: 'LOW' as const,
        status: 'SOURCE DEBIT'
      };
    }
    if (hop.hopType === 'PREDICTED_CASHOUT' || index === total - 1) {
      const isIntercepted = currentCase.status === 'INTERCEPTED' || hop.notes?.toLowerCase().includes('intercepted');
      return {
        nodeType: 'CASHOUT' as const,
        roleLabel: hop.receiverAccount === 'ATM-CASH-EXTRACTION' ? 'ATM / CSP CASHOUT POINT' : 'PREDICTED CASHOUT',
        bankType: hop.channel === 'ATM_PREDICTED' ? 'Cash Dispenser Kiosk / CSP' : 'Cashout Aggregator',
        riskLevel: 'CRITICAL' as const,
        status: isIntercepted ? 'INTERCEPTED' : 'CRITICAL EXTRACTION'
      };
    }
    if (hop.hopType === 'LAYER_1_MULE') {
      return {
        nodeType: 'MULE' as const,
        roleLabel: 'LAYER 1 MULE ACCOUNT',
        bankType: 'Commercial / Mule Account',
        riskLevel: 'HIGH' as const,
        status: 'RAPID DISPERSION'
      };
    }
    if (hop.hopType === 'LAYER_2_MULE') {
      return {
        nodeType: 'INTERMEDIATE' as const,
        roleLabel: 'LAYER 2 MULE INTERMEDIARY',
        bankType: 'Regional Hub Account',
        riskLevel: 'HIGH' as const,
        status: 'INTERMEDIATE SPLIT'
      };
    }
    return {
      nodeType: 'INTERMEDIATE' as const,
      roleLabel: `LAYER ${index} MULE AGGREGATOR`,
      bankType: 'Aggregator Account',
      riskLevel: 'HIGH' as const,
      status: 'MULE ROUTING'
    };
  };

  // Build Graph Nodes and Edges from selectedCase
  const { nodes, edges } = useMemo(() => {
    if (!currentCase || !currentCase.moneyTrail || currentCase.moneyTrail.length === 0) {
      return { nodes: [], edges: [] };
    }

    const builtNodes: ProcessedGraphNode[] = [];
    const cityCountMap: Record<string, number> = {};

    currentCase.moneyTrail.forEach((hop, idx) => {
      const meta = getNodeMeta(hop, idx, currentCase.moneyTrail.length);
      const cityName = hop.locationCity || currentCase.incidentLocation.city || 'Mumbai';
      const stateName = hop.locationState || currentCase.incidentLocation.state || 'Maharashtra';

      // Base coordinates
      let baseCoord = CITY_COORDINATES[cityName] ||
        (currentCase.incidentLocation.city === cityName ? [currentCase.incidentLocation.latitude, currentCase.incidentLocation.longitude] : null);

      if (!baseCoord) {
        // Fallback search by partial string or default
        const matchKey = Object.keys(CITY_COORDINATES).find(k => cityName.toLowerCase().includes(k.toLowerCase()));
        baseCoord = matchKey ? CITY_COORDINATES[matchKey] : [20.5937, 78.9629];
      }

      // If multiple nodes are in the exact same city, apply slight radial offset so both are distinct on map
      const occurrence = cityCountMap[cityName] || 0;
      cityCountMap[cityName] = occurrence + 1;

      let finalCoord: [number, number] = [baseCoord[0], baseCoord[1]];
      if (occurrence > 0) {
        const angle = (occurrence * Math.PI * 2) / 3;
        const offset = 0.045 * occurrence; // ~4-5km visual separation
        finalCoord = [baseCoord[0] + Math.sin(angle) * offset, baseCoord[1] + Math.cos(angle) * offset];
      }

      // Extract date and time
      let dateStr = currentCase.incidentDate;
      let timeStr = currentCase.incidentTime;
      if (hop.timestamp) {
        const parts = hop.timestamp.split(' ');
        if (parts.length >= 2) {
          dateStr = parts[0];
          timeStr = parts.slice(1).join(' ');
        }
      }

      // Check for matching ATM candidate if this is cashout node
      const matchingAtm = currentCase.atmCandidates && currentCase.atmCandidates.length > 0
        ? currentCase.atmCandidates[0]
        : undefined;

      builtNodes.push({
        id: `node-hop-${idx}`,
        hopIndex: idx,
        nodeType: meta.nodeType,
        roleLabel: meta.roleLabel,
        accountHolderName: hop.receiverName,
        amount: hop.amount,
        accountNumber: hop.receiverAccount,
        bankName: hop.receiverBank,
        bankType: meta.bankType,
        ifsc: hop.receiverIfsc,
        city: cityName,
        state: stateName,
        coordinates: finalCoord,
        date: dateStr,
        time: timeStr,
        transactionType: hop.channel || 'IMPS',
        status: meta.status,
        riskLevel: meta.riskLevel,
        notes: hop.notes,
        rawHop: hop,
        atmCandidate: meta.nodeType === 'CASHOUT' ? matchingAtm : undefined,
      });
    });

    // Build Edges
    const builtEdges: ProcessedGraphEdge[] = [];
    for (let i = 0; i < builtNodes.length - 1; i++) {
      const source = builtNodes[i];
      const target = builtNodes[i + 1];
      const hop = currentCase.moneyTrail[i + 1];

      builtEdges.push({
        id: `edge-${source.id}-${target.id}`,
        sourceId: source.id,
        targetId: target.id,
        amount: hop ? hop.amount : target.amount,
        channel: hop ? hop.channel : 'IMPS',
        timestamp: hop ? hop.timestamp : target.time,
        sourceCoord: source.coordinates,
        targetCoord: target.coordinates,
      });
    }

    return { nodes: builtNodes, edges: builtEdges };
  }, [currentCase]);

  // Selected node object
  const activeNode = useMemo(() => {
    if (!selectedNodeId) return nodes[0] || null;
    return nodes.find(n => n.id === selectedNodeId) || nodes[0] || null;
  }, [selectedNodeId, nodes]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Map if not already initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [21.8, 79.5],
        zoom: 5,
        minZoom: 4,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: true,
      });

      // Dark Tactical Esri Tile layer
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: '&copy; Esri, OpenStreetMap contributors',
          maxZoom: 18,
          maxNativeZoom: 16,
        }
      ).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    if (!map || !layerGroup) return;

    // Clear previous markers & polylines
    layerGroup.clearLayers();

    if (nodes.length === 0) return;

    // 1. Draw connecting transaction flow edges on map
    edges.forEach((edge, edgeIdx) => {
      const isConnectedToSelected = selectedNodeId
        ? edge.sourceId === selectedNodeId || edge.targetId === selectedNodeId
        : true;

      const pathColor = isConnectedToSelected ? '#06b6d4' : '#334155';
      const pathWeight = isConnectedToSelected ? 3.5 : 2;
      const pathOpacity = isConnectedToSelected ? 0.9 : 0.4;

      // Draw glowing polyline
      const polyline = L.polyline([edge.sourceCoord, edge.targetCoord], {
        color: pathColor,
        weight: pathWeight,
        opacity: pathOpacity,
        dashArray: isConnectedToSelected ? '8, 8' : '4, 6',
        lineCap: 'round',
        lineJoin: 'round',
      });
      polyline.addTo(layerGroup);

      // Midpoint amount badge
      if (showAmountsOnEdges) {
        const midLat = (edge.sourceCoord[0] + edge.targetCoord[0]) / 2;
        const midLng = (edge.sourceCoord[1] + edge.targetCoord[1]) / 2;

        const amountIcon = L.divIcon({
          className: 'custom-leaflet-edge-badge',
          html: `
            <div class="px-2 py-0.5 rounded-md bg-slate-950/90 border border-cyan-500/60 shadow-lg text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1 backdrop-blur-sm -translate-x-1/2 -translate-y-1/2 whitespace-nowrap">
              <span>→ ₹${(edge.amount / 100000).toFixed(2)}L</span>
            </div>
          `,
          iconSize: [0, 0],
        });

        const amountMarker = L.marker([midLat, midLng], { icon: amountIcon, interactive: false });
        amountMarker.addTo(layerGroup);
      }
    });

    // 2. Draw Nodes / Markers on map
    const bounds = L.latLngBounds([]);

    nodes.forEach((node) => {
      bounds.extend(node.coordinates);
      const isSelected = selectedNodeId === node.id;
      const isHovered = hoveredNodeId === node.id;

      // Color scheme based on role
      let ringColor = '#06b6d4';
      let bgColor = 'bg-cyan-500';
      let borderGlow = 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.6)]';
      let pulseAnim = 'cyber-marker-pulse-cyan';

      if (node.nodeType === 'VICTIM') {
        ringColor = '#0284c7';
        bgColor = 'bg-sky-500';
        borderGlow = 'border-sky-400 shadow-[0_0_15px_rgba(2,132,199,0.6)]';
        pulseAnim = 'cyber-marker-pulse-cyan';
      } else if (node.nodeType === 'CASHOUT') {
        ringColor = '#ef4444';
        bgColor = 'bg-red-600';
        borderGlow = 'border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.8)]';
        pulseAnim = 'cyber-marker-pulse-red';
      } else if (node.nodeType === 'MULE') {
        ringColor = '#f59e0b';
        bgColor = 'bg-amber-500';
        borderGlow = 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]';
        pulseAnim = 'cyber-marker-pulse-orange';
      }

      const markerHtml = `
        <div class="relative cursor-pointer group -translate-x-1/2 -translate-y-1/2 select-none">
          <!-- Pulse Ping -->
          <div class="absolute -inset-2 rounded-full ${pulseAnim} opacity-75"></div>
          
          <!-- Node Marker Circle -->
          <div class="w-8 h-8 rounded-xl ${bgColor} border-2 ${borderGlow} flex items-center justify-center text-white font-mono font-bold text-xs transition-transform transform ${
        isSelected ? 'scale-125 ring-4 ring-cyan-400/50' : isHovered ? 'scale-115' : 'hover:scale-110'
      }">
            0${node.hopIndex}
          </div>

          <!-- Compact Geographical Label -->
          ${
            showLocationLabels
              ? `
            <div class="absolute top-9 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-slate-700/80 rounded-md px-2 py-0.5 text-[10px] font-sans font-semibold text-slate-200 whitespace-nowrap shadow-md pointer-events-none flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full ${bgColor}"></span>
              ${node.city}
            </div>
          `
              : ''
          }
        </div>
      `;

      const markerIcon = L.divIcon({
        className: 'custom-graph-marker',
        html: markerHtml,
        iconSize: [0, 0],
      });

      const marker = L.marker(node.coordinates, { icon: markerIcon });

      // Click event
      marker.on('click', () => {
        setSelectedNodeId(node.id);
      });

      // Hover events
      marker.on('mouseover', () => {
        setHoveredNodeId(node.id);
      });
      marker.on('mouseout', () => {
        setHoveredNodeId(null);
      });

      marker.addTo(layerGroup);
    });

    // Auto-fit bounds on initial case load
    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [70, 70],
        maxZoom: 10,
        animate: true,
      });
    }

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => clearTimeout(timer);
  }, [nodes, edges, selectedNodeId, hoveredNodeId, showAmountsOnEdges, showLocationLabels]);

  // Fit to Flow handler
  const handleFitToFlow = () => {
    if (!mapInstanceRef.current || nodes.length === 0) return;
    const bounds = L.latLngBounds(nodes.map((n) => n.coordinates));
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 10,
        animate: true,
      });
    }
  };

  // Reset View handler
  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([21.8, 79.5], 4.8, { animate: true });
    setSelectedNodeId(nodes[0]?.id || null);
  };

  // Zoom controls
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };
  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Bar & Intelligence Badges */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-sm">
        
        {/* Left: Summary trail metrics */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>GEO MONEY FLOW</span>
            <span className="text-slate-500">|</span>
            <span className="font-bold text-white">{nodes.length} Connected Nodes</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
            <span className="text-slate-500">CASE:</span>
            <span className="font-bold text-cyan-300">{currentCase.caseNumber}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-amber-400">
            <span>TRAIL:</span>
            <span className="font-bold text-white">
              {nodes[0]?.city} → {nodes[nodes.length - 1]?.city}
            </span>
          </div>
        </div>

        {/* Right: Map & Graph Tactical Controls */}
        <div className="flex items-center gap-2">
          
          {/* Show Amounts Toggle */}
          <button
            type="button"
            onClick={() => setShowAmountsOnEdges(!showAmountsOnEdges)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all flex items-center gap-1.5 ${
              showAmountsOnEdges
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle amount display on flow edges"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">AMOUNTS</span>
          </button>

          {/* Show Locations Toggle */}
          <button
            type="button"
            onClick={() => setShowLocationLabels(!showLocationLabels)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all flex items-center gap-1.5 ${
              showLocationLabels
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle city location labels"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">LOCATIONS</span>
          </button>

          {/* 2D / 3D Perspective Toggle */}
          <button
            type="button"
            onClick={() => setIs3DMode(!is3DMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium border transition-all flex items-center gap-1.5 ${
              is3DMode
                ? 'bg-indigo-950/80 border-indigo-500/60 text-indigo-300 shadow-sm'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle 3D Perspective map view"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{is3DMode ? '3D VIEW' : '2D VIEW'}</span>
          </button>

          {/* Fit to Flow */}
          <button
            type="button"
            onClick={handleFitToFlow}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1"
            title="Fit entire money trail inside view"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">FIT TO FLOW</span>
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={handleResetView}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1"
            title="Reset map view to default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">RESET</span>
          </button>

          {/* Zoom In/Out */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border-r border-slate-800"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Main Graph Visualization Stage: India Map + Tactical Overlays */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        
        {/* Leaflet Map Stage */}
        <div
          className={`w-full transition-all duration-500 ${
            is3DMode ? 'map-viewport-3d h-[540px] sm:h-[600px]' : 'map-viewport-2d h-[500px] sm:h-[560px]'
          }`}
        >
          <div ref={mapContainerRef} className="w-full h-full bg-[#020617]" />
        </div>

        {/* Floating Top-Left Tactical HUD Header */}
        <div className="absolute top-4 left-4 z-[1000] pointer-events-none hidden sm:block">
          <div className="p-3 rounded-xl bg-slate-950/85 border border-slate-800 backdrop-blur-md shadow-xl text-left space-y-1 pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-400">
                ACTIVE GEOSPATIAL INTELLIGENCE
              </span>
            </div>
            <div className="text-xs font-mono text-slate-300 font-semibold">
              India Cyber Forensics Vector Grid
            </div>
          </div>
        </div>

        {/* Floating Compact Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] max-w-[280px] sm:max-w-xs">
          <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 backdrop-blur-md shadow-xl space-y-2">
            <div className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase border-b border-slate-800/80 pb-1 flex items-center justify-between">
              <span>GRAPH LEGEND</span>
              <span className="text-[9px] text-cyan-400">CASE FLOW</span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-md bg-sky-500 shrink-0"></span>
                <span>Source / Victim</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-md bg-amber-500 shrink-0"></span>
                <span>Layer 1 Mule</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-md bg-cyan-500 shrink-0"></span>
                <span>Intermediate Hub</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-md bg-red-600 shrink-0"></span>
                <span>ATM / Cashout</span>
              </div>
            </div>

            <div className="text-[9px] font-mono text-cyan-400/90 pt-1 border-t border-slate-800/80 flex items-center gap-1">
              <span>→ Directional Money Flow Edge</span>
            </div>
          </div>
        </div>

        {/* Floating Quick Inspector / Details Sidebar Overlay on Map when a Node is active */}
        {activeNode && (
          <div className="absolute top-4 right-4 z-[1000] w-72 sm:w-84 max-h-[calc(100%-2rem)] overflow-y-auto custom-scrollbar">
            <motion.div
              key={activeNode.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-slate-950/95 border border-cyan-500/40 backdrop-blur-md shadow-2xl space-y-3.5 text-left"
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center font-mono text-xs font-bold text-cyan-300">
                    0{activeNode.hopIndex}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
                    {activeNode.roleLabel}
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                    activeNode.riskLevel === 'CRITICAL'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : activeNode.riskLevel === 'HIGH'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                  }`}
                >
                  {activeNode.status}
                </span>
              </div>

              {/* PRIMARY INFORMATION: NAME + AMOUNT PROMINENT */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  ACCOUNT HOLDER & AMOUNT
                </div>
                <div className="font-['Space_Grotesk'] text-lg font-bold text-white tracking-tight">
                  {activeNode.accountHolderName}
                </div>
                <div className="font-['Space_Grotesk'] text-2xl font-extrabold text-cyan-400">
                  ₹{activeNode.amount.toLocaleString('en-IN')}
                </div>
              </div>

              {/* SECONDARY INFORMATION TABLE */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/60 pb-1">
                  <span>Account Number:</span>
                  <strong className="text-slate-200">{activeNode.accountNumber}</strong>
                </div>

                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/60 pb-1">
                  <span>Bank Name:</span>
                  <strong className="text-slate-200">{activeNode.bankName}</strong>
                </div>

                {activeNode.ifsc && (
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/60 pb-1">
                    <span>IFSC Code:</span>
                    <strong className="text-cyan-300">{activeNode.ifsc}</strong>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/60 pb-1">
                  <span>Location:</span>
                  <strong className="text-amber-400">
                    {activeNode.city}, {activeNode.state}
                  </strong>
                </div>

                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/60 pb-1">
                  <span>Timestamp:</span>
                  <strong className="text-slate-300">{activeNode.date} • {activeNode.time}</strong>
                </div>

                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/60 pb-1">
                  <span>Transfer Channel:</span>
                  <strong className="text-sky-300">{activeNode.transactionType}</strong>
                </div>

                {activeNode.atmCandidate && (
                  <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/50 space-y-1 mt-2">
                    <div className="text-[10px] font-bold text-red-400 uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      TARGET ATM KIOSK
                    </div>
                    <div className="text-[11px] text-slate-200 font-sans font-semibold">
                      {activeNode.atmCandidate.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {activeNode.atmCandidate.address}
                    </div>
                  </div>
                )}

                {activeNode.notes && (
                  <div className="text-[11px] font-sans text-slate-400 italic pt-1">
                    "{activeNode.notes}"
                  </div>
                )}
              </div>

            </motion.div>
          </div>
        )}

      </div>

      {/* Synchronized Financial Relationship Flow Sequence Cards */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Complete Transaction Flow Pipeline
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Click any node in the sequence to highlight geographical path and inspect audit details.
            </p>
          </div>

          <div className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-3 py-1 rounded-xl shrink-0">
            {nodes.length} Stages • End-to-End Traced
          </div>
        </div>

        {/* Responsive Grid/Flow of Nodes with prominent Name + Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {nodes.map((node, idx) => {
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={`relative rounded-2xl p-5 border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'bg-slate-950 border-cyan-400 ring-2 ring-cyan-500/40 shadow-xl'
                    : isHovered
                    ? 'bg-slate-950/90 border-slate-700 shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                
                {/* Card Top Strip */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold ${
                      node.nodeType === 'VICTIM'
                        ? 'bg-sky-950 text-sky-400 border border-sky-800'
                        : node.nodeType === 'CASHOUT'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    }`}>
                      0{node.hopIndex}
                    </div>
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-cyan-400">
                      {node.roleLabel}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase ${
                    node.riskLevel === 'CRITICAL'
                      ? 'bg-red-950/80 text-red-400 border border-red-800/80'
                      : node.riskLevel === 'HIGH'
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {node.status}
                  </span>
                </div>

                {/* PRIMARY INFORMATION: NAME + AMOUNT (Prominent Hierarchy) */}
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/90 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-medium">
                    PRIMARY ACCOUNT & FUNDS
                  </div>
                  <div className="font-['Space_Grotesk'] text-base font-bold text-white tracking-tight">
                    {node.accountHolderName}
                  </div>
                  <div className="font-['Space_Grotesk'] text-xl font-extrabold text-cyan-400">
                    ₹{node.amount.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* SECONDARY INFORMATION */}
                <div className="space-y-1.5 text-xs font-mono text-slate-400 pt-1 border-t border-slate-800/70">
                  <div className="flex items-center justify-between">
                    <span>Account Number:</span>
                    <span className="text-slate-200 font-semibold">{node.accountNumber}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Bank Name:</span>
                    <span className="text-slate-200">{node.bankName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Geographic City:</span>
                    <span className="text-amber-400 font-bold">{node.city}, {node.state}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span>Timestamp:</span>
                    <span className="text-slate-300">{node.time}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span>Transaction Type:</span>
                    <span className="text-sky-400 font-bold">{node.transactionType}</span>
                  </div>
                </div>

                {/* Next stage connection indicator */}
                {idx < nodes.length - 1 && (
                  <div className="text-right text-[10px] font-mono text-cyan-500 font-bold flex items-center justify-end gap-1 pt-1">
                    <span>TRANSFERRED TO NODE 0{idx + 1}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
