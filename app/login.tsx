import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useState } from "react";
import { startOAuthLogin } from "@/constants/oauth";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function LoginScreen() {
  const colors = useColors();
  const [busy, setBusy] = useState(false);
  const login = async () => { setBusy(true); await startOAuthLogin(); setBusy(false); };
  return <ScreenContainer className="p-6" edges={["top", "bottom", "left", "right"]}>
    <View style={styles.center}>
      <View style={[styles.logo, { backgroundColor: colors.primary }]}><Text style={styles.logoText}>S</Text></View>
      <Text style={[styles.title, { color: colors.foreground }]}>StudyFlow</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Turn study time into steady progress.</Text>
      <Pressable onPress={login} disabled={busy} style={({ pressed }) => [styles.button, { backgroundColor: colors.primary }, pressed && styles.pressed]}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Continue with Manus</Text>}
      </Pressable>
      <Text style={[styles.note, { color: colors.muted }]}>Secure sign-in keeps your study plan synced across devices.</Text>
    </View>
  </ScreenContainer>;
}
const styles = StyleSheet.create({ center: { flex: 1, justifyContent: "center", alignItems: "center" }, logo: { width: 76, height: 76, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 20 }, logoText: { color: "#fff", fontSize: 42, fontWeight: "800" }, title: { fontSize: 34, fontWeight: "800" }, subtitle: { fontSize: 16, marginTop: 8, marginBottom: 36, textAlign: "center" }, button: { width: "100%", padding: 16, borderRadius: 16, alignItems: "center" }, buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" }, note: { fontSize: 12, textAlign: "center", marginTop: 16, maxWidth: 280 }, demo: { marginTop: 28, fontWeight: "700" }, pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] } });
