import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  ActivityIndicator,

} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { api } from "../lib/api";
import { alerta } from "../lib/alerta";

const EDADES = Array.from({ length: 30 }, (_, i) => i + 1); // 1..30

export default function RegistroScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({
    nombreCompleto: "",
    direccion: "",
    ciudad: "",
    edad: 18,
    telefono: "",
    genero: "masculino",
    whatsappConsent: true,
    salvo: false,
    reconciliacion: false,
  });
  const [guardando, setGuardando] = useState(false);

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function guardar() {
    if (!form.nombreCompleto.trim()) {
      alerta("Falta el nombre", "Ingresa el nombre completo del joven.");
      return;
    }
    setGuardando(true);
    try {
      await api.crearJoven(form);
      alerta("¡Registrado!", "El joven se guardó correctamente.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      alerta("Error al guardar", err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      {/* Header */}
      <View className="h-16 px-4 flex-row items-center justify-between border-b border-outline-variant/20">
        <Text className="text-xl font-bold text-primary">Nuevo Registro</Text>
        <Pressable onPress={() => router.back()} className="p-2">
          <MaterialIcons name="close" size={24} color="#0058be" />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingVertical: 20, paddingBottom: 140 + insets.bottom }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Banner */}
        <View className="h-32 rounded-3xl bg-primary-container mb-6 justify-end p-4 overflow-hidden">
          <Text className="text-on-primary-container/80 text-xs font-semibold uppercase">
            Únete hoy
          </Text>
          <Text className="text-on-primary-container text-2xl font-bold">
            Comienza tu viaje
          </Text>
        </View>

        <Campo label="Nombre Completo">
          <TextInput
            className="h-12 px-4 rounded-xl border border-outline-variant bg-white text-on-surface"
            placeholder="Ej. Juan Pérez"
            placeholderTextColor="#727785"
            value={form.nombreCompleto}
            onChangeText={(v) => set("nombreCompleto", v)}
          />
        </Campo>

        <Campo label="Dirección">
          <View className="relative justify-center">
            <TextInput
              className="h-12 pl-11 pr-4 rounded-xl border border-outline-variant bg-white text-on-surface"
              placeholder="Calle, Número, Colonia"
              placeholderTextColor="#727785"
              value={form.direccion}
              onChangeText={(v) => set("direccion", v)}
            />
            <View className="absolute left-3">
              <MaterialIcons name="location-on" size={20} color="#727785" />
            </View>
          </View>
        </Campo>

        <Campo label="Ciudad">
          <TextInput
            className="h-12 px-4 rounded-xl border border-outline-variant bg-white text-on-surface"
            placeholder="Ej. Medellín"
            placeholderTextColor="#727785"
            value={form.ciudad}
            onChangeText={(v) => set("ciudad", v)}
          />
        </Campo>

        {/* Edad */}
        <Campo label="Edad">
          <View className="bg-surface-container rounded-2xl p-3">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingHorizontal: 8 }}
            >
              {EDADES.map((e) => {
                const activo = form.edad === e;
                return (
                  <Pressable
                    key={e}
                    onPress={() => set("edad", e)}
                    className={`w-12 h-12 rounded-full items-center justify-center ${
                      activo ? "bg-primary" : "bg-transparent"
                    }`}
                  >
                    <Text
                      className={`font-bold ${
                        activo ? "text-white" : "text-on-surface-variant"
                      }`}
                    >
                      {e === 30 ? "30+" : e}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
          <Text className="text-center text-xs text-outline mt-1 italic">
            Desliza para elegir la edad
          </Text>
        </Campo>

        <Campo label="Número de Teléfono">
          <View className="relative justify-center">
            <TextInput
              className="h-12 pl-11 pr-4 rounded-xl border border-outline-variant bg-white text-on-surface"
              placeholder="55 0000 0000"
              placeholderTextColor="#727785"
              keyboardType="phone-pad"
              value={form.telefono}
              onChangeText={(v) => set("telefono", v)}
            />
            <View className="absolute left-3">
              <MaterialIcons name="call" size={20} color="#727785" />
            </View>
          </View>
        </Campo>

        {/* Género */}
        <Campo label="Género">
          <View className="flex-row gap-4">
            <OpcionGenero
              icon="male"
              label="Masculino"
              activo={form.genero === "masculino"}
              onPress={() => set("genero", "masculino")}
            />
            <OpcionGenero
              icon="female"
              label="Femenino"
              activo={form.genero === "femenino"}
              onPress={() => set("genero", "femenino")}
            />
          </View>
        </Campo>

        {/* Decisión espiritual */}
        <Campo label="Decisión">
          <View className="flex-row gap-4">
            <ToggleDecision
              icon="favorite"
              label="Salvo"
              activo={form.salvo}
              colorActivo="#006c49"
              fondoActivo="rgba(108,248,187,0.25)"
              onPress={() => set("salvo", !form.salvo)}
            />
            <ToggleDecision
              icon="volunteer-activism"
              label="Reconciliación"
              activo={form.reconciliacion}
              colorActivo="#825100"
              fondoActivo="rgba(255,221,184,0.45)"
              onPress={() => set("reconciliacion", !form.reconciliacion)}
            />
          </View>
        </Campo>

        {/* WhatsApp */}
        <View className="p-4 bg-surface-container rounded-2xl flex-row items-center justify-between border border-primary-container/20 mt-2">
          <View className="flex-row items-center gap-3 flex-1">
            <View className="w-10 h-10 rounded-full bg-secondary-container items-center justify-center">
              <MaterialIcons name="chat" size={20} color="#00714d" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-on-surface">
                Unirme al grupo
              </Text>
              <Text className="text-xs text-on-surface-variant">
                Recibe noticias y eventos en WhatsApp
              </Text>
            </View>
          </View>
          <Switch
            value={form.whatsappConsent}
            onValueChange={(v) => set("whatsappConsent", v)}
            trackColor={{ true: "#0058be", false: "#c2c6d6" }}
            thumbColor="#ffffff"
          />
        </View>
      </ScrollView>

      {/* Botón guardar (respeta la barra del sistema) */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t border-outline-variant/20"
        style={{ paddingBottom: 16 + insets.bottom }}
      >
        <Pressable
          onPress={guardar}
          disabled={guardando}
          className="h-14 bg-primary rounded-xl flex-row items-center justify-center gap-2 active:scale-95"
        >
          {guardando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <MaterialIcons name="save" size={22} color="#ffffff" />
              <Text className="text-white text-lg font-bold">
                Guardar Registro
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Campo({ label, children }) {
  return (
    <View className="mb-5">
      <Text className="text-sm font-semibold text-on-surface ml-1 mb-2">
        {label}
      </Text>
      {children}
    </View>
  );
}

function ToggleDecision({ icon, label, activo, colorActivo, fondoActivo, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 h-14 rounded-xl border flex-row items-center justify-center gap-2"
      style={{
        borderColor: activo ? colorActivo : "#c2c6d6",
        backgroundColor: activo ? fondoActivo : "#ffffff",
      }}
    >
      <MaterialIcons name={icon} size={20} color={activo ? colorActivo : "#727785"} />
      <Text
        className="font-semibold"
        style={{ color: activo ? colorActivo : "#0b1c30" }}
      >
        {label}
      </Text>
      {activo && (
        <MaterialIcons name="check-circle" size={16} color={colorActivo} />
      )}
    </Pressable>
  );
}

function OpcionGenero({ icon, label, activo, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 h-14 rounded-xl border flex-row items-center justify-center gap-2 ${
        activo
          ? "border-primary bg-primary-container/10"
          : "border-outline-variant bg-white"
      }`}
    >
      <MaterialIcons
        name={icon}
        size={20}
        color={activo ? "#0058be" : "#727785"}
      />
      <Text className={activo ? "text-primary font-semibold" : "text-on-surface"}>
        {label}
      </Text>
    </Pressable>
  );
}
