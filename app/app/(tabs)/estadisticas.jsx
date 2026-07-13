import { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import TopBar from "../../components/TopBar";
import { api, API_URL } from "../../lib/api";

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
        {/* Exportar a Excel */}
        <Pressable
          onPress={() => Linking.openURL(`${API_URL}/api/export/excel`)}
          className="h-12 bg-secondary rounded-xl flex-row items-center justify-center gap-2 mb-4 active:scale-95"
        >
          <MaterialIcons name="table-view" size={20} color="#ffffff" />
          <Text className="text-white font-bold">Exportar a Excel</Text>
        </Pressable>

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

        {/* Salvos */}
        <View className="bg-surface-container-lowest rounded-xl p-5 mt-4 border border-outline-variant/30">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="favorite" size={22} color="#006c49" />
              <Text className="text-xl font-semibold text-on-surface">Salvos</Text>
            </View>
            <View className="bg-secondary-container px-3 py-1 rounded-full">
              <Text className="text-on-secondary-container font-bold">
                {stats.salvos?.total ?? 0} · {stats.salvos?.porcentaje ?? 0}%
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1 bg-surface-container-low rounded-xl p-3 items-center">
              <MaterialIcons name="male" size={18} color="#2170e4" />
              <Text className="text-lg font-bold text-on-surface">
                {stats.salvos?.genero?.hombres ?? 0}
              </Text>
              <Text className="text-xs text-outline">Hombres</Text>
            </View>
            <View className="flex-1 bg-surface-container-low rounded-xl p-3 items-center">
              <MaterialIcons name="female" size={18} color="#006c49" />
              <Text className="text-lg font-bold text-on-surface">
                {stats.salvos?.genero?.mujeres ?? 0}
              </Text>
              <Text className="text-xs text-outline">Mujeres</Text>
            </View>
            <View className="flex-1 bg-surface-container-low rounded-xl p-3 items-center">
              <MaterialIcons name="volunteer-activism" size={18} color="#825100" />
              <Text className="text-lg font-bold text-on-surface">
                {stats.reconciliaciones ?? 0}
              </Text>
              <Text className="text-xs text-outline">Reconcil.</Text>
            </View>
          </View>

          {(stats.salvos?.porEdad?.length ?? 0) > 0 ? (
            <>
              <Text className="font-semibold text-on-surface-variant text-sm mb-2">
                Salvos por edad
              </Text>
              <TablaEdades filas={stats.salvos.porEdad} color="#006c49" />
            </>
          ) : (
            <Text className="text-outline text-sm">Aún no hay salvos registrados.</Text>
          )}
        </View>

        {/* Por edad exacta (todos) */}
        <View className="bg-surface-container-lowest rounded-xl p-5 mt-4 border border-outline-variant/30">
          <Text className="text-xl font-semibold text-on-surface mb-1">
            Por edad exacta
          </Text>
          <Text className="text-outline text-sm mb-3">
            Todos los registrados, con desglose por género
          </Text>
          <TablaEdades filas={stats.porEdad ?? []} color="#2170e4" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Tabla compacta de edades: cada fila muestra la edad, una barra proporcional
 * y el total con desglose hombres/mujeres.
 */
function TablaEdades({ filas, color }) {
  if (!filas.length) {
    return <Text className="text-outline text-sm">Sin datos todavía.</Text>;
  }
  const max = Math.max(...filas.map((f) => f.total), 1);
  return (
    <View>
      {filas.map((f) => (
        <View key={f.edad} className="flex-row items-center mb-2">
          <Text className="w-14 text-on-surface font-semibold text-sm">
            {f.edad} años
          </Text>
          <View className="flex-1 bg-outline-variant/20 h-4 rounded-full overflow-hidden mx-2">
            <View
              className="h-full rounded-full"
              style={{ width: `${(f.total / max) * 100}%`, backgroundColor: color }}
            />
          </View>
          <Text className="w-24 text-right text-sm text-on-surface">
            <Text className="font-bold">{f.total}</Text>
            <Text className="text-outline"> ({f.hombres}H·{f.mujeres}M)</Text>
          </Text>
        </View>
      ))}
    </View>
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
