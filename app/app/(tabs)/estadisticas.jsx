import { useState, useCallback } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import TopBar from "../../components/TopBar";
import { api } from "../../lib/api";

export default function EstadisticasScreen() {
  const [stats, setStats] = useState(null);

  useFocusEffect(
    useCallback(() => {
      api.estadisticas().then(setStats).catch(() => {});
    }, [])
  );

  if (!stats) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
        <TopBar title="Estadísticas" />
        <ActivityIndicator color="#0058be" className="mt-10" />
      </SafeAreaView>
    );
  }

  const maxEdad = Math.max(...stats.distribucionEdad.map((d) => d.cantidad), 1);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <TopBar title="Estadísticas Generales" />
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
      >
        {/* Total */}
        <View className="bg-primary-container rounded-xl p-6 overflow-hidden">
          <Text className="text-on-primary-container/80 text-sm font-semibold">
            Total Registrados
          </Text>
          <Text className="text-on-primary-container text-5xl font-bold mt-2">
            {stats.total.toLocaleString()}
          </Text>
          <View className="flex-row items-center gap-1 mt-3">
            <MaterialIcons name="trending-up" size={18} color="#6cf8bb" />
            <Text className="text-secondary-container font-semibold">
              {stats.hoy} hoy
            </Text>
          </View>
        </View>

        {/* Distribución por edad */}
        <View className="bg-surface-container-lowest rounded-xl p-5 mt-4 border border-outline-variant/30">
          <Text className="text-xl font-semibold text-on-surface mb-5">
            Distribución por Edad
          </Text>
          <View className="flex-row items-end justify-around" style={{ height: 160 }}>
            {stats.distribucionEdad.map((d) => (
              <View key={d.etiqueta} className="items-center flex-1">
                <Text className="text-xs font-semibold text-on-surface mb-1">
                  {d.cantidad}
                </Text>
                <View
                  className="bg-primary-container rounded-t-lg"
                  style={{
                    width: 28,
                    height: Math.max((d.cantidad / maxEdad) * 120, 6),
                  }}
                />
                <Text className="mt-2 text-xs text-outline">{d.etiqueta}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Género */}
        <View className="bg-surface-container-lowest rounded-xl p-5 mt-4 border border-outline-variant/30">
          <Text className="text-xl font-semibold text-on-surface mb-4">Género</Text>
          <FilaGenero
            icon="male"
            color="#2170e4"
            label="Hombres"
            valor={stats.genero.hombres}
            total={stats.total}
          />
          <FilaGenero
            icon="female"
            color="#006c49"
            label="Mujeres"
            valor={stats.genero.mujeres}
            total={stats.total}
          />
        </View>

        {/* WhatsApp */}
        <View className="bg-secondary-container/20 rounded-xl p-5 mt-4 border border-secondary-container/40">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="text-xl font-semibold text-on-secondary-container">
                Disponibilidad WhatsApp
              </Text>
              <Text className="text-on-surface-variant text-sm mt-1">
                Jóvenes que aceptaron contacto
              </Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-secondary-container items-center justify-center">
              <MaterialIcons name="chat" size={24} color="#00714d" />
            </View>
          </View>
          <View className="flex-row items-end justify-between mt-5 mb-2">
            <Text className="text-4xl font-bold text-on-secondary-container">
              {stats.whatsapp.porcentaje}%
            </Text>
            <Text className="text-on-secondary-container font-semibold mb-1">
              {stats.whatsapp.cantidad} usuarios
            </Text>
          </View>
          <View className="w-full bg-outline-variant/30 h-3 rounded-full overflow-hidden">
            <View
              className="bg-secondary h-full"
              style={{ width: `${stats.whatsapp.porcentaje}%` }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FilaGenero({ icon, color, label, valor, total }) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name={icon} size={20} color={color} />
          <Text className="text-on-surface">{label}</Text>
        </View>
        <Text className="font-bold text-on-surface">
          {valor} ({pct}%)
        </Text>
      </View>
      <View className="w-full bg-outline-variant/20 h-2 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </View>
    </View>
  );
}
