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
} from "react-native";
import { ticketAPI } from "../services/api";

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

export default function TicketDetailScreen({ route }) {
  const { id } = route.params;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0EA5A4" />
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
            <Text style={styles.sectionTitle}>AI Summary</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>{ticket.aiSummary}</Text>
            </View>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TimelineItem({ label, time, active }) {
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
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F7FB" },
  scroll: { 
    paddingTop: Platform.OS === "ios" ? 100 : 80,
    paddingBottom: 40,
  },
  
  heroContainer: {
    width: width - 32,
    height: 240,
    backgroundColor: "#E6ECF5",
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
    borderColor: "rgba(15, 23, 42, 0.08)",
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
    color: "#0F172A",
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
    fontFamily: TITLE_FONT,
  },
  room: {
    color: "#64748B",
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
    backgroundColor: "#F6FAFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  badgeText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
  },
  
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 20,
  },
  
  sectionTitle: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
    fontFamily: TITLE_FONT,
  },
  
  summaryCard: {
    backgroundColor: "#E6FFFB",
    borderLeftWidth: 3,
    borderLeftColor: "#0EA5A4",
    padding: 14,
    borderRadius: 10,
  },
  summaryText: {
    color: "#0F766E",
    fontSize: 14,
    lineHeight: 20,
  },
  
  descriptionText: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 22,
  },
  
  assignmentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  assignmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  assignmentInitial: {
    color: "#3B82F6",
    fontSize: 16,
    fontWeight: "700",
  },
  assignmentName: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "600",
  },
  assignmentMeta: {
    color: "#64748B",
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
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#CBD5E1",
  },
  timelineDotActive: {
    backgroundColor: "#0EA5A4",
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "600",
  },
  timelineTime: {
    color: "#64748B",
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
    color: "#64748B",
    fontSize: 14,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 16,
    fontWeight: "600",
  },
});
