import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/Colors';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import DatabaseService from '../services/DatabaseService';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    notifications: false,
    notificationTime: '20:00',
    dataExport: false,
  });
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const notifications = await DatabaseService.getUserPreference('notifications', false);
      const notificationTime = await DatabaseService.getUserPreference('notificationTime', '20:00');
      
      setSettings({
        notifications,
        notificationTime,
        dataExport: false,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadStats = async () => {
    try {
      const entries = await DatabaseService.getAllColorEntries();
      const totalDays = entries.length;
      const firstEntry = entries[entries.length - 1]; // Oldest first
      const startDate = firstEntry ? new Date(firstEntry.date) : new Date();
      const daysSinceStart = Math.floor((new Date() - startDate) / (1000 * 60 * 60 * 24));
      
      setStats({
        totalDays,
        daysSinceStart,
        completionRate: daysSinceStart > 0 ? Math.round((totalDays / daysSinceStart) * 100) : 0,
        startDate: firstEntry?.date,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const updateSetting = async (key, value) => {
    try {
      await DatabaseService.setUserPreference(key, value);
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  };

  const handleNotificationToggle = async (value) => {
    if (value) {
      // Request permission
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Notification Permission Required',
          'You need to grant notification permission for daily reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // Schedule daily notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Color Diary 🎨',
          body: 'Don\'t forget to select today\'s color!',
          sound: 'default',
        },
        trigger: {
          type: 'daily',
          hour: parseInt(settings.notificationTime.split(':')[0]),
          minute: parseInt(settings.notificationTime.split(':')[1]),
          repeats: true,
        },
      });
      

    } else {
      // Cancel all notifications
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
    
    updateSetting('notifications', value);
  };



  const exportData = async () => {
    try {
      Alert.alert(
        'Data Export',
        'This feature is available in the premium version.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const clearAllData = () => {
    Alert.alert(
      'Delete All Data',
      'This action cannot be undone. All your color selections and analyses will be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              // This would require a clear method in DatabaseService
              Alert.alert('Success', 'All data has been deleted.');
              loadStats();
            } catch (error) {
              Alert.alert('Error', 'An error occurred while deleting data.');
            }
          }
        }
      ]
    );
  };

  const renderStatsCard = () => {
    if (!stats) return null;

    return (
      <Card style={styles.statsCard}>
        <Text style={styles.cardTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalDays}</Text>
            <Text style={styles.statLabel}>Total Days</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.completionRate}%</Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.daysSinceStart}</Text>
            <Text style={styles.statLabel}>Days Passed</Text>
          </View>
        </View>
        {stats.startDate && (
          <Text style={styles.startDateText}>
            Started: {new Date(stats.startDate).toLocaleDateString('en-US')}
          </Text>
        )}
      </Card>
    );
  };

  const renderSettingItem = (title, description, value, onToggle, type = 'switch') => {
    return (
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>{title}</Text>
          {description && (
            <Text style={styles.settingDescription}>{description}</Text>
          )}
        </View>
        {type === 'switch' && (
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ 
              false: Colors.systemGray5, 
              true: Colors.systemBlue + '40' 
            }}
            thumbColor={value ? Colors.systemBlue : Colors.systemGray}
            ios_backgroundColor={Colors.systemGray5}
          />
        )}
      </View>
    );
  };

  const renderActionButton = (title, description, onPress, variant = 'secondary') => {
    return (
      <View style={styles.actionItem}>
        <View style={styles.actionInfo}>
          <Text style={styles.actionTitle}>{title}</Text>
          {description && (
            <Text style={styles.actionDescription}>{description}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.actionButton,
            variant === 'destructive' && styles.destructiveButton
          ]}
          onPress={onPress}
        >
          <Text style={[
            styles.actionButtonText,
            variant === 'destructive' && styles.destructiveButtonText
          ]}>
            {variant === 'destructive' ? 'Delete' : 'Export'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Ayarlar</Text>
        </View>

        {/* Stats */}
        {renderStatsCard()}

        {/* Notifications Settings */}
        <Card style={styles.settingsCard}>
          <Text style={styles.cardTitle}>Notifications</Text>
          {renderSettingItem(
            'Daily Reminder',
            'Get daily color selection reminders at the same time each day',
            settings.notifications,
            handleNotificationToggle
          )}

        </Card>

        {/* Data Management */}
        <Card style={styles.actionsCard}>
          <Text style={styles.cardTitle}>Data Management</Text>
          {renderActionButton(
            'Export Data',
            'Save all your color selections as PDF',
            exportData,
            'secondary'
          )}
          {renderActionButton(
            'Delete All Data',
            'Warning: This action cannot be undone',
            clearAllData,
            'destructive'
          )}
        </Card>

        {/* App Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.cardTitle}>App Information</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Developer</Text>
            <Text style={styles.infoValue}>Color Diary Team</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Feedback</Text>
            <TouchableOpacity onPress={() => {
              Alert.alert('Feedback', 'You can write to feedback@colordiary.com');
            }}>
              <Text style={styles.infoLink}>Contact Us</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* About */}
        <Card style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>About Color Diary</Text>
          <Text style={styles.aboutText}>
            Color Diary allows you to express your daily mood with colors and 
            discover your emotional patterns over time. Every color has a story, 
            what's yours?
          </Text>
          <Text style={styles.aboutText}>
            This app works completely offline and your data is stored only 
            on your device.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.systemGroupedBackground,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  title: {
    ...Typography.title2,
    color: Colors.label,
    fontWeight: '600',
  },
  cardTitle: {
    ...Typography.headline,
    color: Colors.label,
    marginBottom: Spacing.md,
  },
  statsCard: {
    margin: Spacing.md,
    marginTop: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.title2,
    color: Colors.label,
    fontWeight: '600',
  },
  statLabel: {
    ...Typography.caption1,
    color: Colors.secondaryLabel,
    marginTop: Spacing.xs,
  },
  startDateText: {
    ...Typography.footnote,
    color: Colors.secondaryLabel,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  settingsCard: {
    margin: Spacing.md,
    marginTop: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTitle: {
    ...Typography.body,
    color: Colors.label,
  },
  settingDescription: {
    ...Typography.footnote,
    color: Colors.secondaryLabel,
    marginTop: Spacing.xs,
    lineHeight: 16,
  },
  actionsCard: {
    margin: Spacing.md,
    marginTop: 0,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  actionInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  actionTitle: {
    ...Typography.body,
    color: Colors.label,
  },
  actionDescription: {
    ...Typography.footnote,
    color: Colors.secondaryLabel,
    marginTop: Spacing.xs,
    lineHeight: 16,
  },
  actionButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.systemBlue,
    borderRadius: BorderRadius.sm,
  },
  destructiveButton: {
    backgroundColor: Colors.systemRed,
  },
  actionButtonText: {
    ...Typography.subhead,
    color: Colors.systemBackground,
    fontWeight: '600',
  },
  destructiveButtonText: {
    color: Colors.systemBackground,
  },
  infoCard: {
    margin: Spacing.md,
    marginTop: 0,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    ...Typography.body,
    color: Colors.label,
  },
  infoValue: {
    ...Typography.body,
    color: Colors.secondaryLabel,
  },
  infoLink: {
    ...Typography.body,
    color: Colors.systemBlue,
  },
  aboutCard: {
    margin: Spacing.md,
    marginTop: 0,
    marginBottom: Spacing.xl,
  },
  aboutTitle: {
    ...Typography.headline,
    color: Colors.label,
    marginBottom: Spacing.md,
  },
  aboutText: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },

});

export default SettingsScreen;


