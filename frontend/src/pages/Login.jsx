import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../store/authSlice';
import {
    Box, Button, Container, TextField, Typography, Paper, Alert, CircularProgress
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, token, loading, error } = useSelector((state) => state.auth);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (token && user) {
            navigate(user.role === 'hospital' ? '/hospital' : '/patient');
        }
        return () => dispatch(clearError());
    }, [token, user, navigate, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(loginUser({ email, password }));
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={24}
                    sx={{
                        p: 5,
                        borderRadius: 4,
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    }}
                >
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                mx: 'auto',
                                mb: 2,
                                borderRadius: '20px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
                            }}
                        >
                            <MedicalServicesIcon sx={{ fontSize: 40, color: 'white' }} />
                        </Box>
                        <Typography
                            variant="h4"
                            sx={{ fontWeight: 700, color: 'white', mb: 1 }}
                        >
                            MedScan
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Your medical reports, simplified
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {typeof error === 'string' ? error : JSON.stringify(error)}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                    '&.Mui-focused fieldset': { borderColor: '#667eea' }
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            sx={{
                                mb: 3,
                                '& .MuiOutlinedInput-root': {
                                    color: 'white',
                                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                                    '&.Mui-focused fieldset': { borderColor: '#667eea' }
                                },
                                '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' }
                            }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                borderRadius: 2,
                                fontSize: '1rem',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                                    boxShadow: '0 15px 35px rgba(102, 126, 234, 0.4)'
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>
                    </Box>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Link to="/register" style={{ textDecoration: 'none' }}>
                            <Typography sx={{ color: '#667eea', '&:hover': { color: '#764ba2' } }}>
                                Don't have an account? Sign Up
                            </Typography>
                        </Link>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
