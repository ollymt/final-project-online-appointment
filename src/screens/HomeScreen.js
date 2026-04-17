import React from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentContext';
import { Card, SectionHeader, EmptyState } from '../components/UI';
import AppointmentCard from '../components/AppointmentCard';
import { format, parseISO, isToday, isTomorrow, differenceInDays } from 'date-fns';

function UpcomingBanner({ appointment, onPress, theme }) {
    if (!appointment) return null;

    const dateObj = parseISO(appointment.date);
    let dateLabel = format(dateObj, 'MMMM d, yyyy');
    if (isToday(dateObj)) dateLabel = 'Today';
    else if (isTomorrow(dateObj)) dateLabel = 'Tomorrow';
    else {
        const days = differenceInDays(dateObj, new Date());
        dateLabel = `In ${days} days`;
    }

    const [hour, min] = appointment.time.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const dh = h > 12 ? h - 12 : h === 0 ? 12 : h;
    const displayTime = `${dh}:${min} ${ampm}`;

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
            <View style={{
                borderRadius: 20,
                overflow: 'hidden',
                marginBottom: 24,
                backgroundColor: theme.primary,
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
            }}>
                <View style={{ padding: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                        <View style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: 10, padding: 6, marginRight: 8,
                        }}>
                            <Ionicons name="calendar" size={16} color="#fff" />
                        </View>
                        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                            Next Appointment
                        </Text>
                    </View>

                    <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginBottom: 4 }}>
                        {appointment.service}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 16 }}>
                        {appointment.doctorName}
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 12 }}>
                        <View style={{
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14,
                            flexDirection: 'row', alignItems: 'center',
                        }}>
                            <Ionicons name="calendar-outline" size={14} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{dateLabel}</Text>
                        </View>
                        <View style={{
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14,
                            flexDirection: 'row', alignItems: 'center',
                        }}>
                            <Ionicons name="time-outline" size={14} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{displayTime}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

function QuickStatCard({ icon, label, value, color, theme }) {
    return (
        <View style={{
            flex: 1, backgroundColor: theme.bgCard,
            borderRadius: 14, padding: 14, alignItems: 'center',
            borderWidth: 1, borderColor: theme.border,
        }}>
            <View style={{
                width: 40, height: 40, borderRadius: 12,
                backgroundColor: color + '20',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 8,
            }}>
                <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={{ color: theme.text, fontSize: 20, fontWeight: '900' }}>{value}</Text>
            <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '600', textAlign: 'center', marginTop: 2 }}>{label}</Text>
        </View>
    );
}

export default function HomeScreen({ navigation }) {
    const { theme } = useTheme();
    const { user } = useAuth();
    const { appointments, getUpcoming } = useAppointments();

    const upcoming = getUpcoming();
    const nextAppt = upcoming[0];
    const todayAppts = upcoming.filter(a => isToday(parseISO(a.date)));
    const confirmed = appointments.filter(a => a.status === 'confirmed').length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const isDoctor = user?.role === 'doctor';

    const greeting = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={theme.statusBar} />
            <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={{ marginBottom: 24 }}>
                    <Text style={{ color: theme.textSecondary, fontSize: 14 }}>{greeting()},</Text>
                    <Text style={{ color: theme.text, fontSize: 26, fontWeight: '900', letterSpacing: -0.5 }}>
                        {user?.name?.split(' ')[0]} 👋
                    </Text>
                    {isDoctor && (
                        <View style={{
                            marginTop: 6, backgroundColor: theme.primaryDark + '30',
                            borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3,
                            alignSelf: 'flex-start',
                        }}>
                            <Text style={{ color: theme.primary, fontSize: 12, fontWeight: '700' }}>
                                {user.specialty || 'Doctor'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Upcoming banner */}
                {!isDoctor && (
                    <UpcomingBanner
                        appointment={nextAppt}
                        theme={theme}
                        onPress={() => navigation.navigate('Appointments')}
                    />
                )}

                {/* Doctor upcoming */}
                {isDoctor && nextAppt && (
                    <Card style={{ marginBottom: 20, backgroundColor: theme.primaryDark, borderColor: theme.primary }}>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 }}>
                            Next Appointment
                        </Text>
                        <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800' }}>{nextAppt.service}</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 }}>
                            Patient: {nextAppt.patientName} · {format(parseISO(nextAppt.date), 'MMM d')} at {nextAppt.time}
                        </Text>
                    </Card>
                )}

                {/* Stats */}
                <SectionHeader title="Overview" />
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
                    <QuickStatCard icon="calendar-outline" label="Total" value={appointments.length} color={theme.primary} theme={theme} />
                    <QuickStatCard icon="checkmark-circle-outline" label="Confirmed" value={confirmed} color={theme.success} theme={theme} />
                    <QuickStatCard icon="time-outline" label="Pending" value={pending} color={theme.warning} theme={theme} />
                </View>

                {/* Today's appointments */}
                <SectionHeader
                    title={isDoctor ? "Today's Schedule" : "Today's Appointments"}
                    action="View All"
                    onAction={() => navigation.navigate('Appointments')}
                />

                {todayAppts.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon="sunny-outline"
                            title="Nothing today"
                            subtitle={isDoctor ? "No appointments scheduled for today." : "You have no appointments today. Want to book one?"}
                            actionLabel={!isDoctor ? "Book Appointment" : undefined}
                            onAction={() => navigation.navigate('NewAppointment')}
                        />
                    </Card>
                ) : (
                    todayAppts.slice(0, 3).map(a => (
                        <AppointmentCard
                            key={a.id}
                            appointment={a}
                            onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: a.id })}
                        />
                    ))
                )}

                {upcoming.length > 0 && (
                    <>
                        <SectionHeader title="Upcoming" style={{ marginTop: 8 }} action="See All" onAction={() => navigation.navigate('Appointments')} />
                        {upcoming.filter(a => !isToday(parseISO(a.date))).slice(0, 3).map(a => (
                            <AppointmentCard
                                key={a.id}
                                appointment={a}
                                onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: a.id })}
                            />
                        ))}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}