import { Box, Typography, IconButton, keyframes, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { NEON_PINK } from '../theme';
import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash-es';
import { checkApiHealth } from '@/services/api';
import { apiHealth } from '@/utils/storage';

const pulse = keyframes`
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
`;

const DEBOUNCE_MS = 2000;

export function ServerDownPage() {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = useMemo(
        () =>
            debounce(
                async () => {
                    setIsRefreshing(true);
                    try {
                        const healthy = await checkApiHealth();
                        await apiHealth.setValue(healthy);
                    } catch {
                        await apiHealth.setValue(false);
                    } finally {
                        setIsRefreshing(false);
                    }
                },
                DEBOUNCE_MS,
                { leading: true, trailing: false }
            ),
        []
    );

    useEffect(() => {
        return () => handleRefresh.cancel();
    }, [handleRefresh]);

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: 260,
                gap: 2.5,
                px: 3,
                py: 4,
            }}
        >
            {/* Title */}
            <Typography
                variant="h5"
                sx={{
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    background: `linear-gradient(135deg, ${NEON_PINK} 0%, #FF69B4 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}
            >
                UtaBridge
            </Typography>

            {/* Logo */}
            <Box
                component="img"
                src="/icon/128.png"
                alt="UtaBridge Logo"
                sx={{
                    width: 64,
                    height: 64,
                    opacity: 0.5,
                    filter: 'grayscale(40%)',
                }}
            />

            {/* Error message + refresh */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mt: 1,
                    px: 2,
                    py: 1.2,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 20, 147, 0.06)',
                    border: '1px solid rgba(255, 20, 147, 0.15)',
                }}
            >
                <Typography
                    variant="body2"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        animation: `${pulse} 2s ease-in-out infinite`,
                        fontSize: '0.78rem',
                    }}
                >
                    Server seems to be down
                    <br />
                    at the moment
                </Typography>

                <IconButton
                    id="refresh-health-button"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    size="small"
                    sx={{
                        color: NEON_PINK,
                        border: `1px solid ${NEON_PINK}`,
                        width: 36,
                        height: 36,
                        '&:hover': {
                            backgroundColor: 'rgba(255, 20, 147, 0.12)',
                        },
                        '&.Mui-disabled': {
                            color: 'rgba(255, 20, 147, 0.4)',
                            borderColor: 'rgba(255, 20, 147, 0.2)',
                        },
                    }}
                >
                    {isRefreshing ? (
                        <CircularProgress size={18} sx={{ color: NEON_PINK }} />
                    ) : (
                        <RefreshIcon fontSize="small" />
                    )}
                </IconButton>
            </Box>
        </Box>
    );
}
