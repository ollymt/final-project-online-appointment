import React, { useState } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentContext';
import { Button, EmptyState } from '../components/UI';
import AppointmentCard from '../components/AppointmentCard';

const FILTERS = ['All', 'Upcoming', 'Confirmed', 'Pending', 'Cancelled'];

export default function AppointmentsScreen({ navigation }) {
    const { theme } = useTheme();
    const { user } = useAuth();
    const { appointments, deleteAppointment } = useAppointments();
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    const isDoctor = user?.role === 'doctor';
    const now = new Date();

    const filtered = appointments.filter(a => {
        const matchSearch = search.trim() === '' ||
            a.service.toLowerCase().includes(search.toLowerCase()) ||
            a.patientName.toLowerCase().includes(search.toLowerCase()) ||
            a.doctorName.toLowerCase().includes(search.toLowerCase());

        const apptDate = new Date(`${a.date}T${a.time}`);
        const matchFilter =
            filter === 'All' ? true :
                filter === 'Upcoming' ? (apptDate >= now && a.status !== 'cancelled') :
                    a.status === filter.toLowerCase();

        return matchSearch && matchFilter;
    }).sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

    const handleDelete = (appt) => {
        Alert.alert(
            'Cancel Appointment',
            `Are you sure you want to cancel your appointment for "${appt.service}"?`,
            [
                { text: 'Keep Appointment', style: 'cancel' },
                {
                    text: 'Cancel Appointment', style: 'destructive',
                    onPress: async () => {
                        const res = await deleteAppointment(appt.id);
                        if (!res.success) Alert.alert('Cannot Cancel', res.error);
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={theme.statusBar} />
            <View style={{ flex: 1 }}>
                {/* Header */}
                <View style={{
                    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
                    backgroundColor: theme.bg, borderBottomWidth: 1, borderColor: theme.border,
                }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                        <Text style={{ color: theme.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 }}>
                            {isDoctor ? 'All Appointments' : 'My Appointments'}
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('NewAppointment')}
                            style={{
                                backgroundColor: theme.primary,
                                width: 38, height: 38, borderRadius: 12,
                                alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <Ionicons name="add" size={22} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Search */}
                    <View style={{
                        flexDirection: 'row', alignItems: 'center',
                        backgroundColor: theme.bgInput, borderRadius: 12,
                        paddingHorizontal: 12, marginBottom: 12,
                        borderWidth: 1, borderColor: theme.border,
                    }}>
                        <Ionicons name="search-outline" size={18} color={theme.textMuted} style={{ marginRight: 8 }} />
                        <TextInput
                            style={{ flex: 1, color: theme.text, fontSize: 14, paddingVertical: 11 }}
                            placeholder="Search appointments..."
                            placeholderTextColor={theme.textMuted}
                            value={search}
                            onChangeText={setSearch}
                        />
                        {search.length > 0 && (
                            <TouchableOpacity onPress={() => setSearch('')}>
                                <Ionicons name="close-circle" size={18} color={theme.textMuted} />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Filters */}
                    <FlatList
                        horizontal
                        data={FILTERS}
                        keyExtractor={i => i}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => setFilter(item)}
                                style={{
                                    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                                    marginRight: 8,
                                    backgroundColor: filter === item ? theme.primary : theme.bgInput,
                                    borderWidth: 1,
                                    borderColor: filter === item ? theme.primary : theme.border,
                                }}
                            >
                                <Text style={{
                                    color: filter === item ? '#fff' : theme.textSecondary,
                                    fontSize: 13, fontWeight: '600',
                                }}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {/* List */}
                <FlatList
                    data={filtered}
                    keyExtractor={i => i.id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <EmptyState
                            icon="calendar-outline"
                            title="No appointments found"
                            subtitle={filter !== 'All' ? `No ${filter.toLowerCase()} appointments.` : "You haven't booked any appointments yet."}
                            actionLabel="Book Now"
                            onAction={() => navigation.navigate('NewAppointment')}
                        />
                    }
                    renderItem={({ item }) => (
                        <AppointmentCard
                            appointment={item}
                            onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
                            onEdit={item.status !== 'cancelled' ? () => navigation.navigate('EditAppointment', { appointmentId: item.id }) : undefined}
                            onDelete={item.status !== 'cancelled' ? () => handleDelete(item) : undefined}
                        />
                    )}
                />
            </View>
        </SafeAreaView>
    );
}