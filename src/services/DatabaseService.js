import * as SQLite from 'expo-sqlite';
import { Colors } from '../constants/Colors';

class DatabaseService {
  constructor() {
    this.db = null;
    this.initPromise = null;
  }

  async initDatabase() {
    if (this.initPromise) {
      return this.initPromise;
    }
    
    this.initPromise = this._initDatabase();
    return this.initPromise;
  }

  async _initDatabase() {
    try {
      if (!this.db) {
        this.db = await SQLite.openDatabaseAsync('colorDiary.db');
        await this.createTables();
      }
    } catch (error) {
      console.error('Database initialization error:', error);
      this.initPromise = null; // Reset so we can try again
      throw error;
    }
  }

  async createTables() {
    try {
      // Color entries table - minimal structure
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS color_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT UNIQUE NOT NULL,
          color_hex TEXT NOT NULL,
          mood_score INTEGER NOT NULL,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Weekly stats table - for weekly analysis
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS weekly_stats (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          week_start TEXT UNIQUE NOT NULL,
          average_score REAL,
          dominant_color TEXT,
          color_variety INTEGER,
          total_entries INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Monthly trends table - for monthly analysis
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS monthly_trends (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          month TEXT UNIQUE NOT NULL,
          trend_direction TEXT,
          average_score REAL,
          dominant_colors TEXT,
          color_diversity REAL,
          total_entries INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // User preferences - kişiselleştirme için
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE NOT NULL,
          value TEXT NOT NULL,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (error) {
      console.error('Error creating tables:', error);
    }
  }

  // Color entries CRUD operations
  async saveColorEntry(date, colorHex, notes = '') {
    try {
      await this.initDatabase();
      
      // Check if entry already exists for today (extra safety)
      const existingEntry = await this.getColorEntry(date);
      if (existingEntry) {
        console.log('Daily color limit reached:', date);
        // Still allow update, but log it
      }
      
      const moodScore = this.calculateMoodScore(colorHex);
      
      const result = await this.db.runAsync(
        'INSERT OR REPLACE INTO color_entries (date, color_hex, mood_score, notes) VALUES (?, ?, ?, ?)',
        [date, colorHex, moodScore, notes]
      );
      
      // Update stats asynchronously without blocking the main operation
      // This prevents potential recursion issues
      setImmediate(() => {
        this.updateWeeklyStats(date).catch(error => 
          console.error('Error updating weekly stats:', error)
        );
        this.updateMonthlyTrends(date).catch(error => 
          console.error('Error updating monthly trends:', error)
        );
      });
      
      return result;
    } catch (error) {
      console.error('Error saving color entry:', error);
      throw error;
    }
  }

  async getColorEntry(date) {
    try {
      await this.initDatabase();
      const result = await this.db.getFirstAsync(
        'SELECT * FROM color_entries WHERE date = ?',
        [date]
      );
      return result || null;
    } catch (error) {
      console.error('Error getting color entry:', error);
      throw error;
    }
  }

  async getColorEntriesInRange(startDate, endDate) {
    try {
      await this.initDatabase();
      const result = await this.db.getAllAsync(
        'SELECT * FROM color_entries WHERE date BETWEEN ? AND ? ORDER BY date DESC',
        [startDate, endDate]
      );
      return result || [];
    } catch (error) {
      console.error('Error getting color entries in range:', error);
      throw error;
    }
  }

  async getAllColorEntries() {
    try {
      await this.initDatabase();
      const result = await this.db.getAllAsync(
        'SELECT * FROM color_entries ORDER BY date DESC'
      );
      return result || [];
    } catch (error) {
      console.error('Error getting all color entries:', error);
      throw error;
    }
  }

  // PRD'den alınan basit mood score hesaplama
  calculateMoodScore(colorHex) {
    const color = colorHex.toLowerCase();
    const appColors = Colors.appColors;
    
    // En yakın rengi bul
    let closestColor = 'gray';
    let minDistance = Infinity;
    
    Object.keys(appColors).forEach(colorKey => {
      const distance = this.calculateColorDistance(color, appColors[colorKey].hex.toLowerCase());
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = colorKey;
      }
    });
    
    return appColors[closestColor].intensity;
  }

  // Basit renk mesafesi hesaplama
  calculateColorDistance(color1, color2) {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return Infinity;
    
    return Math.sqrt(
      Math.pow(rgb1.r - rgb2.r, 2) +
      Math.pow(rgb1.g - rgb2.g, 2) +
      Math.pow(rgb1.b - rgb2.b, 2)
    );
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Daily color mixture calculation - PRD'deki renk karışımı
  async calculateDailyMixture(date) {
    const entries = await this.getColorEntriesInRange('2024-01-01', date);
    if (entries.length === 0) return null;

    let totalR = 0, totalG = 0, totalB = 0;
    let totalScore = 0;

    entries.forEach(entry => {
      const rgb = this.hexToRgb(entry.color_hex);
      if (rgb) {
        totalR += rgb.r;
        totalG += rgb.g;
        totalB += rgb.b;
        totalScore += entry.mood_score;
      }
    });

    const count = entries.length;
    const mixedColor = `#${Math.round(totalR/count).toString(16).padStart(2, '0')}${Math.round(totalG/count).toString(16).padStart(2, '0')}${Math.round(totalB/count).toString(16).padStart(2, '0')}`;
    const averageScore = Math.round(totalScore / count);

    return {
      mixedColor,
      averageScore,
      totalEntries: count,
      date
    };
  }

  // Weekly stats update - PRD'deki haftalık analiz
  async updateWeeklyStats(date) {
    try {
      await this.initDatabase();
      
      const weekStart = this.getWeekStart(date);
      const weekEnd = this.getWeekEnd(date);
      const entries = await this.getColorEntriesInRange(weekStart, weekEnd);
      
      if (entries.length === 0) return;

      const averageScore = entries.reduce((sum, entry) => sum + entry.mood_score, 0) / entries.length;
      const colorCounts = {};
      
      entries.forEach(entry => {
        const colorKey = this.getClosestAppColor(entry.color_hex);
        colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
      });

      const dominantColor = Object.keys(colorCounts).reduce((a, b) => 
        colorCounts[a] > colorCounts[b] ? a : b
      );

      return await this.db.runAsync(
        'INSERT OR REPLACE INTO weekly_stats (week_start, average_score, dominant_color, color_variety, total_entries) VALUES (?, ?, ?, ?, ?)',
        [weekStart, averageScore, dominantColor, Object.keys(colorCounts).length, entries.length]
      );
    } catch (error) {
      console.error('Error updating weekly stats:', error);
      throw error;
    }
  }

  // Monthly trends update - PRD'deki aylık analiz
  async updateMonthlyTrends(date) {
    try {
      await this.initDatabase();
      
      const month = date.substring(0, 7); // YYYY-MM format
      const monthStart = `${month}-01`;
      const monthEnd = `${month}-31`;
      const entries = await this.getColorEntriesInRange(monthStart, monthEnd);
      
      if (entries.length === 0) return;

      const averageScore = entries.reduce((sum, entry) => sum + entry.mood_score, 0) / entries.length;
      const colorCounts = {};
      
      entries.forEach(entry => {
        const colorKey = this.getClosestAppColor(entry.color_hex);
        colorCounts[colorKey] = (colorCounts[colorKey] || 0) + 1;
      });

      const dominantColors = Object.keys(colorCounts)
        .sort((a, b) => colorCounts[b] - colorCounts[a])
        .slice(0, 3)
        .join(',');

      const colorDiversity = Object.keys(colorCounts).length / 10; // 10 ana renge göre oran

      return await this.db.runAsync(
        'INSERT OR REPLACE INTO monthly_trends (month, average_score, dominant_colors, color_diversity, total_entries) VALUES (?, ?, ?, ?, ?)',
        [month, averageScore, dominantColors, colorDiversity, entries.length]
      );
    } catch (error) {
      console.error('Error updating monthly trends:', error);
      throw error;
    }
  }

  getClosestAppColor(colorHex) {
    const color = colorHex.toLowerCase();
    const appColors = Colors.appColors;
    
    let closestColor = 'gray';
    let minDistance = Infinity;
    
    Object.keys(appColors).forEach(colorKey => {
      const distance = this.calculateColorDistance(color, appColors[colorKey].hex.toLowerCase());
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = colorKey;
      }
    });
    
    return closestColor;
  }

  getWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  }

  getWeekEnd(date) {
    const d = new Date(this.getWeekStart(date));
    d.setDate(d.getDate() + 6);
    return d.toISOString().split('T')[0];
  }

  // User preferences
  async setUserPreference(key, value) {
    try {
      await this.initDatabase();
      return await this.db.runAsync(
        'INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?)',
        [key, JSON.stringify(value)]
      );
    } catch (error) {
      console.error('Error setting user preference:', error);
      throw error;
    }
  }

  async getUserPreference(key, defaultValue = null) {
    try {
      await this.initDatabase();
      const result = await this.db.getFirstAsync(
        'SELECT value FROM user_preferences WHERE key = ?',
        [key]
      );
      
      if (result) {
        try {
          return JSON.parse(result.value);
        } catch (e) {
          return result.value;
        }
      } else {
        return defaultValue;
      }
    } catch (error) {
      console.error('Error getting user preference:', error);
      return defaultValue;
    }
  }
}

// Singleton instance
const databaseService = new DatabaseService();
export default databaseService;

