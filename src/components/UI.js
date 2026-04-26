import React, { useState, useRef, useCallback } from 'react';
import {
    View, Text, TouchableOpacity, TextInput,
    ActivityIndicator, Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export function Card({ children, style }) {
    const { theme } = useTheme();
    return (
        <View style={[{
            backgroundColor: theme.bgCard,
            borderRadius: 16, padding: 16, marginBottom: 12,
            borderWidth: 1, borderColor: theme.border,
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
        }, style]}>
            {children}
        </View>
    );
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, icon, style }) {
    const { theme } = useTheme();
    const isPrimary = variant === 'primary';
    const isDanger = variant === 'danger';
    const isOutline = variant === 'outline';
    const isGhost = variant === 'ghost';

    const bg = isPrimary ? theme.primary : isDanger ? theme.danger : isOutline || isGhost ? 'transparent' : theme.bgCard;
    const color = isPrimary || isDanger ? '#fff' : isOutline ? theme.primary : theme.text;
    const border = isOutline ? theme.primary : 'transparent';

    return (
        <TouchableOpacity
            onPress={onPress} disabled={disabled || loading} activeOpacity={0.75}
            style={[{
                backgroundColor: bg, borderRadius: 12, paddingVertical: 14,
                paddingHorizontal: 20, alignItems: 'center', flexDirection: 'row',
                justifyContent: 'center', borderWidth: isOutline ? 1.5 : 0,
                borderColor: border, opacity: disabled ? 0.5 : 1,
            }, style]}
        >
            {loading ? <ActivityIndicator color={color} size="small" /> : (
                <>
                    {icon && <Ionicons name={icon} size={18} color={color} style={{ marginRight: 8 }} />}
                    <Text style={{ color, fontWeight: '700', fontSize: 15, letterSpacing: 0.3 }}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}

export function Input({
    label, required, error, success, icon, rightElement,
    hint, maxLength, showCount, style, inputStyle,
    value, onBlur, onFocus, ...props
}) {
    const { theme } = useTheme();

    // useRef + forceUpdate avoids re-rendering the parent, which would
    // cause the TextInput to lose focus on every keystroke.
    const focusedRef = useRef(false);
    const [, rerender] = useState(0);
    const forceUpdate = useCallback(() => rerender(n => n + 1), []);

    const focused = focusedRef.current;

    const borderColor = error ? theme.danger
        : success ? theme.success
            : focused ? theme.primary
                : theme.border;

    const iconColor = error ? theme.danger
        : success ? theme.success
            : focused ? theme.primary
                : theme.textMuted;

    const charCount = typeof value === 'string' ? value.length : 0;
    const showCharCounter = (showCount || maxLength) && !props.secureTextEntry;
    const counterColor = maxLength && charCount > maxLength ? theme.danger
        : maxLength && charCount > maxLength * 0.85 ? theme.warning
            : theme.textMuted;

    const handleFocus = useCallback((e) => {
        focusedRef.current = true;
        forceUpdate();
        onFocus?.(e);
    }, [onFocus, forceUpdate]);

    const handleBlur = useCallback((e) => {
        focusedRef.current = false;
        forceUpdate();
        onBlur?.(e);
    }, [onBlur, forceUpdate]);

    return (
        <View style={[{ marginBottom: 16 }, style]}>
            {label && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 0.4 }}>{label}</Text>
                    {required && <Text style={{ color: theme.danger, fontSize: 13, fontWeight: '700', marginLeft: 3 }}>*</Text>}
                </View>
            )}

            <View style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: theme.bgInput, borderRadius: 12,
                borderWidth: 1.5, borderColor,
                paddingHorizontal: 14,
            }}>
                {icon && <Ionicons name={icon} size={18} color={iconColor} style={{ marginRight: 10 }} />}
                <TextInput
                    style={[{ flex: 1, color: theme.text, fontSize: 15, paddingVertical: Platform.OS === 'ios' ? 14 : 11 }, inputStyle]}
                    placeholderTextColor={theme.textMuted}
                    value={value}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...props}
                />
                {success && !error && !rightElement && (
                    <Ionicons name="checkmark-circle" size={18} color={theme.success} style={{ marginLeft: 8 }} />
                )}
                {rightElement}
            </View>

            {(error || hint || showCharCounter) && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                    <View style={{ flex: 1 }}>
                        {error ? (
                            <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <Ionicons name="alert-circle-outline" size={13} color={theme.danger} style={{ marginRight: 4, marginTop: 1 }} />
                                <Text style={{ color: theme.danger, fontSize: 12, flex: 1 }}>{error}</Text>
                            </View>
                        ) : hint ? (
                            <Text style={{ color: theme.textMuted, fontSize: 12 }}>{hint}</Text>
                        ) : null}
                    </View>
                    {showCharCounter && (
                        <Text style={{ color: counterColor, fontSize: 12, marginLeft: 8 }}>{charCount}{maxLength ? `/${maxLength}` : ''}</Text>
                    )}
                </View>
            )}
        </View>
    );
}

