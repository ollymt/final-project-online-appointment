import React, { useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Input, Button, PasswordStrengthBar, InlineAlert, RequiredNote } from '../components/UI';
import {
    validateEmail, validatePassword, validateConfirmPassword,
    validateName, validatePhone, getPasswordStrength, runValidators,
} from '../utils/validators';

// ─── Logo ────────────────────────────────────────────────────────────────────
function LogoSection({ theme }) {
    return (
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
            <View style={{
                width: 80, height: 80, borderRadius: 24,
                backgroundColor: theme.primary,
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
                shadowColor: theme.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
            }}>
                <Ionicons name="medical" size={40} color="#fff" />
            </View>
            <Text style={{ fontSize: 28, fontWeight: '900', color: theme.text, letterSpacing: -0.5 }}>CarePoint</Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4, letterSpacing: 0.3 }}>
                Clinic Appointment Scheduling
            </Text>
        </View>
    );
}

// ─── Login ────────────────────────────────────────────────────────────────────
export function LoginScreen({ navigation }) {
    const { theme } = useTheme();
    const { login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [formError, setFormError] = useState('');

    // Validate a single field on blur
    const validateField = useCallback((field, val) => {
        let err = null;
        if (field === 'email') err = validateEmail(val ?? email);
        if (field === 'password') err = val === undefined ? (password ? null : 'Password is required.') : (val ? null : 'Password is required.');
        setErrors(prev => ({ ...prev, [field]: err }));
        return err;
    }, [email, password]);

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        validateField(field);
    };

    const handleSubmit = async () => {
        // Mark all as touched
        setTouched({ email: true, password: true });
        const errs = runValidators({
            email: () => validateEmail(email),
            password: () => (password ? null : 'Password is required.'),
        });
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setFormError('');
        setLoading(true);
        const result = await login(email.trim(), password);
        setLoading(false);
        if (!result.success) setFormError(result.error);
    };

    const fillDemo = (role) => {
        if (role === 'doctor') { setEmail('dr.santos@clinic.com'); setPassword('doctor123'); }
        else { setEmail('ana@email.com'); setPassword('patient123'); }
        setErrors({}); setTouched({}); setFormError('');
    };

    // Live clear error as user types (only after first submit attempt)
    const handleEmailChange = (v) => {
        setEmail(v);
        if (touched.email) setErrors(prev => ({ ...prev, email: validateEmail(v) }));
        if (formError) setFormError('');
    };
    const handlePasswordChange = (v) => {
        setPassword(v);
        if (touched.password) setErrors(prev => ({ ...prev, password: v ? null : 'Password is required.' }));
        if (formError) setFormError('');
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={theme.statusBar} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <LogoSection theme={theme} />

                    <View style={{ backgroundColor: theme.bgCard, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: theme.border }}>
                        <Text style={{ color: theme.text, fontSize: 22, fontWeight: '800', marginBottom: 4 }}>Welcome back</Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 20 }}>Sign in to your account</Text>

                        {/* Form-level error */}
                        <InlineAlert type="error" message={formError} />

                        <Input
                            label="Email Address"
                            required
                            icon="mail-outline"
                            placeholder="you@example.com"
                            value={email}
                            onChangeText={handleEmailChange}
                            onBlur={() => handleBlur('email')}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="next"
                            error={errors.email}
                            success={touched.email && !errors.email && email.length > 0}
                        />

                        <Input
                            label="Password"
                            required
                            icon="lock-closed-outline"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={handlePasswordChange}
                            onBlur={() => handleBlur('password')}
                            secureTextEntry={!showPw}
                            returnKeyType="done"
                            onSubmitEditing={handleSubmit}
                            error={errors.password}
                            success={touched.password && !errors.password && password.length > 0}
                            rightElement={
                                <TouchableOpacity onPress={() => setShowPw(p => !p)} style={{ padding: 4 }}>
                                    <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.textMuted} />
                                </TouchableOpacity>
                            }
                        />

                        <Button title="Sign In" onPress={handleSubmit} loading={loading} icon="log-in-outline" style={{ marginTop: 4 }} />
                    </View>

                    {/* Demo accounts */}
                    <View style={{ marginTop: 20 }}>
                        <Text style={{ color: theme.textMuted, textAlign: 'center', fontSize: 12, marginBottom: 10, letterSpacing: 0.5 }}>DEMO ACCOUNTS</Text>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            {[
                                { role: 'doctor', icon: 'person-circle-outline', color: theme.primary, label: 'Doctor', sub: 'dr.santos@clinic.com' },
                                { role: 'patient', icon: 'person-outline', color: theme.accent, label: 'Patient', sub: 'ana@email.com' },
                            ].map(d => (
                                <TouchableOpacity
                                    key={d.role} onPress={() => fillDemo(d.role)}
                                    style={{ flex: 1, backgroundColor: theme.bgCard, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: theme.border }}
                                >
                                    <Ionicons name={d.icon} size={22} color={d.color} />
                                    <Text style={{ color: theme.text, fontWeight: '700', fontSize: 12, marginTop: 4 }}>{d.label}</Text>
                                    <Text style={{ color: theme.textMuted, fontSize: 10 }}>{d.sub}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 24, alignItems: 'center' }}>
                        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
                            New patient? <Text style={{ color: theme.primary, fontWeight: '700' }}>Create an account</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ─── Register ─────────────────────────────────────────────────────────────────
export function RegisterScreen({ navigation }) {
    const { theme } = useTheme();
    const { register } = useAuth();

    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [showPw, setShowPw] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [formError, setFormError] = useState('');

    const set = (field, val) => {
        setForm(prev => ({ ...prev, [field]: val }));
        // Live re-validate if already touched
        if (touched[field]) {
            const err = getSingleError(field, val, field === 'confirmPassword' ? form.password : undefined);
            setErrors(prev => ({ ...prev, [field]: err }));
        }
        // Re-validate confirmPassword when password changes
        if (field === 'password' && touched.confirmPassword) {
            const err = validateConfirmPassword(val, form.confirmPassword);
            setErrors(prev => ({ ...prev, confirmPassword: err }));
        }
        if (formError) setFormError('');
    };

    const getSingleError = (field, value, extra) => {
        const v = value ?? form[field];
        if (field === 'name') return validateName(v, 'Full name');
        if (field === 'email') return validateEmail(v);
        if (field === 'phone') return validatePhone(v, false); // optional
        if (field === 'password') return validatePassword(v);
        if (field === 'confirmPassword') return validateConfirmPassword(extra ?? form.password, v);
        return null;
    };

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
        setErrors(prev => ({ ...prev, [field]: getSingleError(field) }));
    };

    const fieldSuccess = (field) =>
        touched[field] && !errors[field] && (form[field] || '').length > 0;

    const strength = getPasswordStrength(form.password);

    const handleRegister = async () => {
        setTouched({ name: true, email: true, phone: true, password: true, confirmPassword: true });
        const errs = runValidators({
            name: () => validateName(form.name, 'Full name'),
            email: () => validateEmail(form.email),
            phone: () => validatePhone(form.phone, false),
            password: () => validatePassword(form.password),
            confirmPassword: () => validateConfirmPassword(form.password, form.confirmPassword),
        });
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setFormError('');
        setLoading(true);
        const result = await register({
            name: form.name.trim(), email: form.email.trim(),
            password: form.password, phone: form.phone.trim(),
        });
        setLoading(false);
        if (!result.success) setFormError(result.error);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
            <StatusBar style={theme.statusBar} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 24, marginTop: 8 }}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>

                    <LogoSection theme={theme} />

                    <View style={{ backgroundColor: theme.bgCard, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: theme.border }}>
                        <Text style={{ color: theme.text, fontSize: 22, fontWeight: '800', marginBottom: 4 }}>Create Account</Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 16 }}>Register as a patient</Text>

                        <RequiredNote />
                        <InlineAlert type="error" message={formError} />

                        <Input
                            label="Full Name" required icon="person-outline"
                            placeholder="e.g. Juan Dela Cruz"
                            value={form.name} onChangeText={v => set('name', v)}
                            onBlur={() => handleBlur('name')}
                            autoCapitalize="words" autoCorrect={false}
                            returnKeyType="next"
                            error={errors.name}
                            success={fieldSuccess('name')}
                            hint="Enter your first and last name"
                        />

                        <Input
                            label="Email Address" required icon="mail-outline"
                            placeholder="you@example.com"
                            value={form.email} onChangeText={v => set('email', v)}
                            onBlur={() => handleBlur('email')}
                            keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                            returnKeyType="next"
                            error={errors.email}
                            success={fieldSuccess('email')}
                        />

                        <Input
                            label="Phone Number" icon="call-outline"
                            placeholder="09XXXXXXXXX"
                            value={form.phone} onChangeText={v => set('phone', v)}
                            onBlur={() => handleBlur('phone')}
                            keyboardType="phone-pad"
                            returnKeyType="next"
                            error={errors.phone}
                            success={fieldSuccess('phone')}
                            hint="Optional · PH mobile format (09XXXXXXXXX)"
                            maxLength={13}
                            showCount
                        />

                        <Input
                            label="Password" required icon="lock-closed-outline"
                            placeholder="At least 6 characters"
                            value={form.password} onChangeText={v => set('password', v)}
                            onBlur={() => handleBlur('password')}
                            secureTextEntry={!showPw}
                            returnKeyType="next"
                            error={errors.password}
                            success={fieldSuccess('password') && strength.score >= 3}
                            hint={!errors.password && !touched.password ? 'Use uppercase, numbers & symbols for a stronger password' : undefined}
                            rightElement={
                                <TouchableOpacity onPress={() => setShowPw(p => !p)} style={{ padding: 4 }}>
                                    <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.textMuted} />
                                </TouchableOpacity>
                            }
                        />
                        {/* Password strength bar (only show once user starts typing) */}
                        {form.password.length > 0 && <PasswordStrengthBar strength={strength} />}

                        <Input
                            label="Confirm Password" required icon="shield-checkmark-outline"
                            placeholder="Repeat your password"
                            value={form.confirmPassword} onChangeText={v => set('confirmPassword', v)}
                            onBlur={() => handleBlur('confirmPassword')}
                            secureTextEntry={!showConfirm}
                            returnKeyType="done"
                            onSubmitEditing={handleRegister}
                            error={errors.confirmPassword}
                            success={fieldSuccess('confirmPassword')}
                            rightElement={
                                <TouchableOpacity onPress={() => setShowConfirm(p => !p)} style={{ padding: 4 }}>
                                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.textMuted} />
                                </TouchableOpacity>
                            }
                        />

                        <Button title="Create Account" onPress={handleRegister} loading={loading} icon="person-add-outline" style={{ marginTop: 4 }} />
                    </View>

                    <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 24, alignItems: 'center' }}>
                        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
                            Already have an account? <Text style={{ color: theme.primary, fontWeight: '700' }}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}