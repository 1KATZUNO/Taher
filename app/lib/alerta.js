import { Alert, Platform } from "react-native";

/**
 * Alerta multiplataforma.
 * - Nativo (Android/iOS): usa Alert.alert normal.
 * - Web: Alert.alert no está implementado en react-native-web, así que
 *   usamos window.alert / window.confirm para que iPhone/PC vean los avisos.
 */
export function alerta(titulo, mensaje, botones) {
  if (Platform.OS !== "web") {
    return Alert.alert(titulo, mensaje, botones);
  }

  const texto = mensaje ? `${titulo}\n\n${mensaje}` : titulo;

  // Sin botones o un solo botón: aviso simple
  if (!botones || botones.length <= 1) {
    window.alert(texto);
    const unico = botones && botones[0];
    if (unico?.onPress) unico.onPress();
    return;
  }

  // Dos o más botones: confirm (OK = botón afirmativo, Cancelar = style cancel)
  const confirmado = window.confirm(texto);
  const afirmativo = botones.find((b) => b.style !== "cancel");
  const cancelar = botones.find((b) => b.style === "cancel");
  if (confirmado) {
    afirmativo?.onPress?.();
  } else {
    cancelar?.onPress?.();
  }
}
