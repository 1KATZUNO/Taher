import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,

  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { api } from "../../lib/api";
import { alerta } from "../../lib/alerta";

export default function DetalleJoven() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [joven, setJoven] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    api.obtenerJoven(id).then(setJoven).catch(() => {});
  }, [id]);

  async function marcar(campo) {
    if (!joven || guardando) return;
    const nuevoValor = !joven[campo];
    setGuardando(true);
    try {
      const actualizado = await api.actualizarJoven(id, { [campo]: nuevoValor });
      setJoven(actualizado);
    } catch (e) {
      alerta("Error", e.message);
    } finally {
      setGuardando(false);
    }
  }

  function eliminar() {
    alerta("Eliminar registro", "¿Seguro que deseas eliminarlo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await api.eliminarJoven(id);
            router.back();
          } catch (e) {
            alerta("Error", e.message);
          }
        },
      },
    ]);
  }

  if (!joven) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ActivityIndicator color="#0058be" className="mt-10" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="h-16 px-4 flex-row items-center justify-between border-b border-outline-variant/20">
        <Pressable onPress={() => router.back()} className="p-2">
          <MaterialIcons name="arrow-back" size={24} color="#0058be" />
        </Pressable>
        <Text className="text-xl font-bold text-primary">Detalle</Text>
        <Pressable onPress={eliminar} className="p-2">
          <MaterialIcons name="delete-outline" size={24} color="#ba1a1a" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View className="items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-primary-container items-center justify-center mb-3">
            <MaterialIcons name="person" size={48} color="#fefcff" />
          </View>
          <Text className="text-2xl font-bold text-on-surface">
            {joven.nombreCompleto}
          </Text>
          <Text className="text-outline">
            {joven.edad} años{joven.ciudad ? ` • ${joven.ciudad}` : ""}
          </Text>
        </View>

        {/* Decisión espiritual (se puede marcar/desmarcar aquí también) */}
        <View className="flex-row gap-3 mb-4">
          <BotonDecision
            icon="favorite"
            label="Salvo"
            activo={!!joven.salvo}
            colorActivo="#006c49"
            fondoActivo="rgba(108,248,187,0.25)"
            deshabilitado={guardando}
            onPress={() => marcar("salvo")}
          />
          <BotonDecision
            icon="volunteer-activism"
            label="Reconciliación"
            activo={!!joven.reconciliacion}
            colorActivo="#825100"
            fondoActivo="rgba(255,221,184,0.45)"
            deshabilitado={guardando}
            onPress={() => marcar("reconciliacion")}
          />
        </View>

        <Dato icon="location-on" label="Dirección" valor={joven.direccion || "—"} />
        <Dato icon="call" label="Teléfono" valor={joven.telefono || "—"} />
        <Dato
          icon="wc"
          label="Género"
          valor={joven.genero === "masculino" ? "Masculino" : "Femenino"}
        />
        <Dato
          icon="chat"
          label="Contacto WhatsApp"
          valor={joven.whatsappConsent ? "Aceptado" : "No aceptado"}
        />

        {joven.whatsappConsent && joven.telefono ? (
          <Pressable
            onPress={() =>
              Linking.openURL(
                `https://wa.me/${joven.telefono.replace(/\D/g, "")}`
              )
            }
            className="h-14 rounded-xl flex-row items-center justify-center gap-2 mt-6"
            style={{ backgroundColor: "#25D366" }}
          >
            <MaterialIcons name="chat" size={22} color="#ffffff" />
            <Text className="text-white font-bold text-lg">
              Escribir por WhatsApp
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function BotonDecision({ icon, label, activo, colorActivo, fondoActivo, deshabilitado, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={deshabilitado}
      className="flex-1 h-14 rounded-xl border flex-row items-center justify-center gap-2"
      style={{
        borderColor: activo ? colorActivo : "#c2c6d6",
        backgroundColor: activo ? fondoActivo : "#ffffff",
        opacity: deshabilitado ? 0.6 : 1,
      }}
    >
      <MaterialIcons name={icon} size={20} color={activo ? colorActivo : "#727785"} />
      <Text className="font-semibold" style={{ color: activo ? colorActivo : "#0b1c30" }}>
        {label}
      </Text>
      {activo && <MaterialIcons name="check-circle" size={16} color={colorActivo} />}
    </Pressable>
  );
}

function Dato({ icon, label, valor }) {
  return (
    <View className="bg-surface-container-lowest rounded-xl p-4 mb-3 flex-row items-center gap-3 border border-outline-variant/30">
      <MaterialIcons name={icon} size={22} color="#0058be" />
      <View>
        <Text className="text-xs text-on-surface-variant">{label}</Text>
        <Text className="text-on-surface font-semibold">{valor}</Text>
      </View>
    </View>
  );
}
