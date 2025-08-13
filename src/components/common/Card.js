import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '../../constants/Colors';

const Card = ({ children, style, variant = 'default', padding = 'medium' }) => {
  const getCardStyle = () => {
    const baseStyle = [styles.card];
    
    // Variant styles
    switch (variant) {
      case 'default':
        baseStyle.push(styles.defaultCard);
        break;
      case 'elevated':
        baseStyle.push(styles.elevatedCard);
        break;
      case 'outlined':
        baseStyle.push(styles.outlinedCard);
        break;
      case 'filled':
        baseStyle.push(styles.filledCard);
        break;
    }
    
    // Padding styles
    switch (padding) {
      case 'none':
        baseStyle.push(styles.noPadding);
        break;
      case 'small':
        baseStyle.push(styles.smallPadding);
        break;
      case 'medium':
        baseStyle.push(styles.mediumPadding);
        break;
      case 'large':
        baseStyle.push(styles.largePadding);
        break;
    }
    
    return baseStyle;
  };

  return (
    <View style={[...getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  // Base card style
  card: {
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondarySystemGroupedBackground,
  },
  
  // Variant styles
  defaultCard: {
    backgroundColor: Colors.secondarySystemGroupedBackground,
  },
  elevatedCard: {
    backgroundColor: Colors.systemBackground,
    ...Shadows.medium,
  },
  outlinedCard: {
    backgroundColor: Colors.systemBackground,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  filledCard: {
    backgroundColor: Colors.systemGray6,
  },
  
  // Padding styles
  noPadding: {
    padding: 0,
  },
  smallPadding: {
    padding: Spacing.sm,
  },
  mediumPadding: {
    padding: Spacing.md,
  },
  largePadding: {
    padding: Spacing.lg,
  },
});

export default Card;


