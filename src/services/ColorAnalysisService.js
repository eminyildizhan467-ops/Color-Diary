import { Colors } from '../constants/Colors';

class ColorAnalysisService {
  constructor() {
    this.appColors = Colors.appColors;
  }

  // Simple color analysis system
  analyzeColor(colorHex) {
    const closestColorKey = this.getClosestAppColor(colorHex);
    const colorData = this.appColors[closestColorKey];
    
    return {
      colorKey: closestColorKey,
      mood: colorData.mood,
      intensity: colorData.intensity,
      warmth: colorData.warmth,
      hex: colorHex,
      analysis: this.generateColorAnalysis(colorData),
      suggestions: this.generateSuggestions(colorData)
    };
  }

  // En yakın app color'ı bulma
  getClosestAppColor(colorHex) {
    const targetRgb = this.hexToRgb(colorHex);
    if (!targetRgb) return 'gray';

    let closestColor = 'gray';
    let minDistance = Infinity;

    Object.keys(this.appColors).forEach(colorKey => {
      const colorRgb = this.hexToRgb(this.appColors[colorKey].hex);
      if (colorRgb) {
        const distance = this.calculateColorDistance(targetRgb, colorRgb);
        if (distance < minDistance) {
          minDistance = distance;
          closestColor = colorKey;
        }
      }
    });

    return closestColor;
  }

  // Renk mesafesi hesaplama
  calculateColorDistance(rgb1, rgb2) {
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  }

  // Hex to RGB dönüşümü
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // RGB to Hex dönüşümü
  rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // Color mixture calculation
  calculateColorMixture(colorEntries) {
    if (!colorEntries || colorEntries.length === 0) {
      return null;
    }

    let totalR = 0, totalG = 0, totalB = 0;
    let totalIntensity = 0;
    let warmCount = 0, coolCount = 0, neutralCount = 0;

    colorEntries.forEach(entry => {
      const rgb = this.hexToRgb(entry.color_hex);
      const analysis = this.analyzeColor(entry.color_hex);
      
      if (rgb) {
        // Weighted average based on recency (son günler daha etkili)
        const weight = this.calculateWeight(entry.date);
        totalR += rgb.r * weight;
        totalG += rgb.g * weight;
        totalB += rgb.b * weight;
        totalIntensity += analysis.intensity * weight;

        // Warmth counting
        switch (analysis.warmth) {
          case 'warm': warmCount++; break;
          case 'cool': coolCount++; break;
          case 'neutral': neutralCount++; break;
        }
      }
    });

    const count = colorEntries.length;
    const mixedR = Math.round(totalR / count);
    const mixedG = Math.round(totalG / count);
    const mixedB = Math.round(totalB / count);
    const mixedHex = this.rgbToHex(mixedR, mixedG, mixedB);
    const averageIntensity = Math.round(totalIntensity / count);

    // Dominant warmth
    let dominantWarmth = 'neutral';
    if (warmCount > coolCount && warmCount > neutralCount) dominantWarmth = 'warm';
    else if (coolCount > warmCount && coolCount > neutralCount) dominantWarmth = 'cool';

    return {
      mixedColor: mixedHex,
      averageIntensity,
      dominantWarmth,
      colorBalance: {
        warm: warmCount,
        cool: coolCount,
        neutral: neutralCount
      },
      totalEntries: count,
      analysis: this.analyzeMixedColor(mixedHex, averageIntensity, dominantWarmth)
    };
  }

  // Zaman ağırlıklı hesaplama (PRD'deki "Son günlerin daha fazla etkisi")
  calculateWeight(entryDate) {
    const today = new Date();
    const entryDateObj = new Date(entryDate);
    const daysDiff = Math.floor((today - entryDateObj) / (1000 * 60 * 60 * 24));
    
    // Son 7 gün için daha yüksek ağırlık
    if (daysDiff <= 7) return 1.0;
    if (daysDiff <= 30) return 0.8;
    if (daysDiff <= 90) return 0.6;
    return 0.4;
  }

  // Mixed color analysis
  analyzeMixedColor(hexColor, intensity, warmth) {
    const analysis = this.analyzeColor(hexColor);
    
    return {
      ...analysis,
      mixedIntensity: intensity,
      mixedWarmth: warmth,
      interpretation: this.generateMixtureInterpretation(intensity, warmth),
      recommendations: this.generateMixtureRecommendations(intensity, warmth)
    };
  }

