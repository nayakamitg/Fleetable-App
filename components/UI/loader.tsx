import { useEffect, useRef } from "react";
import { Animated, Image, StyleProp, StyleSheet, Text, View } from "react-native";

export const TireLoader = ({size=24, color='black', text, style}: {size?: number, color?: string, text?: string, style?: StyleProp<View>}) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;
      useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
    return (
        <View style={[{alignItems: 'center', justifyContent: 'center',gap: 8}, style]}>
            <Animated.Image source={require('../../assets/tire.png')} style={[{width: size, height: size, tintColor: color}, {transform: [{rotate: rotate}]}]} />
            {text && <Text style={{color: color, fontSize: 16, fontWeight: 'bold'}}>{text}</Text>}
        </View>
    );
};
