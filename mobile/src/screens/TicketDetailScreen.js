import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ticketAPI } from '../services/api';

export default function TicketDetailScreen({ route, navigation }) {
  const { ticketId } = route.params;
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTicket();
  }, []);

  const loadTicket = async () => {
    try {
      const response = await ticketAPI.getTicketById(ticketId);
      setTicket(response.ticket);
    } catch (error) {
      console.error('Error loading ticket:', error);
      Alert.alert('Error', 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const response = await ticketAPI.updateStatus(
        ticketId,
        newStatus,
        `Status changed to ${newStatus}`
      );
      setTicket(response.ticket);
      Alert.alert('Success', `Ticket status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update ticket status');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Ticket not found</Text>
      </View>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW': return '#3b82f6';
      case 'IN_REVIEW': return '#f59e0b';
      case 'IN_PROGRESS': return '#8b5cf6';
      case 'RESOLVED': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'High': return '#dc2626';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {ticket.building} - Room {ticket.room}
        </Text>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: getStatusColor(ticket.status) }]}>
            <Text style={styles.badgeText}>{ticket.status}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getSeverityColor(ticket.severity) }]}>
            <Text style={styles.badgeText}>{ticket.severity}</Text>
          </View>
        </View>
      </View>

      {/* Images */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Issue Photo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {ticket.imageUrls.map((url, index) => (
            <Image key={index} source={{ uri: url }} style={styles.image} />
          ))}
        </ScrollView>
      </View>

      {/* AI Analysis */}
      {ticket.aiSummary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Analysis</Text>
          <View style={styles.card}>
            <Text style={styles.label}>Category</Text>
            <Text style={styles.value}>{ticket.category}</Text>

            <Text style={styles.label}>Summary</Text>
            <Text style={styles.value}>{ticket.aiSummary}</Text>

            {ticket.facilitiesDescription && (
              <>
                <Text style={styles.label}>Facilities Description</Text>
                <Text style={styles.value}>{ticket.facilitiesDescription}</Text>
              </>
            )}
          </View>
        </View>
      )}

      {/* Follow-up Questions */}
      {ticket.followUpQuestions && ticket.followUpQuestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow-up Questions</Text>
          <View style={styles.card}>
            {ticket.followUpQuestions.map((q, index) => (
              <Text key={index} style={styles.listItem}>
                • {q}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Safety Notes */}
      {ticket.safetyNotes && ticket.safetyNotes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Safety Notes</Text>
          <View style={[styles.card, styles.warningCard]}>
            {ticket.safetyNotes.map((note, index) => (
              <Text key={index} style={styles.warningText}>
                • {note}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Status History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Timeline</Text>
        <View style={styles.card}>
          {ticket.statusHistory.map((item, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: getStatusColor(item.status) }]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStatus}>{item.status}</Text>
                <Text style={styles.timelineDate}>
                  {new Date(item.timestamp).toLocaleString()}
                </Text>
                {item.note && (
                  <Text style={styles.timelineNote}>{item.note}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Action Buttons (Demo Only) */}
      {ticket.status !== 'RESOLVED' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Status (Demo)</Text>
          <View style={styles.actionButtons}>
            {ticket.status === 'NEW' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#f59e0b' }]}
                onPress={() => updateStatus('IN_REVIEW')}
              >
                <Text style={styles.actionButtonText}>Mark In Review</Text>
              </TouchableOpacity>
            )}
            {ticket.status === 'IN_REVIEW' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#8b5cf6' }]}
                onPress={() => updateStatus('IN_PROGRESS')}
              >
                <Text style={styles.actionButtonText}>Start Progress</Text>
              </TouchableOpacity>
            )}
            {ticket.status === 'IN_PROGRESS' && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#10b981' }]}
                onPress={() => updateStatus('RESOLVED')}
              >
                <Text style={styles.actionButtonText}>Mark Resolved</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* After Images */}
      {ticket.afterImageUrls && ticket.afterImageUrls.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ After Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {ticket.afterImageUrls.map((url, index) => (
              <Image key={index} source={{ uri: url }} style={styles.image} />
            ))}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  image: {
    width: 300,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#e5e7eb',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
  },
  warningCard: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  listItem: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 8,
    lineHeight: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  timelineDate: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  timelineNote: {
    fontSize: 13,
    color: '#374151',
    marginTop: 4,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
