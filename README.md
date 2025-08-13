# 🎨 Color Diary

A React Native mobile application that allows users to express their daily mood through colors and track emotional patterns over time.

## ✨ Features

- **Daily Color Selection**: Choose a color that represents your daily mood
- **Color Analysis**: Get insights about your emotional patterns
- **Mood Tracking**: Visual calendar showing your color choices over time
- **Color Mixing**: See how your colors blend together over different periods
- **Statistics**: View your mood trends and patterns
- **Offline First**: All data is stored locally on your device
- **Daily Reminders**: Optional notifications to remind you to log your daily color

## 📱 Screenshots

*Screenshots will be added soon*

## 🛠️ Tech Stack

- **React Native** - Mobile app framework
- **Expo** - Development platform
- **SQLite** - Local database storage
- **React Navigation** - Navigation library
- **Expo Notifications** - Local notification system

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (for testing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/color-diary.git
cd color-diary
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the Expo development server:
```bash
expo start
# or
npx expo start
```

4. Use the Expo Go app on your phone to scan the QR code, or run on a simulator.

## 📋 App Structure

```
src/
├── components/
│   ├── ColorPicker.js      # Color selection component
│   └── common/
│       ├── Button.js       # Reusable button component
│       └── Card.js         # Reusable card component
├── constants/
│   └── Colors.js           # Color palette and theme
├── navigation/
│   └── TabNavigator.js     # Bottom tab navigation
├── screens/
│   ├── HomeScreen.js       # Daily color selection
│   ├── ColorMapScreen.js   # Monthly calendar view
│   ├── AnalysisScreen.js   # Mood analysis and insights
│   ├── MixtureScreen.js    # Color mixing views
│   └── SettingsScreen.js   # App settings
└── services/
    ├── ColorAnalysisService.js  # Color analysis logic
    └── DatabaseService.js       # SQLite database operations
```

## 🎯 How It Works

1. **Daily Selection**: Each day, select a color that represents your mood
2. **Analysis**: The app analyzes your color choice and provides mood insights
3. **Tracking**: View your color history on a monthly calendar
4. **Patterns**: Discover your emotional patterns through weekly and monthly analysis
5. **Mixing**: See how your colors combine over different time periods

## 🎨 Color Psychology

The app uses a carefully selected palette of 10 colors, each associated with different moods and energy levels:

- **Red**: Energy, passion
- **Blue**: Calmness, stability  
- **Yellow**: Happiness, optimism
- **Green**: Balance, growth
- **Purple**: Creativity, spirituality
- **Orange**: Enthusiasm, warmth
- **Pink**: Love, compassion
- **Black**: Power, mystery
- **White**: Purity, clarity
- **Gray**: Neutral, balanced

## 🔒 Privacy

- All data is stored locally on your device
- No data is sent to external servers
- Complete offline functionality
- Your emotional data stays private

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or feedback, please contact: feedback@colordiary.com

---

**Color Diary** - Express your emotions through colors 🎨