import { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_URL } from "../lib/api";

const PIN_LENGTH = 4;
// PIN universal quemado en la app: la validación es local e instantánea.
// (Seguridad superficial a propósito; el dato sensible vive en la API.)
const PIN_CORRECTO = "2207";

export default function PinScreen() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [estado, setEstado] = useState("idle"); // idle | error

  // Despierta la API de Render (plan free se duerme) mientras el usuario
  // teclea el PIN, para que al entrar los datos carguen rápido.
  useEffect(() => {
    fetch(`${API_URL}/api/health`).catch(() => {});
  }, []);

  function validar(valor) {
    if (valor === PIN_CORRECTO) {
      router.replace("/(tabs)/inicio");
      setTimeout(() => setPin(""), 500);
      return;
    }
    setEstado("error");
    setTimeout(() => {
      setPin("");
      setEstado("idle");
    }, 700);
  }

  function presionar(num) {
    if (pin.length >= PIN_LENGTH) return;
    const nuevo = pin + num;
    setPin(nuevo);
    if (nuevo.length === PIN_LENGTH) validar(nuevo);
  }

  function borrar() {
    setPin((p) => p.slice(0, -1));
  }

  const teclas = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-between px-6 py-8">
        {/* Header */}
        <View className="items-center mt-8">
          <View className="w-16 h-16 rounded-2xl bg-primary items-center justify-center mb-6 shadow-lg">
            <MaterialIcons name="security" size={36} color="#ffffff" />
          </View>
          <Text className="text-2xl font-bold text-primary">Registro Juvenil</Text>
          <Text className="text-on-surface-variant mt-2 text-base">
            Ingresa tu código PIN para continuar
          </Text>
        </View>

        {/* PIN dots */}
        <View className="flex-row gap-6 my-8">
          {Array.from({ length: PIN_LENGTH }).map((_, i) => {
            const lleno = i < pin.length;
            const colorBorde =
              estado === "error"
                ? "border-error"
                : lleno
                ? "border-primary"
                : "border-outline-variant";
            const colorFondo =
              estado === "error"
                ? "bg-error"
                : lleno
                ? "bg-primary"
                : "bg-transparent";
            return (
              <View
                key={i}
                className={`w-4 h-4 rounded-full border-2 ${colorBorde} ${colorFondo}`}
              />
            );
          })}
        </View>

        {/* Keypad */}
        <View className="w-full max-w-[320px]">
          <View className="flex-row flex-wrap justify-between">
            {teclas.map((t) => (
              <Tecla key={t} label={t} onPress={() => presionar(t)} />
            ))}
            {/* Fila 4: huella / 0 / borrar */}
            <View className="w-[30%] h-20 items-center justify-center">
              <MaterialIcons name="fingerprint" size={32} color="#0058be" />
            </View>
            <Tecla label="0" onPress={() => presionar("0")} />
            <Pressable
              onPress={borrar}
              className="w-[30%] h-20 items-center justify-center active:opacity-60"
            >
              <MaterialIcons name="backspace" size={30} color="#ba1a1a" />
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View className="items-center w-full">
          <Text className="text-primary font-semibold text-sm">
            ¿Olvidaste tu PIN?
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Tecla({ label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="w-[30%] h-20 bg-surface-container-low rounded-2xl items-center justify-center mb-4 active:bg-surface-container-highest active:scale-95"
      style={{
        shadowColor: "#0058be",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 1,
      }}
    >
      <Text className="text-2xl font-semibold text-on-surface">{label}</Text>
    </Pressable>
  );
}
