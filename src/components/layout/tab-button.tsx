import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { TabTriggerSlotProps } from 'expo-router/ui';

import { ThemedText } from '../ui/themed-text';
import { ThemedView } from '../ui/themed-view';
import { Spacing } from '@/constants/theme';

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
    return (
        <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedView
                type={isFocused ? 'backgroundSelected' : 'backgroundElement'}
                style={styles.tabButtonView}
            >
                <ThemedText
                    type="small"
                    themeColor={isFocused ? 'text' : 'textSecondary'}
                >
                    {children}
                </ThemedText>
            </ThemedView>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pressed: {
        opacity: 0.7,
    },
    tabButtonView: {
        paddingVertical: Spacing.one,
        paddingHorizontal: Spacing.three,
        borderRadius: Spacing.three,
    },
});
