import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Typography, BorderRadius, Shadows } from '../../constants/Colors';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  loading = false,
  style,
  textStyle 
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryButton);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryButton);
        break;
      case 'tertiary':
        baseStyle.push(styles.tertiaryButton);
        break;
      case 'destructive':
        baseStyle.push(styles.destructiveButton);
        break;
    }
    
    // Size styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallButton);
        break;
      case 'medium':
        baseStyle.push(styles.mediumButton);
        break;
      case 'large':
        baseStyle.push(styles.largeButton);
        break;
    }
    
    // State styles
    if (disabled) {
      baseStyle.push(styles.disabledButton);
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text];
    
    // Variant text styles
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primaryText);
        break;
      case 'secondary':
        baseStyle.push(styles.secondaryText);
        break;
      case 'tertiary':
        baseStyle.push(styles.tertiaryText);
        break;
      case 'destructive':
        baseStyle.push(styles.destructiveText);
        break;
    }
    
    // Size text styles
    switch (size) {
      case 'small':
        baseStyle.push(styles.smallText);
        break;
      case 'medium':
        baseStyle.push(styles.mediumText);
        break;
      case 'large':
        baseStyle.push(styles.largeText);
        break;
    }
    
    if (disabled) {
      baseStyle.push(styles.disabledText);
    }
    
    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? Colors.systemBackground : Colors.systemBlue} 
          size="small" 
        />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base button styles
  button: {
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...Shadows.small
  },
  
  // Variant styles
  primaryButton: {
    backgroundColor: Colors.systemBlue,
  },
  secondaryButton: {
    backgroundColor: Colors.secondarySystemBackground,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  tertiaryButton: {
    backgroundColor: 'transparent',
  },
  destructiveButton: {
    backgroundColor: Colors.systemRed,
  },
  
  // Size styles
  smallButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 32,
  },
  mediumButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
  },
  largeButton: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 56,
  },
  
  // State styles
  disabledButton: {
    opacity: 0.3,
  },
  
  // Text base styles
  text: {
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Variant text styles
  primaryText: {
    color: Colors.systemBackground,
  },
  secondaryText: {
    color: Colors.label,
  },
  tertiaryText: {
    color: Colors.systemBlue,
  },
  destructiveText: {
    color: Colors.systemBackground,
  },
  
  // Size text styles
  smallText: {
    ...Typography.footnote,
  },
  mediumText: {
    ...Typography.body,
  },
  largeText: {
    ...Typography.headline,
  },
  
  // State text styles
  disabledText: {
    opacity: 0.6,
  },
});

export default Button;

