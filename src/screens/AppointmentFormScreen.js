import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    KeyboardAvoidingView, Platform, Alert, BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useAppointments } from '../context/AppointmentContext';
import { Input, Button, Card, InlineAlert, RequiredNote } from '../components/UI';
import { validateName, validatePhone, validateService, validateDate, validateTime, validateNotes, runValidators } from '../utils/validators';
import { format, addDays } from 'date-fns';

const NOTES_MAX = 300;

const SERVICES = [
    'Teeth Cleaning', 'Dental Checkup', 'Tooth Extraction',
    'Dental Filling', 'Root Canal', 'Teeth Whitening',
    'Orthodontic Consultation', 'Braces Adjustment', 'Dentures', 'Other',
];

const ALL_TIMES = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00',
];

const DOCTORS = [
    { id: 'doctor_001', name: 'Dr. Maria Santos', specialty: 'General Dentistry' },
    { id: 'doctor_002', name: 'Dr. James Reyes', specialty: 'Orthodontics' },
];

// ─── Selector (radio list) ────────────────────────────────────────────────────
function SelectorList({ title, required, options, selected, onSelect, renderItem, error, theme }) {
    return (
        <View style={{ marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 0.4 }}>{title}</Text>
                {required && <Text style={{ color: theme.danger, fontSize: 13, fontWeight: '700', marginLeft: 3 }}>*</Text>}
            </View>
            <View style={{
                backgroundColor: theme.bgCard, borderRadius: 14,
                borderWidth: 1.5, borderColor: error ? theme.danger : theme.border,
                overflow: 'hidden', marginBottom: error ? 4 : 16,
            }}>
                {options.map((opt, i) => {
                    const isSelected = renderItem ? selected?.id === opt.id : selected === opt;
                    return (
                        <TouchableOpacity
                            key={renderItem ? opt.id : opt} onPress={() => onSelect(opt)}
                            activeOpacity={0.7}
                            style={{
                                flexDirection: 'row', alignItems: 'center',
                                paddingHorizontal: 14, paddingVertical: 13,
                                backgroundColor: isSelected ? theme.primary + '12' : 'transparent',
                                borderTopWidth: i > 0 ? 1 : 0, borderColor: theme.border,
                            }}
                        >
                            <View style={{
                                width: 20, height: 20, borderRadius: 10,
                                borderWidth: 2, borderColor: isSelected ? theme.primary : theme.border,
                                alignItems: 'center', justifyContent: 'center', marginRight: 12,
                            }}>
                                {isSelected && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.primary }} />}
                            </View>
                            {renderItem ? renderItem(opt, isSelected) : (
                                <Text style={{ color: isSelected ? theme.primary : theme.text, fontWeight: isSelected ? '700' : '400', fontSize: 14 }}>
                                    {opt}
                                </Text>
                            )}
                            {isSelected && <Ionicons name="checkmark" size={16} color={theme.primary} style={{ marginLeft: 'auto' }} />}
                        </TouchableOpacity>
                    );
                })}
            </View>
            {error && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14, marginTop: -2 }}>
                    <Ionicons name="alert-circle-outline" size={13} color={theme.danger} style={{ marginRight: 4 }} />
                    <Text style={{ color: theme.danger, fontSize: 12 }}>{error}</Text>
                </View>
            )}
        </View>
    );
}