export function PasswordStrengthBar({ strength }) {
    const { theme } = useTheme();
    if (!strength || !strength.label) return null;
    const segments = 4;
    const filled = Math.ceil((strength.score / 5) * segments);
    return (
        <View style={{ marginTop: -8, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', gap: 4, marginBottom: 4 }}>
                {Array.from({ length: segments }).map((_, i) => (
                    <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i < filled ? strength.color : theme.border }} />
                ))}
            </View>
            <Text style={{ color: strength.color, fontSize: 12, fontWeight: '600' }}>Password strength: {strength.label}</Text>
        </View>
    );
}

export function Badge({ label, color, bg }) {
    const { theme } = useTheme();
    const colorMap = {
        confirmed: { bg: theme.successLight, color: theme.success },
        pending: { bg: theme.warningLight, color: theme.warning },
        cancelled: { bg: theme.dangerLight, color: theme.danger },
        completed: { bg: theme.bgInput, color: theme.textSecondary },
    };
    const s = colorMap[label] || { bg: bg || theme.bgInput, color: color || theme.text };
    return (
        <View style={{ backgroundColor: s.bg, borderRadius: 8, paddingVertical: 3, paddingHorizontal: 10 }}>
            <Text style={{ color: s.color, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' }}>{label}</Text>
        </View>
    );
}

export function Avatar({ initials, size = 44, bg }) {
    const { theme } = useTheme();
    return (
        <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg || theme.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: size * 0.36 }}>{initials}</Text>
        </View>
    );
}

export function SectionHeader({ title, action, onAction }) {
    const { theme } = useTheme();
    return (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 4 }}>
            <Text style={{ color: theme.text, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 }}>{title}</Text>
            {action && (
                <TouchableOpacity onPress={onAction}>
                    <Text style={{ color: theme.primary, fontSize: 14, fontWeight: '600' }}>{action}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }) {
    const { theme } = useTheme();
    return (
        <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 }}>
            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: theme.bgInput, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Ionicons name={icon || 'calendar-outline'} size={36} color={theme.textMuted} />
            </View>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 6, textAlign: 'center' }}>{title}</Text>
            {subtitle && <Text style={{ color: theme.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>{subtitle}</Text>}
            {actionLabel && <Button title={actionLabel} onPress={onAction} style={{ marginTop: 20, paddingHorizontal: 28 }} />}
        </View>
    );
}

export function Divider({ style }) {
    const { theme } = useTheme();
    return <View style={[{ height: 1, backgroundColor: theme.border, marginVertical: 12 }, style]} />;
}

export function InlineAlert({ type = 'error', message, style }) {
    const { theme } = useTheme();
    const map = {
        error: { bg: theme.dangerLight, border: theme.danger, icon: 'alert-circle-outline', color: theme.danger },
        warning: { bg: theme.warningLight, border: theme.warning, icon: 'warning-outline', color: theme.warning },
        info: { bg: theme.bgInput, border: theme.primary, icon: 'information-circle-outline', color: theme.primary },
        success: { bg: theme.successLight, border: theme.success, icon: 'checkmark-circle-outline', color: theme.success },
    };
    const s = map[type] || map.error;
    if (!message) return null;
    return (
        <View style={[{ flexDirection: 'row', alignItems: 'flex-start', backgroundColor: s.bg, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: s.border, padding: 12, marginBottom: 16 }, style]}>
            <Ionicons name={s.icon} size={16} color={s.color} style={{ marginRight: 8, marginTop: 1 }} />
            <Text style={{ color: s.color, fontSize: 13, flex: 1, lineHeight: 19 }}>{message}</Text>
        </View>
    );
}

export function RequiredNote() {
    const { theme } = useTheme();
    return (
        <Text style={{ color: theme.textMuted, fontSize: 12, marginBottom: 16 }}>
            Fields marked with <Text style={{ color: theme.danger, fontWeight: '700' }}>*</Text> are required.
        </Text>
    );
}