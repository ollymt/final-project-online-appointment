import React, { useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    KeyboardAvoidingView, Platform, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Input, Button } from '../components/UI';
import { StatusBar } from 'expo-status-bar';

function LogoSection({ theme }) {
    return (
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
            <View style={{
                width: 80, height: 80, borderRadius: 24,
                backgroundColor: theme.primary,
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.35,
                shadowRadius: 16,
                elevation: 8,
            }}>
                <Ionicons name="medical" size={40} color="#fff" />
            </View>
            <Text style={{ fontSize: 28, fontWeight: '900', color: theme.text, letterSpacing: -0.5 }}>
                CarePoint
            </Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4, letterSpacing: 0.3 }}>
                Clinic Appointment Scheduling
            </Text>
        </View>
    );
}

export function LoginScreen({ navigation }) {
    const { theme } = useTheme();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const e = {};
        if (!email.trim()) e.email = 'Email is required.';
        else if (!email.includes('@')) e.email = 'Enter a valid email.';
        if (!password) e.password = 'Password is required.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) return;
        setLoading(true);
        const result = await login(email.trim(), password);
        setLoading(false);
        if (!result.success) {
            Alert.alert('Login Failed', result.error);
        }
    };

    const fillDemo = (role) => {
        if (role === 'doctor') {
            setEmail('dr.santos@clinic.com');
            setPassword('doctor123');
        } else {
            setEmail('ana@email.com');
            setPassword('patient123');
        }
        setErrors({});
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={theme.statusBar} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} showsVerticalScrollIndicator={false}>
                    <LogoSection theme={theme} />

                    <View style={{
                        backgroundColor: theme.bgCard,
                        borderRadius: 20,
                        padding: 24,
                        borderWidth: 1,
                        borderColor: theme.border,
                    }}>
                        <Text style={{ color: theme.text, fontSize: 22, fontWeight: '800', marginBottom: 6 }}>Welcome back</Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 24 }}>Sign in to your account</Text>

                        <Input
                            label="Email Address"
                            icon="mail-outline"
                            placeholder="you@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={errors.email}
                        />

                        <Input
                            label="Password"
                            icon="lock-closed-outline"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPw}
                            error={errors.password}
                            inputStyle={{ flex: 1 }}
                        />
                        <TouchableOpacity
                            onPress={() => setShowPw(!showPw)}
                            style={{ position: 'absolute', right: 38, top: 118 }}
                        >
                            <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.textMuted} />
                        </TouchableOpacity>

                        <Button title="Sign In" onPress={handleLogin} loading={loading} icon="log-in-outline" style={{ marginTop: 8 }} />
                    </View>

                    {/* Demo accounts */}
                    <View style={{ marginTop: 20 }}>
                        <Text style={{ color: theme.textMuted, textAlign: 'center', fontSize: 12, marginBottom: 10, letterSpacing: 0.5 }}>
                            DEMO ACCOUNTS
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity
                                onPress={() => fillDemo('doctor')}
                                style={{
                                    flex: 1, backgroundColor: theme.bgCard, borderRadius: 12,
                                    padding: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border,
                                }}
                            >
                                <Ionicons name="person-circle-outline" size={22} color={theme.primary} />
                                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 12, marginTop: 4 }}>Doctor</Text>
                                <Text style={{ color: theme.textMuted, fontSize: 10 }}>dr.santos@clinic.com</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => fillDemo('patient')}
                                style={{
                                    flex: 1, backgroundColor: theme.bgCard, borderRadius: 12,
                                    padding: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border,
                                }}
                            >
                                <Ionicons name="person-outline" size={22} color={theme.accent} />
                                <Text style={{ color: theme.text, fontWeight: '700', fontSize: 12, marginTop: 4 }}>Patient</Text>
                                <Text style={{ color: theme.textMuted, fontSize: 10 }}>ana@email.com</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 24, alignItems: 'center' }}>
                        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
                            New patient?{' '}
                            <Text style={{ color: theme.primary, fontWeight: '700' }}>Create an account</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

export function RegisterScreen({ navigation }) {
    const { theme } = useTheme();
    const { register } = useAuth();
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

    const validate = () => {
        const e = {};
        if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Enter your full name.';
        if (!form.email.trim() || !form.email.includes('@')) e.email = 'Enter a valid email.';
        if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters.';
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) return;
        setLoading(true);
        const result = await register({ name: form.name.trim(), email: form.email.trim(), password: form.password, phone: form.phone.trim() });
        setLoading(false);
        if (!result.success) Alert.alert('Registration Failed', result.error);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={theme.statusBar} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }} showsVerticalScrollIndicator={false}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 24, marginTop: 8 }}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>

                    <LogoSection theme={theme} />

                    <View style={{
                        backgroundColor: theme.bgCard, borderRadius: 20,
                        padding: 24, borderWidth: 1, borderColor: theme.border,
                    }}>
                        <Text style={{ color: theme.text, fontSize: 22, fontWeight: '800', marginBottom: 6 }}>Create Account</Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 24 }}>Register as a patient</Text>

                        <Input label="Full Name" icon="person-outline" placeholder="Juan Dela Cruz" value={form.name} onChangeText={v => set('name', v)} error={errors.name} />
                        <Input label="Email Address" icon="mail-outline" placeholder="you@example.com" value={form.email} onChangeText={v => set('email', v)} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
                        <Input label="Phone Number (optional)" icon="call-outline" placeholder="09XXXXXXXXX" value={form.phone} onChangeText={v => set('phone', v)} keyboardType="phone-pad" />
                        <Input label="Password" icon="lock-closed-outline" placeholder="At least 6 characters" value={form.password} onChangeText={v => set('password', v)} secureTextEntry={!showPw} error={errors.password} />
                        <Input label="Confirm Password" icon="shield-checkmark-outline" placeholder="Repeat your password" value={form.confirmPassword} onChangeText={v => set('confirmPassword', v)} secureTextEntry={!showPw} error={errors.confirmPassword} />

                        <Button title="Create Account" onPress={handleRegister} loading={loading} icon="person-add-outline" style={{ marginTop: 4 }} />
                    </View>

                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 24, alignItems: 'center' }}>
                        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
                            Already have an account?{' '}
                            <Text style={{ color: theme.primary, fontWeight: '700' }}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}