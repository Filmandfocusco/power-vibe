import React, { useEffect, useMemo, useState } from "react";

// ==============================================
// Power Vibe — On-set power calculator (React)
// Clean, single-file version
// - Dark / Light theme auto based on system (no manual toggle)
// - Colourful summary cards (Battery / Assumptions / Runtime)
// - Grouped Battery presets with "Most used on set" highlight
// - Grouped Accessories in Full List modal with "Most used on set" highlight
// ==============================================

// ---- Device presets (cameras & accessories)
const PRESETS = {
  cameras: [
    { name: "ARRI Alexa 35", watts: 90 },
    { name: "ARRI Alexa Mini LF", watts: 85 },
    { name: "ARRI Alexa Mini", watts: 80 },
    { name: "Sony Venice 2", watts: 65 },
    { name: "Sony FX9", watts: 55 },
    { name: "Canon C500 MkII", watts: 45 },
    { name: "RED Komodo", watts: 35 },
    { name: "RED V-Raptor", watts: 80 },
    { name: "Blackmagic URSA Mini Pro 12K", watts: 90 },
    { name: "Panasonic Varicam LT", watts: 65 },
  ],
  accessories: [
    // Monitoring
    { name: "SmallHD 703", watts: 18, brand: "SmallHD", common: true },
    { name: "SmallHD Cine 7", watts: 22, brand: "SmallHD", common: true },
    { name: "SmallHD Focus 5\" Monitor", watts: 8, brand: "SmallHD" },
    { name: "SmallHD Focus 7\" Monitor", watts: 12, brand: "SmallHD" },
    { name: "SmallHD Cine 5\" Monitor", watts: 10, brand: "SmallHD" },
    {
      name: "Atomos Ninja V 5\" Recorder/Monitor",
      watts: 10,
      brand: "Atomos",
      common: true,
    },
    { name: "Atomos Shinobi 7\" Monitor", watts: 14, brand: "Atomos" },
    { name: "Atomos Shogun 7", watts: 25, brand: "Atomos" },
    {
      name: "TVLogic F-5A 5.5\" On-Camera Monitor",
      watts: 10,
      brand: "TVLogic",
    },
    {
      name: "TVLogic VFM-058W 5.5\" On-Camera Monitor",
      watts: 9.6,
      brand: "TVLogic",
    },
    { name: "TVLogic VFM-055A 5.5\" OLED Monitor", watts: 10, brand: "TVLogic" },
    {
      name: "TVLogic F-7H mk2 7\" High-Bright Monitor",
      watts: 22,
      brand: "TVLogic",
    },

    // Wireless video (Teradek)
    { name: "Teradek Bolt 6 TX", watts: 20, brand: "Teradek", common: true },
    { name: "Teradek Bolt 6 RX", watts: 25, brand: "Teradek", common: true },
    { name: "Teradek Bolt 4K 750 TX", watts: 15, brand: "Teradek" },
    { name: "Teradek Bolt 4K 750 RX", watts: 18, brand: "Teradek" },
    { name: "Teradek Bolt 4K 1500 TX", watts: 18, brand: "Teradek" },
    { name: "Teradek Bolt 4K 1500 RX", watts: 22, brand: "Teradek" },
    { name: "Teradek Bolt 3000 TX", watts: 20, brand: "Teradek" },
    { name: "Teradek Bolt 3000 RX", watts: 25, brand: "Teradek" },

    // Lens control / motors & ARRI ecosystem
    { name: "Preston MDR-2", watts: 6, brand: "Preston" },
    { name: "Preston MDR-3", watts: 6, brand: "Preston" },
    { name: "Preston MDR-4", watts: 6, brand: "Preston" },
    { name: "Preston DM1X Motor", watts: 6, brand: "Preston" },
    { name: "Preston DM2 Motor", watts: 7, brand: "Preston" },
    { name: "Preston DM4 Motor", watts: 7, brand: "Preston" },
    { name: "Heden M21VE Motor", watts: 6, brand: "Heden" },
    { name: "Heden M26T Motor", watts: 6, brand: "Heden" },
    { name: "Heden M26P Motor", watts: 6, brand: "Heden" },
    { name: "Preston MDR-5", watts: 8, brand: "Preston" },
    { name: "Cmotion CPro Motor", watts: 7, brand: "Cmotion" },
    { name: "Tilta Nucleus-M Motor", watts: 6, brand: "Tilta" },
    { name: "ARRI cforce Mini Motor", watts: 20, brand: "ARRI", common: true },
    { name: "ARRI cforce Plus Motor", watts: 30, brand: "ARRI" },
    { name: "ARRI cforce RF Motor", watts: 10, brand: "ARRI" },
    { name: "ARRI RIA-1 Interface Adapter", watts: 5, brand: "ARRI" },
    { name: "ARRI LCUBE CUB-1 Interface", watts: 5, brand: "ARRI" },

    // Focus tools
    {
      name: "Focusbug Cine RT Rangefinder",
      watts: 10,
      brand: "Focusbug",
      common: true,
    },
    {
      name: "Preston Light Ranger 2", watts: 3, brand: "Preston" },
    {
      name: "Cinema Electronics CineTape", watts: 3.5, brand: "Cinema Electronics" },

    // On-board lights
    { name: "Aputure AL-M9 Mini Light", watts: 9, brand: "Aputure" },
    { name: "Lume Cube Panel Pro", watts: 16, brand: "Lume Cube" },

    // Stabilisation
    { name: "DJI Ronin 2", watts: 60, brand: "DJI", common: true },
    { name: "DJI Ronin 2 (Gimbal Only)", watts: 40, brand: "DJI" },
    { name: "Freefly Movi Pro (System)", watts: 50, brand: "Freefly" },
  ],
};

