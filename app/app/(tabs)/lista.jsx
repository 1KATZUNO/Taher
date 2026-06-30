import { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import TopBar from "../../components/TopBar";
import JovenCard from "../../components/JovenCard";
import { api } from "../../lib/api";

export default function ListaScreen() {
  const router = useRouter();
  const [jovenes, setJovenes] = useState([]);
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const [lista, est] = await Promise.all([
        api.listarJovenes(),
        api.estadisticas(),
      ]);
      setJovenes(lista);
      setStats(est);
    } catch (e) {
      // silencioso; el pull-to-refresh permite reintentar
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [cargar])
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <TopBar title="Jóvenes Registrados" />
      <FlatList
        data={jovenes}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => {
              setRefrescando(true);
              cargar();
            }}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Recap */}
            <View className="flex-row gap-4 mb-6">
              <View className="flex-1 bg-primary-container p-4 rounded-xl">
                <Text className="text-on-primary-container/80 text-sm font-semibold">
                  Total
                </Text>
                <Text className="text-on-primary-container text-2xl font-bold">
                  {stats ? stats.total : "—"}
                </Text>
              </View>
              <View className="flex-1 bg-secondary-container p-4 rounded-xl">
                <Text className="text-on-secondary-container/80 text-sm font-semibold">
                  Activos hoy
                </Text>
                <Text className="text-on-secondary-container text-2xl font-bold">
                  +{stats ? stats.hoy : "—"}
                </Text>
              </View>
            </View>
            <Text className="text-2xl font-bold text-on-background mb-4">
              Lista Reciente
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mb-4">
            <JovenCard
              joven={item}
              onPress={() => router.push(`/joven/${item._id}`)}
            />
          </View>
        )}
        ListEmptyComponent={
          cargando ? (
            <ActivityIndicator color="#0058be" className="mt-10" />
          ) : (
            <Text className="text-center text-outline mt-10">
              No hay jóvenes registrados todavía.
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}
