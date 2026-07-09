import { View, Text, Pressable, Linking } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

function iniciales(nombre = "") {
  return nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function JovenCard({ joven, onPress }) {
  const subtitulo = [
    joven.edad ? `${joven.edad} años` : null,
    joven.ciudad || null,
  ]
    .filter(Boolean)
    .join(" • ");

  function abrirWhatsapp() {
    const tel = (joven.telefono || "").replace(/\D/g, "");
    if (tel) Linking.openURL(`https://wa.me/${tel}`);
  }

  return (
    <Pressable
      onPress={onPress}
      className="bg-surface-container-lowest p-4 rounded-xl flex-row items-center justify-between border border-outline-variant/30 active:scale-[0.98]"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
        elevation: 1,
      }}
    >
      <View className="flex-row items-center gap-3 flex-1">
        <View className="w-12 h-12 rounded-full bg-primary-container items-center justify-center">
          <Text className="text-on-primary-container font-bold">
            {iniciales(joven.nombreCompleto)}
          </Text>
        </View>
        <View className="flex-1">
          <View className="flex-row items-center gap-1">
            <Text className="font-semibold text-on-surface" numberOfLines={1}>
              {joven.nombreCompleto}
            </Text>
            {joven.salvo && (
              <MaterialIcons name="favorite" size={14} color="#006c49" />
            )}
          </View>
          <Text className="text-outline text-xs">{subtitulo}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        {joven.whatsappConsent && (
          <Pressable
            onPress={abrirWhatsapp}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "rgba(37,211,102,0.12)" }}
          >
            <MaterialIcons name="chat" size={20} color="#25D366" />
          </Pressable>
        )}
        <MaterialIcons name="chevron-right" size={24} color="#c2c6d6" />
      </View>
    </Pressable>
  );
}
