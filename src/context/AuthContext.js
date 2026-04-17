import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

// Seed users - in a real app these would be in a backend
const SEED_USERS = [
    {
        id: 'doctor_001',
        name: 'Dr. Maria Santos',
        email: 'dr.santos@clinic.com',
        password: 'doctor123',
        role: 'doctor',
        specialty: 'General Dentistry',
        avatar: 'MS',
    },
    {
        id: 'doctor_002',
        name: 'Dr. James Reyes',
        email: 'dr.reyes@clinic.com',
        password: 'doctor123',
        role: 'doctor',
        specialty: 'Orthodontics',
        avatar: 'JR',
    },
    {
        id: 'patient_001',
        name: 'Ana Dela Cruz',
        email: 'ana@email.com',
        password: 'patient123',
        role: 'patient',
        avatar: 'AD',
        phone: '09171234567',
    },
    {
        id: 'patient_002',
        name: 'Ben Villanueva',
        email: 'ben@email.com',
        password: 'patient123',
        role: 'patient',
        avatar: 'BV',
        phone: '09281234567',
    },
    {
        id: 'patient_003',
        name: 'Carmen Ramos',
        email: 'carmen@email.com',
        password: 'patient123',
        role: 'patient',
        avatar: 'CR',
        phone: '09391234567',
    },
];

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState(SEED_USERS);

    useEffect(() => {
        initUsers();
        loadSession();
    }, []);

    const initUsers = async () => {
        try {
            const stored = await AsyncStorage.getItem('@users');
            if (!stored) {
                await AsyncStorage.setItem('@users', JSON.stringify(SEED_USERS));
            } else {
                setAllUsers(JSON.parse(stored));
            }
        } catch { }
    };

    const loadSession = async () => {
        try {
            const session = await AsyncStorage.getItem('@session');
            if (session) setUser(JSON.parse(session));
        } catch { }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            const storedUsers = await AsyncStorage.getItem('@users');
            const users = storedUsers ? JSON.parse(storedUsers) : SEED_USERS;
            const found = users.find(
                u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
            );
            if (!found) return { success: false, error: 'Invalid email or password.' };
            const { password: _, ...safeUser } = found;
            await AsyncStorage.setItem('@session', JSON.stringify(safeUser));
            setUser(safeUser);
            return { success: true };
        } catch {
            return { success: false, error: 'Something went wrong. Please try again.' };
        }
    };

    const logout = async () => {
        await AsyncStorage.removeItem('@session');
        setUser(null);
    };

    const register = async ({ name, email, password, phone }) => {
        try {
            const storedUsers = await AsyncStorage.getItem('@users');
            const users = storedUsers ? JSON.parse(storedUsers) : SEED_USERS;
            if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
                return { success: false, error: 'Email already registered.' };
            }
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const newUser = {
                id: `patient_${Date.now()}`,
                name,
                email,
                password,
                role: 'patient',
                avatar: initials,
                phone: phone || '',
            };
            const updated = [...users, newUser];
            await AsyncStorage.setItem('@users', JSON.stringify(updated));
            const { password: _, ...safeUser } = newUser;
            await AsyncStorage.setItem('@session', JSON.stringify(safeUser));
            setUser(safeUser);
            return { success: true };
        } catch {
            return { success: false, error: 'Registration failed. Try again.' };
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, allUsers: SEED_USERS }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);