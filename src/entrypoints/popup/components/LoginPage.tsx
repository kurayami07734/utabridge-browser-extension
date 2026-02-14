import { Box, Button, Typography, keyframes } from '@mui/material';
import { NEON_PINK } from '../theme';

const float = keyframes`
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-6px); }
`;

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 15px rgba(255, 20, 147, 0.3); }
    50% { box-shadow: 0 0 30px rgba(255, 20, 147, 0.6); }
`;

interface LoginPageProps {
    onSignIn: () => void;
}

export function LoginPage({ onSignIn }: LoginPageProps) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                minHeight: 260,
                gap: 3,
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
                    mb: -1,
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
                    width: 80,
                    height: 80,
                    animation: `${float} 3s ease-in-out infinite`,
                    filter: `drop-shadow(0 4px 20px rgba(255, 20, 147, 0.4))`,
                }}
            />

            {/* Tagline */}
            <Typography
                variant="caption"
                sx={{
                    color: 'text.secondary',
                    textAlign: 'center',
                    fontSize: '0.75rem',
                }}
            >
                Translating your music world
            </Typography>

            {/* Sign in button */}
            <Button
                id="sign-in-button"
                variant="outlined"
                onClick={onSignIn}
                sx={{
                    mt: 1,
                    px: 4,
                    py: 1.2,
                    borderColor: NEON_PINK,
                    color: '#FFFFFF',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    animation: `${glow} 2.5s ease-in-out infinite`,
                    '&:hover': {
                        borderColor: NEON_PINK,
                        backgroundColor: 'rgba(255, 20, 147, 0.12)',
                    },
                }}
            >
                Continue with Google
            </Button>
        </Box>
    );
}