// ---- Battery presets (common packs)
const BATTERY_PRESETS = [
  // ⭐ Common On-Set
  {
    label: "⭐ Anton Bauer Dionic XT 90 – 98Wh (14.4V)",
    wh: 98,
    volts: 14.4,
    brand: "Anton Bauer",
    common: true,
  },
  {
    label: "⭐ Anton Bauer Dionic 26V – 98Wh (26V)",
    wh: 98,
    volts: 26,
    brand: "Anton Bauer",
    common: true,
  },

  // Anton Bauer
  {
    label: "Anton Bauer Titon Micro 45 – 47Wh (14.4V)",
    wh: 47,
    volts: 14.4,
    brand: "Anton Bauer",
  },
  {
    label: "Anton Bauer Titon Micro 90 – 94Wh (14.4V)",
    wh: 94,
    volts: 14.4,
    brand: "Anton Bauer",
  },
  {
    label: "Anton Bauer Titon Micro 150 – 140Wh (14.4V)",
    wh: 140,
    volts: 14.4,
    brand: "Anton Bauer",
  },
  {
    label: "Anton Bauer Dionic XT 150 – 156Wh (14.4V)",
    wh: 156,
    volts: 14.4,
    brand: "Anton Bauer",
  },
  {
    label: "Anton Bauer Dionic 26V – 240Wh (26V)",
    wh: 240,
    volts: 26,
    brand: "Anton Bauer",
  },

  // Hawk-Woods
  {
    label: "Hawk-Woods Mini V-Lok – 98Wh (14.4V)",
    wh: 98,
    volts: 14.4,
    brand: "Hawk-Woods",
  },
  {
    label: "Hawk-Woods Mini V-Lok – 150Wh (14.4V)",
    wh: 150,
    volts: 14.4,
    brand: "Hawk-Woods",
  },
  {
    label: "Hawk-Woods Reel Power 26V – 150Wh (26V)",
    wh: 150,
    volts: 26,
    brand: "Hawk-Woods",
  },

  // Core
  {
    label: "Core SWX Helix 9 Mini – 98Wh (dual 14/28V)",
    wh: 98,
    volts: 14.4,
    brand: "Core SWX",
  },

  // Bebob
  {
    label: "Bebob V150micro – 147Wh (14.4V)",
    wh: 147,
    volts: 14.4,
    brand: "Bebob",
  },

  // IDX (extended)
  {
    label: "IDX Imicro-50 – 47Wh (14.4V)",
    wh: 47,
    volts: 14.4,
    brand: "IDX",
  },
  {
    label: "IDX Imicro-98 – 97Wh (14.4V)",
    wh: 97,
    volts: 14.4,
    brand: "IDX",
  },
  {
    label: "IDX Imicro-150 – 145Wh (14.4V)",
    wh: 145,
    volts: 14.4,
    brand: "IDX",
  },
  {
    label: "IDX DUO-C95 – 93Wh (14.4V)",
    wh: 93,
    volts: 14.4,
    brand: "IDX",
  },
  {
    label: "IDX DUO-C98 – 96Wh (14.4V)",
    wh: 96,
    volts: 14.4,
    brand: "IDX",
  },
  {
    label: "IDX DUO-C150 – 145Wh (14.4V)",
    wh: 145,
    volts: 14.4,
    brand: "IDX",
  },
  {
    label: "IDX DUO-C198 – 191Wh (14.4V)",
    wh: 191,
    volts: 14.4,
    brand: "IDX",
  },
  {
    label: "IDX Endura CUE-D95 – 91Wh (14.4V)",
    wh: 91,
    volts: 14.4,
    brand: "IDX",
  },
  {
    label: "IDX Endura CUE-D150 – 146Wh (14.4V)",
    wh: 146,
    volts: 14.4,
    brand: "IDX",
  },
  {
    label: "IDX Endura ELITE – 142Wh (14.4V)",
    wh: 142,
    volts: 14.4,
    brand: "IDX",
  },
  {
    label: "IDX VL-150X – 143Wh (26V)",
    wh: 143,
    volts: 26,
    brand: "IDX",
  },
  {
    label: "IDX VL-200X – 193Wh (26V)",
    wh: 193,
    volts: 26,
    brand: "IDX",
  },
];

