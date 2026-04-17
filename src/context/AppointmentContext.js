import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

const AppointmentContext = createContext();

const SEED_APPOINTMENTS = [
    {
        id: 'appt_001',
        patientId: 'patient_001',
        patientName: 'Ana Dela Cruz',
        patientPhone: '09171234567',
        doctorId: 'doctor_001',
        doctorName: 'Dr. Maria Santos',
        service: 'Teeth Cleaning',
        date: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toISOString().split('T')[0]; })(),
        time: '09:00',
        status: 'confirmed',
        notes: 'First visit',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'appt_002',
        patientId: 'patient_002',
        patientName: 'Ben Villanueva',
        patientPhone: '09281234567',
        doctorId: 'doctor_001',
        doctorName: 'Dr. Maria Santos',
        service: 'Tooth Extraction',
        date: (() => { const d = new Date(); d.setDate(d.getDate() + 5); return d.toISOString().split('T')[0]; })(),
        time: '14:00',
        status: 'pending',
        notes: 'Lower left molar',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'appt_003',
        patientId: 'patient_003',
        patientName: 'Carmen Ramos',
        patientPhone: '09391234567',
        doctorId: 'doctor_002',
        doctorName: 'Dr. James Reyes',
        service: 'Orthodontic Consultation',
        date: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0]; })(),
        time: '10:30',
        status: 'confirmed',
        notes: '',
        createdAt: new Date().toISOString(),
    },
    {
        id: 'appt_004',
        patientId: 'patient_001',
        patientName: 'Ana Dela Cruz',
        patientPhone: '09171234567',
        doctorId: 'doctor_002',
        doctorName: 'Dr. James Reyes',
        service: 'Braces Adjustment',
        date: (() => { const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split('T')[0]; })(),
        time: '11:00',
        status: 'pending',
        notes: '',
        createdAt: new Date().toISOString(),
    },
];

export function AppointmentProvider({ children }) {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            const stored = await AsyncStorage.getItem('@appointments');
            if (stored) {
                setAppointments(JSON.parse(stored));
            } else {
                await AsyncStorage.setItem('@appointments', JSON.stringify(SEED_APPOINTMENTS));
                setAppointments(SEED_APPOINTMENTS);
            }
        } catch { }
    };

    const save = async (data) => {
        await AsyncStorage.setItem('@appointments', JSON.stringify(data));
        setAppointments(data);
    };

    const getVisible = () => {
        if (!user) return [];
        if (user.role === 'doctor') return appointments;
        return appointments.filter(a => a.patientId === user.id);
    };

    const createAppointment = async (appt) => {
        try {
            // Check for time conflict
            const conflict = appointments.find(
                a => a.date === appt.date && a.time === appt.time && a.doctorId === appt.doctorId && a.status !== 'cancelled'
            );
            if (conflict) return { success: false, error: 'This time slot is already taken. Please choose another.' };

            const newAppt = {
                ...appt,
                id: `appt_${Date.now()}`,
                createdAt: new Date().toISOString(),
                status: 'pending',
            };
            const updated = [...appointments, newAppt];
            await save(updated);
            return { success: true, appointment: newAppt };
        } catch {
            return { success: false, error: 'Failed to create appointment.' };
        }
    };

    const updateAppointment = async (id, updates) => {
        try {
            // Cancellation: only allow 24h before
            const appt = appointments.find(a => a.id === id);
            if (!appt) return { success: false, error: 'Appointment not found.' };

            if (updates.date && updates.date !== appt.date) {
                const apptDate = new Date(`${updates.date}T${updates.time || appt.time}`);
                const now = new Date();
                const hoursUntil = (apptDate - now) / (1000 * 60 * 60);
                if (hoursUntil < 24 && user?.role !== 'doctor') {
                    return { success: false, error: 'Rescheduling must be done at least 24 hours in advance.' };
                }
                // Check conflict for new slot
                const conflict = appointments.find(
                    a => a.id !== id && a.date === updates.date && a.time === (updates.time || appt.time) && a.doctorId === appt.doctorId && a.status !== 'cancelled'
                );
                if (conflict) return { success: false, error: 'This time slot is already taken.' };
            }

            const updated = appointments.map(a => a.id === id ? { ...a, ...updates } : a);
            await save(updated);
            return { success: true };
        } catch {
            return { success: false, error: 'Failed to update appointment.' };
        }
    };

    const deleteAppointment = async (id) => {
        try {
            const appt = appointments.find(a => a.id === id);
            if (!appt) return { success: false, error: 'Not found.' };

            // Keep your 24h rule for patients
            if (user?.role !== 'doctor') {
                const apptDate = new Date(`${appt.date}T${appt.time}`);
                const hoursUntil = (apptDate - new Date()) / (1000 * 60 * 60);
                if (hoursUntil < 24) {
                    return { success: false, error: 'Cancellations must be made at least 24 hours in advance.' };
                }
            }

            // SOFT DELETE: Change status instead of filtering out
            const updated = appointments.map(a =>
                a.id === id ? { ...a, status: 'cancelled' } : a
            );

            await save(updated);
            return { success: true };
        } catch {
            return { success: false, error: 'Failed to cancel appointment.' };
        }
    };

    const getUpcoming = () => {
        const visible = getVisible();
        const now = new Date();
        return visible
            .filter(a => {
                const d = new Date(`${a.date}T${a.time}`);
                return d >= now && a.status !== 'cancelled';
            })
            .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));
    };

    return (
        <AppointmentContext.Provider value={{
            appointments: getVisible(),
            allAppointments: appointments,
            createAppointment,
            updateAppointment,
            deleteAppointment,
            getUpcoming,
            reload: loadAppointments,
        }}>
            {children}
        </AppointmentContext.Provider>
    );
}

export const useAppointments = () => useContext(AppointmentContext);