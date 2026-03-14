/**
 * Custom hook for month navigation with swipe gesture support
 * Provides centralized month navigation logic used across timeline and overview screens
 */

import { useCallback, useRef, useEffect, useState } from 'react';
import { PanResponder, GestureResponderEvent, PanResponderGestureState } from 'react-native';

interface UseMonthNavigationReturn {
    currentMonth: Date;
    setCurrentMonth: (date: Date) => void;
    panResponder: ReturnType<typeof PanResponder.create>;
}

export function useMonthNavigation(initialMonth: Date = new Date()): UseMonthNavigationReturn {
    const [currentMonth, setCurrentMonth] = useState(initialMonth);

    // Ref to store latest month value for use in event handlers
    const currentMonthRef = useRef(currentMonth);
    useEffect(() => {
        currentMonthRef.current = currentMonth;
    }, [currentMonth]);

    // Handle swipe gestures - memoized with dependencies
    const handleSwipe = useCallback((
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
    ) => {
        const { dx } = gestureState;
        const SWIPE_THRESHOLD = 50;

        if (dx > SWIPE_THRESHOLD) {
            // Swiped right - go to previous month
            const newMonth = new Date(
                currentMonthRef.current.getFullYear(),
                currentMonthRef.current.getMonth() - 1,
                1
            );
            setCurrentMonth(newMonth);
        } else if (dx < -SWIPE_THRESHOLD) {
            // Swiped left - go to next month
            const newMonth = new Date(
                currentMonthRef.current.getFullYear(),
                currentMonthRef.current.getMonth() + 1,
                1
            );
            setCurrentMonth(newMonth);
        }
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderRelease: handleSwipe,
        })
    ).current;

    return { currentMonth, setCurrentMonth, panResponder };
}
