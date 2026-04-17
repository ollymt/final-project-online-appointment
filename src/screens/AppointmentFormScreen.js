import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentContext';
import { Input, Button, Card } from '../components/UI';
import { format, addDays, parseISO } from 'date-fns';

const SERVICES = [
    'Teeth Cleaning', 'Dental Checkup', 'Tooth Extraction',
    'Dental Filling', 'Root Canal', 'Teeth Whitening',
    'Orthodontic Consultation', 'Braces Adjustment', 'Dentures', 'Other',
];

const TIMES = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00',
];

const DOCTORS = [
    { id: 'doctor_001', name: 'Dr. Maria Santos', specialty: 'General Dentistry' },
    { id: 'doctor_002', name: 'Dr. James Reyes', specialty: 'Orthodontics' },
];

function SelectorModal({ title, options, selected, onSelect, renderItem, theme }) {
    return (
        <View style={{
            backgroundColor: theme.bgCard,
            borderRadius: 16, borderWidth: 1, borderColor: theme.border,
            marginBottom: 16, overflow: 'hidden',
        }}>
            <Text style={{
                color: theme.textSecondary, fontSize: 13, fontWeight: '600',
                paddingHorizontal: 14, paddingTop: 14, paddingBottom: 8,
                letterSpacing: 0.5,
            }}>{title}</Text>
            {options.map((opt, i) => {
                const isSelected = renderItem ? selected?.id === opt.id : selected === opt;
                return (
                    <TouchableOpacity
                        key={renderItem ? opt.id : opt}
                        onPress={() => onSelect(opt)}
                        style={{
                            flexDirection: 'row', alignItems: 'center',
                            paddingHorizontal: 14, paddingVertical: 12,
                            backgroundColor: isSelected ? theme.primary + '15' : 'transparent',
                            borderTopWidth: i > 0 ? 1 : 0,
                            borderColor: theme.border,
                        }}
                    >
                        <View style={{
                            width: 20, height: 20, borderRadius: 10,
                            borderWidth: 2,
                            borderColor: isSelected ? theme.primary : theme.border,
                            alignItems: 'center', justifyContent: 'center',
                            marginRight: 12,
                        }}>
                            {isSelected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.primary }} />}
                        </View>
                        {renderItem ? renderItem(opt, isSelected) : (
                            <Text style={{ color: isSelected ? theme.primary : theme.text, fontWeight: isSelected ? '700' : '400', fontSize: 14 }}>
                                {opt}
                            </Text>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

function DatePicker({ selected, onSelect, theme }) {
    const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));
    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, letterSpacing: 0.5 }}>
                Select Date
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                {dates.map((date, i) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isSelected = selected === dateStr;
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => onSelect(dateStr)}
                            style={{
                                width: 60, height: 72, borderRadius: 14,
                                alignItems: 'center', justifyContent: 'center',
                                marginRight: 8,
                                backgroundColor: isSelected ? theme.primary : theme.bgCard,
                                borderWidth: 1.5,
                                borderColor: isSelected ? theme.primary : theme.border,
                            }}
                        >
                            <Text style={{
                                color: isSelected ? 'rgba(255,255,255,0.8)' : theme.textMuted,
                                fontSize: 11, fontWeight: '700', textTransform: 'uppercase',
                            }}>
                                {format(date, 'EEE')}
                            </Text>
                            <Text style={{
                                color: isSelected ? '#fff' : theme.text,
                                fontSize: 20, fontWeight: '900', lineHeight: 24,
                            }}>
                                {format(date, 'd')}
                            </Text>
                            <Text style={{
                                color: isSelected ? 'rgba(255,255,255,0.7)' : theme.textMuted,
                                fontSize: 10,
                            }}>
                                {format(date, 'MMM')}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

function TimePicker({ selected, onSelect, theme }) {
    const formatTime = (t) => {
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const dh = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${dh}:${m} ${ampm}`;
    };

    return (
        <View style={{ marginBottom: 16 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 8, letterSpacing: 0.5 }}>
                Select Time
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {TIMES.map(t => {
                    const isSelected = selected === t;
                    return (
                        <TouchableOpacity
                            key={t}
                            onPress={() => onSelect(t)}
                            style={{
                                paddingHorizontal: 14, paddingVertical: 9,
                                borderRadius: 10,
                                backgroundColor: isSelected ? theme.primary : theme.bgCard,
                                borderWidth: 1.5,
                                borderColor: isSelected ? theme.primary : theme.border,
                            }}
                        >
                            <Text style={{
                                color: isSelected ? '#fff' : theme.text,
                                fontSize: 13, fontWeight: '600',
                            }}>
                                {formatTime(t)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

export default function AppointmentFormScreen({ route, navigation }) {
    const { appointmentId } = route.params || {};
    const isEditing = !!appointmentId;
    const { theme } = useTheme();
    const { user } = useAuth();
    const { allAppointments, createAppointment, updateAppointment } = useAppointments();

    const existing = isEditing ? allAppointments.find(a => a.id === appointmentId) : null;

    const [form, setForm] = useState({
        service: existing?.service || '',
        date: existing?.date || '',
        time: existing?.time || '',
        notes: existing?.notes || '',
        doctor: existing ? DOCTORS.find(d => d.id === existing.doctorId) || DOCTORS[0] : DOCTORS[0],
        // doctor-only fields
        patientName: existing?.patientName || '',
        patientPhone: existing?.patientPhone || '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const isDoctor = user?.role === 'doctor';

    const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

    const validate = () => {
        const e = {};
        if (!form.service) e.service = 'Please select a service.';
        if (!form.date) e.date = 'Please select a date.';
        if (!form.time) e.time = 'Please select a time.';
        if (isDoctor && !form.patientName.trim()) e.patientName = 'Patient name is required.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);

        const payload = {
            service: form.service,
            date: form.date,
            time: form.time,
            notes: form.notes.trim(),
            doctorId: form.doctor.id,
            doctorName: form.doctor.name,
            patientId: isDoctor ? (existing?.patientId || `manual_${Date.now()}`) : user.id,
            patientName: isDoctor ? form.patientName.trim() : user.name,
            patientPhone: isDoctor ? form.patientPhone.trim() : (user.phone || ''),
        };

        let result;
        if (isEditing) {
            result = await updateAppointment(appointmentId, payload);
        } else {
            result = await createAppointment(payload);
        }

        setLoading(false);
        if (result.success) {
            navigation.goBack();
        } else {
            Alert.alert('Error', result.error);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={theme.statusBar} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 12 }}>
                            <Ionicons name="arrow-back" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={{ color: theme.text, fontSize: 20, fontWeight: '900', letterSpacing: -0.3 }}>
                            {isEditing ? 'Edit Appointment' : 'Book Appointment'}
                        </Text>
                    </View>

                    {/* Doctor info for patients */}
                    {!isDoctor && (
                        <SelectorModal
                            title="Choose Doctor"
                            options={DOCTORS}
                            selected={form.doctor}
                            onSelect={d => set('doctor', d)}
                            theme={theme}
                            renderItem={(doc, isSelected) => (
                                <View>
                                    <Text style={{ color: isSelected ? theme.primary : theme.text, fontWeight: '700', fontSize: 14 }}>
                                        {doc.name}
                                    </Text>
                                    <Text style={{ color: theme.textMuted, fontSize: 12 }}>{doc.specialty}</Text>
                                </View>
                            )}
                        />
                    )}

                    {/* Patient info for doctors */}
                    {isDoctor && (
                        <Card>
                            <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
                                Patient Information
                            </Text>
                            <Input
                                label="Patient Full Name"
                                icon="person-outline"
                                placeholder="e.g. Juan Dela Cruz"
                                value={form.patientName}
                                onChangeText={v => set('patientName', v)}
                                error={errors.patientName}
                            />
                            <Input
                                label="Patient Phone (optional)"
                                icon="call-outline"
                                placeholder="09XXXXXXXXX"
                                value={form.patientPhone}
                                onChangeText={v => set('patientPhone', v)}
                                keyboardType="phone-pad"
                            />
                            <SelectorModal
                                title="Assign Doctor"
                                options={DOCTORS}
                                selected={form.doctor}
                                onSelect={d => set('doctor', d)}
                                theme={theme}
                                renderItem={(doc, isSelected) => (
                                    <View>
                                        <Text style={{ color: isSelected ? theme.primary : theme.text, fontWeight: '700', fontSize: 14 }}>
                                            {doc.name}
                                        </Text>
                                        <Text style={{ color: theme.textMuted, fontSize: 12 }}>{doc.specialty}</Text>
                                    </View>
                                )}
                            />
                        </Card>
                    )}

                    {/* Service selection */}
                    <SelectorModal
                        title="Select Service"
                        options={SERVICES}
                        selected={form.service}
                        onSelect={s => set('service', s)}
                        theme={theme}
                    />
                    {errors.service && <Text style={{ color: theme.danger, fontSize: 12, marginTop: -10, marginBottom: 12 }}>{errors.service}</Text>}

                    {/* Date picker */}
                    <DatePicker selected={form.date} onSelect={d => set('date', d)} theme={theme} />
                    {errors.date && <Text style={{ color: theme.danger, fontSize: 12, marginTop: -8, marginBottom: 12 }}>{errors.date}</Text>}

                    {/* Time picker */}
                    <TimePicker selected={form.time} onSelect={t => set('time', t)} theme={theme} />
                    {errors.time && <Text style={{ color: theme.danger, fontSize: 12, marginTop: -8, marginBottom: 12 }}>{errors.time}</Text>}

                    {/* Notes */}
                    <Input
                        label="Notes (optional)"
                        icon="document-text-outline"
                        placeholder="Any additional information..."
                        value={form.notes}
                        onChangeText={v => set('notes', v)}
                        multiline
                        numberOfLines={3}
                        inputStyle={{ height: 80, textAlignVertical: 'top' }}
                    />

                    <Button
                        title={isEditing ? 'Save Changes' : 'Book Appointment'}
                        onPress={handleSubmit}
                        loading={loading}
                        icon={isEditing ? 'checkmark-circle-outline' : 'calendar-outline'}
                        style={{ marginTop: 8 }}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}