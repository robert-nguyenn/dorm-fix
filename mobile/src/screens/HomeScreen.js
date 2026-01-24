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
  NEW: { bg: "#EFF6FF", border: "#93C5FD", text: "#2563EB", dot: "#3B82F6" },
  IN_PROGRESS: { bg: "#FEF3C7", border: "#FCD34D", text: "#D97706", dot: "#F59E0B" },
  RESOLVED: { bg: "#F0FDF4", border: "#86EFAC", text: "#16A34A", dot: "#22C55E" },
};

export default function HomeScreen({ navigation }) {
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

  return (
    <SafeAreaView style={styles.safe}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
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
            tintColor="#3B82F6"
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.headerSpacer} />
            <View style={styles.headerContainer}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Overview</Text>
                
                <View style={styles.statsGrid}>
                  <StatCard label="New" value={counts.NEW} status="NEW" />
                  <StatCard label="Active" value={counts.IN_PROGRESS} status="IN_PROGRESS" />
                  <StatCard label="Resolved" value={counts.RESOLVED} status="RESOLVED" />
                </View>
              </View>

              <Text style={styles.sectionTitle}>Recent Requests</Text>
            </View>
          </>
        }
        contentContainerStyle={{ paddingBottom: 120 }}
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

function StatCard({ label, value, status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.NEW;

  return (
    <View style={[styles.statCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },

  headerSpacer: {
    height: Platform.OS === "ios" ? 100 : 80,
  },
  headerContainer: { 
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  header: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  headerTitle: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: -0.4,
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
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  statLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
  },

  sectionTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  card: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  thumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
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
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 15,
    letterSpacing: -0.2,
  },
  room: {
    color: "#64748B",
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
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "500",
  },
  summary: {
    color: "#475569",
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
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubtext: {
    color: "#64748B",
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
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
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
    color: "#64748B",
    fontSize: 16,
    marginTop: 12,
  },
});