import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../store/authSlice';
import {
    Box, Button, Container, TextField, Typography, Paper, Alert,
    CircularProgress, MenuItem, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';

export default function Register() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.auth);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        sex: '',
        dob: '',
        role: 'patient'
    });

    useEffect(() => { return () => dispatch(clearError()); }, [dispatch]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleRoleChange = (_, newRole) => newRole && setFormData({ ...formData, role: newRole });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(registerUser(formData));
        if (registerUser.fulfilled.match(result)) navigate('/login');
    };

    const inputStyles = {
        mb: 2,
        '& .MuiOutlinedInput-root': {
            color: 'white',
            '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
            '&.Mui-focused fieldset': { borderColor: '#667eea' }
        },
        '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
        '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.5)' }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                py: 4,
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
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 1 }}>
                            Create Account
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Join MedScan today
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {typeof error === 'string' ? error : JSON.stringify(error)}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 1.5, fontWeight: 500 }}>
                            I am registering as:
                        </Typography>
                        <ToggleButtonGroup
                            value={formData.role}
                            exclusive
                            onChange={handleRoleChange}
                            fullWidth
                            sx={{
                                mb: 3,
                                '& .MuiToggleButton-root': {
                                    py: 1.5,
                                    color: 'rgba(255,255,255,0.6)',
                                    borderColor: 'rgba(255,255,255,0.2)',
                                    '&.Mui-selected': {
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        color: 'white',
                                        '&:hover': {
                                            background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)'
                                        }
                                    }
                                }
                            }}
                        >
                            <ToggleButton value="patient">
                                <PersonIcon sx={{ mr: 1 }} /> Patient
                            </ToggleButton>
                            <ToggleButton value="hospital">
                                <LocalHospitalIcon sx={{ mr: 1 }} /> Hospital
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <TextField
                            fullWidth
                            label="Full Name"
                            name="full_name"
                            onChange={handleChange}
                            required
                            sx={inputStyles}
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            onChange={handleChange}
                            required
                            sx={inputStyles}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            onChange={handleChange}
                            required
                            sx={inputStyles}
                        />

                        {formData.role === 'patient' && (
                            <>
                                <TextField
                                    fullWidth
                                    select
                                    label="Biological Sex"
                                    name="sex"
                                    value={formData.sex}
                                    onChange={handleChange}
                                    required
                                    sx={inputStyles}
                                >
                                    <MenuItem value="M">Male</MenuItem>
                                    <MenuItem value="F">Female</MenuItem>
                                </TextField>
                                <TextField
                                    fullWidth
                                    label="Date of Birth"
                                    name="dob"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    onChange={handleChange}
                                    sx={inputStyles}
                                />
                            </>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                mt: 1,
                                borderRadius: 2,
                                fontSize: '1rem',
                                fontWeight: 600,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)'
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                        </Button>
                    </Box>

                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            <Typography sx={{ color: '#667eea', '&:hover': { color: '#764ba2' } }}>
                                Already have an account? Sign In
                            </Typography>
                        </Link>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
