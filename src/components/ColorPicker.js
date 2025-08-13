import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Svg, { 
  Defs, 
  RadialGradient, 
  Stop, 
  Circle
} from 'react-native-svg';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../constants/Colors';

// No animated components needed

const { width } = Dimensions.get('window');
const PICKER_SIZE = width * 0.75;
const CENTER = PICKER_SIZE / 2;
const RADIUS = CENTER - 30;

const ColorPicker = ({ onColorChange, initialColor = '#FF0000' }) => {
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [showPresets, setShowPresets] = useState(false);
  const [selectorPosition, setSelectorPosition] = useState({
    x: CENTER + RADIUS - 30,
    y: CENTER
  });
  
  // Simple touch handling without complex animations
  
  // Get preset colors from app colors
  const presetColors = Object.values(Colors.appColors);
  
  useEffect(() => {
    // Initialize position based on initial color
    const position = colorToPosition(initialColor);
    setSelectorPosition({ x: position.x, y: position.y });
  }, [initialColor]);

  // Convert HSV to RGB
  const hsvToRgb = (h, s, v) => {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    
    let r, g, b;
    
    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }
    
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  };

  // Convert RGB to Hex
  const rgbToHex = (r, g, b) => {
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Convert position to color
  const positionToColor = (x, y) => {
    const dx = x - CENTER;
    const dy = y - CENTER;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If outside the circle, constrain to edge (no recursion)
    let finalX = x;
    let finalY = y;
    let finalDistance = distance;
    
    if (distance > RADIUS) {
      const angle = Math.atan2(dy, dx);
      finalX = CENTER + RADIUS * Math.cos(angle);
      finalY = CENTER + RADIUS * Math.sin(angle);
      finalDistance = RADIUS;
    }
    
    // Calculate hue from angle (0-360 degrees)
    let angle = Math.atan2(finalY - CENTER, finalX - CENTER) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    
    // Calculate saturation from distance (0-1)
    const saturation = Math.min(finalDistance / RADIUS, 1);
    
    // Variable brightness based on distance from center
    // Center (distance 0) = 0.3 (dark), Edge (distance RADIUS) = 1.0 (bright)
    const minValue = 0.3;
    const maxValue = 1.0;
    const value = minValue + (saturation * (maxValue - minValue));
    
    const rgb = hsvToRgb(angle, saturation, value);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  };

  // Convert color to position (for initial positioning)
  const colorToPosition = (hexColor) => {
    // Convert hex to RGB
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    
    // Convert RGB to HSV
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    let h = 0;
    if (delta !== 0) {
      if (max === r) h = ((g - b) / delta) % 6;
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
    }
    h = (h * 60 + 360) % 360;
    
    const s = max === 0 ? 0 : delta / max;
    const v = max;
    
    // Reverse calculate distance from value
    // value = minValue + (saturation * (maxValue - minValue))
    // So: saturation = (value - minValue) / (maxValue - minValue)
    const minValue = 0.3;
    const maxValue = 1.0;
    
    // But we need to solve this differently since we have both s and v
    // We'll use saturation for distance, but adjust based on value
    let adjustedSaturation = s;
    
    // If the color is very dark (low value), it should be closer to center
    if (v < 0.6) {
      adjustedSaturation = Math.min(s, (v - minValue) / (maxValue - minValue));
    }
    
    // Convert HSV to position
    const angle = (h * Math.PI) / 180;
    const distance = adjustedSaturation * RADIUS;
    
    return {
      x: CENTER + distance * Math.cos(angle),
      y: CENTER + distance * Math.sin(angle)
    };
  };

  // Update color based on position
  const updateColor = (x, y) => {
    const newColor = positionToColor(x, y);
    setSelectedColor(newColor);
    setSelectorPosition({ x, y });
    onColorChange?.(newColor);
  };

  // Handle preset color selection
  const selectPresetColor = (color) => {
    setSelectedColor(color.hex);
    onColorChange?.(color.hex);
    const position = colorToPosition(color.hex);
    setSelectorPosition({ x: position.x, y: position.y });
  };

  // Handle direct tap on color wheel
  const handleTap = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    const dx = locationX - CENTER;
    const dy = locationY - CENTER;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= RADIUS) {
      updateColor(locationX, locationY);
    }
  };

  // Simple pan gesture handler
  const handlePanGesture = (event) => {
    const { x, y } = event.nativeEvent;
    const dx = x - CENTER;
    const dy = y - CENTER;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance <= RADIUS) {
      updateColor(x, y);
    } else {
      // Constrain to circle edge
      const angle = Math.atan2(dy, dx);
      const constrainedX = CENTER + RADIUS * Math.cos(angle);
      const constrainedY = CENTER + RADIUS * Math.sin(angle);
      updateColor(constrainedX, constrainedY);
    }
  };

  // Simple state-based selector positioning

  return (
    <View style={styles.container}>
      {/* Color Wheel Container */}
      <View style={styles.pickerContainer}>
        {/* Beautiful Modern Color Wheel - Original Design */}
        <Svg width={PICKER_SIZE} height={PICKER_SIZE} style={styles.colorWheel}>
          <Defs>
            {/* Radial gradient for value (brightness) overlay - dark center to bright edge */}
            <RadialGradient id="valueGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#000000" stopOpacity="0.7" />
              <Stop offset="50%" stopColor="#000000" stopOpacity="0.3" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </RadialGradient>
            
            {/* Individual color gradients for each segment */}
            <RadialGradient id="redGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFE5E5" />
              <Stop offset="100%" stopColor="#FF3B30" />
            </RadialGradient>
            <RadialGradient id="orangeGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFF0E5" />
              <Stop offset="100%" stopColor="#FF9500" />
            </RadialGradient>
            <RadialGradient id="yellowGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFFCE5" />
              <Stop offset="100%" stopColor="#FFCC00" />
            </RadialGradient>
            <RadialGradient id="greenGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#E5F7E5" />
              <Stop offset="100%" stopColor="#34C759" />
            </RadialGradient>
            <RadialGradient id="blueGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#E5F2FF" />
              <Stop offset="100%" stopColor="#007AFF" />
            </RadialGradient>
            <RadialGradient id="purpleGrad" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#F0E5FF" />
              <Stop offset="100%" stopColor="#AF52DE" />
            </RadialGradient>
          </Defs>
          
          {/* Background circle with shadow */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS + 5}
            fill={Colors.systemBackground}
            stroke={Colors.systemGray5}
            strokeWidth="1"
            opacity="0.8"
          />
          
          {/* Color segments as beautiful arcs */}
          <Circle cx={CENTER + RADIUS - 25} cy={CENTER} r={RADIUS * 0.15} fill="url(#redGrad)" opacity="0.9" />
          <Circle cx={CENTER + (RADIUS - 25) * 0.866} cy={CENTER - (RADIUS - 25) * 0.5} r={RADIUS * 0.15} fill="url(#orangeGrad)" opacity="0.9" />
          <Circle cx={CENTER + (RADIUS - 25) * 0.5} cy={CENTER - (RADIUS - 25) * 0.866} r={RADIUS * 0.15} fill="url(#yellowGrad)" opacity="0.9" />
          <Circle cx={CENTER} cy={CENTER - RADIUS + 25} r={RADIUS * 0.15} fill="url(#yellowGrad)" opacity="0.9" />
          <Circle cx={CENTER - (RADIUS - 25) * 0.5} cy={CENTER - (RADIUS - 25) * 0.866} r={RADIUS * 0.15} fill="url(#greenGrad)" opacity="0.9" />
          <Circle cx={CENTER - (RADIUS - 25) * 0.866} cy={CENTER - (RADIUS - 25) * 0.5} r={RADIUS * 0.15} fill="url(#greenGrad)" opacity="0.9" />
          <Circle cx={CENTER - RADIUS + 25} cy={CENTER} r={RADIUS * 0.15} fill="url(#blueGrad)" opacity="0.9" />
          <Circle cx={CENTER - (RADIUS - 25) * 0.866} cy={CENTER + (RADIUS - 25) * 0.5} r={RADIUS * 0.15} fill="url(#blueGrad)" opacity="0.9" />
          <Circle cx={CENTER - (RADIUS - 25) * 0.5} cy={CENTER + (RADIUS - 25) * 0.866} r={RADIUS * 0.15} fill="url(#purpleGrad)" opacity="0.9" />
          <Circle cx={CENTER} cy={CENTER + RADIUS - 25} r={RADIUS * 0.15} fill="url(#purpleGrad)" opacity="0.9" />
          <Circle cx={CENTER + (RADIUS - 25) * 0.5} cy={CENTER + (RADIUS - 25) * 0.866} r={RADIUS * 0.15} fill="url(#purpleGrad)" opacity="0.9" />
          <Circle cx={CENTER + (RADIUS - 25) * 0.866} cy={CENTER + (RADIUS - 25) * 0.5} r={RADIUS * 0.15} fill="url(#redGrad)" opacity="0.9" />
          
          {/* Beautiful color dots with premium styling */}
          <Circle cx={CENTER + RADIUS - 30} cy={CENTER} r={16} fill="#FF3B30" stroke="#FFFFFF" strokeWidth="3" />
          <Circle cx={CENTER + (RADIUS - 30) * 0.866} cy={CENTER - (RADIUS - 30) * 0.5} r={16} fill="#FF9500" stroke="#FFFFFF" strokeWidth="3" />
          <Circle cx={CENTER + (RADIUS - 30) * 0.5} cy={CENTER - (RADIUS - 30) * 0.866} r={16} fill="#FFCC00" stroke="#FFFFFF" strokeWidth="3" />
          <Circle cx={CENTER} cy={CENTER - RADIUS + 30} r={16} fill="#32D74B" stroke="#FFFFFF" strokeWidth="3" />
          <Circle cx={CENTER - (RADIUS - 30) * 0.5} cy={CENTER - (RADIUS - 30) * 0.866} r={16} fill="#30D158" stroke="#FFFFFF" strokeWidth="3" />
          <Circle cx={CENTER - (RADIUS - 30) * 0.866} cy={CENTER - (RADIUS - 30) * 0.5} r={16} fill="#40E0D0" stroke="#FFFFFF" strokeWidth="3" />
          <Circle cx={CENTER - RADIUS + 30} cy={CENTER} r={16} fill="#5AC8FA" stroke="#FFFFFF" strokeWidth="3" />
          <Circle cx={CENTER - (RADIUS - 30) * 0.866} cy={CENTER + (RADIUS - 30) * 0.5} r={16} fill="#007AFF" stroke="#FFFFFF" strokeWidth="3" />
          <Circle cx={CENTER - (RADIUS - 30) * 0.5} cy={CENTER + (RADIUS - 30) * 0.866} r={16} fill="#5856D6" stroke="#FFFFFF" strokeWidth="3" />
          <Circle cx={CENTER} cy={CENTER + RADIUS - 30} r={16} fill="#AF52DE" stroke="#FFFFFF" strokeWidth="3" />
          <Circle cx={CENTER + (RADIUS - 30) * 0.5} cy={CENTER + (RADIUS - 30) * 0.866} r={16} fill="#FF2D92" stroke="#FFFFFF" strokeWidth="3" />
          <Circle cx={CENTER + (RADIUS - 30) * 0.866} cy={CENTER + (RADIUS - 30) * 0.5} r={16} fill="#FF2D55" stroke="#FFFFFF" strokeWidth="3" />
          
          {/* Value (brightness) overlay - makes center darker */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="url(#valueGrad)"
          />
          
          {/* Premium center circle with glassmorphism effect */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={35}
            fill="#F5F5F5"
            stroke="#E0E0E0"
            strokeWidth="1"
            opacity="0.9"
          />
          
          {/* Inner center dot indicating dark colors */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={12}
            fill="#666666"
            opacity="0.8"
          />
          
          {/* Tiny center dot */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={4}
            fill="#333333"
            opacity="1"
          />
          
          {/* Static SVG Color Selector - Always visible */}
          <Circle
            cx={selectorPosition.x}
            cy={selectorPosition.y}
            r={25}
            fill="#FFFFFF"
            stroke="#000000"
            strokeWidth="4"
          />
          <Circle
            cx={selectorPosition.x}
            cy={selectorPosition.y}
            r={18}
            fill={selectedColor}
            stroke="#FFFFFF"
            strokeWidth="3"
          />
        </Svg>

        {/* Touch Handler with Drag Support */}
        <PanGestureHandler
          onGestureEvent={handlePanGesture}
          onHandlerStateChange={handlePanGesture}
        >
          <TouchableOpacity 
            style={styles.touchArea}
            onPress={handleTap}
            activeOpacity={1}
          >
            <View style={styles.touchArea} />
          </TouchableOpacity>
        </PanGestureHandler>
      </View>

      {/* Preset Colors Section */}
      <View style={styles.presetsContainer}>
        <TouchableOpacity 
          style={styles.presetsToggle}
          onPress={() => setShowPresets(!showPresets)}
        >
          <Text style={styles.presetsToggleText}>
            {showPresets ? 'Renk Tekerleği' : 'Hazır Renkler'}
          </Text>
          <Text style={styles.presetsToggleIcon}>
            {showPresets ? '🎨' : '🎯'}
          </Text>
        </TouchableOpacity>
        
        {showPresets && (
          <View style={styles.presetColors}>
            {presetColors.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.presetColor,
                  { backgroundColor: color.hex },
                  selectedColor === color.hex && styles.selectedPreset
                ]}
                onPress={() => selectPresetColor(color)}
              >
                <View style={styles.presetColorInner}>
                  {selectedColor === color.hex && (
                    <Text style={styles.selectedPresetIcon}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerContainer: {
    width: PICKER_SIZE,
    height: PICKER_SIZE,
    position: 'relative',
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  colorWheel: {
    position: 'absolute',
  },
  touchArea: {
    position: 'absolute',
    width: PICKER_SIZE,
    height: PICKER_SIZE,
  },
  selector: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    elevation: 20,
  },
  selectorOuter: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 6,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 20,
  },
  selectorInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  selectorArrow: {
    position: 'absolute',
    top: -35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectorArrowText: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
    textShadowColor: '#FFFFFF',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  
  // Preset Colors Section
  presetsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  presetsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondarySystemGroupedBackground,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
    ...Shadows.small,
  },
  presetsToggleText: {
    ...Typography.subhead,
    color: Colors.label,
    fontWeight: '600',
    marginRight: Spacing.xs,
  },
  presetsToggleIcon: {
    fontSize: 16,
  },
  presetColors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: PICKER_SIZE,
  },
  presetColor: {
    width: 44,
    height: 44,
    borderRadius: 22,
    margin: Spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.systemBackground,
    ...Shadows.small,
  },
  presetColorInner: {
    width: '100%',
    height: '100%',
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedPreset: {
    borderColor: Colors.systemBlue,
    borderWidth: 4,
    transform: [{ scale: 1.1 }],
  },
  selectedPresetIcon: {
    color: Colors.systemBackground,
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default ColorPicker;

