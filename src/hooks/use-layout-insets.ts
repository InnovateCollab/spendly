/**
 * Hook for calculating safe area insets and platform-specific padding
 * Used by Timeline and Overview screens
 */

import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabInset, Spacing } from '@/constants/theme';

export interface LayoutInsets {
    top: number;
    left: number;
    right: number;
    bottom: number;
}

export function useLayoutInsets() {
    const safeAreaInsets = useSafeAreaInsets();

    const insets: LayoutInsets = {
        ...safeAreaInsets,
        bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
    };

    const contentPlatformStyle = Platform.select({
        android: {
            paddingTop: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
            paddingBottom: insets.bottom,
        },
        web: {
            paddingTop: Spacing.six,
            paddingBottom: Spacing.four,
        },
    });

    return { insets, contentPlatformStyle };
}
