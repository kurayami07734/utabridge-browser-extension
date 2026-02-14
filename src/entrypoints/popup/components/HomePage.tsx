import { Box, Typography, Avatar, Switch, keyframes } from '@mui/material';
import { NEON_PINK } from '../theme';
import type { UserInfo } from '@/types/auth';
import { useEffect, useState } from 'react';

const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
`;

interface HomePageProps {
    user: UserInfo;
    enabled: boolean;
    onToggle: () => void;
    onAvatarClick: () => void;
}

export function HomePage({ user, enabled, onToggle, onAvatarClick }: HomePageProps) {
    const [cacheCount, setCacheCount] = useState(0);

    useEffect(() => {
        const countCache = async () => {
            try {
                const allItems = await browser.storage.local.get(null);
                const translationKeys = Object.keys(allItems).filter((key) =>
                    key.startsWith('translation_')
                );
                // Only count entries that don't have an error
                const validCount = translationKeys.filter((key) => {
                    const item = allItems[key] as { error?: string } | undefined;
                    return item && !item.error;
                }).length;
                setCacheCount(validCount);
            } catch {
                setCacheCount(0);
            }
        };
        countCache();
    }, []);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 260,
                animation: `${fadeIn} 0.3s ease-out`,
            }}
        >
            {/* Navbar */}
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

                {/* Avatar */}
                <Avatar
                    id="user-avatar-button"
                    src={user.pictureUrl || undefined}
                    alt={user.name}
                    onClick={onAvatarClick}
                    sx={{
                        width: 32,
                        height: 32,
                        cursor: 'pointer',
                        border: `2px solid transparent`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            border: `2px solid ${NEON_PINK}`,
                            boxShadow: `0 0 12px rgba(255, 20, 147, 0.3)`,
                        },
                    }}
                />
            </Box>

            {/* Main toggle area */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1.5,
                    px: 3,
                }}
            >
                <Switch
                    id="extension-toggle"
                    checked={enabled}
                    onChange={onToggle}
                    sx={{
                        width: 62,
                        height: 34,
                        padding: 0,
                        '& .MuiSwitch-switchBase': {
                            padding: 0,
                            margin: '3px',
                            transitionDuration: '250ms',
                            '&.Mui-checked': {
                                transform: 'translateX(28px)',
                                color: '#fff',
                                '& + .MuiSwitch-track': {
                                    backgroundColor: NEON_PINK,
                                    opacity: 1,
                                    border: 0,
                                },
                            },
                        },
                        '& .MuiSwitch-thumb': {
                            boxSizing: 'border-box',
                            width: 28,
                            height: 28,
                            boxShadow: enabled
                                ? `0 0 10px rgba(255, 20, 147, 0.5)`
                                : '0 2px 4px rgba(0,0,0,0.3)',
                        },
                        '& .MuiSwitch-track': {
                            borderRadius: 34 / 2,
                            backgroundColor: '#39393D',
                            opacity: 1,
                        },
                    }}
                />
                <Typography
                    variant="body2"
                    sx={{
                        color: enabled ? NEON_PINK : 'text.secondary',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        transition: 'color 0.2s ease',
                    }}
                >
                    {enabled ? 'Active' : 'Disabled'}
                </Typography>
            </Box>

            {/* Stats footer */}
            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    textAlign: 'center',
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.4)',
                        fontSize: '0.7rem',
                    }}
                >
                    Songs translated:{' '}
                    <Box
                        component="span"
                        sx={{
                            color: NEON_PINK,
                            fontWeight: 700,
                        }}
                    >
                        {cacheCount}
                    </Box>{' '}
                </Typography>
            </Box>
        </Box>
    );
}
