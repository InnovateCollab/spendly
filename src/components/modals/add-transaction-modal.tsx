import { SymbolView } from 'expo-symbols';
import { useState, useEffect } from 'react';
import {
    ScrollView,
    StyleSheet,
    View,
    TextInput,
    Pressable,
    Modal,
    Platform,
    Animated,
    KeyboardAvoidingView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { database } from '@/database';
import type { Category, TransactionUI } from '@/schemas';

interface AddTransactionModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    editTransaction?: TransactionUI;
}

export const AddTransactionModal = ({
    visible,
    onClose,
    onSuccess,
    editTransaction,
}: AddTransactionModalProps) => {
    const theme = useTheme();

    // Form data state
    const [formData, setFormData] = useState({
        amount: '',
        selectedCategory: null as Category | null,
        selectedDate: new Date(),
        note: '',
        labels: [] as string[],
        labelInput: '',
    });

    // UI state
    const [uiState, setUiState] = useState({
        showCategoryPicker: false,
        showDatePicker: false,
        isLoading: false,
    });

    // Toast state
    const [toastState, setToastState] = useState({
        showToast: false,
        toastMessage: '',
        toastOpacity: new Animated.Value(0),
    });

    const [categories, setCategories] = useState<Category[]>([]);

    // fetch categories when modal becomes visible
    useEffect(() => {
        if (!visible) return;

        const loadCategories = async () => {
            try {
                const categories = await database.getCategories();
                setCategories(categories);
            } catch (error) {
                console.warn('Failed to load categories:', error);
            }
        };
        loadCategories();
    }, [visible]);

    // populate form when editing a transaction
    useEffect(() => {
        if (visible && editTransaction) {
            setFormData({
                amount: Math.abs(editTransaction.amount).toString(),
                selectedCategory: editTransaction.category,
                selectedDate: new Date(editTransaction.date),
                note: editTransaction.note || '',
                labels: editTransaction.labels || [],
                labelInput: '',
            });
        } else if (!editTransaction && visible) {
            resetForm();
        }
    }, [editTransaction, visible, categories]);

    const showToastNotification = (message: string, duration = 1500) => {
        setToastState(prev => ({
            ...prev,
            toastMessage: message,
            showToast: true,
        }));
        Animated.sequence([
            Animated.timing(toastState.toastOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(duration),
            Animated.timing(toastState.toastOpacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => setToastState(prev => ({ ...prev, showToast: false })));
    };

    const addLabel = () => {
        if (formData.labelInput.trim() && !formData.labels.includes(formData.labelInput.trim())) {
            setFormData(prev => ({
                ...prev,
                labels: [...prev.labels, prev.labelInput.trim()],
                labelInput: '',
            }));
        }
    };

    const removeLabel = (label: string) => {
        setFormData(prev => ({
            ...prev,
            labels: prev.labels.filter((l) => l !== label),
        }));
    };

    const getDateString = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const resetForm = () => {
        setFormData({
            amount: '',
            selectedCategory: null,
            selectedDate: new Date(),
            note: '',
            labels: [],
            labelInput: '',
        });
    };

    const handleAddTransaction = async () => {
        // Validate required fields
        if (!formData.amount.trim()) {
            showToastNotification('Please enter an amount');
            return;
        }

        if (!formData.selectedCategory) {
            showToastNotification('Please select a category');
            return;
        }

        setUiState(prev => ({ ...prev, isLoading: true }));
        try {
            // Parse amount to number
            const parsedAmount = parseFloat(formData.amount);
            if (isNaN(parsedAmount)) {
                showToastNotification('Please enter a valid amount');
                setUiState(prev => ({ ...prev, isLoading: false }));
                return;
            }

            // Calculate final amount based on category type (negative for expenses)
            const finalAmount =
                formData.selectedCategory.type === 'income' ? parsedAmount : -parsedAmount;

            if (editTransaction) {
                // Update existing transaction
                await database.updateTransaction(editTransaction.id, {
                    categoryId: formData.selectedCategory.id,
                    amount: finalAmount,
                    date: formData.selectedDate,
                    note: formData.note || undefined,
                    labels: formData.labels.length > 0 ? formData.labels : undefined,
                });

                // Reset form
                resetForm();

                // Show success toast
                showToastNotification('Transaction updated! ✓', 1200);
                setTimeout(() => {
                    setUiState(prev => ({ ...prev, isLoading: false }));
                    onClose();
                    onSuccess?.();
                }, 1200);
            } else {
                // Insert new transaction
                await database.insertTransaction({
                    categoryId: formData.selectedCategory.id,
                    amount: finalAmount,
                    date: formData.selectedDate,
                    note: formData.note || undefined,
                    labels: formData.labels.length > 0 ? formData.labels : undefined,
                });

                // Reset form
                resetForm();

                // Show success toast
                showToastNotification('Transaction added! ✓', 1200);
                setTimeout(() => {
                    setUiState(prev => ({ ...prev, isLoading: false }));
                    onClose();
                    onSuccess?.();
                }, 1200);
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            showToastNotification('Failed to save transaction');
            setUiState(prev => ({ ...prev, isLoading: false }));
        }
    };

    const handleDeleteTransaction = async () => {
        if (!editTransaction) return;

        setUiState(prev => ({ ...prev, isLoading: true }));
        try {
            await database.deleteTransaction(editTransaction.id);

            // Reset form
            resetForm();

            // Show success toast
            showToastNotification('Transaction deleted! ✓', 1200);
            setTimeout(() => {
                setUiState(prev => ({ ...prev, isLoading: false }));
                onClose();
                onSuccess?.();
            }, 1200);
        } catch (error) {
            console.error('Error deleting transaction:', error);
            showToastNotification('Failed to delete transaction');
            setUiState(prev => ({ ...prev, isLoading: false }));
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : undefined}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={styles.modalContainer}>
                    <ThemedView style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <ThemedText type="subtitle" style={styles.headerTitle}>
                                {editTransaction ? 'Edit Transaction' : 'Add Transaction'}
                            </ThemedText>
                            {editTransaction ? (
                                <Pressable
                                    onPress={handleDeleteTransaction}
                                    disabled={uiState.isLoading}
                                    style={({ pressed }) => pressed && { opacity: 0.7 }}
                                >
                                    <SymbolView
                                        name={{ ios: 'trash.fill', android: 'delete', web: 'delete' }}
                                        size={24}
                                        tintColor="#ef4444"
                                    />
                                </Pressable>
                            ) : (
                                <Pressable onPress={onClose} style={({ pressed }) => pressed && { opacity: 0.7 }}>
                                    <ThemedText style={styles.closeIcon}>✕</ThemedText>
                                </Pressable>
                            )}
                        </View>

                        {/* Form Content */}
                        <ScrollView
                            style={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.scrollContentContainer}
                        >
                            {/* Amount Section */}
                            <ThemedView type="backgroundElement" style={styles.section}>
                                <View style={styles.amountRow}>
                                    <Pressable
                                        onPress={() => setUiState(prev => ({ ...prev, showCategoryPicker: true }))}
                                        style={({ pressed }) => [
                                            pressed && { opacity: 0.7 },
                                        ]}
                                    >
                                        <View style={styles.categoryDisplay}>
                                            {formData.selectedCategory ? (
                                                <>
                                                    <SymbolView
                                                        name={formData.selectedCategory.icon}
                                                        size={28}
                                                        tintColor={formData.selectedCategory.color}
                                                    />
                                                    <ThemedText type="small" style={styles.categoryName}>
                                                        {formData.selectedCategory.name}
                                                    </ThemedText>
                                                </>
                                            ) : (
                                                <>
                                                    <SymbolView
                                                        name={{
                                                            ios: 'square.grid.2x2',
                                                            android: 'dashboard',
                                                            web: 'dashboard',
                                                        }}
                                                        size={32}
                                                        tintColor="#22c55e"
                                                    />
                                                    <ThemedText type="small" style={styles.categoryPlaceholder}>
                                                        Select Category
                                                    </ThemedText>
                                                </>
                                            )}
                                        </View>
                                    </Pressable>
                                    <TextInput
                                        style={[styles.amountInput, { color: theme.text }]}
                                        placeholder="Amount"
                                        placeholderTextColor={theme.textSecondary}
                                        keyboardType="decimal-pad"
                                        value={formData.amount}
                                        onChangeText={(val) => setFormData(prev => ({ ...prev, amount: val }))}
                                        editable={!uiState.isLoading}
                                    />
                                </View>
                            </ThemedView>

                            {/* Category Picker Modal */}
                            <Modal
                                visible={uiState.showCategoryPicker}
                                transparent
                                animationType="fade"
                                onRequestClose={() => setUiState(prev => ({ ...prev, showCategoryPicker: false }))}
                            >
                                <View style={styles.categoryPickerOverlay}>
                                    <Pressable
                                        style={styles.categoryPickerBackdrop}
                                        onPress={() => setUiState(prev => ({ ...prev, showCategoryPicker: false }))}
                                    />
                                    <View style={[styles.categoryPickerSheet, { backgroundColor: theme.background }]}>
                                        <View style={styles.categorySheetHeader}>
                                            <ThemedText type="subtitle">Select Category</ThemedText>
                                            <Pressable onPress={() => setUiState(prev => ({ ...prev, showCategoryPicker: false }))}>
                                                <ThemedText style={styles.categoryCloseButton}>Close</ThemedText>
                                            </Pressable>
                                        </View>
                                        <ScrollView
                                            style={styles.categoryScrollView}
                                            showsVerticalScrollIndicator={false}
                                            contentContainerStyle={styles.categoryGridContainer}
                                        >
                                            {categories.map((category) => (
                                                <Pressable
                                                    key={category.id}
                                                    onPress={() => {
                                                        setFormData(prev => ({ ...prev, selectedCategory: category }));
                                                        setUiState(prev => ({ ...prev, showCategoryPicker: false }));
                                                    }}
                                                    style={({ pressed }) => [
                                                        styles.categoryOption,
                                                        pressed && { opacity: 0.7 },
                                                    ]}
                                                >
                                                    <View
                                                        style={[
                                                            styles.categoryIconCircle,
                                                            formData.selectedCategory?.id === category.id &&
                                                            styles.categoryIconCircleSelected,
                                                        ]}
                                                    >
                                                        <SymbolView
                                                            name={category.icon}
                                                            size={32}
                                                            tintColor={category.color}
                                                        />
                                                    </View>
                                                    <ThemedText type="small" style={styles.categoryOptionName}>
                                                        {category.name}
                                                    </ThemedText>
                                                </Pressable>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </View>
                            </Modal>

                            {/* Date Section */}
                            <ThemedView type="backgroundElement" style={styles.section}>
                                <View style={styles.row}>
                                    <Pressable
                                        onPress={() => setUiState(prev => ({ ...prev, showDatePicker: true }))}
                                        style={({ pressed }) => [styles.dateButton, pressed && { opacity: 0.7 }]}
                                    >
                                        <View style={styles.rowLeft}>
                                            <SymbolView
                                                name={{
                                                    ios: 'calendar',
                                                    android: 'calendar_today',
                                                    web: 'calendar_today',
                                                }}
                                                size={24}
                                                tintColor={theme.text}
                                            />
                                            <ThemedText type="small">{getDateString(formData.selectedDate)}</ThemedText>
                                        </View>
                                    </Pressable>
                                </View>
                            </ThemedView>

                            {/* Date Picker */}
                            {uiState.showDatePicker && (
                                <DateTimePicker
                                    value={formData.selectedDate}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={(event, date) => {
                                        if (Platform.OS === 'android') {
                                            setUiState(prev => ({ ...prev, showDatePicker: false }));
                                            if (date) {
                                                setFormData(prev => ({ ...prev, selectedDate: date }));
                                            }
                                        } else if (event.type === 'set' && date) {
                                            setFormData(prev => ({ ...prev, selectedDate: date }));
                                            setUiState(prev => ({ ...prev, showDatePicker: false }));
                                        } else if (event.type === 'dismissed') {
                                            setUiState(prev => ({ ...prev, showDatePicker: false }));
                                        }
                                    }}
                                />
                            )}

                            {/* Note Section */}
                            <ThemedView type="backgroundElement" style={styles.section}>
                                <View style={styles.rowVertical}>
                                    <View style={styles.rowLeft}>
                                        <SymbolView
                                            name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
                                            size={24}
                                            tintColor={theme.text}
                                        />
                                        <ThemedText type="small">Note</ThemedText>
                                    </View>
                                    <TextInput
                                        style={[styles.noteInput, { color: theme.text, borderColor: theme.textSecondary }]}
                                        placeholder="Add a note (optional)"
                                        placeholderTextColor={theme.textSecondary}
                                        value={formData.note}
                                        onChangeText={(val) => setFormData(prev => ({ ...prev, note: val }))}
                                        multiline
                                        editable={!uiState.isLoading}
                                    />
                                </View>
                            </ThemedView>

                            {/* Labels Section */}
                            <ThemedView type="backgroundElement" style={styles.section}>
                                <View style={styles.rowLeft}>
                                    <SymbolView
                                        name={{ ios: 'tag.fill', android: 'local_offer', web: 'local_offer' }}
                                        size={24}
                                        tintColor="#FBBF24"
                                    />
                                    <ThemedText type="small">Labels</ThemedText>
                                </View>

                                {/* Label Input */}
                                <View style={styles.labelInputContainer}>
                                    <TextInput
                                        style={[
                                            styles.labelInputField,
                                            { color: theme.text, borderColor: theme.textSecondary },
                                        ]}
                                        placeholder="Add a label"
                                        placeholderTextColor={theme.textSecondary}
                                        value={formData.labelInput}
                                        onChangeText={(val) => setFormData(prev => ({ ...prev, labelInput: val }))}
                                        editable={!uiState.isLoading}
                                    />
                                    <Pressable
                                        style={({ pressed }) => [styles.addLabelButton, pressed && { opacity: 0.7 }]}
                                        onPress={addLabel}
                                        disabled={uiState.isLoading}
                                    >
                                        <ThemedText type="small" style={styles.addLabelText}>
                                            Add
                                        </ThemedText>
                                    </Pressable>
                                </View>

                                {/* Display Labels */}
                                {formData.labels.length > 0 && (
                                    <View style={styles.labelsDisplay}>
                                        {formData.labels.map((label, idx) => (
                                            <Pressable
                                                key={idx}
                                                style={styles.labelTag}
                                                onPress={() => removeLabel(label)}
                                                disabled={uiState.isLoading}
                                            >
                                                <ThemedText type="small" style={styles.labelTagText}>
                                                    {label} ✕
                                                </ThemedText>
                                            </Pressable>
                                        ))}
                                    </View>
                                )}
                            </ThemedView>
                        </ScrollView>

                        {/* Add Button */}
                        <View style={styles.buttonContainer}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.addButton,
                                    pressed && { opacity: 0.8 },
                                    uiState.isLoading && { opacity: 0.6 },
                                ]}
                                onPress={handleAddTransaction}
                                disabled={uiState.isLoading}
                            >
                                <ThemedText type="small" style={styles.addButtonText}>
                                    {uiState.isLoading ? (editTransaction ? 'Updating...' : 'Adding...') : (editTransaction ? 'Update Transaction' : 'Add Transaction')}
                                </ThemedText>
                            </Pressable>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.cancelButton,
                                    pressed && { opacity: 0.8 },
                                ]}
                                onPress={onClose}
                                disabled={uiState.isLoading}
                            >
                                <ThemedText type="small" style={styles.cancelButtonText}>
                                    Cancel
                                </ThemedText>
                            </Pressable>
                        </View>

                        {/* Toast Notification */}
                        {toastState.showToast && (
                            <Animated.View
                                style={[
                                    styles.toastContainer,
                                    {
                                        opacity: toastState.toastOpacity,
                                        transform: [
                                            {
                                                translateY: toastState.toastOpacity.interpolate({
                                                    inputRange: [0, 1],
                                                    outputRange: [50, 0],
                                                }),
                                            },
                                        ],
                                    },
                                ]}
                            >
                                <ThemedText style={styles.toastText}>{toastState.toastMessage}</ThemedText>
                            </Animated.View>
                        )}
                    </ThemedView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        ...(Platform.OS === 'web' && { backgroundColor: 'rgba(0, 0, 0, 0.5)' }),
    },
    modalContent: {
        flex: 1,
        paddingTop: Spacing.two,
        paddingHorizontal: Spacing.four,
        ...(Platform.OS === 'web' && {
            maxWidth: MaxContentWidth,
            width: '100%',
        }),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.two,
        paddingHorizontal: Spacing.one,
        marginBottom: Spacing.two,
    },
    headerTitle: {
        textAlign: 'center',
        flex: 1,
    },
    closeIcon: {
        fontSize: 24,
        fontWeight: '600',
        color: '#666',
    },
    scrollContent: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingBottom: Spacing.three,
        gap: Spacing.three,
    },
    section: {
        padding: Spacing.three,
        borderRadius: Spacing.two,
        gap: Spacing.two,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e8e8e8',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
    },
    amountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
        justifyContent: 'space-between',
    },
    rowVertical: {
        gap: Spacing.two,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
        flex: 1,
    },
    amountInput: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        paddingVertical: Spacing.one,
        textAlign: 'right',
    },
    noteInput: {
        borderWidth: 1,
        borderRadius: Spacing.one,
        padding: Spacing.two,
        minHeight: 80,
        fontSize: 14,
        backgroundColor: '#f9f9f9',
    },
    labelInputContainer: {
        flexDirection: 'row',
        gap: Spacing.one,
        alignItems: 'center',
    },
    labelInputField: {
        flex: 1,
        borderWidth: 1,
        borderRadius: Spacing.one,
        padding: Spacing.two,
        fontSize: 14,
        backgroundColor: '#f9f9f9',
    },
    addLabelButton: {
        paddingHorizontal: Spacing.two,
        paddingVertical: Spacing.one,
        backgroundColor: '#22c55e',
        borderRadius: Spacing.one,
    },
    addLabelText: {
        color: '#fff',
        fontWeight: '600',
    },
    labelsDisplay: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.one,
        marginTop: Spacing.one,
    },
    labelTag: {
        backgroundColor: '#FFE66D',
        paddingHorizontal: Spacing.two,
        paddingVertical: Spacing.one,
        borderRadius: Spacing.two,
    },
    labelTagText: {
        color: '#000',
        fontWeight: '600',
    },
    categoryButton: {
        paddingHorizontal: Spacing.two,
        paddingVertical: Spacing.one,
    },
    categoryDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.one,
        minWidth: 120,
    },
    categoryName: {
        fontWeight: '600',
        fontSize: 14,
    },
    categoryPlaceholder: {
        fontSize: 12,
        color: '#999',
    },
    categoryPickerOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    categoryPickerBackdrop: {
        flex: 1,
    },
    categoryPickerSheet: {
        minHeight: '50%',
        borderTopLeftRadius: Spacing.three,
        borderTopRightRadius: Spacing.three,
        paddingHorizontal: Spacing.two,
        paddingTop: Spacing.three,
        paddingBottom: Spacing.three,
    },
    categorySheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.three,
        paddingBottom: Spacing.two,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    categoryCloseButton: {
        color: '#007AFF',
        fontWeight: '600',
        fontSize: 14,
    },
    categoryScrollView: {
        flex: 1,
    },
    categoryGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.two,
        justifyContent: 'flex-start',
        paddingBottom: Spacing.three,
        paddingHorizontal: Spacing.one,
    },
    categoryOption: {
        width: '22%',
        alignItems: 'center',
        gap: Spacing.two,
    },
    categoryIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryIconCircleSelected: {
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
    },
    categoryOptionName: {
        textAlign: 'center',
        fontSize: 10,
        fontWeight: '600',
        marginTop: Spacing.one,
    },
    dateButton: {
        flex: 1,
    },
    buttonContainer: {
        gap: Spacing.two,
        paddingBottom: Spacing.three,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: Spacing.two,
    },
    addButton: {
        backgroundColor: '#22c55e',
        paddingVertical: Spacing.three,
        borderRadius: Spacing.two,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    cancelButton: {
        backgroundColor: '#e0e0e0',
        paddingVertical: Spacing.three,
        borderRadius: Spacing.two,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 16,
    },
    toastContainer: {
        position: 'absolute',
        bottom: 80,
        left: Spacing.three,
        right: Spacing.three,
        backgroundColor: '#22c55e',
        borderRadius: Spacing.two,
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.two,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    toastText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
