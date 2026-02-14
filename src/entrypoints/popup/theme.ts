import { createTheme } from '@mui/material/styles';

// Neon pink extracted from the UtaBridge logo icon
const NEON_PINK = '#FF1493';
const NEON_PINK_LIGHT = '#FF69B4';
const NEON_PINK_DARK = '#C70067';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: NEON_PINK,
            light: NEON_PINK_LIGHT,
            dark: NEON_PINK_DARK,
            contrastText: '#FFFFFF',
        },
        background: {
            default: '#0D0D0D',
            paper: '#1A1A1A',
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#A0A0A0',
        },
    },
    typography: {
        fontFamily: "'Inter', 'Roboto', sans-serif",
        h6: {
            fontWeight: 700,
            letterSpacing: '-0.02em',
        },
        body2: {
            fontSize: '0.8rem',
        },
        caption: {
            fontSize: '0.7rem',
            color: '#888',
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiSwitch: {
            styleOverrides: {
                root: {
                    padding: 8,
                },
            },
        },
    },
});

export default theme;
export { NEON_PINK, NEON_PINK_LIGHT, NEON_PINK_DARK };
