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
import { ticketAPI } from "../services/api";
import { useTheme } from "../theme";

const TITLE_FONT = Platform.select({ ios: "Avenir Next", android: "sans-serif-condensed" });

const BUILDINGS = ["Pearsons Hall", "Caws Hall", "Yates Hall", "Miller Hall"];

export default function CreateTicketScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [building, setBuilding] = useState("");
  const [room, setRoom] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]); // array of { uri, name, type }
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return Boolean(building && room && images.length > 0 && !submitting);
  }, [building, room, images, submitting]);

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
      const picked = result.assets.map((a, idx) => ({
        uri: a.uri,
        name: a.fileName || `issue-${Date.now()}-${idx}.jpg`,
        type: a.mimeType || "image/jpeg",
      }));
      setImages((prev) => [...prev, ...picked].slice(0, 3));
    }
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!building || !room) {
      Alert.alert("Missing fields", "Building and room are required.");
      return;
    }

    if (images.length === 0) {
      Alert.alert("No images", "Please add at least one photo of the issue.");
      return;
    }

    setSubmitting(true);

    try {
      // Build FormData for image upload
      const form = new FormData();
      form.append("building", building);
      form.append("room", room);
      
      // Backend expects userNote instead of description
      if (description) form.append("userNote", description);
      
      // Append images
      if (images.length === 0) {
        Alert.alert("No images", "Please add at least one photo of the issue.");
        setSubmitting(false);
        return;
      }

      images.forEach((img, i) => {
        form.append("images", {
          uri: img.uri,
          type: img.type || "image/jpeg",
          name: img.name || `issue-${Date.now()}-${i}.jpg`,
        });
      });

      // Call backend API
      const response = await ticketAPI.createTicket(form);
      if (response.aiDebug) {
        console.log("AI debug:", response.aiDebug);
      }
      console.log("Ticket created:", response.ticket._id);

      Alert.alert("Submitted", "Your request has been created successfully!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.log("Submit error:", e);
      const errorMsg = e.response?.data?.error?.message || e.message || "Could not submit your ticket. Please try again.";
      Alert.alert("Error", errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

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

        {/* Issue Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Details</Text>
          <Text style={styles.cardCaption}>Describe the issue (optional - AI will analyze from photos)</Text>

          <Text style={styles.label}>Additional notes</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Any additional details that might help…"
            placeholderTextColor="#94A3B8"
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={4}
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
            {images.map((img, idx) => (
              <View key={img.uri + idx} style={styles.imageItem}>
                <Image source={{ uri: img.uri }} style={styles.image} />
                <Pressable onPress={() => removeImage(idx)} style={styles.removeBtn}>
                  <Text style={styles.removeText}>×</Text>
                </Pressable>
              </View>
            ))}

            {images.length === 0 && (
              <View style={styles.photoEmpty}>
                <Text style={styles.photoEmptyIcon}>📷</Text>
                <Text style={styles.photoEmptyText}>AI will analyze photos to categorize & prioritize</Text>
              </View>
            )}
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

const createStyles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  scroll: {
    paddingTop: Platform.OS === "ios" ? 110 : 90,
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 14,
  },

  heroCard: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  heroTop: { flexDirection: "row", gap: 12, alignItems: "center" },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#E6FFFB",
    borderWidth: 1,
    borderColor: "#99F6E4",
    alignItems: "center",
    justifyContent: "center",
  },
  heroIcon: { fontSize: 20 },
  heroTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
    fontFamily: TITLE_FONT,
  },
  heroSub: { color: theme.textSoft, marginTop: 2, fontSize: 13 },

  heroHintRow: { flexDirection: "row", gap: 10, marginTop: 12, flexWrap: "wrap" },
  hintPill: {
    backgroundColor: theme.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  hintText: { color: theme.text, fontSize: 12, fontWeight: "600" },

  card: {
    backgroundColor: theme.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
    fontFamily: TITLE_FONT,
  },
  cardCaption: { color: theme.textMuted, fontSize: 13, marginTop: 4, marginBottom: 14 },

  label: {
    color: theme.textMuted,
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
    backgroundColor: theme.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.border,
  },
  chipActive: {
    backgroundColor: "rgba(14, 165, 164, 0.16)",
    borderColor: theme.accent,
  },
  chipText: { color: theme.text, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: theme.accent },

  input: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: theme.text,
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
    backgroundColor: theme.accentStrong,
  },
  addBtnText: { color: "#FFFFFF", fontWeight: "700" },

  imageGrid: { gap: 10 },
  imageItem: {
    width: "100%",
    height: 190,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: theme.surfaceAlt,
  },
  image: { width: "100%", height: "100%" },
  removeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(11, 18, 32, 0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: { color: "#fff", fontSize: 20, lineHeight: 20 },

  photoEmpty: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surfaceAlt,
    padding: 14,
    alignItems: "center",
  },
  photoEmptyIcon: { fontSize: 22 },
  photoEmptyText: { marginTop: 6, color: theme.textSoft, fontWeight: "600" },

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
    backgroundColor: theme.accent,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  submitDisabled: { opacity: 0.5 },
  submitPressed: { transform: [{ scale: 0.99 }] },
  submitText: { color: "#FFFFFF", fontSize: 16, fontWeight: "900", fontFamily: TITLE_FONT },
  submitArrow: { color: "#FFFFFF", fontSize: 18, fontWeight: "300" },

  footerNote: {
    textAlign: "center",
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 6,
    paddingHorizontal: 8,
  },

  pressed: { opacity: 0.7 },
});
