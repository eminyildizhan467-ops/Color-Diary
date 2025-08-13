import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing, BorderRadius } from '../constants/Colors';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import ColorPicker from '../components/ColorPicker';
import DatabaseService from '../services/DatabaseService';
import ColorAnalysisService from '../services/ColorAnalysisService';

const HomeScreen = () => {
  const [selectedColor, setSelectedColor] = useState('#FF0000');
  const [notes, setNotes] = useState('');
  const [todayEntry, setTodayEntry] = useState(null);
  const [colorAnalysis, setColorAnalysis] = useState(null);
  const [dailyMixture, setDailyMixture] = useState(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadTodayEntry();
    loadDailyMixture();
  }, []);

  const loadTodayEntry = async () => {
    try {
      const entry = await DatabaseService.getColorEntry(today);
      if (entry) {
        setTodayEntry(entry);
        setSelectedColor(entry.color_hex);
        setNotes(entry.notes || '');
        analyzeColor(entry.color_hex);
      }
    } catch (error) {
      console.error('Error loading today entry:', error);
    }
  };

  const loadDailyMixture = async () => {
    try {
      const mixture = await DatabaseService.calculateDailyMixture(today);
      setDailyMixture(mixture);
    } catch (error) {
      console.error('Error loading daily mixture:', error);
    }
  };

  const analyzeColor = (color) => {
    const analysis = ColorAnalysisService.analyzeColor(color);
    setColorAnalysis(analysis);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    analyzeColor(color);
    // Haptic feedback for iOS
    Haptics.selectionAsync();
  };

  const saveColorEntry = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      await DatabaseService.saveColorEntry(today, selectedColor, notes);
      setTodayEntry({
        date: today,
        color_hex: selectedColor,
        notes,
        mood_score: colorAnalysis?.intensity || 5
      });
      
      // Reload daily mixture after saving
      await loadDailyMixture();
      
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Success! 🎨',
        'Today\'s color has been saved.',
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('Error saving color entry:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Color could not be saved. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (intensity) => {
    if (intensity >= 8) return '🔥';
    if (intensity >= 6) return '😊';
    if (intensity >= 4) return '😌';
    return '😴';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.flex} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.dateText}>{formatDate(today)}</Text>
            <Text style={styles.titleText}>
              {todayEntry ? 'Today\'s Color' : 'How Are You Feeling Today?'}
            </Text>
          </View>

          {/* Color Picker Card */}
          <Card variant="elevated" style={[styles.pickerCard, todayEntry && styles.disabledPickerCard]}>
            {!todayEntry ? (
              <ColorPicker
                onColorChange={handleColorChange}
                initialColor={selectedColor}
              />
            ) : (
              <View style={styles.disabledPicker}>
                <View style={styles.disabledPickerOverlay} />
                <ColorPicker
                  onColorChange={() => {}} // Disabled
                  initialColor={selectedColor}
                />
                <View style={styles.dailyLimitMessage}>
                  <Text style={styles.dailyLimitTitle}>
                    🎯 Daily Color Selection Complete
                  </Text>
                  <Text style={styles.dailyLimitText}>
                    You can only select 1 color per day.{'\n'}
                    You can select a new color tomorrow ({new Date(Date.now() + 24*60*60*1000).toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}).
                  </Text>
                </View>
              </View>
            )}
          </Card>

          {/* Selected Color Display */}
          <Card style={styles.colorDisplayCard}>
            <View style={styles.colorDisplay}>
              <View style={[styles.colorSwatch, { backgroundColor: selectedColor }]} />
              <View style={styles.colorInfo}>
                <Text style={styles.colorHex}>{selectedColor.toUpperCase()}</Text>
                {colorAnalysis && (
                  <>
                    <Text style={styles.colorName}>
                      {colorAnalysis.colorKey === 'gray' ? 'Gray' :
                       colorAnalysis.colorKey === 'yellow' ? 'Yellow' :
                       colorAnalysis.colorKey === 'red' ? 'Red' :
                       colorAnalysis.colorKey === 'blue' ? 'Blue' :
                       colorAnalysis.colorKey === 'green' ? 'Green' :
                       colorAnalysis.colorKey === 'purple' ? 'Purple' :
                       colorAnalysis.colorKey === 'orange' ? 'Orange' :
                       colorAnalysis.colorKey === 'pink' ? 'Pink' :
                       colorAnalysis.colorKey === 'black' ? 'Black' :
                       colorAnalysis.colorKey === 'white' ? 'White' : 
                       colorAnalysis.colorKey}
                    </Text>
                    <Text style={styles.colorMood}>
                      {getMoodEmoji(colorAnalysis.intensity)} {colorAnalysis.mood}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </Card>

          {/* Color Analysis */}
          {colorAnalysis && (
            <Card style={styles.analysisCard}>
              <Text style={styles.analysisTitle}>Instant Mood Analysis</Text>
              <Text style={styles.analysisText}>{colorAnalysis.analysis}</Text>
              
              <View style={styles.analysisMetrics}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Energy</Text>
                  <Text style={styles.metricValue}>{colorAnalysis.intensity}/10</Text>
                </View>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>Warmth</Text>
                  <Text style={styles.metricValue}>
                    {colorAnalysis.warmth === 'warm' ? '🔥' : 
                     colorAnalysis.warmth === 'cool' ? '❄️' : '⚖️'}
                  </Text>
                </View>
              </View>

              {colorAnalysis.suggestions.length > 0 && (
                <View style={styles.suggestions}>
                  <Text style={styles.suggestionsTitle}>Suggestions</Text>
                  {colorAnalysis.suggestions.map((suggestion, index) => (
                    <Text key={index} style={styles.suggestionText}>
                      • {suggestion}
                    </Text>
                  ))}
                </View>
              )}
            </Card>
          )}

          {/* Daily Mixture */}
          {dailyMixture && dailyMixture.totalEntries > 1 && (
            <Card style={styles.mixtureCard}>
              <Text style={styles.mixtureTitle}>Daily Color Mixture</Text>
              <View style={styles.mixtureDisplay}>
                <View style={[styles.mixtureSwatch, { backgroundColor: dailyMixture.mixedColor }]} />
                <View style={styles.mixtureInfo}>
                  <Text style={styles.mixtureText}>
                    Mixture of {dailyMixture.totalEntries} colors
                  </Text>
                  <Text style={styles.mixtureScore}>
                    Average energy: {dailyMixture.averageScore}/10
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {/* Notes Input */}
          <Card style={styles.notesCard}>
            <Text style={styles.notesTitle}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="You can write how you feel today..."
              placeholderTextColor={Colors.placeholderText}
              value={notes}
              onChangeText={setNotes}
              multiline
              maxLength={200}
            />
          </Card>

          {/* Save Button */}
          {!todayEntry && (
            <View style={styles.buttonContainer}>
                          <Button
              title="Save Today's Color"
              onPress={saveColorEntry}
                loading={loading}
                size="large"
                style={styles.saveButton}
              />
            </View>
          )}

          {/* Status */}
          {todayEntry && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                ✅ Today's color saved
              </Text>
              <Text style={styles.statusSubtext}>
                Daily color selection completed. You can select a new color tomorrow.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.systemGroupedBackground,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  dateText: {
    ...Typography.subhead,
    color: Colors.secondaryLabel,
    marginBottom: Spacing.xs,
  },
  titleText: {
    ...Typography.title2,
    color: Colors.label,
    fontWeight: '600',
    textAlign: 'center',
  },
  pickerCard: {
    margin: Spacing.md,
    alignItems: 'center',
  },
  disabledPickerCard: {
    opacity: 0.7,
  },
  disabledPicker: {
    position: 'relative',
    alignItems: 'center',
  },
  disabledPickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.systemBackground,
    opacity: 0.8,
    zIndex: 1,
    borderRadius: BorderRadius.md,
  },
  dailyLimitMessage: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    zIndex: 2,
    alignItems: 'center',
    backgroundColor: Colors.systemBackground,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.systemOrange,
    shadowColor: Colors.systemOrange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  dailyLimitTitle: {
    ...Typography.headline,
    color: Colors.systemOrange,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  dailyLimitText: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    textAlign: 'center',
    lineHeight: 20,
  },
  colorDisplayCard: {
    margin: Spacing.md,
    marginTop: 0,
  },
  colorDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.separator,
  },
  colorInfo: {
    flex: 1,
  },
  colorHex: {
    ...Typography.headline,
    color: Colors.label,
    fontFamily: 'Menlo',
  },
  colorName: {
    ...Typography.title3,
    color: Colors.systemBlue,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  colorMood: {
    ...Typography.subhead,
    color: Colors.secondaryLabel,
    marginTop: Spacing.xs,
  },
  analysisCard: {
    margin: Spacing.md,
    marginTop: 0,
  },
  analysisTitle: {
    ...Typography.headline,
    color: Colors.label,
    marginBottom: Spacing.sm,
  },
  analysisText: {
    ...Typography.body,
    color: Colors.secondaryLabel,
    lineHeight: 24,
    marginBottom: Spacing.md,
  },
  analysisMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    ...Typography.caption1,
    color: Colors.secondaryLabel,
    marginBottom: Spacing.xs,
  },
  metricValue: {
    ...Typography.headline,
    color: Colors.label,
  },
  suggestions: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.systemGray6,
    borderRadius: BorderRadius.sm,
  },
  suggestionsTitle: {
    ...Typography.subhead,
    color: Colors.label,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  suggestionText: {
    ...Typography.footnote,
    color: Colors.secondaryLabel,
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
  mixtureCard: {
    margin: Spacing.md,
    marginTop: 0,
  },
  mixtureTitle: {
    ...Typography.headline,
    color: Colors.label,
    marginBottom: Spacing.sm,
  },
  mixtureDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mixtureSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.separator,
  },
  mixtureInfo: {
    flex: 1,
  },
  mixtureText: {
    ...Typography.body,
    color: Colors.label,
  },
  mixtureScore: {
    ...Typography.subhead,
    color: Colors.secondaryLabel,
    marginTop: Spacing.xs,
  },
  notesCard: {
    margin: Spacing.md,
    marginTop: 0,
  },
  notesTitle: {
    ...Typography.headline,
    color: Colors.label,
    marginBottom: Spacing.sm,
  },
  notesInput: {
    ...Typography.body,
    color: Colors.label,
    borderWidth: 1,
    borderColor: Colors.separator,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    padding: Spacing.md,
  },
  saveButton: {
    marginBottom: Spacing.sm,
  },
  statusContainer: {
    alignItems: 'center',
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.systemGreen + '10',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.systemGreen + '30',
  },
  statusText: {
    ...Typography.footnote,
    color: Colors.systemGreen,
    textAlign: 'center',
    fontWeight: '600',
  },
  statusSubtext: {
    ...Typography.caption1,
    color: Colors.secondaryLabel,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});

export default HomeScreen;


