import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/Colors';
import Card from '../components/common/Card';
import DatabaseService from '../services/DatabaseService';
import ColorAnalysisService from '../services/ColorAnalysisService';

const MixtureScreen = () => {
  const [mixtures, setMixtures] = useState({
    daily: null,
    weekly: null,
    monthly: null,
    yearly: null,
  });
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMixtures();
  }, []);

  const loadMixtures = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Daily mixture
      const dailyMixture = await DatabaseService.calculateDailyMixture(today);
      
      // Weekly mixture (last 7 days)
      const weekStart = getWeekStart(today);
      const weekEntries = await DatabaseService.getColorEntriesInRange(weekStart, today);
      const weeklyMixture = weekEntries.length > 0 ? 
        ColorAnalysisService.calculateColorMixture(weekEntries) : null;
      
      // Monthly mixture
      const monthStart = `${today.substring(0, 7)}-01`;
      const monthEntries = await DatabaseService.getColorEntriesInRange(monthStart, today);
      const monthlyMixture = monthEntries.length > 0 ?
        ColorAnalysisService.calculateColorMixture(monthEntries) : null;
      
      // Yearly mixture
      const yearStart = `${today.substring(0, 4)}-01-01`;
      const yearEntries = await DatabaseService.getColorEntriesInRange(yearStart, today);
      const yearlyMixture = yearEntries.length > 0 ?
        ColorAnalysisService.calculateColorMixture(yearEntries) : null;
      
      setMixtures({
        daily: dailyMixture,
        weekly: weeklyMixture,
        monthly: monthlyMixture,
        yearly: yearlyMixture,
      });
    } catch (error) {
      console.error('Error loading mixtures:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  };

  const getPeriodTitle = (period) => {
    switch (period) {
      case 'daily': return 'Daily Mixture';
      case 'weekly': return 'Weekly Mixture';
      case 'monthly': return 'Monthly Mixture';
      case 'yearly': return 'Yearly Mixture';
      default: return 'Mixture';
    }
  };

  const getPeriodDescription = (period) => {
    switch (period) {
      case 'daily': return 'Mixture of all colors you have selected so far';
      case 'weekly': return 'Mixture of colors you selected in the last 7 days';
      case 'monthly': return 'Mixture of colors you selected this month';
      case 'yearly': return 'Mixture of colors you selected this year';
      default: return '';
    }
  };

  const renderPeriodSelector = () => {
    const periods = [
      { key: 'daily', label: 'Daily' },
      { key: 'weekly', label: 'Weekly' },
      { key: 'monthly', label: 'Monthly' },
      { key: 'yearly', label: 'Yearly' },
    ];

    return (
      <View style={styles.periodSelector}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              selectedPeriod === period.key && styles.selectedPeriodButton,
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Text
              style={[
                styles.periodButtonText,
                selectedPeriod === period.key && styles.selectedPeriodButtonText,
              ]}
            >
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderMixture = (mixture) => {
    if (!mixture) {
      return (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No data yet</Text>
          <Text style={styles.emptyDescription}>
            No color selection has been made for this period yet.
          </Text>
        </Card>
      );
    }

    return (
      <View>
        {/* Main Mixture Display */}
        <Card style={styles.mixtureCard}>
          <View style={styles.mixtureHeader}>
            <View style={[
              styles.mixtureSwatch,
              { backgroundColor: mixture.mixedColor }
            ]} />
            <View style={styles.mixtureInfo}>
              <Text style={styles.mixtureColor}>
                {mixture.mixedColor?.toUpperCase()}
              </Text>
              <Text style={styles.mixtureEntries}>
                Mixture of {mixture.totalEntries} colors
              </Text>
            </View>
          </View>
          
          {mixture.analysis && (
            <Text style={styles.mixtureInterpretation}>
              {mixture.analysis.interpretation}
            </Text>
          )}
        </Card>

        {/* Mixture Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Mixture Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {mixture.averageIntensity || mixture.averageScore}/10
              </Text>
              <Text style={styles.statLabel}>Ortalama Enerji</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {mixture.dominantWarmth === 'warm' ? '🔥' :
                 mixture.dominantWarmth === 'cool' ? '❄️' : '⚖️'}
              </Text>
              <Text style={styles.statLabel}>Dominant Warmth</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mixture.totalEntries}</Text>
              <Text style={styles.statLabel}>Total Colors</Text>
            </View>
          </View>
          
          {mixture.colorBalance && (
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceTitle}>Color Balance</Text>
              <View style={styles.balanceBar}>
                <View 
                  style={[
                    styles.balanceSegment, 
                    styles.warmSegment,
                    { flex: mixture.colorBalance.warm }
                  ]} 
                />
                <View 
                  style={[
                    styles.balanceSegment, 
                    styles.coolSegment,
                    { flex: mixture.colorBalance.cool }
                  ]} 
                />
                <View 
                  style={[
                    styles.balanceSegment, 
                    styles.neutralSegment,
                    { flex: mixture.colorBalance.neutral }
                  ]} 
                />
              </View>
              <View style={styles.balanceLabels}>
                <Text style={styles.balanceLabel}>
                  🔥 {mixture.colorBalance.warm}
                </Text>
                <Text style={styles.balanceLabel}>
                  ❄️ {mixture.colorBalance.cool}
                </Text>
                <Text style={styles.balanceLabel}>
                  ⚖️ {mixture.colorBalance.neutral}
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Recommendations */}
        {mixture.analysis?.recommendations && mixture.analysis.recommendations.length > 0 && (
          <Card style={styles.recommendationsCard}>
            <Text style={styles.recommendationsTitle}>Recommendations</Text>
            {mixture.analysis.recommendations.map((recommendation, index) => (
              <Text key={index} style={styles.recommendationText}>
                • {recommendation}
              </Text>
            ))}
          </Card>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{getPeriodTitle(selectedPeriod)}</Text>
          <Text style={styles.description}>
            {getPeriodDescription(selectedPeriod)}
          </Text>
        </View>

        {/* Period Selector */}
        {renderPeriodSelector()}

        {/* Mixture Display */}
        {renderMixture(mixtures[selectedPeriod])}
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
    marginBottom: Spacing.xs,
  },
  description: {
    ...Typography.subhead,
    color: Colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 20,
  },
  periodSelector: {
    flexDirection: 'row',
    margin: Spacing.md,
    backgroundColor: Colors.secondarySystemBackground,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  selectedPeriodButton: {
    backgroundColor: Colors.systemBackground,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    ...Typography.subhead,
    color: Colors.secondaryLabel,
    fontWeight: '500',
  },
  selectedPeriodButtonText: {
    color: Colors.label,
    fontWeight: '600',
  },
  mixtureCard: {
    margin: Spacing.md,
    marginTop: 0,
  },
  mixtureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  mixtureSwatch: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: Colors.separator,
    marginRight: Spacing.md,
  },
  mixtureInfo: {
    flex: 1,
  },
  mixtureColor: {
    ...Typography.title3,
    color: Colors.label,
    fontFamily: 'Menlo',
    fontWeight: '600',
  },
  mixtureEntries: {
    ...Typography.subhead,
    color: Colors.secondaryLabel,
    marginTop: Spacing.xs,
  },
  mixtureInterpretation: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    lineHeight: 24,
  },
  statsCard: {
    margin: Spacing.md,
    marginTop: 0,
  },
  statsTitle: {
    ...Typography.headline,
    color: Colors.label,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
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
  balanceContainer: {
    marginTop: Spacing.md,
  },
  balanceTitle: {
    ...Typography.subhead,
    color: Colors.label,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  balanceBar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  balanceSegment: {
    height: '100%',
  },
  warmSegment: {
    backgroundColor: Colors.systemOrange,
  },
  coolSegment: {
    backgroundColor: Colors.systemBlue,
  },
  neutralSegment: {
    backgroundColor: Colors.systemGray,
  },
  balanceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  balanceLabel: {
    ...Typography.caption1,
    color: Colors.secondaryLabel,
  },
  recommendationsCard: {
    margin: Spacing.md,
    marginTop: 0,
  },
  recommendationsTitle: {
    ...Typography.headline,
    color: Colors.label,
    marginBottom: Spacing.sm,
  },
  recommendationText: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    marginBottom: Spacing.xs,
    lineHeight: 22,
  },
  emptyCard: {
    margin: Spacing.md,
    marginTop: 0,
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.headline,
    color: Colors.label,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default MixtureScreen;