// ---- Helpers
function uid() {
  return Math.random().toString(36).slice(2, 9);
}
function parseNum(v) {
  if (v === undefined || v === null || v === "") return undefined;
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) ? n : undefined;
}
function devicePowerW(d) {
  const W = parseNum(d.watts);
  if (W !== undefined && W > 0) return W;
  const V = parseNum(d.volts);
  const A = parseNum(d.amps);
  if (V !== undefined && A !== undefined) return V * A;
  return undefined;
}
function whFromVAh(volts, ampHours) {
  if (volts === undefined || ampHours === undefined) return undefined;
  return volts * ampHours;
}
function runtimeHours(wh, totalWatts, derate = 0.1) {
  const usableWh = wh * (1 - derate);
  return usableWh / totalWatts;
}
function connectorNote(currentA) {
  if (currentA > 12)
    return "❗ Over 12A: use RS/Fischer or block distro; check plate rating.";
  if (currentA > 10)
    return "⚠️ 10–12A: near plate limit; verify rating & cable gauge.";
  if (currentA > 6) return "OK: use quality 2-pin LEMO / D-Tap; mind cable length.";
  return "OK: typical D-Tap/2-pin range.";
}
function toneClasses(tone = "neutral") {
  switch (tone) {
    case "ok":
      return "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 dark:from-emerald-900/30 dark:to-teal-900/20 dark:border-emerald-800";
    case "warn":
      return "bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 dark:from-amber-900/30 dark:to-yellow-900/20 dark:border-amber-800";
    case "danger":
      return "bg-gradient-to-br from-red-50 to-rose-50 border-red-200 dark:from-red-900/30 dark:to-rose-900/20 dark:border-red-800";
    default:
      return "bg-white border-neutral-200 dark:bg-neutral-900/60 dark:border-neutral-800";
  }
}

