/**
 * Reusable toggle button for switching between Expense/Income
 * Used by Overview and can be reused in other screens
 */

import React from 'react';
import { Pressable } from 'react-native';
import { SymbolView, SymbolViewProps } from 'expo-symbols';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { CategoryType } from '@/schemas';
import { Spacing } from '@/constants/theme';

interface TypeToggleButtonProps {
    selected: CategoryType;
    onSelect: (type: CategoryType) => void;
    type: 'expense' | 'income';
    label: string;
    icon: SymbolViewProps['name'];
    color: string;
    style?: any;
}

export const TypeToggleButton: React.FC<TypeToggleButtonProps> = ({
    selected,
    onSelect,
    type,
    label,
    icon,
    color,
    style,
}) => {
    const isSelected = selected === type;

    return (
        <Pressable
            style={({ pressed }) => [
                { flex: 1, ...style },
                pressed && { opacity: 0.7 },
            ]}
            onPress={() => onSelect(type)}
        >
            <ThemedView
                type={isSelected ? 'backgroundSelected' : 'backgroundElement'}
                style={[
                    {
                        padding: Spacing.two,
                        borderRadius: Spacing.two,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: Spacing.one,
                        borderWidth: 2,
                        borderColor: '#d0d0d0',
                    },
                    isSelected && {
                        backgroundColor: '#ffffff',
                        borderColor: '#d0d0d0',
                    },
                ]}
            >
                <SymbolView tintColor={color} name={icon} size={18} />
                <ThemedText type="small">{label}</ThemedText>
            </ThemedView>
        </Pressable>
    );
};
