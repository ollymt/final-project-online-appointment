import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentContext';
import { Card, Button, Badge } from '../components/UI';
import { format, parseISO } from 'date-fns';

function InfoRow({ icon, label, value, theme }) {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
            <View style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: theme.bgInput,
                alignItems: 'center', justifyContent: 'center',
                marginRight: 12,
            }}>
                <Ionicons name={icon} size={18} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{label}</Text>
                <Text style={{ color: theme.text, fontSize: 15, fontWeight: '600' }}>{value}</Text>
            </View>
        </View>
    );
}

export default function AppointmentDetailScreen({ route, navigation }) {
    const { appointmentId } = route.params;
    const { theme } = useTheme();
    const { user } = useAuth();

    // Destructured updateAppointment from context
    const { allAppointments, deleteAppointment, updateAppointment } = useAppointments();

    const appointment = allAppointments.find(a => a.id === appointmentId);

    if (!appointment) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: theme.text }}>Appointment not found.</Text>
                <Button title="Go Back" onPress={() => navigation.goBack()} style={{ marginTop: 16 }} />
            </SafeAreaView>
        );
    }

    const dateObj = parseISO(appointment.date);
    const [h, m] = appointment.time.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const dh = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayTime = `${dh}:${m} ${ampm}`;

    const isDoctor = user?.role === 'doctor';
    const canEdit = appointment.status !== 'cancelled';

    // Logic for Doctor to confirm appointment
    const handleConfirm = async () => {
        Alert.alert(
            'Confirm Appointment',
            'Are you sure you want to confirm this appointment?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Confirm',
                    onPress: async () => {
                        const res = await updateAppointment(appointment.id, { status: 'confirmed' });
                        if (!res.success) {
                            Alert.alert('Error', res.error);
                        }
                    },
                },
            ]
        );
    };

    const handleDelete = () => {
        Alert.alert(
            'Cancel Appointment',
            'Are you sure you want to cancel this appointment?',
            [
                { text: 'Keep', style: 'cancel' },
                {
                    text: 'Cancel Appointment', style: 'destructive',
                    onPress: async () => {
                        const res = await deleteAppointment(appointment.id);
                        if (res.success) {
                            navigation.goBack();
                        } else {
                            Alert.alert('Cannot Cancel', res.error);
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={theme.statusBar} />
            <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                {/* Back button */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} onPress={() => navigation.goBack()} />
                    <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800', marginLeft: 12 }}>Appointment Details</Text>
                </View>

                {/* Status header */}
                <Card style={{ marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: theme.text, fontSize: 20, fontWeight: '900', marginBottom: 6 }}>
                                {appointment.service}
                            </Text>
                            <Badge label={appointment.status} />
                        </View>
                        <View style={{
                            width: 56, height: 56, borderRadius: 16,
                            backgroundColor: theme.primaryDark + '20',
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Ionicons name="medical" size={28} color={theme.primary} />
                        </View>
                    </View>
                </Card>

                {/* Date & time */}
                <Card>
                    <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
                        Schedule
                    </Text>
                    <InfoRow icon="calendar-outline" label="Date" value={format(dateObj, 'EEEE, MMMM d, yyyy')} theme={theme} />
                    <InfoRow icon="time-outline" label="Time" value={displayTime} theme={theme} />
                </Card>

                {/* People */}
                <Card>
                    <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
                        People
                    </Text>
                    <InfoRow icon="person-circle-outline" label="Doctor" value={appointment.doctorName} theme={theme} />
                    <InfoRow icon="person-outline" label="Patient" value={appointment.patientName} theme={theme} />
                    {appointment.patientPhone && (
                        <InfoRow icon="call-outline" label="Contact" value={appointment.patientPhone} theme={theme} />
                    )}
                </Card>

                {/* Notes */}
                {appointment.notes ? (
                    <Card>
                        <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                            Notes
                        </Text>
                        <Text style={{ color: theme.text, fontSize: 14, lineHeight: 22 }}>{appointment.notes}</Text>
                    </Card>
                ) : null}

                {/* Meta */}
                <Card>
                    <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
                        Created
                    </Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 13 }}>
                        {format(new Date(appointment.createdAt), 'MMMM d, yyyy · h:mm a')}
                    </Text>
                </Card>

                {/* Actions */}
                {canEdit && (
                    <View style={{ gap: 10, marginTop: 10 }}>
                        {/* DOCTOR ONLY: Confirm Button */}
                        {isDoctor && appointment.status === 'pending' && (
                            <Button
                                title="Confirm Appointment"
                                icon="checkmark-circle-outline"
                                variant="primary"
                                onPress={handleConfirm}
                            />
                        )}

                        <Button
                            title="Edit Appointment"
                            icon="pencil-outline"
                            variant="outline"
                            onPress={() => navigation.navigate('EditAppointment', { appointmentId: appointment.id })}
                        />

                        <Button
                            title="Cancel Appointment"
                            icon="trash-outline"
                            variant="danger"
                            onPress={handleDelete}
                        />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}