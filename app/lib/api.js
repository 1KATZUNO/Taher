import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Resuelve la URL base de la API.
 *
 * - En Expo Go / dispositivo físico: usamos la IP de la máquina de desarrollo
 *   (la misma desde la que sirve Metro), tomada de hostUri.
 * - En emulador Android: 10.0.2.2 apunta al localhost de la PC.
 * - Web / fallback: localhost.
 *
 * Puedes forzar la URL definiendo EXPO_PUBLIC_API_URL.
 */
const PORT = 4000;

function resolveBaseUrl() {
  // 1) Override manual por variable de entorno
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }

  // 2) IP de la máquina que sirve Metro (Expo Go en dispositivo físico)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:${PORT}`;
  }

  // 3) Emulador Android
  if (Platform.OS === "android") {
    return `http://10.0.2.2:${PORT}`;
  }

  // 4) Fallback
  return `http://localhost:${PORT}`;
}

export const API_URL = resolveBaseUrl();

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || `Error ${res.status}`;
    const error = new Error(msg);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  validarPin: (pin) =>
    request("/api/auth/pin", {
      method: "POST",
      body: JSON.stringify({ pin }),
    }),

  listarJovenes: (search = "") =>
    request(`/api/jovenes${search ? `?search=${encodeURIComponent(search)}` : ""}`),

  obtenerJoven: (id) => request(`/api/jovenes/${id}`),

  crearJoven: (joven) =>
    request("/api/jovenes", {
      method: "POST",
      body: JSON.stringify(joven),
    }),

  eliminarJoven: (id) =>
    request(`/api/jovenes/${id}`, { method: "DELETE" }),

  estadisticas: () => request("/api/stats"),
};
