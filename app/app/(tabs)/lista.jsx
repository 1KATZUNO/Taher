import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import TopBar from "../../components/TopBar";
import JovenCard from "../../components/JovenCard";
import { api } from "../../lib/api";

const EDADES = Array.from({ length: 30 }, (_, i) => i + 1); // 1..30

export default function ListaScreen() {
  const router = useRouter();
  const [jovenes, setJovenes] = useState([]);
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  // Filtros
  const [fSalvo, setFSalvo] = useState(false);
  const [fGenero, setFGenero] = useState(null); // null | masculino | femenino
  const [fEdad, setFEdad] = useState(null); // null | número

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

  const filtrados = useMemo(
    () =>
      jovenes.filter(
        (j) =>
          (!fSalvo || j.salvo) &&
          (!fGenero || j.genero === fGenero) &&
          (fEdad == null || j.edad === fEdad)
      ),
    [jovenes, fSalvo, fGenero, fEdad]
  );

  const hayFiltros = fSalvo || fGenero || fEdad != null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <TopBar title="Jóvenes Registrados" />
      <FlatList
        data={filtrados}
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
            <View className="flex-row gap-4 mb-5">
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
                  Salvos
                </Text>
                <Text className="text-on-secondary-container text-2xl font-bold">
                  {stats ? stats.salvos?.total ?? 0 : "—"}
                </Text>
              </View>
            </View>

            {/* Filtros: salvos y género */}
            <Text className="font-semibold text-on-surface-variant text-sm mb-2">
              Filtros
            </Text>
            <View className="flex-row gap-2 mb-3 flex-wrap">
              <Chip
                icon="favorite"
                label="Salvos"
                activo={fSalvo}
                colorActivo="#006c49"
                onPress={() => setFSalvo(!fSalvo)}
              />
              <Chip
                icon="male"
                label="Hombres"
                activo={fGenero === "masculino"}
                colorActivo="#0058be"
                onPress={() =>
                  setFGenero(fGenero === "masculino" ? null : "masculino")
                }
              />
              <Chip
                icon="female"
                label="Mujeres"
                activo={fGenero === "femenino"}
                colorActivo="#0058be"
                onPress={() =>
                  setFGenero(fGenero === "femenino" ? null : "femenino")
                }
              />
            </View>

            {/* Filtro por edad exacta */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
              className="mb-3"
            >
              <Pressable
                onPress={() => setFEdad(null)}
                className={`px-4 h-9 rounded-full items-center justify-center ${
                  fEdad == null ? "bg-primary" : "bg-surface-container"
                }`}
              >
                <Text
                  className={`font-semibold text-sm ${
                    fEdad == null ? "text-white" : "text-on-surface-variant"
                  }`}
                >
                  Todas las edades
                </Text>
              </Pressable>
              {EDADES.map((e) => (
                <Pressable
                  key={e}
                  onPress={() => setFEdad(fEdad === e ? null : e)}
                  className={`w-9 h-9 rounded-full items-center justify-center ${
                    fEdad === e ? "bg-primary" : "bg-surface-container"
                  }`}
                >
                  <Text
                    className={`font-semibold text-sm ${
                      fEdad === e ? "text-white" : "text-on-surface-variant"
                    }`}
                  >
                    {e}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* Conteo de resultados */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-on-background">
                {hayFiltros ? "Resultados" : "Lista Reciente"}
              </Text>
              <View
                className={`px-3 py-1 rounded-full ${
                  hayFiltros ? "bg-primary" : "bg-surface-container"
                }`}
              >
                <Text
                  className={`font-bold text-sm ${
                    hayFiltros ? "text-white" : "text-on-surface-variant"
                  }`}
                >
                  {filtrados.length} {filtrados.length === 1 ? "joven" : "jóvenes"}
                </Text>
              </View>
            </View>
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
              {hayFiltros
                ? "Ningún joven coincide con los filtros."
                : "No hay jóvenes registrados todavía."}
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}

function Chip({ icon, label, activo, colorActivo, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-1 px-3 h-9 rounded-full border"
      style={{
        borderColor: activo ? colorActivo : "#c2c6d6",
        backgroundColor: activo ? colorActivo : "#ffffff",
      }}
    >
      <MaterialIcons name={icon} size={16} color={activo ? "#ffffff" : "#727785"} />
      <Text
        className="font-semibold text-sm"
        style={{ color: activo ? "#ffffff" : "#424754" }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
