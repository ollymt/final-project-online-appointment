import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentContext';
import { Card, Avatar, Divider } from '../components/UI';

function SettingRow({ icon, label, sublabel, onPress, rightElement, color, theme }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            style={{
                flexDirection: 'row', alignItems: 'center',
                paddingVertical: 14, paddingHorizontal: 16,
            }}
        >
            <View style={{
                width: 36, height: 36, borderRadius: 10,
                backgroundColor: (color || theme.primary) + '18',
                alignItems: 'center', justifyContent: 'center',
                marginRight: 14,
            }}>
                <Ionicons name={icon} size={19} color={color || theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={{ color: color || theme.text, fontSize: 15, fontWeight: '600' }}>{label}</Text>
                {sublabel && <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 1 }}>{sublabel}</Text>}
            </View>
            {rightElement || (onPress && <Ionicons name="chevron-forward" size={16} color={theme.textMuted} />)}
        </TouchableOpacity>
    );
}

export default function ProfileScreen({ navigation }) {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const { appointments } = useAppointments();

    const isDark = theme.mode === 'dark';
    const isDoctor = user?.role === 'doctor';

    const stats = {
        total: appointments.length,
        upcoming: appointments.filter(a => new Date(`${a.date}T${a.time}`) > new Date() && a.status !== 'cancelled').length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
    };

    const handleLogout = () => {
        Alert.alert(
            'Sign Out',
            'Are you sure you want to sign out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: logout },
            ]
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={theme.statusBar} />
            <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                <Text style={{ color: theme.text, fontSize: 22, fontWeight: '900', marginBottom: 24, letterSpacing: -0.5 }}>
                    Profile
                </Text>

                {/* User card */}
                <Card style={{ marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                        <Avatar
                            initials={user?.avatar || user?.name?.slice(0, 2).toUpperCase()}
                            size={60}
                            bg={isDoctor ? theme.primaryDark : theme.accent}
                        />
                        <View style={{ marginLeft: 16, flex: 1 }}>
                            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800' }}>{user?.name}</Text>
                            <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>{user?.email}</Text>
                            <View style={{
                                marginTop: 6,
                                backgroundColor: isDoctor ? theme.primary + '20' : theme.accent + '20',
                                borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3,
                                alignSelf: 'flex-start',
                            }}>
                                <Text style={{
                                    color: isDoctor ? theme.primary : theme.accent,
                                    fontSize: 12, fontWeight: '700', textTransform: 'capitalize',
                                }}>
                                    {isDoctor ? `Doctor · ${user.specialty || 'General'}` : 'Patient'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {user?.phone && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="call-outline" size={14} color={theme.textMuted} style={{ marginRight: 6 }} />
                            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{user.phone}</Text>
                        </View>
                    )}
                </Card>

                {/* Stats */}
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                    {[
                        { label: 'Total', value: stats.total, icon: 'calendar', color: theme.primary },
                        { label: 'Upcoming', value: stats.upcoming, icon: 'arrow-forward-circle', color: theme.warning },
                        { label: 'Confirmed', value: stats.confirmed, icon: 'checkmark-circle', color: theme.success },
                    ].map(s => (
                        <View key={s.label} style={{
                            flex: 1, backgroundColor: theme.bgCard, borderRadius: 14,
                            padding: 12, alignItems: 'center',
                            borderWidth: 1, borderColor: theme.border,
                        }}>
                            <Ionicons name={s.icon} size={22} color={s.color} />
                            <Text style={{ color: theme.text, fontSize: 20, fontWeight: '900', marginTop: 4 }}>{s.value}</Text>
                            <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '600' }}>{s.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Settings */}
                <Card style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
                    <Text style={{
                        color: theme.textMuted, fontSize: 11, fontWeight: '700',
                        textTransform: 'uppercase', letterSpacing: 0.8,
                        paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4,
                    }}>
                        Preferences
                    </Text>
                    <SettingRow
                        icon={isDark ? 'moon' : 'sunny-outline'}
                        label="Dark Mode"
                        sublabel={isDark ? 'Currently using dark theme' : 'Currently using light theme'}
                        theme={theme}
                        rightElement={
                            <Switch
                                value={isDark}
                                onValueChange={toggleTheme}
                                trackColor={{ false: theme.border, true: theme.primary }}
                                thumbColor="#fff"
                            />
                        }
                    />
                </Card>

                <Card style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
                    <Text style={{
                        color: theme.textMuted, fontSize: 11, fontWeight: '700',
                        textTransform: 'uppercase', letterSpacing: 0.8,
                        paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4,
                    }}>
                        Appointments
                    </Text>
                    <SettingRow
                        icon="calendar-outline"
                        label="My Appointments"
                        sublabel={`${stats.total} appointment${stats.total !== 1 ? 's' : ''}`}
                        onPress={() => navigation.navigate('Appointments')}
                        theme={theme}
                    />
                    <Divider style={{ marginVertical: 0, marginHorizontal: 16 }} />
                    <SettingRow
                        icon="add-circle-outline"
                        label="Book New Appointment"
                        theme={theme}
                        onPress={() => navigation.navigate('NewAppointment')}
                    />
                </Card>

                <Card style={{ marginBottom: 12, padding: 0, overflow: 'hidden' }}>
                    <Text style={{
                        color: theme.textMuted, fontSize: 11, fontWeight: '700',
                        textTransform: 'uppercase', letterSpacing: 0.8,
                        paddingHorizontal: 16, paddingTop: 14, paddingBottom: 4,
                    }}>
                        About
                    </Text>
                    <SettingRow
                        icon="medical-outline"
                        label="CarePoint Clinic"
                        sublabel="Version 1.0.0"
                        theme={theme}
                    />
                    <Divider style={{ marginVertical: 0, marginHorizontal: 16 }} />
                    <SettingRow
                        icon="information-circle-outline"
                        label="Cancellation Policy"
                        sublabel="24 hours advance notice required"
                        theme={theme}
                    />
                </Card>

                {/* Logout */}
                <Card style={{ padding: 0, overflow: 'hidden' }}>
                    <SettingRow
                        icon="log-out-outline"
                        label="Sign Out"
                        color={theme.danger}
                        onPress={handleLogout}
                        theme={theme}
                    />
                </Card>

                <Text style={{
                    color: theme.textMuted, fontSize: 11, textAlign: 'center',
                    marginTop: 24, lineHeight: 16,
                }}>
                    CarePoint Clinic Scheduling App{'\n'}© 2025 All rights reserved
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}