// ─── Date picker ──────────────────────────────────────────────────────────────
function DatePicker({ selected, onSelect, error, theme }) {
    const dates = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i + 1));
    return (
        <View style={{ marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 0.4 }}>Select Date</Text>
                <Text style={{ color: theme.danger, fontSize: 13, fontWeight: '700', marginLeft: 3 }}>*</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16, gap: 8 }}>
                {dates.map((date, i) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    const isSel = selected === dateStr;
                    const isWeekend = [0, 6].includes(date.getDay());
                    return (
                        <TouchableOpacity
                            key={i} onPress={() => onSelect(dateStr)} activeOpacity={0.75}
                            style={{
                                width: 58, height: 76, borderRadius: 14,
                                alignItems: 'center', justifyContent: 'center',
                                backgroundColor: isSel ? theme.primary : isWeekend ? theme.bgInput + 'aa' : theme.bgCard,
                                borderWidth: 1.5, borderColor: isSel ? theme.primary : error && !selected ? theme.danger : theme.border,
                                opacity: isWeekend ? 0.55 : 1,
                            }}
                        >
                            <Text style={{ color: isSel ? 'rgba(255,255,255,0.75)' : theme.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>
                                {format(date, 'EEE')}
                            </Text>
                            <Text style={{ color: isSel ? '#fff' : theme.text, fontSize: 20, fontWeight: '900', lineHeight: 26 }}>
                                {format(date, 'd')}
                            </Text>
                            <Text style={{ color: isSel ? 'rgba(255,255,255,0.65)' : theme.textMuted, fontSize: 9 }}>
                                {format(date, 'MMM')}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
            {isWeekendNote(selected) && (
                <InlineAlert type="warning" message="Weekends have limited availability. Please confirm with the clinic." style={{ marginTop: 8 }} />
            )}
            {error && !selected && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                    <Ionicons name="alert-circle-outline" size={13} color={theme.danger} style={{ marginRight: 4 }} />
                    <Text style={{ color: theme.danger, fontSize: 12 }}>{error}</Text>
                </View>
            )}
            <View style={{ height: 16 }} />
        </View>
    );
}

function isWeekendNote(dateStr) {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return [0, 6].includes(d.getDay());
}

// ─── Time picker ──────────────────────────────────────────────────────────────
function TimePicker({ selected, onSelect, bookedTimes = [], error, theme }) {
    const fmt = (t) => {
        const [h, m] = t.split(':');
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const dh = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${dh}:${m} ${ampm}`;
    };

    return (
        <View style={{ marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 0.4 }}>Select Time</Text>
                <Text style={{ color: theme.danger, fontSize: 13, fontWeight: '700', marginLeft: 3 }}>*</Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {ALL_TIMES.map(t => {
                    const isSel = selected === t;
                    const isBooked = bookedTimes.includes(t);
                    return (
                        <TouchableOpacity
                            key={t} onPress={() => !isBooked && onSelect(t)}
                            activeOpacity={isBooked ? 1 : 0.75}
                            style={{
                                paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10,
                                backgroundColor: isSel ? theme.primary : isBooked ? theme.bgInput : theme.bgCard,
                                borderWidth: 1.5,
                                borderColor: isSel ? theme.primary : isBooked ? theme.border : error && !selected ? theme.danger : theme.border,
                                opacity: isBooked ? 0.45 : 1,
                            }}
                        >
                            <Text style={{ color: isSel ? '#fff' : isBooked ? theme.textMuted : theme.text, fontSize: 13, fontWeight: '600' }}>
                                {fmt(t)}
                            </Text>
                            {isBooked && (
                                <Text style={{ color: theme.textMuted, fontSize: 9, textAlign: 'center', marginTop: 1 }}>Taken</Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Legend */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: theme.primary, marginRight: 5 }} />
                    <Text style={{ color: theme.textMuted, fontSize: 11 }}>Selected</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: theme.bgInput, borderWidth: 1, borderColor: theme.border, marginRight: 5 }} />
                    <Text style={{ color: theme.textMuted, fontSize: 11 }}>Taken</Text>
                </View>
            </View>

            {error && !selected && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                    <Ionicons name="alert-circle-outline" size={13} color={theme.danger} style={{ marginRight: 4 }} />
                    <Text style={{ color: theme.danger, fontSize: 12 }}>{error}</Text>
                </View>
            )}
            <View style={{ height: 16 }} />
        </View>
    );
}

// ─── Main form ────────────────────────────────────────────────────────────────
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
        doctor: existing ? (DOCTORS.find(d => d.id === existing.doctorId) || DOCTORS[0]) : DOCTORS[0],
        patientName: existing?.patientName || '',
        patientPhone: existing?.patientPhone || '',
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const isDirty = useRef(false);

    const isDoctor = user?.role === 'doctor';

    // Track dirty state
    useEffect(() => { isDirty.current = true; }, [form]);

    // Android back handler: warn if dirty
    useEffect(() => {
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            if (isDirty.current) {
                Alert.alert('Discard changes?', 'You have unsaved changes. Leave without saving?', [
                    { text: 'Keep Editing', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
                ]);
                return true;
            }
            return false;
        });
        return () => sub.remove();
    }, []);

    const set = (field, val) => {
        setForm(prev => ({ ...prev, [field]: val }));
        isDirty.current = true;
        if (touched[field]) validateSingle(field, val);
        if (formError) setFormError('');
    };

    const validateSingle = (field, val) => {
        const v = val ?? form[field];
        let err = null;
        if (field === 'patientName') err = isDoctor ? validateName(v, 'Patient name') : null;
        if (field === 'patientPhone') err = isDoctor ? validatePhone(v, false) : null;
        if (field === 'service') err = validateService(v);
        if (field === 'date') err = validateDate(v);
        if (field === 'time') err = validateTime(v);
        if (field === 'notes') err = validateNotes(v, NOTES_MAX);
        setErrors(prev => ({ ...prev, [field]: err }));
        return err;
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateSingle(field);
    };

    // Compute booked times for the selected doctor + date (exclude current appt when editing)
    const bookedTimes = allAppointments
        .filter(a => a.date === form.date && a.doctorId === form.doctor.id && a.status !== 'cancelled' && a.id !== appointmentId)
        .map(a => a.time);

    const handleBack = () => {
        if (isDirty.current) {
            Alert.alert('Discard changes?', 'You have unsaved changes. Leave without saving?', [
                { text: 'Keep Editing', style: 'cancel' },
                { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
            ]);
        } else {
            navigation.goBack();
        }
    };

    const handleSubmit = async () => {
        setTouched({ service: true, date: true, time: true, notes: true, patientName: true, patientPhone: true });

        const validators = {
            service: () => validateService(form.service),
            date: () => validateDate(form.date),
            time: () => validateTime(form.time),
            notes: () => validateNotes(form.notes, NOTES_MAX),
        };
        if (isDoctor) {
            validators.patientName = () => validateName(form.patientName, 'Patient name');
            validators.patientPhone = () => validatePhone(form.patientPhone, false);
        }

        const errs = runValidators(validators);

        // Also block if selected time is already booked
        if (form.time && bookedTimes.includes(form.time)) {
            errs.time = 'This time slot is already taken. Please choose another.';
        }

        setErrors(errs);
        if (Object.keys(errs).length > 0) {
            setFormError('Please fix the errors below before submitting.');
            return;
        }

        setFormError('');
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

        const result = isEditing
            ? await updateAppointment(appointmentId, payload)
            : await createAppointment(payload);

        setLoading(false);
        if (result.success) {
            isDirty.current = false;
            navigation.goBack();
        } else {
            setFormError(result.error);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={theme.statusBar} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                        <TouchableOpacity onPress={handleBack} style={{ marginRight: 12 }}>
                            <Ionicons name="arrow-back" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={{ color: theme.text, fontSize: 20, fontWeight: '900', letterSpacing: -0.3 }}>
                            {isEditing ? 'Edit Appointment' : 'Book Appointment'}
                        </Text>
                    </View>

                    <RequiredNote />
                    <InlineAlert type="error" message={formError} />

                    {/* Doctor view: patient info */}
                    {isDoctor && (
                        <Card>
                            <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 14 }}>
                                Patient Information
                            </Text>
                            <Input
                                label="Patient Full Name" required icon="person-outline"
                                placeholder="e.g. Juan Dela Cruz"
                                value={form.patientName} onChangeText={v => set('patientName', v)}
                                onBlur={() => handleBlur('patientName')}
                                autoCapitalize="words" autoCorrect={false}
                                error={errors.patientName}
                                success={touched.patientName && !errors.patientName && form.patientName.length > 0}
                            />
                            <Input
                                label="Patient Phone" icon="call-outline"
                                placeholder="09XXXXXXXXX"
                                value={form.patientPhone} onChangeText={v => set('patientPhone', v)}
                                onBlur={() => handleBlur('patientPhone')}
                                keyboardType="phone-pad"
                                error={errors.patientPhone}
                                success={touched.patientPhone && !errors.patientPhone && form.patientPhone.length > 0}
                                hint="Optional · PH mobile (09XXXXXXXXX)"
                                maxLength={13} showCount
                            />
                            <SelectorList
                                title="Assign Doctor" required
                                options={DOCTORS} selected={form.doctor}
                                onSelect={d => set('doctor', d)} theme={theme}
                                renderItem={(doc, isSel) => (
                                    <View>
                                        <Text style={{ color: isSel ? theme.primary : theme.text, fontWeight: '700', fontSize: 14 }}>{doc.name}</Text>
                                        <Text style={{ color: theme.textMuted, fontSize: 12 }}>{doc.specialty}</Text>
                                    </View>
                                )}
                            />
                        </Card>
                    )}

                    {/* Patient view: choose doctor */}
                    {!isDoctor && (
                        <SelectorList
                            title="Choose Doctor" required
                            options={DOCTORS} selected={form.doctor}
                            onSelect={d => { set('doctor', d); set('time', ''); }} // reset time on doctor change
                            theme={theme}
                            renderItem={(doc, isSel) => (
                                <View>
                                    <Text style={{ color: isSel ? theme.primary : theme.text, fontWeight: '700', fontSize: 14 }}>{doc.name}</Text>
                                    <Text style={{ color: theme.textMuted, fontSize: 12 }}>{doc.specialty}</Text>
                                </View>
                            )}
                        />
                    )}

                    {/* Service */}
                    <SelectorList
                        title="Service" required
                        options={SERVICES} selected={form.service}
                        onSelect={s => set('service', s)}
                        error={errors.service}
                        theme={theme}
                    />

                    {/* Date */}
                    <DatePicker
                        selected={form.date}
                        onSelect={d => { set('date', d); set('time', ''); }} // reset time on date change
                        error={errors.date}
                        theme={theme}
                    />

                    {/* Time — show booked slots grayed out */}
                    {form.date ? (
                        <TimePicker
                            selected={form.time}
                            onSelect={t => set('time', t)}
                            bookedTimes={bookedTimes}
                            error={errors.time}
                            theme={theme}
                        />
                    ) : (
                        <View style={{
                            backgroundColor: theme.bgInput, borderRadius: 12,
                            padding: 16, marginBottom: 16, alignItems: 'center',
                        }}>
                            <Ionicons name="calendar-outline" size={22} color={theme.textMuted} style={{ marginBottom: 6 }} />
                            <Text style={{ color: theme.textMuted, fontSize: 13 }}>Select a date first to see available times</Text>
                        </View>
                    )}

                    {/* Notes */}
                    <Input
                        label="Notes" icon="document-text-outline"
                        placeholder="Any symptoms, allergies, or special requests..."
                        value={form.notes}
                        onChangeText={v => set('notes', v)}
                        onBlur={() => handleBlur('notes')}
                        multiline numberOfLines={4}
                        inputStyle={{ height: 90, textAlignVertical: 'top', paddingTop: 4 }}
                        error={errors.notes}
                        maxLength={NOTES_MAX}
                        showCount
                        hint={`Up to ${NOTES_MAX} characters`}
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