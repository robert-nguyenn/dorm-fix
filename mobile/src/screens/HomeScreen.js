import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  RefreshControl,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ticketAPI } from "../services/api";
import { useTheme } from "../theme";
import { useFocusEffect } from "@react-navigation/native";

const TITLE_FONT = Platform.select({ ios: "Avenir Next", android: "sans-serif-condensed" });

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function normalizeStatus(s) {
  const v = (s || "").toUpperCase();
  return ["NEW", "IN_REVIEW", "IN_PROGRESS", "RESOLVED"].includes(v) ? v : "NEW";
}

const SEVERITY_COLORS = {
  High: { bg: "#FEF2F2", border: "#FCA5A5", text: "#DC2626", dot: "#EF4444" },
  Medium: { bg: "#FFFBEB", border: "#FCD34D", text: "#D97706", dot: "#F59E0B" },
  Low: { bg: "#F0FDF4", border: "#86EFAC", text: "#16A34A", dot: "#22C55E" },
};

const STATUS_COLORS = {
  NEW: { bg: "rgba(255,255,255,0.14)", border: "rgba(255,255,255,0.25)", text: "#FFFFFF", dot: "#7DD3FC" },
  IN_PROGRESS: { bg: "rgba(255,255,255,0.14)", border: "rgba(255,255,255,0.25)", text: "#FFFFFF", dot: "#FBBF24" },
  RESOLVED: { bg: "rgba(255,255,255,0.14)", border: "rgba(255,255,255,0.25)", text: "#FFFFFF", dot: "#34D399" },
};

export default function HomeScreen({ navigation }) {
  const { theme, mode, toggleTheme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [tickets, setTickets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const response = await ticketAPI.getTickets();
      setTickets(response.tickets || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTickets();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchTickets();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchTickets();
    } finally {
      setRefreshing(false);
    }
  };

  const counts = useMemo(() => {
    const c = { NEW: 0, IN_PROGRESS: 0, RESOLVED: 0 };
    tickets.forEach((t) => {
      const s = normalizeStatus(t.status);
      if (c[s] !== undefined) c[s]++;
    });
    return c;
  }, [tickets]);

  const renderItem = ({ item }) => {
    const severityStyle = SEVERITY_COLORS[item.severity] || SEVERITY_COLORS.Low;
    const statusStyle = STATUS_COLORS[normalizeStatus(item.status)] || STATUS_COLORS.NEW;

    return (
      <Pressable
        onPress={() => navigation.navigate("TicketDetail", { id: item._id })}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        <Image source={{ uri: item.imageUrls?.[0] }} style={styles.thumb} />

        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.location}>
              {item.building}
            </Text>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: statusStyle.dot },
              ]}
            />
          </View>

          <Text style={styles.room}>Room {item.room}</Text>

          <View style={styles.metaRow}>
            <View style={[styles.categoryPill, { backgroundColor: severityStyle.bg, borderColor: severityStyle.border }]}>
              <Text style={[styles.categoryText, { color: severityStyle.text }]}>{item.category}</Text>
            </View>
            <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>
          </View>

          <Text style={styles.summary} numberOfLines={2}>
            {item.aiSummary}
          </Text>
        </View>
      </Pressable>
    );
  };

  const StatCard = ({ label, value, status }) => {
    const colors = STATUS_COLORS[status] || STATUS_COLORS.NEW;

    return (
      <View style={[styles.statCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={styles.loadingText}>Loading tickets...</Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(t) => t._id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0EA5A4"
            />
          }
          ListHeaderComponent={
            <>
              <View style={styles.heroWrap}>
                <LinearGradient
                  colors={theme.heroGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.hero}
                >
                  <View style={styles.heroTopRow}>
                    <View style={styles.heroCopy}>
                      <Text style={styles.heroEyebrow}>DormFix</Text>
                      <Text style={styles.heroTitle}>Maintenance Overview</Text>
                      <Text style={styles.heroSub}>
                        Live campus requests and service health at a glance.
                      </Text>
                    </View>

                    <Pressable onPress={toggleTheme} style={styles.themeToggle}>
                      <Text style={styles.themeToggleText}>
                        {mode === "dark" ? "Dark" : "Light"}
                      </Text>
                    </Pressable>
                  </View>

                <View style={styles.statsGrid}>
                  <StatCard label="New" value={counts.NEW} status="NEW" />
                  <StatCard label="Active" value={counts.IN_PROGRESS} status="IN_PROGRESS" />
                  <StatCard label="Resolved" value={counts.RESOLVED} status="RESOLVED" />
                </View>
              </LinearGradient>
            </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Requests</Text>
                <Text style={styles.sectionCaption}>Latest 100 submissions</Text>
              </View>
            </>
          }
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 6 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <View style={styles.emptyCheckmark}>
                  <View style={styles.checkmarkLine1} />
                  <View style={styles.checkmarkLine2} />
                </View>
              </View>
              <Text style={styles.emptyText}>All caught up</Text>
              <Text style={styles.emptySubtext}>No active requests at the moment</Text>
            </View>
          }
        />
      )}

      <Pressable
        onPress={() => navigation.navigate("CreateTicket")}
        style={({ pressed }) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },

  heroWrap: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 22 : 14,
    marginBottom: 18,
  },
  hero: {
    borderRadius: 22,
    padding: 20,
    gap: 18,
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    gap: 6,
  },
  themeToggle: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
  },
  themeToggleText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
    fontFamily: TITLE_FONT,
  },
  heroSub: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    lineHeight: 18,
  },
  
  statsGrid: { 
    flexDirection: "row", 
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  statLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "500",
  },

  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: -0.3,
    fontFamily: TITLE_FONT,
  },
  sectionCaption: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },

  card: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: theme.surfaceAlt,
  },
  cardContent: { 
    flex: 1,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  location: {
    color: theme.text,
    fontWeight: "600",
    fontSize: 15,
    letterSpacing: -0.2,
    fontFamily: TITLE_FONT,
  },
  room: {
    color: theme.textSoft,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  timeText: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: "500",
  },
  summary: {
    color: theme.textSoft,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyCheckmark: {
    width: 28,
    height: 28,
    position: "relative",
  },
  checkmarkLine1: {
    position: "absolute",
    width: 3,
    height: 12,
    backgroundColor: "#22C55E",
    borderRadius: 2,
    transform: [{ rotate: "45deg" }],
    left: 8,
    top: 12,
  },
  checkmarkLine2: {
    position: "absolute",
    width: 3,
    height: 20,
    backgroundColor: "#22C55E",
    borderRadius: 2,
    transform: [{ rotate: "-45deg" }],
    left: 14,
    top: 4,
  },
  emptyText: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtext: {
    color: theme.textMuted,
    fontSize: 14,
    marginTop: 4,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabPressed: {
    transform: [{ scale: 0.94 }],
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "400",
    marginTop: -2,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    color: theme.textMuted,
    fontSize: 16,
    marginTop: 12,
  },
});
