import React from 'react';
import {
    View, Text, TouchableOpacity, TextInput,
    ActivityIndicator, StyleSheet, Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export function Card({ children, style }) {
    const { theme } = useTheme();
    return (
        <View style={[{
            backgroundColor: theme.bgCard,
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.border,
            shadowColor: theme.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 8,
            elevation: 3,
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

    const bg = isPrimary ? theme.primary
        : isDanger ? theme.danger
            : isOutline || isGhost ? 'transparent'
                : theme.bgCard;

    const color = isPrimary || isDanger ? '#fff'
        : isOutline ? theme.primary
            : theme.text;

    const border = isOutline ? theme.primary : 'transparent';

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.75}
            style={[{
                backgroundColor: bg,
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 20,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                borderWidth: isOutline ? 1.5 : 0,
                borderColor: border,
                opacity: disabled ? 0.5 : 1,
            }, style]}
        >
            {loading ? (
                <ActivityIndicator color={color} size="small" />
            ) : (
                <>
                    {icon && <Ionicons name={icon} size={18} color={color} style={{ marginRight: 8 }} />}
                    <Text style={{ color, fontWeight: '700', fontSize: 15, letterSpacing: 0.3 }}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}

export function Input({ label, error, icon, style, inputStyle, ...props }) {
    const { theme } = useTheme();
    return (
        <View style={[{ marginBottom: 16 }, style]}>
            {label && (
                <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6, letterSpacing: 0.5 }}>
                    {label}
                </Text>
            )}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.bgInput,
                borderRadius: 12,
                borderWidth: 1.5,
                borderColor: error ? theme.danger : theme.border,
                paddingHorizontal: 14,
            }}>
                {icon && <Ionicons name={icon} size={18} color={theme.textMuted} style={{ marginRight: 10 }} />}
                <TextInput
                    style={[{
                        flex: 1,
                        color: theme.text,
                        fontSize: 15,
                        paddingVertical: Platform.OS === 'ios' ? 14 : 11,
                    }, inputStyle]}
                    placeholderTextColor={theme.textMuted}
                    {...props}
                />
            </View>
            {error && <Text style={{ color: theme.danger, fontSize: 12, marginTop: 4 }}>{error}</Text>}
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
    const style = colorMap[label] || { bg: bg || theme.bgInput, color: color || theme.text };
    return (
        <View style={{ backgroundColor: style.bg, borderRadius: 8, paddingVertical: 3, paddingHorizontal: 10 }}>
            <Text style={{ color: style.color, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' }}>{label}</Text>
        </View>
    );
}

export function Avatar({ initials, size = 44, bg }) {
    const { theme } = useTheme();
    return (
        <View style={{
            width: size, height: size, borderRadius: size / 2,
            backgroundColor: bg || theme.primary,
            alignItems: 'center', justifyContent: 'center',
        }}>
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
            <View style={{
                width: 80, height: 80, borderRadius: 40,
                backgroundColor: theme.bgInput,
                alignItems: 'center', justifyContent: 'center',
                marginBottom: 16,
            }}>
                <Ionicons name={icon || 'calendar-outline'} size={36} color={theme.textMuted} />
            </View>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 6, textAlign: 'center' }}>{title}</Text>
            {subtitle && <Text style={{ color: theme.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 }}>{subtitle}</Text>}
            {actionLabel && (
                <Button title={actionLabel} onPress={onAction} style={{ marginTop: 20, paddingHorizontal: 28 }} />
            )}
        </View>
    );
}

export function Divider({ style }) {
    const { theme } = useTheme();
    return <View style={[{ height: 1, backgroundColor: theme.border, marginVertical: 12 }, style]} />;
}