import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ticketAPI } from "../services/api";
import { useTheme } from "../theme";

const { width } = Dimensions.get("window");
const TITLE_FONT = Platform.select({ ios: "Avenir Next", android: "sans-serif-condensed" });

const SEVERITY_COLORS = {
  High: { bg: "#FEF2F2", border: "#FCA5A5", text: "#DC2626" },
  Medium: { bg: "#FFFBEB", border: "#FCD34D", text: "#D97706" },
  Low: { bg: "#F0FDF4", border: "#86EFAC", text: "#16A34A" },
};

const STATUS_INFO = {
  NEW: { label: "New Request", color: "#0EA5A4", bg: "#E6FFFB" },
  IN_PROGRESS: { label: "In Progress", color: "#D97706", bg: "#FEF3C7" },
  RESOLVED: { label: "Completed", color: "#16A34A", bg: "#F0FDF4" },
};

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function TicketDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const { id } = route.params;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const TimelineItem = ({ label, time, active }) => {
    return (
      <View style={styles.timelineItem}>
        <View style={styles.timelineDot}>
          <View style={[
            styles.timelineDotInner,
            active && styles.timelineDotActive
          ]} />
        </View>
        <View style={styles.timelineContent}>
          <Text style={styles.timelineLabel}>{label}</Text>
          <Text style={styles.timelineTime}>{time}</Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const response = await ticketAPI.getTicketById(id);
        setTicket(response.ticket);
      } catch (error) {
        console.error("Error fetching ticket:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      "Delete ticket?",
      "This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await ticketAPI.deleteTicket(id);
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting ticket:", error);
              Alert.alert("Error", "Failed to delete the ticket. Please try again.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={styles.loadingText}>Loading ticket...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!ticket) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Ticket not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const severityStyle = SEVERITY_COLORS[ticket.severity] || SEVERITY_COLORS.Low;
  const statusInfo = STATUS_INFO[ticket.status] || STATUS_INFO.NEW;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {ticket.imageUrls?.[0] && (
          <View style={styles.heroContainer}>
            <Image
              source={{ uri: ticket.imageUrls[0] }}
              style={styles.heroImage}
            />
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.statusBar}>
            <View style={[styles.statusPill, { backgroundColor: statusInfo.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.location}>{ticket.building}</Text>
            <Text style={styles.room}>Room {ticket.room}</Text>

            <View style={styles.metaRow}>
              <View style={[styles.badge, { backgroundColor: severityStyle.bg, borderColor: severityStyle.border }]}>
                <Text style={[styles.badgeText, { color: severityStyle.text }]}>
                  {ticket.severity} Priority
                </Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{ticket.category}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.aiHeader}>
              <Text style={styles.sectionTitle}>Gemini AI Summary</Text>
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>AI</Text>
              </View>
            </View>
            <LinearGradient
              colors={[theme.surfaceAlt, "rgba(14, 165, 164, 0.12)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.aiCard}
            >
              <Text style={styles.aiSubtitle}>Auto‑triaged insight</Text>
              <Text style={styles.aiSummaryText}>{ticket.aiSummary}</Text>
            </LinearGradient>
          </View>

          {ticket.userNote && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>User Notes</Text>
                <Text style={styles.descriptionText}>{ticket.userNote}</Text>
              </View>
            </>
          )}

          {ticket.facilitiesDescription && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Facilities Description</Text>
                <Text style={styles.descriptionText}>{ticket.facilitiesDescription}</Text>
              </View>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <View style={styles.timeline}>
              <TimelineItem
                label="Request Created"
                time={timeAgo(ticket.createdAt)}
                active
              />
              {ticket.aiSummary && (
                <TimelineItem
                  label="AI Analysis Complete"
                  time={timeAgo(ticket.createdAt)}
                  active
                />
              )}
              {ticket.status === "IN_PROGRESS" && (
                <TimelineItem
                  label="In Progress"
                  time={timeAgo(ticket.updatedAt)}
                  active
                />
              )}
              {ticket.status === "RESOLVED" && (
                <TimelineItem
                  label="Issue Resolved"
                  time={timeAgo(ticket.updatedAt)}
                  active
                />
              )}
            </View>
          </View>

          <View style={styles.deleteWrap}>
            <Pressable onPress={handleDelete} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete ticket</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  scroll: { 
    paddingTop: Platform.OS === "ios" ? 100 : 80,
    paddingBottom: 40,
  },
  
  heroContainer: {
    width: width - 32,
    height: 240,
    backgroundColor: theme.surfaceAlt,
    marginBottom: 20,
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  
  content: { paddingHorizontal: 20 },
  
  statusBar: {
    marginBottom: 20,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: theme.border,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  
  section: { marginBottom: 24 },
  
  location: {
    color: theme.text,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
    fontFamily: TITLE_FONT,
  },
  room: {
    color: theme.textSoft,
    fontSize: 16,
    fontWeight: "500",
    marginTop: 4,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    backgroundColor: theme.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  badgeText: {
    color: theme.textSoft,
    fontSize: 12,
    fontWeight: "600",
  },
  
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 20,
  },
  
  sectionTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
    fontFamily: TITLE_FONT,
  },
  
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  aiBadge: {
    backgroundColor: theme.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  aiBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  aiCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  aiSubtitle: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  aiSummaryText: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600",
  },
  
  descriptionText: {
    color: theme.textSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  
  assignmentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: theme.surface,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  assignmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  assignmentInitial: {
    color: theme.accent,
    fontSize: 16,
    fontWeight: "700",
  },
  assignmentName: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "600",
  },
  assignmentMeta: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  
  timeline: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 12,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.textMuted,
  },
  timelineDotActive: {
    backgroundColor: theme.accent,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "600",
  },
  timelineTime: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    color: theme.textMuted,
    fontSize: 14,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "600",
  },

  deleteWrap: {
    marginTop: 8,
    marginBottom: 20,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: theme.mode === "dark" ? "rgba(248, 113, 113, 0.45)" : "rgba(239, 68, 68, 0.35)",
    backgroundColor: theme.mode === "dark" ? "rgba(248, 113, 113, 0.15)" : "rgba(239, 68, 68, 0.08)",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    color: theme.mode === "dark" ? "#FCA5A5" : "#EF4444",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
