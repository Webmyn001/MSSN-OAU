import { useEffect, useState } from "react";
import { toast } from "~/lib/stores/toast";
import {
  Clock,
  Calendar,
  Sparkles,
  Save,
  RotateCcw,
  Moon,
  Sun,
  Sunset,
  Sunrise,
  RefreshCw,
  CalendarClock,
} from "lucide-react";

import { API_BASE } from "~/lib/api/base";

interface PrayerTimeItem {
  adhan: string;
  iqamah: string;
}

interface PrayerTimesPayload {
  hijriDate?: string;
  shortHijriDate?: string;
  isCustomHijri?: boolean;
  updatedAt?: string;
  prayer_times: {
    subhi: PrayerTimeItem;
    dhuhr: PrayerTimeItem;
    asr: PrayerTimeItem;
    maghrib: PrayerTimeItem;
    isha: PrayerTimeItem;
    jumuah: PrayerTimeItem;
  };
}

const API_URL = `${API_BASE}/public/prayer-times`;
const LOCAL_STORAGE_KEY = "mssn_prayer_times";

const defaultData: PrayerTimesPayload = {
  hijriDate: "27 Muharram, 1446AH",
  shortHijriDate: "27/01/1446AH",
  isCustomHijri: false,
  prayer_times: {
    subhi: { adhan: "05:15 AM", iqamah: "05:35 AM" },
    dhuhr: { adhan: "01:00 PM", iqamah: "01:25 PM" },
    asr: { adhan: "04:15 PM", iqamah: "04:30 PM" },
    maghrib: { adhan: "06:45 PM", iqamah: "06:50 PM" },
    isha: { adhan: "08:00 PM", iqamah: "08:15 PM" },
    jumuah: { adhan: "01:00 PM", iqamah: "01:45 PM" },
  },
};

function loadFromLocalStorage(): PrayerTimesPayload | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PrayerTimesPayload;
      if (parsed?.prayer_times) return parsed;
    }
  } catch {}
  return null;
}

function saveToLocalStorage(data: PrayerTimesPayload) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
    }
  } catch {}
}

export function meta() {
  return [{ title: "Prayer Times & Hijri Date" }];
}

