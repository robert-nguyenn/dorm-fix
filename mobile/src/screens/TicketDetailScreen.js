import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  SafeAreaView,
  Dimensions,
  Platform,
} from "react-native";

const { width } = Dimensions.get("window");

const MOCK_DETAIL = {
  _id: "1",
  building: "Pearsons Hall",
  room: "214",
  category: "Plumbing",
  severity: "High",
  status: "IN_PROGRESS",
  imageUrls: [
    "https://images.unsplash.com/photo-1581579186983-3e0b8b3d8df0?auto=format&fit=crop&w=800&q=60",
  ],
  aiSummary: "Sink is leaking under the cabinet; water pooling near pipe connection.",
  description: "There's a significant leak coming from under the bathroom sink. Water is pooling on the floor and the cabinet is getting damaged. This needs immediate attention.",
  createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
  updatedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  assignedTo: "Maintenance Team A",
};

const SEVERITY_COLORS = {
  High: { bg: "#FEF2F2", border: "#FCA5A5", text: "#DC2626" },
  Medium: { bg: "#FFFBEB", border: "#FCD34D", text: "#D97706" },
  Low: { bg: "#F0FDF4", border: "#86EFAC", text: "#16A34A" },
};

const STATUS_INFO = {
  NEW: { label: "New Request", color: "#2563EB", bg: "#EFF6FF" },
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
  const ticket = MOCK_DETAIL;
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

          {ticket.description && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.descriptionText}>{ticket.description}</Text>
              </View>
            </>
          )}

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Assignment</Text>
            <View style={styles.assignmentCard}>
              <View style={styles.assignmentIcon}>
                <Text style={styles.assignmentInitial}>
                  {ticket.assignedTo?.[0] || "?"}
                </Text>
              </View>
              <View>
                <Text style={styles.assignmentName}>{ticket.assignedTo || "Unassigned"}</Text>
                <Text style={styles.assignmentMeta}>
                  Updated {timeAgo(ticket.updatedAt)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <View style={styles.timeline}>
              <TimelineItem
                label="Request Created"
                time={timeAgo(ticket.createdAt)}
                active
              />
              <TimelineItem
                label="AI Analysis Complete"
                time={timeAgo(ticket.createdAt)}
                active
              />
              {ticket.status !== "NEW" && (
                <TimelineItem
                  label="Assigned to Team"
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
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  scroll: { 
    paddingTop: Platform.OS === "ios" ? 100 : 80,
    paddingBottom: 40,
  },
  
  heroContainer: {
    width: width,
    height: 240,
    backgroundColor: "#E2E8F0",
    marginBottom: 20,
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
    borderRadius: 8,
    alignSelf: "flex-start",
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
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
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
  },
  
  summaryCard: {
    backgroundColor: "#EFF6FF",
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
    padding: 14,
    borderRadius: 8,
  },
  summaryText: {
    color: "#1E40AF",
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
    backgroundColor: "#3B82F6",
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
});