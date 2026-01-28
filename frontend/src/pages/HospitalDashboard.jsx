import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import api from '../services/api';
import {
    Box, Typography, AppBar, Toolbar, Button, Chip, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';

const BentoCard = ({ children, sx = {}, ...props }) => (
    <Box
        sx={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 3,
            p: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
                border: '1px solid rgba(255, 255, 255, 0.15)',
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            },
            ...sx
        }}
        {...props}
    >
        {children}
    </Box>
);

export default function HospitalDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'hospital') {
            navigate('/login');
            return;
        }
        fetchPatients();
    }, [user, navigate]);

    const fetchPatients = async () => {
        try {
            const response = await api.get('/auth/patients');
            setPatients(response.data);
        } catch (error) {
            console.error('Failed to fetch patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
            <AppBar position="static" sx={{ background: 'transparent', boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Toolbar>
                    <LocalHospitalIcon sx={{ mr: 2, color: '#667eea' }} />
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: 'white' }}>
                        MedScan Hospital
                    </Typography>
                    <Chip
                        label={user?.full_name || user?.email}
                        sx={{ mr: 2, bgcolor: 'rgba(102, 126, 234, 0.2)', color: 'white', border: '1px solid rgba(102, 126, 234, 0.3)' }}
                    />
                    <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Logout
                    </Button>
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 4 }}>
                {/* Welcome Banner */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
                        Welcome back, {user?.full_name || 'Hospital Admin'}
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        Here's an overview of your patient management dashboard
                    </Typography>
                </Box>

                {/* Bento Grid */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
                        gridTemplateRows: { xs: 'auto', md: 'repeat(3, minmax(150px, auto))' },
                        gap: 3,
                    }}
                >
                    {/* Stats Card - Patient Count */}
                    <BentoCard sx={{ gridColumn: { md: 'span 1' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', mr: 2 }}>
                                <PeopleIcon sx={{ color: 'white' }} />
                            </Box>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Total Patients</Typography>
                        </Box>
                        <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                            {loading ? '...' : patients.length}
                        </Typography>
                    </BentoCard>

                    {/* Stats Card - Active */}
                    <BentoCard sx={{ gridColumn: { md: 'span 1' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', mr: 2 }}>
                                <TrendingUpIcon sx={{ color: 'white' }} />
                            </Box>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Active Users</Typography>
                        </Box>
                        <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>
                            {loading ? '...' : patients.filter(p => p.is_active).length}
                        </Typography>
                    </BentoCard>

                    {/* Stats Card - Reports */}
                    <BentoCard sx={{ gridColumn: { md: 'span 1' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', mr: 2 }}>
                                <AssessmentIcon sx={{ color: 'white' }} />
                            </Box>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Total Reports</Typography>
                        </Box>
                        <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>0</Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Coming soon</Typography>
                    </BentoCard>

                    {/* Notifications Card */}
                    <BentoCard sx={{ gridColumn: { md: 'span 1' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', mr: 2 }}>
                                <NotificationsIcon sx={{ color: 'white' }} />
                            </Box>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Notifications</Typography>
                        </Box>
                        <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>0</Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>No new alerts</Typography>
                    </BentoCard>

                    {/* Patient List Table - Spans 4 columns */}
                    <BentoCard sx={{ gridColumn: { md: 'span 4' } }}>
                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 3 }}>
                            Registered Patients
                        </Typography>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress sx={{ color: '#667eea' }} />
                            </Box>
                        ) : patients.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <PeopleIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
                                <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>No patients registered yet</Typography>
                            </Box>
                        ) : (
                            <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.1)' }}>Name</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.1)' }}>Email</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.1)' }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {patients.map((patient) => (
                                            <TableRow key={patient.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                                                <TableCell sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.05)' }}>
                                                    {patient.full_name || 'N/A'}
                                                </TableCell>
                                                <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.05)' }}>
                                                    {patient.email}
                                                </TableCell>
                                                <TableCell sx={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                                                    <Chip
                                                        label={patient.is_active ? 'Active' : 'Inactive'}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: patient.is_active ? 'rgba(56, 239, 125, 0.2)' : 'rgba(255,255,255,0.1)',
                                                            color: patient.is_active ? '#38ef7d' : 'rgba(255,255,255,0.5)'
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </BentoCard>
                </Box>
            </Box>
        </Box>
    );
}
