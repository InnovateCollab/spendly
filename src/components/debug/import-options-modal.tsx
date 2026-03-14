import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';

interface ImportOptionsModalProps {
    visible: boolean;
    onLoadSample: () => void;
    onPickFile: () => void;
    onClose: () => void;
}

export function ImportOptionsModal({
    visible,
    onLoadSample,
    onPickFile,
    onClose,
}: ImportOptionsModalProps) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View
                style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                }}
            >
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        paddingTop: 20,
                        paddingHorizontal: 20,
                        paddingBottom: 40,
                    }}
                >
                    <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 20 }}>
                        📥 Import CSV Data
                    </Text>

                    <View style={{ gap: 10 }}>
                        <TouchableOpacity
                            onPress={onLoadSample}
                            style={{
                                backgroundColor: '#7B5DFF',
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                borderRadius: 8,
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                                Load Sample Data
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            disabled={true}
                            onPress={onPickFile}
                            style={{
                                backgroundColor: '#E0E0E0',
                                paddingVertical: 12,
                                paddingHorizontal: 16,
                                borderRadius: 8,
                                alignItems: 'center',
                                opacity: 0.6,
                            }}
                        >
                            <Text
                                style={{
                                    color: '#999',
                                    fontWeight: '600',
                                    fontSize: 14,
                                }}
                            >
                                Pick File from Storage (Coming Soon...)
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={onClose}
                        style={{
                            backgroundColor: '#E8E8E8',
                            paddingVertical: 12,
                            borderRadius: 8,
                            alignItems: 'center',
                            marginTop: 15,
                        }}
                    >
                        <Text style={{ fontWeight: '600', fontSize: 14 }}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
