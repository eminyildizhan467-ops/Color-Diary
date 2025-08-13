import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/Colors';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import DatabaseService from '../services/DatabaseService';
import ColorAnalysisService from '../services/ColorAnalysisService';

const { width } = Dimensions.get('window');
const CELL_SIZE = (width - 60) / 7; // 7 days per week, with margins

const ColorMapScreen = () => {
  const navigation = useNavigation();
  const [colorEntries, setColorEntries] = useState({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    loadColorEntries();
  }, [selectedYear, selectedMonth]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadColorEntries();
    }, [selectedYear, selectedMonth])
  );

  const loadColorEntries = async () => {
    setLoading(true);
    try {
      const startDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-01`;
      const endDate = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-31`;
      
      const entries = await DatabaseService.getColorEntriesInRange(startDate, endDate);
      

      
      // Convert array to object for easy lookup
      const entriesMap = {};
      entries.forEach(entry => {
        entriesMap[entry.date] = entry;
      });
      
      setColorEntries(entriesMap);
    } catch (error) {
      console.error('Error loading color entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDate = (day) => {
    return `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getMonthName = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const today = new Date().toISOString().split('T')[0];
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.emptyCell} />
      );
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(day);
      const entry = colorEntries[dateString];
      const isToday = dateString === today;
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            entry && { backgroundColor: entry.color_hex },
            isToday && styles.todayCell,
            entry && styles.filledCell
          ]}
          onPress={() => entry && setSelectedEntry(entry)}
        >
          <Text style={[
            styles.dayText,
            isToday && styles.todayText,
            entry && styles.filledDayText
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return days;
  };

  const renderMonthSelector = () => {
    return (
      <View style={styles.monthSelector}>
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => {
            if (selectedMonth === 0) {
              setSelectedMonth(11);
              setSelectedYear(selectedYear - 1);
            } else {
              setSelectedMonth(selectedMonth - 1);
            }
          }}
        >
          <Text style={styles.monthButtonText}>‹</Text>
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {getMonthName(selectedMonth)} {selectedYear}
        </Text>
        
        <TouchableOpacity
          style={styles.monthButton}
          onPress={() => {
            if (selectedMonth === 11) {
              setSelectedMonth(0);
              setSelectedYear(selectedYear + 1);
            } else {
              setSelectedMonth(selectedMonth + 1);
            }
          }}
        >
          <Text style={styles.monthButtonText}>›</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderWeekDays = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <View style={styles.weekDaysContainer}>
        {weekDays.map((day, index) => (
          <View key={index} style={styles.weekDayCell}>
            <Text style={styles.weekDayText}>{day}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderSelectedEntry = () => {
    if (!selectedEntry) return null;
    
    const analysis = ColorAnalysisService.analyzeColor(selectedEntry.color_hex);
    const date = new Date(selectedEntry.date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const today = new Date().toISOString().split('T')[0];
    const isToday = selectedEntry.date === today;
    
    const handleEditToday = () => {
      navigation.navigate('Home');
      setSelectedEntry(null);
    };
    
    return (
      <Card style={styles.selectedEntryCard}>
        <View style={styles.selectedEntryHeader}>
          <View style={[
            styles.selectedColorSwatch,
            { backgroundColor: selectedEntry.color_hex }
          ]} />
          <View style={styles.selectedEntryInfo}>
            <Text style={styles.selectedEntryDate}>
              {isToday ? '🎯 Today' : date}
            </Text>
            <Text style={styles.selectedEntryMood}>
              {analysis.colorKey === 'gray' ? 'Gray' :
               analysis.colorKey === 'yellow' ? 'Yellow' :
               analysis.colorKey === 'red' ? 'Red' :
               analysis.colorKey === 'blue' ? 'Blue' :
               analysis.colorKey === 'green' ? 'Green' :
               analysis.colorKey === 'purple' ? 'Purple' :
               analysis.colorKey === 'orange' ? 'Orange' :
               analysis.colorKey === 'pink' ? 'Pink' :
               analysis.colorKey === 'black' ? 'Black' :
               analysis.colorKey === 'white' ? 'White' : 
               analysis.colorKey} • {analysis.mood} • Energy: {analysis.intensity}/10
            </Text>
            <Text style={styles.selectedEntryHex}>
              {selectedEntry.color_hex.toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedEntry(null)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
        
        {selectedEntry.notes && (
          <Text style={styles.selectedEntryNotes}>
            "{selectedEntry.notes}"
          </Text>
        )}
        
        {isToday && (
          <View style={styles.todayActions}>
            <Button
              title="Edit Today's Color"
              onPress={handleEditToday}
              variant="secondary"
              size="small"
              style={styles.editTodayButton}
            />
          </View>
        )}
      </Card>
    );
  };

  const getMonthStats = () => {
    const entries = Object.values(colorEntries);
    if (entries.length === 0) return null;
    
    const totalDays = entries.length;
    const totalScore = entries.reduce((sum, entry) => sum + entry.mood_score, 0);
    const averageScore = Math.round(totalScore / totalDays);
    
    // Find most common color
    const colorCounts = {};
    entries.forEach(entry => {
      const colorKey = ColorAnalysisService.getClosestAppColor(entry.color_hex);
      colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
    });
    
    const dominantColor = Object.keys(colorCounts).reduce((a, b) => 
      colorCounts[a] > colorCounts[b] ? a : b
    );
    
    return {
      totalDays,
      averageScore,
      dominantColor,
      colorVariety: Object.keys(colorCounts).length
    };
  };

  const stats = getMonthStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Month Selector */}
        {renderMonthSelector()}
        
        {/* Month Stats */}
        {stats && (
          <Card style={styles.statsCard}>
            <Text style={styles.statsTitle}>Monthly Summary</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalDays}</Text>
                <Text style={styles.statLabel}>Days</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.averageScore}/10</Text>
                <Text style={styles.statLabel}>Avg. Energy</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.colorVariety}</Text>
                <Text style={styles.statLabel}>Color Variety</Text>
              </View>
              <View style={styles.statItem}>
                <View style={[
                  styles.dominantColorSwatch,
                  { backgroundColor: Colors.appColors[stats.dominantColor]?.hex || Colors.systemGray }
                ]} />
                <Text style={styles.statLabel}>Dominant</Text>
              </View>
            </View>
          </Card>
        )}
        
        {/* Calendar */}
        <Card style={styles.calendarCard}>
          {/* Week Days Header */}
          {renderWeekDays()}
          
          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {renderCalendarGrid()}
          </View>
          
          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={styles.legendEmptyCell} />
              <Text style={styles.legendText}>No color selected</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendFilledCell, { backgroundColor: Colors.systemBlue }]} />
              <Text style={styles.legendText}>Color selected</Text>
            </View>
          </View>
        </Card>
        
        {/* Selected Entry Details */}
        {renderSelectedEntry()}
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
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  monthButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.secondarySystemBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonText: {
    ...Typography.title2,
    color: Colors.systemBlue,
    fontWeight: '600',
  },
  monthTitle: {
    ...Typography.title1,
    color: Colors.label,
    fontWeight: '600',
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
  dominantColorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  calendarCard: {
    margin: Spacing.md,
    marginTop: 0,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  weekDayCell: {
    width: CELL_SIZE,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  weekDayText: {
    ...Typography.caption1,
    color: Colors.secondaryLabel,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  todayCell: {
    borderWidth: 3,
    borderColor: Colors.systemBlue,
    borderRadius: BorderRadius.sm,
  },
  filledCell: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  dayText: {
    ...Typography.caption2,
    color: Colors.secondaryLabel,
  },
  todayText: {
    color: Colors.systemBlue,
    fontWeight: '700',
    textShadowColor: Colors.systemBackground,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  filledDayText: {
    color: Colors.systemBackground,
    fontWeight: '700',
    textShadowColor: Colors.label,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
  },
  legendText: {
    ...Typography.caption1,
    color: Colors.secondaryLabel,
    marginLeft: Spacing.xs,
  },
  legendEmptyCell: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.systemGray4,
    backgroundColor: Colors.systemBackground,
  },
  legendFilledCell: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  selectedEntryCard: {
    margin: Spacing.md,
    marginTop: 0,
  },
  selectedEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedColorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.separator,
    marginRight: Spacing.md,
  },
  selectedEntryInfo: {
    flex: 1,
  },
  selectedEntryDate: {
    ...Typography.headline,
    color: Colors.label,
  },
  selectedEntryMood: {
    ...Typography.subhead,
    color: Colors.secondaryLabel,
    marginTop: Spacing.xs,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.systemGray5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    ...Typography.footnote,
    color: Colors.secondaryLabel,
  },
  selectedEntryNotes: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    marginTop: Spacing.md,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  selectedEntryHex: {
    ...Typography.caption1,
    color: Colors.systemGray,
    fontFamily: 'Menlo',
    marginTop: Spacing.xs,
  },
  todayActions: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.separator,
  },
  editTodayButton: {
    marginTop: 0,
  },
});

export default ColorMapScreen;


