import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import TopBar from "../../components/TopBar";
import JovenCard from "../../components/JovenCard";
import { api } from "../../lib/api";

export default function BuscarScreen() {
  const router = useRouter();
  const { q } = useLocalSearchParams();
  const [texto, setTexto] = useState(typeof q === "string" ? q : "");
  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      setCargando(true);
      try {
        const data = await api.listarJovenes(texto);
        setResultados(data);
      } catch (e) {
        setResultados([]);
      } finally {
        setCargando(false);
      }
    }, 300); // debounce
    return () => clearTimeout(t);
  }, [texto]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <TopBar title="Buscar" />
      <View className="px-5 pt-4">
        <View className="flex-row items-center bg-surface-container-lowest border-2 border-outline-variant rounded-xl h-14 px-4">
          <MaterialIcons name="search" size={22} color="#727785" />
          <TextInput
            className="flex-1 ml-3 text-base text-on-surface"
            placeholder="Buscar por nombre o ciudad..."
            placeholderTextColor="#727785"
            value={texto}
            onChangeText={setTexto}
            autoFocus
          />
          {texto.length > 0 && (
            <MaterialIcons
              name="close"
              size={22}
              color="#727785"
              onPress={() => setTexto("")}
            />
          )}
        </View>
      </View>

      <FlatList
        data={resultados}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20 }}
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
              {texto ? "Sin resultados." : "Escribe para buscar."}
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}
