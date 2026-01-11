import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const USE_MOCK = true;

const BUILDINGS = ["Pearsons Hall", "Caws Hall", "Yates Hall", "Miller Hall"];
const CATEGORIES = ["Plumbing", "Electrical", "HVAC", "Furniture", "Other"];
const SEVERITIES = ["Low", "Medium", "High"];

const severityMeta = {
  Low: { dot: "#22C55E", bg: "#F0FDF4", border: "#86EFAC", text: "#16A34A" },
  Medium: { dot: "#F59E0B", bg: "#FFFBEB", border: "#FCD34D", text: "#D97706" },
  High: { dot: "#EF4444", bg: "#FEF2F2", border: "#FCA5A5", text: "#DC2626" },
};

export default function CreateTicketScreen({ navigation }) {
  const [building, setBuilding] = useState("");
  const [room, setRoom] = useState("");
  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("Medium");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]); // array of local URIs
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return Boolean(building && room && category && !submitting);
  }, [building, room, category, submitting]);

  const pickImage = async () => {
    if (images.length >= 3) {
      Alert.alert("Limit reached", "You can add up to 3 photos.");
      return;
    }

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow photo access to attach images.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: 3 - images.length,
    });

    if (!result.canceled) {
      const pickedUris = result.assets.map((a) => a.uri);
      setImages((prev) => [...prev, ...pickedUris].slice(0, 3));
    }
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!building || !room || !category) {
      Alert.alert("Missing fields", "Building, room, and category are required.");
      return;
    }

    setSubmitting(true);

    try {
      if (!USE_MOCK) {
        /**
         * 🔌 BACKEND CONNECTION POINT (matches your mobile conventions)
         *
         * 1) Import:
         *    import { ticketAPI } from "../services/api";
         *
         * 2) Build FormData with key `images` (multipart/form-data):
         *
         *    const form = new FormData();
         *    form.append("building", building);
         *    form.append("room", room);
         *    form.append("category", category);
         *    form.append("severity", severity);
         *    if (description) form.append("description", description);
         *
         *    images.forEach((uri, i) => {
         *      form.append("images", {
         *        uri,
         *        type: "image/jpeg",
         *        name: `issue-${Date.now()}-${i}.jpg`,
         *      });
         *    });
         *
         * 3) Call:
         *    await ticketAPI.createTicket(form);
         *
         * NOTE: Keep `images` key (not `image`, not `files`) so it matches backend.
         */
      } else {
        // Mock submit: log payload and simulate network latency
        const payload = { building, room, category, severity, description, images };
        console.log("MOCK SUBMIT:", payload);
        await new Promise((r) => setTimeout(r, 550));
      }

      Alert.alert("Submitted", "Your request has been created.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.log("Submit error:", e);
      Alert.alert("Error", "Could not submit your ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const sevStyle = severityMeta[severity] || severityMeta.Medium;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Top card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroIconWrap}>
              <Text style={styles.heroIcon}>🛠️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>New request</Text>
              <Text style={styles.heroSub}>Fast, clear, facilities-ready.</Text>
            </View>
          </View>

          <View style={styles.heroHintRow}>
            <View style={styles.hintPill}>
              <Text style={styles.hintText}>Photo → Structured ticket</Text>
            </View>
            <View style={styles.hintPill}>
              <Text style={styles.hintText}>Under 30 seconds</Text>
            </View>
          </View>
        </View>

        {/* Location */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Location</Text>
          <Text style={styles.cardCaption}>Choose building + room (required)</Text>

          <Text style={styles.label}>Building</Text>
          <View style={styles.chipGrid}>
            {BUILDINGS.map((b) => (
              <Pressable
                key={b}
                onPress={() => setBuilding(b)}
                style={({ pressed }) => [
                  styles.chip,
                  building === b && styles.chipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.chipText, building === b && styles.chipTextActive]}>
                  {b}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Room</Text>
          <TextInput
            value={room}
            onChangeText={setRoom}
            placeholder="e.g., 214"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Issue */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Issue</Text>
          <Text style={styles.cardCaption}>Category + priority (required)</Text>

          <Text style={styles.label}>Category</Text>
          <View style={styles.chipGrid}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={({ pressed }) => [
                  styles.chip,
                  category === c && styles.chipActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.chipText, category === c && styles.chipTextActive]}>
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityRow}>
            {SEVERITIES.map((s) => {
              const sMeta = severityMeta[s];
              const active = severity === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => setSeverity(s)}
                  style={({ pressed }) => [
                    styles.priorityChip,
                    active && { backgroundColor: sMeta.bg, borderColor: sMeta.border },
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={[styles.dot, { backgroundColor: sMeta.dot }]} />
                  <Text style={[styles.priorityText, active && { color: sMeta.text }]}>
                    {s}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Anything helpful for facilities…"
            placeholderTextColor="#94A3B8"
            style={[styles.input, styles.textArea]}
            multiline
          />
        </View>

        {/* Photos */}
        <View style={styles.card}>
          <View style={styles.photoHeader}>
            <View>
              <Text style={styles.cardTitle}>Photos</Text>
              <Text style={styles.cardCaption}>Up to 3 images. More clarity = faster fix.</Text>
            </View>

            <Pressable onPress={pickImage} style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}>
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          </View>

          <View style={styles.imageGrid}>
            {images.map((uri, idx) => (
              <View key={uri + idx} style={styles.imageItem}>
                <Image source={{ uri }} style={styles.image} />
                <Pressable onPress={() => removeImage(idx)} style={styles.removeBtn}>
                  <Text style={styles.removeText}>×</Text>
                </Pressable>
              </View>
            ))}

            {images.length === 0 && (
              <View style={styles.photoEmpty}>
                <Text style={styles.photoEmptyIcon}>📷</Text>
                <Text style={styles.photoEmptyText}>Add a photo to auto-fill the ticket.</Text>
              </View>
            )}
          </View>

          {/* Little “preview” pill */}
          <View style={[styles.previewPill, { backgroundColor: sevStyle.bg, borderColor: sevStyle.border }]}>
            <View style={[styles.dot, { backgroundColor: sevStyle.dot }]} />
            <Text style={[styles.previewText, { color: sevStyle.text }]}>
              Priority: {severity}
            </Text>
          </View>
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={({ pressed }) => [
            styles.submit,
            !canSubmit && styles.submitDisabled,
            pressed && canSubmit && styles.submitPressed,
          ]}
        >
          <Text style={styles.submitText}>{submitting ? "Submitting…" : "Submit request"}</Text>
          <Text style={styles.submitArrow}>→</Text>
        </Pressable>

        <Text style={styles.footerNote}>
          Not an emergency service. For immediate danger, call campus security / 911.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: {
    paddingTop: Platform.OS === "ios" ? 110 : 90,
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 14,
  },

  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  heroTop: { flexDirection: "row", gap: 12, alignItems: "center" },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    alignItems: "center",
    justifyContent: "center",
  },
  heroIcon: { fontSize: 20 },
  heroTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  heroSub: { color: "#64748B", marginTop: 2, fontSize: 13 },

  heroHintRow: { flexDirection: "row", gap: 10, marginTop: 12, flexWrap: "wrap" },
  hintPill: {
    backgroundColor: "#F1F5F9",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  hintText: { color: "#334155", fontSize: 12, fontWeight: "600" },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  cardTitle: { color: "#0F172A", fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
  cardCaption: { color: "#64748B", fontSize: 13, marginTop: 4, marginBottom: 14 },

  label: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#93C5FD",
  },
  chipText: { color: "#334155", fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#1D4ED8" },

  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: "#0F172A",
    fontSize: 15,
    marginBottom: 4,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
    paddingTop: 12,
  },

  priorityRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  priorityChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  priorityText: { color: "#334155", fontWeight: "700" },
  dot: { width: 8, height: 8, borderRadius: 4 },

  photoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#0F172A",
  },
  addBtnText: { color: "#FFFFFF", fontWeight: "700" },

  imageGrid: { gap: 10 },
  imageItem: {
    width: "100%",
    height: 190,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
  },
  image: { width: "100%", height: "100%" },
  removeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: { color: "#fff", fontSize: 20, lineHeight: 20 },

  photoEmpty: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    padding: 14,
    alignItems: "center",
  },
  photoEmptyIcon: { fontSize: 22 },
  photoEmptyText: { marginTop: 6, color: "#475569", fontWeight: "600" },

  previewPill: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewText: { fontWeight: "800" },

  submit: {
    marginTop: 6,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  submitDisabled: { opacity: 0.5 },
  submitPressed: { transform: [{ scale: 0.99 }] },
  submitText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900" },
  submitArrow: { color: "#FFFFFF", fontSize: 18, fontWeight: "300" },

  footerNote: {
    textAlign: "center",
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 6,
    paddingHorizontal: 8,
  },

  pressed: { opacity: 0.7 },
});
