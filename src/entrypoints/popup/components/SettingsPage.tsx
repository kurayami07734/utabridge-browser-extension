import {
    Box,
    Typography,
    Avatar,
    IconButton,
    ToggleButtonGroup,
    ToggleButton,
    CircularProgress,
    keyframes,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { NEON_PINK } from '../theme';
import type { UserInfo } from '@/types/auth';
import type { PrimaryDisplay } from '@/utils/types';
import { useState } from 'react';

const slideIn = keyframes`
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
`;

interface SettingsPageProps {
    user: UserInfo;
    displayMode: PrimaryDisplay;
    onDisplayChange: (mode: PrimaryDisplay) => Promise<void>;
    onBack: () => void;
    onSignOut: () => void;
}

export function SettingsPage({
    user,
    displayMode,
    onDisplayChange,
    onBack,
    onSignOut,
}: SettingsPageProps) {
    const [isSaving, setIsSaving] = useState(false);

    const handleDisplayChange = async (mode: PrimaryDisplay) => {
        setIsSaving(true);
        try {
            await onDisplayChange(mode);
        } finally {
            setIsSaving(false);
        }
    };
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 260,
                animation: `${slideIn} 0.25s ease-out`,
            }}
        >
            {/* Header with back button */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.5,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                }}
            >
                {/* Logo + Title */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                        component="img"
                        src="/icon/32.png"
                        alt="UtaBridge"
                        sx={{ width: 24, height: 24 }}
                    />
                    <Typography
                        variant="subtitle1"
                        sx={{
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            background: `linear-gradient(135deg, ${NEON_PINK} 0%, #FF69B4 100%)`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        UtaBridge
                    </Typography>
                </Box>

                {/* Back button */}
                <IconButton
                    id="settings-back-button"
                    onClick={onBack}
                    size="small"
                    sx={{
                        color: NEON_PINK,
                        border: `1px solid rgba(255, 20, 147, 0.3)`,
                        width: 32,
                        height: 32,
                        '&:hover': {
                            backgroundColor: 'rgba(255, 20, 147, 0.1)',
                            borderColor: NEON_PINK,
                        },
                    }}
                >
                    <ArrowBackIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* User info */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    px: 2.5,
                    py: 2.5,
                }}
            >
                <Avatar
                    src={user.pictureUrl || undefined}
                    alt={user.name}
                    sx={{
                        width: 52,
                        height: 52,
                        border: `2px solid ${NEON_PINK}`,
                        boxShadow: `0 0 16px rgba(255, 20, 147, 0.25)`,
                    }}
                />
                <Box sx={{ overflow: 'hidden' }}>
                    <Typography
                        variant="body2"
                        sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            fontSize: '0.85rem',
                        }}
                    >
                        {user.name}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.secondary',
                            fontSize: '0.72rem',
                            display: 'block',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {user.email}
                    </Typography>
                </Box>
            </Box>

            {/* Divider */}
            <Box sx={{ mx: 2, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.06)' }} />

            {/* Preferences */}
            <Box sx={{ px: 2.5, py: 2 }}>
                <Typography
                    variant="body2"
                    sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 1.5,
                        fontSize: '0.82rem',
                    }}
                >
                    Preferences
                </Typography>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1.5,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                color: 'text.secondary',
                                fontSize: '0.72rem',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            Primary Text
                        </Typography>
                        {isSaving && <CircularProgress size={12} sx={{ color: NEON_PINK }} />}
                    </Box>
                    <ToggleButtonGroup
                        id="display-mode-toggle"
                        value={displayMode}
                        exclusive
                        disabled={isSaving}
                        onChange={(_, val) => val && handleDisplayChange(val as PrimaryDisplay)}
                        size="small"
                        sx={{
                            '& .MuiToggleButtonGroup-grouped': {
                                border: `1px solid rgba(255, 20, 147, 0.2)`,
                                '&.Mui-selected': {
                                    backgroundColor: NEON_PINK,
                                    color: '#FFFFFF',
                                    fontWeight: 600,
                                    '&:hover': {
                                        backgroundColor: '#E0117F',
                                    },
                                },
                                '&:not(.Mui-selected)': {
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 20, 147, 0.08)',
                                    },
                                },
                                '&.Mui-disabled': {
                                    opacity: 0.5,
                                },
                            },
                        }}
                    >
                        <ToggleButton
                            value="romanization"
                            sx={{
                                px: 1.5,
                                py: 0.5,
                                fontSize: '0.7rem',
                                textTransform: 'none',
                            }}
                        >
                            Romanization
                        </ToggleButton>
                        <ToggleButton
                            value="translation"
                            sx={{
                                px: 1.5,
                                py: 0.5,
                                fontSize: '0.7rem',
                                textTransform: 'none',
                            }}
                        >
                            Translation
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Box>

            {/* Sign out (pushed to bottom) */}
            <Box sx={{ flex: 1 }} />
            <Box
                sx={{
                    px: 2.5,
                    py: 1.5,
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    textAlign: 'center',
                }}
            >
                <Typography
                    id="sign-out-button"
                    component="button"
                    variant="caption"
                    onClick={onSignOut}
                    sx={{
                        color: 'rgba(255, 255, 255, 0.35)',
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        transition: 'color 0.2s ease',
                        '&:hover': {
                            color: NEON_PINK,
                        },
                    }}
                >
                    Sign out
                </Typography>
            </Box>
        </Box>
    );
}