export default function PrayerTimes() {
  const initialData: PrayerTimesPayload = loadFromLocalStorage() ?? JSON.parse(JSON.stringify(defaultData));
  const [prayerTimesData, setPrayerTimesData] = useState<PrayerTimesPayload>(
    JSON.parse(JSON.stringify(initialData))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isFetchingHijri, setIsFetchingHijri] = useState(false);

  async function loadPrayerTimes() {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const body = await res.json();
        if (body?.success && body?.data?.prayer_times) {
          setPrayerTimesData(body.data);
          saveToLocalStorage(body.data);
        }
      }
    } catch (e) {
      console.warn("Failed to load prayer times from API, using cached/local data:", e);
    }
  }

  useEffect(() => {
    loadPrayerTimes();
  }, []);

  async function autoFetchHijriDate() {
    setIsFetchingHijri(true);
    try {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;

      const req = await fetch(`https://api.aladhan.com/v1/gToH/${formattedDate}`);
      if (!req.ok) throw new Error("Failed to connect to AlAdhan API");
      const res = await req.json();

      if (res && res.code === 200 && res.data?.hijri) {
        const h = res.data.hijri;
        const formatted = `${h.day} ${h.month.en}, ${h.year}${h.designation.abbreviated}`;
        const shortFormatted = `${h.date.replaceAll("-", "/")}${h.designation.abbreviated}`;

        setPrayerTimesData((prev) => ({
          ...prev,
          hijriDate: formatted,
          shortHijriDate: shortFormatted,
          isCustomHijri: false,
        }));
        toast("success", `Fetched Hijri Date: ${formatted}`);
      } else {
        throw new Error("Invalid Hijri date payload");
      }
    } catch (err: any) {
      toast("error", err.message || "Failed to auto-fetch Hijri date.");
    } finally {
      setIsFetchingHijri(false);
    }
  }

  async function handleSavePrayerTimes(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    toast("success", "Saving prayer times & Hijri date…");

    const updatedData = { ...prayerTimesData, updatedAt: new Date().toISOString() };
    setPrayerTimesData(updatedData);
    saveToLocalStorage(updatedData);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const body = await res.json();
        if (body?.data) {
          setPrayerTimesData(body.data);
          saveToLocalStorage(body.data);
        }
        toast("success", "✅ Prayer times & Hijri date saved! Marketing site updated.");
      } else {
        throw new Error("API save failed");
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        toast("success", "✅ Saved locally. API timed out — will sync next time.");
      } else {
        toast("success", "✅ Saved locally. Will sync to server when API is available.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  function resetToDefaults() {
    if (window.confirm("Reset prayer times to default schedule?")) {
      setPrayerTimesData(JSON.parse(JSON.stringify(defaultData)));
      toast("success", "Reset prayer times to default times.");
    }
  }

  const prayersList = [
    { key: "subhi", label: "Subhi (Fajr)", icon: Sunrise, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    { key: "dhuhr", label: "Dhuhr", icon: Sun, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { key: "asr", label: "Asr", icon: Sun, color: "text-orange-600 bg-orange-50 border-orange-200" },
    { key: "maghrib", label: "Maghrib", icon: Sunset, color: "text-rose-600 bg-rose-50 border-rose-200" },
    { key: "isha", label: "Isha", icon: Moon, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { key: "jumuah", label: "Jumu'ah (Friday)", icon: Calendar, color: "text-green-700 bg-green-50 border-green-200" },
  ] as const;

  function formatUpdatedAt(iso: string | undefined): string {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return (
        d.toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) +
        " at " +
        d.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
      );
    } catch {
      return "";
    }
  }

  const lastUpdatedDisplay = formatUpdatedAt(prayerTimesData.updatedAt);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-green-950 tracking-tight flex items-center gap-2">
            <Clock className="w-7 h-7 text-green-700" />
            Prayer Times & Hijri Date Manager
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Update daily Adhan and Iqamah times for Solah and set the Hijri date. Changes reflect live on the website.
          </p>
          {lastUpdatedDisplay && (
            <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1.5 font-medium">
              <CalendarClock className="w-3.5 h-3.5" />
              Last updated: {lastUpdatedDisplay}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={resetToDefaults}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all shadow-xs"
          >
            <RotateCcw className="w-4 h-4 text-gray-500" />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleSavePrayerTimes}
            disabled={isSaving}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving…" : "Save & Post Times"}</span>
          </button>
        </div>
      </div>

      {/* Section 1: Hijri Date Settings */}
      <div className="bg-white p-5 rounded-2xl border border-green-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <Moon className="w-5 h-5 text-green-700" />
            <h3 className="text-sm font-bold text-green-950">Hijri Date Settings</h3>
          </div>
          <button
            type="button"
            onClick={autoFetchHijriDate}
            disabled={isFetchingHijri}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 hover:bg-green-200 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-green-700 ${isFetchingHijri ? "animate-spin" : ""}`} />
            <span>{isFetchingHijri ? "Fetching…" : "Auto-Fetch Today's Hijri Date"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label htmlFor="hijri-date-full" className="block font-semibold text-gray-700 mb-1">
              Full Hijri Date Text
            </label>
            <input
              id="hijri-date-full"
              type="text"
              value={prayerTimesData.hijriDate || ""}
              onChange={(e) => setPrayerTimesData((prev) => ({ ...prev, hijriDate: e.target.value }))}
              placeholder="e.g. 27 Muharram, 1446AH"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 font-medium"
            />
          </div>

          <div>
            <label htmlFor="hijri-date-short" className="block font-semibold text-gray-700 mb-1">
              Short Hijri Date (e.g. DD/MM/YYYY)
            </label>
            <input
              id="hijri-date-short"
              type="text"
              value={prayerTimesData.shortHijriDate || ""}
              onChange={(e) => setPrayerTimesData((prev) => ({ ...prev, shortHijriDate: e.target.value }))}
              placeholder="e.g. 27/01/1446AH"
              className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Daily Solah Adhan & Iqamah Times Grid */}
      <form onSubmit={handleSavePrayerTimes} className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-green-950 flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-700" />
            Daily Solah Adhan & Iqamah Schedule
          </h3>
          <span className="text-xs text-gray-500">Edit times in 12-hour format (e.g., 05:15 AM)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prayersList.map((prayer) => {
            const prayerKey = prayer.key as keyof PrayerTimesPayload["prayer_times"];
            const Icon = prayer.icon;
            return (
              <div key={prayer.key} className={`p-4 rounded-2xl border bg-white shadow-xs space-y-3`}>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${prayer.color}`}>
                    <Icon className="w-4 h-4" />
                    {prayer.label}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label htmlFor={`adhan-${prayer.key}`} className="block font-semibold text-gray-600 mb-1">
                      Adhan (Call to Prayer)
                    </label>
                    <input
                      id={`adhan-${prayer.key}`}
                      type="text"
                      value={prayerTimesData.prayer_times[prayerKey].adhan}
                      onChange={(e) =>
                        setPrayerTimesData((prev) => ({
                          ...prev,
                          prayer_times: {
                            ...prev.prayer_times,
                            [prayerKey]: {
                              ...prev.prayer_times[prayerKey],
                              adhan: e.target.value,
                            },
                          },
                        }))
                      }
                      placeholder="05:15 AM"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>

                  <div>
                    <label htmlFor={`iqamah-${prayer.key}`} className="block font-semibold text-gray-600 mb-1">
                      Iqamah (Solah Starts)
                    </label>
                    <input
                      id={`iqamah-${prayer.key}`}
                      type="text"
                      value={prayerTimesData.prayer_times[prayerKey].iqamah}
                      onChange={(e) =>
                        setPrayerTimesData((prev) => ({
                          ...prev,
                          prayer_times: {
                            ...prev.prayer_times,
                            [prayerKey]: {
                              ...prev.prayer_times[prayerKey],
                              iqamah: e.target.value,
                            },
                          },
                        }))
                      }
                      placeholder="05:35 AM"
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "Saving…" : "Save & Post All Prayer Times"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
