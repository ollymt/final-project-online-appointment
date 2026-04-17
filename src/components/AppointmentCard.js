import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Badge } from './UI';
import { format, parseISO } from 'date-fns';

const SERVICE_ICONS = {
    'Teeth Cleaning': 'sparkles-outline',
    'Tooth Extraction': 'cut-outline',
    'Orthodontic Consultation': 'chatbubble-outline',
    'Braces Adjustment': 'construct-outline',
    'Dental Checkup': 'search-outline',
    'Root Canal': 'medical-outline',
    'Dental Filling': 'color-fill-outline',
    'Teeth Whitening': 'sunny-outline',
    'Dentures': 'happy-outline',
    'Other': 'ellipsis-horizontal-circle-outline',
};

export default function AppointmentCard({ appointment, onPress, onEdit, onDelete }) {
    const { theme } = useTheme();
    const { user } = useAuth();
    const isDoctor = user?.role === 'doctor';

    const dateObj = parseISO(appointment.date);
    const dayName = format(dateObj, 'EEE');
    const dayNum = format(dateObj, 'd');
    const monthName = format(dateObj, 'MMM yyyy');
    const [hour, min] = appointment.time.split(':');
    const timeH = parseInt(hour);
    const ampm = timeH >= 12 ? 'PM' : 'AM';
    const displayHour = timeH > 12 ? timeH - 12 : timeH === 0 ? 12 : timeH;
    const displayTime = `${displayHour}:${min} ${ampm}`;

    const icon = SERVICE_ICONS[appointment.service] || SERVICE_ICONS['Other'];

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={{
                backgroundColor: theme.bgCard,
                borderRadius: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: theme.border,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
                elevation: 2,
            }}
        >
            {/* Top color bar based on status */}
            <View style={{
                height: 4,
                backgroundColor: appointment.status === 'confirmed' ? theme.primary
                    : appointment.status === 'cancelled' ? theme.danger
                        : theme.warning,
            }} />

            <View style={{ flexDirection: 'row', padding: 14 }}>
                {/* Date block */}
                <View style={{
                    width: 54, alignItems: 'center', justifyContent: 'center',
                    backgroundColor: theme.bgInput, borderRadius: 12,
                    paddingVertical: 8, marginRight: 14,
                }}>
                    <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' }}>{dayName}</Text>
                    <Text style={{ color: theme.text, fontSize: 24, fontWeight: '800', lineHeight: 28 }}>{dayNum}</Text>
                    <Text style={{ color: theme.textMuted, fontSize: 10, fontWeight: '600' }}>{monthName}</Text>
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Ionicons name={icon} size={14} color={theme.primary} style={{ marginRight: 5 }} />
                        <Text style={{ color: theme.text, fontSize: 15, fontWeight: '700', flex: 1 }} numberOfLines={1}>
                            {appointment.service}
                        </Text>
                    </View>

                    {isDoctor ? (
                        <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 4 }}>
                            👤 {appointment.patientName}
                        </Text>
                    ) : (
                        <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 4 }}>
                            🩺 {appointment.doctorName}
                        </Text>
                    )}

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="time-outline" size={13} color={theme.textMuted} style={{ marginRight: 3 }} />
                            <Text style={{ color: theme.textMuted, fontSize: 13 }}>{displayTime}</Text>
                        </View>
                        <Badge label={appointment.status} />
                    </View>

                    {appointment.notes ? (
                        <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 6, fontStyle: 'italic' }} numberOfLines={1}>
                            "{appointment.notes}"
                        </Text>
                    ) : null}
                </View>
            </View>

            {/* Actions */}
            {(onEdit || onDelete) && appointment.status !== 'cancelled' && (
                <View style={{
                    flexDirection: 'row',
                    borderTopWidth: 1,
                    borderColor: theme.border,
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                }}>
                    {onEdit && (
                        <TouchableOpacity
                            onPress={onEdit}
                            style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}
                        >
                            <Ionicons name="pencil-outline" size={15} color={theme.primary} style={{ marginRight: 4 }} />
                            <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '600' }}>Edit</Text>
                        </TouchableOpacity>
                    )}
                    {onDelete && (
                        <TouchableOpacity
                            onPress={onDelete}
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                            <Ionicons name="trash-outline" size={15} color={theme.danger} style={{ marginRight: 4 }} />
                            <Text style={{ color: theme.danger, fontSize: 13, fontWeight: '600' }}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
}