// ---- Visuals
function LogoMark() {
  return (
    <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-yellow-300 to-amber-500 grid place-items-center shadow">
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6 text-black"
        fill="currentColor"
        aria-hidden
      >
        <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
      </svg>
    </div>
  );
}
function Badge({ tone = "neutral", children }) {
  const tones = {
    neutral:
      "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
    ok: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
    warn: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
    danger: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
        tones[tone] || tones.neutral
      }`}
    >
      {children}
    </span>
  );
}
function AmpGauge({ value = 0, max = 12 }) {
  const clamped = Math.max(0, Math.min(value, max));
  const pct = max === 0 ? 0 : clamped / max;
  const C = 60;
  const stroke = C * pct;
  const rest = C - stroke;
  const color =
    value > 12 ? "stroke-red-600" : value > 10 ? "stroke-amber-500" : "stroke-emerald-600";
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 24 24" className="h-16 w-16">
        <circle
          cx="12"
          cy="12"
          r="9.55"
          className="fill-none stroke-neutral-200 dark:stroke-neutral-700"
          strokeWidth="4"
          strokeDasharray={`${C}`}
        />
        <circle
          cx="12"
          cy="12"
          r="9.55"
          className={`fill-none ${color}`}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${stroke} ${rest}`}
          transform="rotate(-90 12 12)"
        />
        <text
          x="12"
          y="13.5"
          textAnchor="middle"
          className="fill-neutral-900 dark:fill-neutral-200 text-[10px] font-semibold"
        >
          A
        </text>
      </svg>
      <div>
        <div className="text-2xl font-semibold leading-6">{value.toFixed(2)}A</div>
        <div className="text-xs text-neutral-600 dark:text-neutral-400">
          of {max}A typical plate limit
        </div>
      </div>
    </div>
  );
}
function BatteryBar({ hours = 0 }) {
  const maxRef = 4;
  const pct = Math.max(0, Math.min(hours / maxRef, 1));
  const hh = Math.floor(hours);
  const mm = Math.round((hours % 1) * 60);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-semibold">
          {hours > 0 ? `${hh}h ${mm}m` : "—"}
        </div>
        <div className="text-xs text-neutral-600 dark:text-neutral-400">
          visualised on a 4h scale
        </div>
      </div>
      <div className="mt-2 h-3 w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500"
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  );
}

