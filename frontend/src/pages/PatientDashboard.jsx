import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import {
    Box, Typography, AppBar, Toolbar, Button, Chip, Avatar
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import TimelineIcon from '@mui/icons-material/Timeline';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const BentoCard = ({ children, sx = {}, gradient, ...props }) => (
    <Box
        sx={{
            background: gradient || 'rgba(255, 255, 255, 0.03)',
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

export default function PatientDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (!user || user.role !== 'patient') {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
            <AppBar position="static" sx={{ background: 'transparent', boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Toolbar>
                    <MedicalServicesIcon sx={{ mr: 2, color: '#667eea' }} />
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: 'white' }}>
                        MedScan Patient Portal
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
                {/* Bento Grid */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
                        gridTemplateRows: 'auto',
                        gap: 3,
                    }}
                >
                    {/* Welcome Card - Spans 2 columns */}
                    <BentoCard
                        gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        sx={{ gridColumn: { md: 'span 2' }, gridRow: { md: 'span 2' } }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    mr: 3
                                }}
                            >
                                <PersonIcon sx={{ fontSize: 40 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                                    Welcome back!
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }}>
                                    {user?.full_name || 'Patient'}
                                </Typography>
                            </Box>
                        </Box>
                        <Typography sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.7 }}>
                            Your personal health dashboard. Upload and view your medical reports,
                            track your health metrics, and get AI-powered insights.
                        </Typography>
                    </BentoCard>

                    {/* Profile Card */}
                    <BentoCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', mr: 2 }}>
                                <PersonIcon sx={{ color: 'white' }} />
                            </Box>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Profile</Typography>
                        </Box>
                        <Typography sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>{user?.email}</Typography>
                        <Chip
                            label={user?.is_active ? 'Verified' : 'Pending'}
                            size="small"
                            sx={{
                                bgcolor: 'rgba(56, 239, 125, 0.2)',
                                color: '#38ef7d',
                                mt: 1
                            }}
                        />
                    </BentoCard>

                    {/* Health Score Card */}
                    <BentoCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', mr: 2 }}>
                                <FavoriteIcon sx={{ color: 'white' }} />
                            </Box>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Health Score</Typography>
                        </Box>
                        <Typography variant="h3" sx={{ color: 'white', fontWeight: 700 }}>--</Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>Upload reports to calculate</Typography>
                    </BentoCard>

                    {/* My Reports Card - Spans 2 columns */}
                    <BentoCard sx={{ gridColumn: { md: 'span 2' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', mr: 2 }}>
                                <AssignmentIcon sx={{ color: 'white' }} />
                            </Box>
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>My Reports</Typography>
                        </Box>
                        <Box
                            sx={{
                                textAlign: 'center',
                                py: 4,
                                border: '2px dashed rgba(255,255,255,0.1)',
                                borderRadius: 2,
                                bgcolor: 'rgba(255,255,255,0.02)'
                            }}
                        >
                            <AssignmentIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
                            <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>No reports uploaded yet</Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, mt: 1 }}>
                                Upload your medical reports to get started
                            </Typography>
                        </Box>
                    </BentoCard>

                    {/* Upload Card */}
                    <BentoCard sx={{ cursor: 'pointer' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', mr: 2 }}>
                                <CloudUploadIcon sx={{ color: 'white' }} />
                            </Box>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Quick Upload</Typography>
                        </Box>
                        <Typography sx={{ color: 'white', fontWeight: 600, mb: 1 }}>Upload Report</Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>PDF, JPG, PNG files</Typography>
                    </BentoCard>

                    {/* Timeline Card */}
                    <BentoCard>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', mr: 2 }}>
                                <TimelineIcon sx={{ color: 'white' }} />
                            </Box>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Health Trends</Typography>
                        </Box>
                        <Typography sx={{ color: 'white', fontWeight: 600, mb: 1 }}>Track Progress</Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>View after uploading reports</Typography>
                    </BentoCard>

                    {/* Appointments Card - Spans 2 columns */}
                    <BentoCard sx={{ gridColumn: { md: 'span 2' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', mr: 2 }}>
                                <CalendarMonthIcon sx={{ color: '#1a1a2e' }} />
                            </Box>
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Upcoming Appointments</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                            <CalendarMonthIcon sx={{ fontSize: 40, color: 'rgba(255,255,255,0.2)', mb: 1 }} />
                            <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>No appointments scheduled</Typography>
                        </Box>
                    </BentoCard>
                </Box>
            </Box>
        </Box>
    );
}