  // Generate color analysis text
  generateColorAnalysis(colorData) {
    const intensityText = this.getIntensityText(colorData.intensity);
    const warmthText = this.getWarmthText(colorData.warmth);
    
    return `This ${colorData.mood}-themed color shows a ${intensityText} energy level and evokes a ${warmthText} feeling.`;
  }

  // Mixture interpretation
  generateMixtureInterpretation(intensity, warmth) {
    let interpretation = '';
    
    if (intensity >= 7) {
      interpretation += 'You are in a high-energy period. ';
    } else if (intensity >= 5) {
      interpretation += 'You appear to be in a balanced mood period. ';
    } else {
      interpretation += 'You may be in a calm and peaceful period. ';
    }

    if (warmth === 'warm') {
      interpretation += 'Warm colors show that you feel social and outgoing.';
    } else if (warmth === 'cool') {
      interpretation += 'Cool colors indicate an introspective and thoughtful period.';
    } else {
      interpretation += 'Neutral colors reflect a balanced and steady approach.';
    }

    return interpretation;
  }

  // Minimal suggestions system
  generateSuggestions(colorData) {
    const suggestions = [];
    
    // Balance suggestion
    if (colorData.warmth === 'warm' && colorData.intensity > 7) {
      suggestions.push('You are choosing very warm colors. Try a cool color for balance.');
    } else if (colorData.warmth === 'cool' && colorData.intensity < 4) {
      suggestions.push('You are choosing low-energy colors. A more vibrant color might boost your mood.');
    }
    
    // Variety suggestion
    suggestions.push(`If you want to try a different emotion from the ${colorData.mood} theme, you can prefer ${this.getOppositeColorSuggestion(colorData)} colors.`);
    
    return suggestions;
  }

  generateMixtureRecommendations(intensity, warmth) {
    const recommendations = [];
    
    if (intensity > 7) {
      recommendations.push('Try calm activities to balance your high energy level.');
    } else if (intensity < 4) {
      recommendations.push('You can do active hobbies or sports to increase your energy level.');
    }

    if (warmth === 'warm') {
      recommendations.push('Focusing on social activities might be good for you.');
    } else if (warmth === 'cool') {
      recommendations.push('Introspective activities and meditation can be beneficial.');
    }

    return recommendations;
  }

  // Helper methods
  getIntensityText(intensity) {
    if (intensity >= 8) return 'very high';
    if (intensity >= 6) return 'high';
    if (intensity >= 4) return 'moderate';
    return 'low';
  }

  getWarmthText(warmth) {
    switch (warmth) {
      case 'warm': return 'warm and energetic';
      case 'cool': return 'cool and calm';
      default: return 'balanced';
    }
  }

  getOppositeColorSuggestion(colorData) {
    if (colorData.warmth === 'warm') return 'cool colors like blue, purple';
    if (colorData.warmth === 'cool') return 'warm colors like red, yellow';
    return 'vibrant';
  }

  // Weekly trend analysis
  analyzeWeeklyTrend(weeklyEntries) {
    if (!weeklyEntries || weeklyEntries.length === 0) return null;

    const dailyScores = weeklyEntries.map(entry => ({
      date: entry.date,
      score: this.analyzeColor(entry.color_hex).intensity
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Trend direction calculation
    const firstHalf = dailyScores.slice(0, Math.ceil(dailyScores.length / 2));
    const secondHalf = dailyScores.slice(Math.floor(dailyScores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, item) => sum + item.score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, item) => sum + item.score, 0) / secondHalf.length;
    
    let trendDirection = 'stable';
    const difference = secondAvg - firstAvg;
    
    if (difference > 1) trendDirection = 'increasing';
    else if (difference < -1) trendDirection = 'decreasing';

    return {
      trendDirection,
      averageScore: dailyScores.reduce((sum, item) => sum + item.score, 0) / dailyScores.length,
      scoreRange: {
        min: Math.min(...dailyScores.map(item => item.score)),
        max: Math.max(...dailyScores.map(item => item.score))
      },
      consistency: this.calculateConsistency(dailyScores.map(item => item.score))
    };
  }

  // Tutarlılık hesaplama
  calculateConsistency(scores) {
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const standardDeviation = Math.sqrt(variance);
    
    // 0-1 arası normalize et (düşük std dev = yüksek tutarlılık)
    return Math.max(0, 1 - (standardDeviation / 5));
  }
}

// Singleton instance
const colorAnalysisService = new ColorAnalysisService();
export default colorAnalysisService;


