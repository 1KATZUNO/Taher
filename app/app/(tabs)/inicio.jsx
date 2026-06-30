import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import TopBar from "../../components/TopBar";
import { api } from "../../lib/api";

export default function InicioScreen() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [stats, setStats] = useState(null);

  useFocusEffect(
    useCallback(() => {
      api.estadisticas().then(setStats).catch(() => {});
    }, [])
  );

  function buscar() {
    router.push({ pathname: "/(tabs)/buscar", params: { q: busqueda } });
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <TopBar
        title="Registro Juvenil"
        right={
          <View className="w-9 h-9 rounded-full bg-primary-container items-center justify-center">
            <Text className="text-on-primary-container font-bold text-xs">JD</Text>
          </View>
        }
      />
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 32 }}
      >
        {/* Bienvenida */}
        <Text className="text-2xl font-bold text-on-background">
          ¡Hola, Bienvenido!
        </Text>
        <Text className="text-on-surface-variant mt-1 text-base">
          Gestione el registro de jóvenes de forma rápida y sencilla.
        </Text>

        {/* Buscador */}
        <View className="mt-6 flex-row items-center bg-surface-container-lowest border-2 border-outline-variant rounded-xl h-14 px-4">
          <MaterialIcons name="search" size={22} color="#727785" />
          <TextInput
            className="flex-1 ml-3 text-base text-on-surface"
            placeholder="Buscar por nombre..."
            placeholderTextColor="#727785"
            value={busqueda}
            onChangeText={setBusqueda}
            onSubmitEditing={buscar}
            returnKeyType="search"
          />
        </View>

        {/* Hero */}
        <View className="items-center my-8">
          <View className="w-56 h-56 bg-surface-container-lowest rounded-3xl border border-surface-container-highest items-center justify-center shadow-lg">
            <MaterialIcons name="groups" size={120} color="#2170e4" />
          </View>
        </View>

        {/* Botón principal */}
        <Pressable
          onPress={() => router.push("/registro")}
          className="h-14 bg-primary rounded-xl flex-row items-center justify-center gap-3 active:scale-95"
          style={{
            shadowColor: "#0058be",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          <MaterialIcons name="person-add" size={24} color="#ffffff" />
          <Text className="text-on-primary text-lg font-semibold">
            Registrar Nuevo Joven
          </Text>
        </Pressable>
        <Text className="text-center text-outline text-xs mt-3">
          Complete el formulario en menos de 2 minutos
        </Text>

        {/* Estadísticas rápidas */}
        <View className="flex-row gap-4 mt-6">
          <StatCard
            icon="group"
            color="#0058be"
            label="Total Registrados"
            value={stats ? String(stats.total) : "—"}
          />
          <StatCard
            icon="history-edu"
            color="#006c49"
            label="Hoy"
            value={stats ? String(stats.hoy) : "—"}
          />
        </View>

        <View className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 mt-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-on-surface-variant text-sm font-semibold">
                WhatsApp
              </Text>
              <Text className="text-2xl font-bold text-on-surface">
                {stats ? `${stats.whatsapp.porcentaje}% aceptó contacto` : "—"}
              </Text>
            </View>
            <MaterialIcons name="trending-up" size={28} color="#825100" />
          </View>
          <View className="w-full bg-outline-variant/20 h-2 rounded-full overflow-hidden mt-3">
            <View
              className="bg-primary h-full rounded-full"
              style={{ width: `${stats?.whatsapp.porcentaje || 0}%` }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, color, label, value }) {
  return (
    <View className="flex-1 bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
      <MaterialIcons name={icon} size={24} color={color} />
      <Text className="text-on-surface-variant text-sm font-semibold mt-2">
        {label}
      </Text>
      <Text className="text-2xl font-bold text-on-surface">{value}</Text>
    </View>
  );
}
