import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../constants/Colors';
import Card from '../components/common/Card';
import DatabaseService from '../services/DatabaseService';
import ColorAnalysisService from '../services/ColorAnalysisService';

const { width } = Dimensions.get('window');

const AnalysisScreen = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysisData();
  }, []);

  const loadAnalysisData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get last 30 days of entries
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];
      
      const entries = await DatabaseService.getColorEntriesInRange(startDate, today);
      
      if (entries.length === 0) {
        setAnalysisData(null);
        return;
      }

      // Calculate various analyses
      const weeklyTrend = ColorAnalysisService.analyzeWeeklyTrend(entries.slice(0, 7));
      const monthlyMixture = ColorAnalysisService.calculateColorMixture(entries);
      
      // Color frequency analysis
      const colorFrequency = {};
      entries.forEach(entry => {
        const colorKey = ColorAnalysisService.getClosestAppColor(entry.color_hex);
        colorFrequency[colorKey] = (colorFrequency[colorKey] || 0) + 1;
      });
      
      // Mood patterns
      const moodScores = entries.map(entry => ({
        date: entry.date,
        score: entry.mood_score,
        dayOfWeek: new Date(entry.date).getDay()
      }));
      
      // Weekly mood pattern
      const weeklyMoodPattern = Array(7).fill(0).map((_, dayIndex) => {
        const dayScores = moodScores.filter(item => item.dayOfWeek === dayIndex);
        return dayScores.length > 0 
          ? dayScores.reduce((sum, item) => sum + item.score, 0) / dayScores.length
          : 0;
      });
      
      setAnalysisData({
        entries,
        weeklyTrend,
        monthlyMixture,
        colorFrequency,
        moodScores,
        weeklyMoodPattern,
        totalDays: entries.length,
        averageMood: moodScores.reduce((sum, item) => sum + item.score, 0) / moodScores.length
      });
      
    } catch (error) {
      console.error('Error loading analysis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMoodTrend = () => {
    if (!analysisData?.weeklyTrend) return null;

    const { trendDirection, averageScore, consistency } = analysisData.weeklyTrend;
    
    let trendIcon = '📊';
    let trendText = 'Stable';
    let trendColor = Colors.systemGray;
    
    if (trendDirection === 'increasing') {
      trendIcon = '📈';
      trendText = 'Increasing';
      trendColor = Colors.systemGreen;
    } else if (trendDirection === 'decreasing') {
      trendIcon = '📉';
      trendText = 'Decreasing';
      trendColor = Colors.systemRed;
    }

    return (
      <Card style={styles.trendCard}>
        <Text style={styles.cardTitle}>Weekly Mood Trend</Text>
        <View style={styles.trendContainer}>
          <View style={styles.trendMain}>
            <Text style={styles.trendIcon}>{trendIcon}</Text>
            <View>
              <Text style={[styles.trendText, { color: trendColor }]}>
                {trendText}
              </Text>
              <Text style={styles.trendScore}>
                Average: {averageScore.toFixed(1)}/10
              </Text>
            </View>
          </View>
          <View style={styles.consistencyContainer}>
            <Text style={styles.consistencyLabel}>Consistency</Text>
            <View style={styles.consistencyBar}>
              <View 
                style={[
                  styles.consistencyFill,
                  { width: `${consistency * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.consistencyText}>
              %{Math.round(consistency * 100)}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderColorFrequency = () => {
    if (!analysisData?.colorFrequency) return null;

    const sortedColors = Object.entries(analysisData.colorFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return (
      <Card style={styles.frequencyCard}>
        <Text style={styles.cardTitle}>Most Selected Colors</Text>
        {sortedColors.map(([colorKey, count], index) => {
          const colorData = Colors.appColors[colorKey];
          const percentage = (count / analysisData.totalDays) * 100;
          
          return (
            <View key={colorKey} style={styles.colorFrequencyItem}>
              <View style={styles.colorFrequencyLeft}>
                <View style={[
                  styles.colorFrequencySwatch,
                  { backgroundColor: colorData?.hex || Colors.systemGray }
                ]} />
                <Text style={styles.colorFrequencyName}>
                  {colorData?.mood || colorKey}
                </Text>
              </View>
              <View style={styles.colorFrequencyRight}>
                <View style={styles.colorFrequencyBar}>
                  <View 
                    style={[
                      styles.colorFrequencyFill,
                      { 
                        width: `${percentage}%`,
                        backgroundColor: colorData?.hex || Colors.systemGray
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.colorFrequencyCount}>
                  {count} days
                </Text>
              </View>
            </View>
          );
        })}
      </Card>
    );
  };

  const renderWeeklyPattern = () => {
    if (!analysisData?.weeklyMoodPattern) return null;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const maxScore = Math.max(...analysisData.weeklyMoodPattern);

    return (
      <Card style={styles.patternCard}>
        <Text style={styles.cardTitle}>Weekly Mood Pattern</Text>
        <View style={styles.weeklyPatternContainer}>
          {analysisData.weeklyMoodPattern.map((score, index) => (
            <View key={index} style={styles.dayPattern}>
              <View style={styles.dayBar}>
                <View 
                  style={[
                    styles.dayBarFill,
                    { 
                      height: `${(score / maxScore) * 100}%`,
                      backgroundColor: score > 6 ? Colors.systemGreen :
                                     score > 4 ? Colors.systemYellow :
                                     Colors.systemRed
                    }
                  ]} 
                />
              </View>
              <Text style={styles.dayName}>{dayNames[index]}</Text>
              <Text style={styles.dayScore}>{score.toFixed(1)}</Text>
            </View>
          ))}
        </View>
      </Card>
    );
  };

  const renderInsights = () => {
    if (!analysisData) return null;

    const insights = [];
    
    // Mood consistency insight
    if (analysisData.weeklyTrend?.consistency > 0.8) {
      insights.push('Your mood is quite consistent. This is a sign of emotional stability!');
    } else if (analysisData.weeklyTrend?.consistency < 0.4) {
      insights.push('There is variety in your mood. This may be the natural rhythm of life.');
    }
    
    // Color diversity insight
    const colorCount = Object.keys(analysisData.colorFrequency).length;
    if (colorCount >= 7) {
      insights.push('Your color choices are very diverse. You have a creative and flexible approach.');
    } else if (colorCount <= 3) {
      insights.push('You prefer certain colors. This is a sign of a consistent personality.');
    }
    
    // Average mood insight
    if (analysisData.averageMood >= 7) {
      insights.push('You generally choose high-energy colors. You are in a positive period!');
    } else if (analysisData.averageMood <= 4) {
      insights.push('You prefer calmer colors. You may be going through a peaceful period.');
    }

    if (insights.length === 0) return null;

    return (
      <Card style={styles.insightsCard}>
        <Text style={styles.cardTitle}>Personal Insights</Text>
        {insights.map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <Text style={styles.insightIcon}>💡</Text>
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}
      </Card>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Preparing analysis...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!analysisData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No analysis yet</Text>
          <Text style={styles.emptyDescription}>
            You need to make color selections for at least a few days for analysis.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mood Analysis</Text>
          <Text style={styles.subtitle}>
            Your data from the last {analysisData.totalDays} days has been analyzed
          </Text>
        </View>

        {/* Mood Trend */}
        {renderMoodTrend()}

        {/* Color Frequency */}
        {renderColorFrequency()}

        {/* Weekly Pattern */}
        {renderWeeklyPattern()}

        {/* Insights */}
        {renderInsights()}
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
  subtitle: {
    ...Typography.subhead,
    color: Colors.secondaryLabel,
    textAlign: 'center',
  },
  cardTitle: {
    ...Typography.headline,
    color: Colors.label,
    marginBottom: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.secondaryLabel,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.title3,
    color: Colors.label,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 22,
  },
  trendCard: {
    margin: Spacing.md,
    marginTop: 0,
  },
  trendContainer: {
    // Container styles
  },
  trendMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  trendIcon: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  trendText: {
    ...Typography.title3,
    fontWeight: '600',
  },
  trendScore: {
    ...Typography.subhead,
    color: Colors.secondaryLabel,
    marginTop: Spacing.xs,
  },
  consistencyContainer: {
    // Consistency styles
  },
  consistencyLabel: {
    ...Typography.subhead,
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  consistencyBar: {
    height: 6,
    backgroundColor: Colors.systemGray5,
    borderRadius: 3,
    marginBottom: Spacing.xs,
  },
  consistencyFill: {
    height: '100%',
    backgroundColor: Colors.systemBlue,
    borderRadius: 3,
  },
  consistencyText: {
    ...Typography.caption1,
    color: Colors.secondaryLabel,
    textAlign: 'right',
  },
  frequencyCard: {
    margin: Spacing.md,
    marginTop: 0,
  },
  colorFrequencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  colorFrequencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorFrequencySwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  colorFrequencyName: {
    ...Typography.body,
    color: Colors.label,
    flex: 1,
  },
  colorFrequencyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
  },
  colorFrequencyBar: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.systemGray5,
    borderRadius: 2,
    marginRight: Spacing.sm,
  },
  colorFrequencyFill: {
    height: '100%',
    borderRadius: 2,
  },
  colorFrequencyCount: {
    ...Typography.caption1,
    color: Colors.secondaryLabel,
    width: 35,
    textAlign: 'right',
  },
  patternCard: {
    margin: Spacing.md,
    marginTop: 0,
  },
  weeklyPatternContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  dayPattern: {
    alignItems: 'center',
    flex: 1,
  },
  dayBar: {
    width: 20,
    height: 80,
    backgroundColor: Colors.systemGray5,
    borderRadius: 10,
    justifyContent: 'flex-end',
    marginBottom: Spacing.xs,
  },
  dayBarFill: {
    width: '100%',
    borderRadius: 10,
    minHeight: 4,
  },
  dayName: {
    ...Typography.caption1,
    color: Colors.secondaryLabel,
    marginBottom: 2,
  },
  dayScore: {
    ...Typography.caption2,
    color: Colors.tertiaryLabel,
  },
  insightsCard: {
    margin: Spacing.md,
    marginTop: 0,
    marginBottom: Spacing.xl,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  insightIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  insightText: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    flex: 1,
    lineHeight: 22,
  },
});

export default AnalysisScreen;


