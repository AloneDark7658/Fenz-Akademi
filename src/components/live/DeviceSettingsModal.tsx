"use client";

import { useState, useEffect } from "react";
import { X, Mic, Video, Volume2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Device {
  deviceId: string;
  kind: string;
  label: string;
}

interface DeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  getAvailableDevices: () => Promise<{ camera: Device[]; mic: Device[]; speaker: Device[] }>;
  setDevice: (kind: "camera" | "mic" | "speaker", deviceId: string) => Promise<void>;
}

export function DeviceSettingsModal({
  isOpen,
  onClose,
  getAvailableDevices,
  setDevice,
}: DeviceSettingsModalProps) {
  const [devices, setDevices] = useState<{ camera: Device[]; mic: Device[]; speaker: Device[] }>({
    camera: [],
    mic: [],
    speaker: [],
  });
  const [selectedDevices, setSelectedDevices] = useState({
    camera: "",
    mic: "",
    speaker: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getAvailableDevices().then((devs) => {
        setDevices(devs);
        // Varsayılan olarak ilk cihazları seçili göster (gerçekte tarayıcının varsayılanıdır)
        setSelectedDevices({
          camera: devs.camera[0]?.deviceId || "",
          mic: devs.mic[0]?.deviceId || "",
          speaker: devs.speaker[0]?.deviceId || "",
        });
        setIsLoading(false);
      });
    }
  }, [isOpen, getAvailableDevices]);

  const handleDeviceChange = async (kind: "camera" | "mic" | "speaker", deviceId: string) => {
    setSelectedDevices((prev) => ({ ...prev, [kind]: deviceId }));
    await setDevice(kind, deviceId);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="text-lg font-bold text-white">Cihaz Ayarları</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin mb-4" />
                <p className="text-sm text-slate-400">Cihazlar taranıyor...</p>
              </div>
            ) : (
              <>
                {/* Kamera */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                    <Video className="w-4 h-4 text-cyan-400" />
                    Kamera
                  </label>
                  <select
                    value={selectedDevices.camera}
                    onChange={(e) => handleDeviceChange("camera", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 appearance-none"
                  >
                    {devices.camera.length === 0 && <option value="">Kamera bulunamadı</option>}
                    {devices.camera.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Kamera ${d.deviceId.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mikrofon */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                    <Mic className="w-4 h-4 text-cyan-400" />
                    Mikrofon
                  </label>
                  <select
                    value={selectedDevices.mic}
                    onChange={(e) => handleDeviceChange("mic", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 appearance-none"
                  >
                    {devices.mic.length === 0 && <option value="">Mikrofon bulunamadı</option>}
                    {devices.mic.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Mikrofon ${d.deviceId.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Hoparlör */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-300">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    Hoparlör
                  </label>
                  <select
                    value={selectedDevices.speaker}
                    onChange={(e) => handleDeviceChange("speaker", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 appearance-none"
                  >
                    {devices.speaker.length === 0 && <option value="">Hoparlör bulunamadı (veya tarayıcı desteklemiyor)</option>}
                    {devices.speaker.map((d) => (
                      <option key={d.deviceId} value={d.deviceId}>
                        {d.label || `Hoparlör ${d.deviceId.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Not: Hoparlör seçimi Safari ve Firefox'ta desteklenmeyebilir.
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