// =============================
// Main App — Power Vibe
// =============================
export default function PowerVibe() {
  // Theme (auto from system, no manual toggle button)
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    try {
      const hasWindow = typeof window !== "undefined";
      const hasDoc = typeof document !== "undefined";
      const mql =
        hasWindow && window.matchMedia
          ? window.matchMedia("(prefers-color-scheme: dark)")
          : null;
      const preferred = !!(mql && mql.matches);
      setIsDark(preferred);
      if (hasDoc) document.documentElement.classList.toggle("dark", preferred);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      if (typeof document !== "undefined") {
        document.documentElement.classList.toggle("dark", isDark);
      }
    } catch {}
  }, [isDark]);

  // Devices state
  const [devices, setDevices] = useState([]);

  // Battery state
  const [batteryWh, setBatteryWh] = useState("98");
  const [batteryV, setBatteryV] = useState("14.4");
  const [batteryAh, setBatteryAh] = useState("");
  const [batteryPreset, setBatteryPreset] = useState("");
  const [deratePct, setDeratePct] = useState("10");

  // iOS-friendly picker state
  const isIOS =
    typeof navigator !== "undefined" && /iP(ad|hone|od)/.test(navigator.userAgent);
  const [showCamList, setShowCamList] = useState(false);
  const [showAccList, setShowAccList] = useState(false);
  const [showBattList, setShowBattList] = useState(false);

  // Computations
  const totalWatts = useMemo(
    () => devices.reduce((sum, d) => sum + (devicePowerW(d) ?? 0), 0),
    [devices]
  );
  const systemV = useMemo(() => parseNum(batteryV) ?? 14.4, [batteryV]);
  const totalCurrentA = useMemo(
    () => (totalWatts > 0 ? totalWatts / (systemV || 14.4) : 0),
    [totalWatts, systemV]
  );
  const computedWh = useMemo(() => {
    const whDirect = parseNum(batteryWh);
    const v = parseNum(batteryV);
    const ah = parseNum(batteryAh);
    if (whDirect !== undefined && whDirect > 0) return whDirect;
    return whFromVAh(v, ah) ?? 0;
  }, [batteryWh, batteryV, batteryAh]);
  const hours = useMemo(() => {
    if (totalWatts <= 0 || computedWh <= 0) return 0;
    const derate = Math.min(Math.max(parseNum(deratePct) ?? 10, 0), 50) / 100;
    return runtimeHours(computedWh, totalWatts, derate);
  }, [computedWh, totalWatts, deratePct]);
  const warning = useMemo(() => {
    if (totalCurrentA > 12)
      return "❗ Exceeds 12A — likely unsafe on most plates. Split loads or use 26V/Block.";
    if (totalCurrentA > 10)
      return "⚠️ Approaching/over 10A — verify plate & cable ratings.";
    return "";
  }, [totalCurrentA]);
  const loadTone = totalCurrentA > 12 ? "danger" : totalCurrentA > 10 ? "warn" : "ok";

  // Actions
  function addDevice(name, watts) {
    setDevices((prev) => [...prev, { id: uid(), name, watts }]);
  }

  // Shared input/select classes
  const inputClass =
    "px-3 py-2 rounded-xl border bg-white dark:bg-neutral-900 dark:border-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 transition";
  const selectWrap = "relative w-full";
  const selectClass =
    "appearance-none w-full px-3 py-2 rounded-xl border bg-white dark:bg-neutral-900 dark:border-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/60 pr-9";

  // Explicit select sizes (undefined is omitted by React)
  const cameraSelectSize = isIOS ? undefined : 5;
  const accessorySelectSize = isIOS ? undefined : 5;
  const batterySelectSize = isIOS ? undefined : 5;

  // Group batteries by brand for the Full List modal
  const batteryGroups = useMemo(() => {
    const acc = {};
    for (const p of BATTERY_PRESETS) {
      const key = p.brand || "Other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
    }
    return acc;
  }, []);

  // Group accessories by brand for the Accessories Full List modal
  const accessoryGroups = useMemo(() => {
    const acc = {};
    for (const a of PRESETS.accessories) {
      const key = a.brand || "Other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(a);
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen w-full bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 -mx-4 sm:mx-0 px-4 sm:px-0 py-3 mb-4 sm:mb-6 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogoMark />
              <div>
                <h1 className="text-2xl font-semibold leading-6">Power Vibe</h1>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 -mt-0.5">
                  On-set power calculator for camera departments
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Preset pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Camera dropdown */}
          <div>
            <label className="block text-sm mb-1 font-medium">Add Camera Body</label>
            <div className="flex gap-2 items-center">
              <div className={selectWrap}>
                <select
                  className={selectClass}
                  aria-label="Add Camera Body"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      const preset = PRESETS.cameras.find((c) => c.name === val);
                      if (preset) addDevice(preset.name, preset.watts);
                      e.currentTarget.selectedIndex = 0;
                    }
                  }}
                  size={cameraSelectSize}
                >
                  <option value="">Select camera…</option>
                  {PRESETS.cameras.map((c) => (
                    <option key={c.name} value={c.name}>{`${c.name} (${c.watts}W)`}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="px-3 py-2 border rounded-xl text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setShowCamList(true)}
              >
                Full list
              </button>
            </div>
          </div>

          {/* Accessories dropdown */}
          <div>
            <label className="block text-sm mb-1 font-medium">Add Accessory</label>
            <div className="flex gap-2 items-center">
              <div className={selectWrap}>
                <select
                  className={selectClass}
                  aria-label="Add Accessory"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      const preset = PRESETS.accessories.find((a) => a.name === val);
                      if (preset) addDevice(preset.name, preset.watts);
                      e.currentTarget.selectedIndex = 0;
                    }
                  }}
                  size={accessorySelectSize}
                >
                  <option value="">Select accessory…</option>
                  {PRESETS.accessories.map((a) => (
                    <option key={a.name} value={a.name}>{`${a.name} (${a.watts}W)`}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="px-3 py-2 border rounded-xl text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setShowAccList(true)}
              >
                Full list
              </button>
            </div>
          </div>
        </div>

        {/* Devices table */}
        <div className="rounded-2xl shadow-sm border overflow-hidden bg-white dark:bg-neutral-900 dark:border-neutral-800">
          <div className="grid grid-cols-12 gap-0 px-4 py-3 text-sm font-medium bg-neutral-100 dark:bg-neutral-800/60">
            <div className="col-span-6">Device</div>
            <div className="col-span-3 text-right">Watts</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>
          {devices.map((d) => {
            const W = devicePowerW(d);
            return (
              <div
                key={d.id}
                className="grid grid-cols-12 items-center gap-3 px-4 py-3 border-t dark:border-neutral-800"
              >
                <input
                  value={d.name}
                  onChange={(e) =>
                    setDevices(
                      devices.map((x) =>
                        x.id === d.id ? { ...x, name: e.target.value } : x
                      )
                    )
                  }
                  className={`col-span-6 ${inputClass}`}
                  placeholder="Accessory name"
                />
                <div className="col-span-3">
                  <div className="flex items-center rounded-xl border dark:border-neutral-700 px-2 py-1.5 bg-white dark:bg-neutral-900 overflow-hidden focus-within:ring-2 focus-within:ring-sky-400/60 transition">
                    <input
                      value={d.watts ?? ""}
                      onChange={(e) =>
                        setDevices(
                          devices.map((x) =>
                            x.id === d.id ? { ...x, watts: e.target.value } : x
                          )
                        )
                      }
                      className="w-full flex-1 text-right text-sm font-semibold text-neutral-800 dark:text-neutral-100 tabular-nums tracking-tight outline-none bg-transparent border-0 p-0"
                      placeholder="0.0"
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                    />
                  </div>
                </div>
                <div className="col-span-3 flex items-center justify-end gap-2">
                  <div className="hidden md:block min-w-[84px] text-right text-xs tabular-nums text-neutral-500 dark:text-neutral-400">
                    {W ? `${W.toFixed(1)} W` : "—"}
                  </div>
                  <button
                    className="px-3 py-2 rounded-xl border dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    onClick={() =>
                      setDevices(devices.filter((x) => x.id !== d.id))
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
          <div className="px-4 py-3 border-t dark:border-neutral-800">
            <button
              className="px-3 py-2 rounded-xl bg-black text-white hover:opacity-90 dark:bg-white dark:text-black"
              onClick={() =>
                setDevices((prev) => [
                  ...prev,
                  { id: uid(), name: "Custom Device", watts: "" },
                ])
              }
            >
              ＋ Add device
            </button>
          </div>
        </div>

        {/* Battery & Assumptions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`rounded-2xl shadow-sm border p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 ${isDark ? "text-neutral-900" : ""}`}>
            <h2 className="font-semibold mb-3">Battery</h2>
            <div className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-12">
                <label className="block text-sm mb-1">Choose preset</label>
                <div className="flex items-center gap-2">
                  <div className={selectWrap}>
                    <select
                      className={selectClass}
                      value={batteryPreset}
                      onChange={(e) => {
                        const v = e.target.value;
                        setBatteryPreset(v);
                        const preset = BATTERY_PRESETS.find(
                          (p) => p.label === v
                        );
                        if (preset) {
                          setBatteryWh(String(preset.wh));
                          setBatteryV(String(preset.volts));
                          setBatteryAh("");
                        }
                      }}
                      size={batterySelectSize}
                    >
                      <option value="">Custom / enter manually…</option>
                      {BATTERY_PRESETS.map((p) => (
                        <option key={p.label} value={p.label}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-2 border rounded-xl text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => setShowBattList(true)}
                  >
                    Full list
                  </button>
                </div>
              </div>
              <div className="col-span-6">
                <label className="block text-sm mb-1">Capacity (Wh)</label>
                <input
                  value={batteryWh}
                  onChange={(e) => {
                    setBatteryWh(e.target.value);
                    if (batteryPreset) setBatteryPreset("");
                  }}
                  className={inputClass + " w-full"}
                  placeholder="e.g. 98"
                  type="number"
                  min={0}
                  step={1}
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm mb-1">Volts (V)</label>
                <input
                  value={batteryV}
                  onChange={(e) => {
                    setBatteryV(e.target.value);
                    if (batteryPreset) setBatteryPreset("");
                  }}
                  className={inputClass + " w-full"}
                  placeholder="14.4 or 26"
                  type="number"
                  min={0}
                  step={0.1}
                />
              </div>
              <div className="col-span-3">
                <label className="block text-sm mb-1">Capacity (Ah)</label>
                <input
                  value={batteryAh}
                  onChange={(e) => {
                    setBatteryAh(e.target.value);
                    if (batteryPreset) setBatteryPreset("");
                  }}
                  className={inputClass + " w-full"}
                  placeholder="optional"
                  type="number"
                  min={0}
                  step={0.1}
                />
              </div>
              <p className="col-span-12 text-xs text-neutral-500 dark:text-neutral-400">
                Select a preset to auto-fill values, or choose <em>Custom</em> and enter Wh
                or V+Ah manually.
              </p>
            </div>
          </div>

          <div className={`rounded-2xl shadow-sm border p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200 ${isDark ? "text-neutral-900" : ""}`}>
            <h2 className="font-semibold mb-3">Assumptions</h2>
            <label className="block text-sm mb-1">Capacity Derate (%)</label>
            <input
              value={deratePct}
              onChange={(e) => setDeratePct(e.target.value)}
              className={inputClass + " w-full mb-2"}
              type="number"
              min={0}
              max={50}
              step={1}
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Accounts for cold weather, aging, sag & reserve. Typical: 10–50%.
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`rounded-2xl shadow-sm border p-4 ${toneClasses(loadTone)}`}>
            <h3 className="font-semibold mb-2">Total Load</h3>
            <AmpGauge value={totalCurrentA} max={12} />
            <div className="mt-3 text-sm text-neutral-700 dark:text-neutral-300 flex items-center gap-2 flex-wrap">
              <Badge tone="neutral">{totalWatts.toFixed(1)} W total</Badge>
              <span>
                ≈ {totalCurrentA.toFixed(2)} A @ {(systemV ?? 14.4).toFixed(1)} V
              </span>
            </div>
            {warning && (
              <div className="mt-3 text-sm text-red-600 dark:text-red-400">
                {warning}
              </div>
            )}
          </div>

          <div className={`rounded-2xl shadow-sm border p-4 bg-gradient-to-br from-sky-50 to-indigo-50 border-sky-200 ${isDark ? "text-neutral-900" : ""}`}>
            <h3 className="font-semibold mb-2">Estimated Runtime</h3>
            <BatteryBar hours={hours} />
            <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              Based on {(computedWh || 0).toFixed(0)} Wh and {totalWatts.toFixed(1)} W
            </div>
          </div>

          <div className="rounded-2xl shadow-sm border p-4 bg-gradient-to-br from-neutral-50 to-zinc-50 border-neutral-200 dark:from-neutral-900/30 dark:to-zinc-900/20 dark:border-neutral-800">
            <h3 className="font-semibold mb-2">Connector Guidance</h3>
            <div className="text-sm">{connectorNote(totalCurrentA)}</div>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Always verify plate/cable ratings for your specific hardware.
            </p>
          </div>
        </div>

        <p className="mt-6 text-xs text-neutral-500 dark:text-neutral-400">
          Formulas: P = V × I; Total P = ΣPᵢ; Runtime (h) = UsableWh ÷ TotalW; UsableWh = Wh ×
          (1 − derate).
        </p>

        {/* iOS-friendly full list modal for Cameras */}
        {showCamList && (
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setShowCamList(false)}
          >
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md max-h-[70vh] overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 p-4"
              style={{ WebkitOverflowScrolling: "touch" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Choose Camera Body</h3>
                <button
                  className="px-3 py-1 border rounded-xl text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  onClick={() => setShowCamList(false)}
                >
                  Close
                </button>
              </div>
              <div className="space-y-2">
                {PRESETS.cameras.map((c) => (
                  <button
                    key={c.name}
                    className="w-full text-left px-3 py-2 rounded-xl border dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    onClick={() => {
                      addDevice(c.name, c.watts);
                      setShowCamList(false);
                    }}
                  >
                    {c.name}{" "}
                    <span className="text-neutral-500 dark:text-neutral-400">
                      ({c.watts}W)
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* iOS-friendly full list modal for Accessories */}
        {showAccList && (
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setShowAccList(false)}
          >
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md max-h-[70vh] overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 p-4"
              style={{ WebkitOverflowScrolling: "touch" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Choose Accessory</h3>
                <button
                  className="px-3 py-1 border rounded-xl text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  onClick={() => setShowAccList(false)}
                >
                  Close
                </button>
              </div>
              <div className="space-y-3">
                {Object.entries(accessoryGroups).map(([brand, items]) => (
                  <div key={brand} className="space-y-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 px-1">
                      {brand}
                    </div>
                    {items.map((a) => (
                      <button
                        key={a.name}
                        className={`w-full text-left px-3 py-2 rounded-xl border dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm ${
                          a.common
                            ? "border-amber-400/80 bg-amber-50/40 dark:bg-amber-900/30"
                            : ""
                        }`}
                        onClick={() => {
                          addDevice(a.name, a.watts);
                          setShowAccList(false);
                        }}
                      >
                        <div className="flex flex-col items-start">
                          <span>
                            {a.name}{" "}
                            <span className="text-neutral-500 dark:text-neutral-400">
                              ({a.watts}W)
                            </span>
                          </span>
                          {a.common && (
                            <span className="mt-0.5 text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-300">
                              Most used on set
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* iOS-friendly full list modal for Batteries */}
        {showBattList && (
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={() => setShowBattList(false)}
          >
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md max-h-[70vh] overflow-y-auto rounded-2xl bg-white dark:bg-neutral-900 p-4"
              style={{ WebkitOverflowScrolling: "touch" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Choose Battery Preset</h3>
                <button
                  className="px-3 py-1 border rounded-xl text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  onClick={() => setShowBattList(false)}
                >
                  Close
                </button>
              </div>
              <div className="space-y-3">
                {Object.entries(batteryGroups).map(([brand, items]) => (
                  <div key={brand} className="space-y-1">
                    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 px-1">
                      {brand}
                    </div>
                    {items.map((p) => (
                      <button
                        key={p.label}
                        className={`w-full text-left px-3 py-2 rounded-xl border dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm ${
                          p.common
                            ? "border-amber-400/80 bg-amber-50/40 dark:bg-amber-900/30"
                            : ""
                        }`}
                        onClick={() => {
                          setBatteryPreset(p.label);
                          setBatteryWh(String(p.wh));
                          setBatteryV(String(p.volts));
                          setBatteryAh("");
                          setShowBattList(false);
                        }}
                      >
                        <div className="flex flex-col items-start">
                          <span>{p.label}</span>
                          {p.common && (
                            <span className="mt-0.5 text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-300">
                              Most used on set
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==============================================
// Lightweight runtime tests (console-only)
// ==============================================
if (typeof window !== "undefined") {
  try {
    console.assert(
      devicePowerW({ watts: 10 }) === 10,
      "devicePowerW watts failed"
    );
    console.assert(
      devicePowerW({ volts: 10, amps: 2 }) === 20,
      "devicePowerW V*A failed"
    );
    const wh = whFromVAh(14.4, 6.8);
    console.assert(
      Math.abs(wh - 97.92) < 0.01,
      "whFromVAh failed"
    );
    const rt = runtimeHours(100, 50, 0.1);
    console.assert(
      Math.abs(rt - 1.8) < 0.001,
      "runtimeHours failed"
    );
    console.debug("Power Vibe self-tests passed ✅");
  } catch (e) {
    console.warn("Power Vibe self-tests found an issue:", e);
  }
}
