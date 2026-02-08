import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import FileUpload from '../components/FileUpload';
import api from '../services/api';
import {
    Box, Typography, AppBar, Toolbar, Button, Chip, Avatar,
    CircularProgress, Table, TableBody, TableCell, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem,
    FormControl, InputLabel, IconButton
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';

const BentoCard = ({ children, sx = {}, gradient, onClick, ...props }) => (
    <Box
        onClick={onClick}
        sx={{
            background: gradient || 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 3,
            p: 3,
            transition: 'all 0.3s ease',
            cursor: onClick ? 'pointer' : 'default',
            '&:hover': {
                border: '1px solid rgba(255, 255, 255, 0.15)',
                transform: onClick ? 'translateY(-2px)' : 'none',
                boxShadow: onClick ? '0 10px 40px rgba(0, 0, 0, 0.3)' : 'none'
            },
            ...sx
        }}
        {...props}
    >
        {children}
    </Box>
);

const StatusBadge = ({ status }) => {
    const colors = {
        normal: { bg: 'rgba(56, 239, 125, 0.2)', text: '#38ef7d', icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> },
        low: { bg: 'rgba(255, 193, 7, 0.2)', text: '#ffc107', icon: <WarningAmberIcon sx={{ fontSize: 16 }} /> },
        high: { bg: 'rgba(255, 152, 0, 0.2)', text: '#ff9800', icon: <WarningAmberIcon sx={{ fontSize: 16 }} /> },
        critical: { bg: 'rgba(244, 67, 54, 0.2)', text: '#f44336', icon: <WarningAmberIcon sx={{ fontSize: 16 }} /> }
    };
    const style = colors[status] || colors.normal;

    return (
        <Chip
            icon={style.icon}
            label={status?.toUpperCase()}
            size="small"
            sx={{ bgcolor: style.bg, color: style.text, '& .MuiChip-icon': { color: style.text } }}
        />
    );
};

export default function PatientDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    const [uploadOpen, setUploadOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [compareOpen, setCompareOpen] = useState(false);
    const [selectedReports, setSelectedReports] = useState({ report1: '', report2: '' });
    const [comparisonData, setComparisonData] = useState(null);
    const [comparingLoad, setComparingLoad] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'patient') {
            navigate('/login');
        } else {
            fetchDashboardData();
        }
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/reports/dashboard/summary');
            setDashboardData(response.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleCompare = async () => {
        if (!selectedReports.report1 || !selectedReports.report2) return;
        setComparingLoad(true);
        try {
            const response = await api.get('/reports/compare/', {
                params: { report1_id: selectedReports.report1, report2_id: selectedReports.report2 }
            });
            setComparisonData(response.data);
        } catch (error) {
            console.error('Comparison failed:', error);
        } finally {
            setComparingLoad(false);
        }
    };

    const handleUploadSuccess = () => {
        setUploadOpen(false);
        fetchDashboardData(); // Refresh data
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
                <CircularProgress sx={{ color: '#667eea' }} />
            </Box>
        );
    }

    const hasReports = dashboardData?.total_reports > 0;
    const flaggedMetrics = dashboardData?.flagged_metrics || [];
    const recentReports = dashboardData?.recent_reports || [];

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
            {/* App Bar */}
            <AppBar position="static" sx={{ background: 'transparent', boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Toolbar>
                    <MedicalServicesIcon sx={{ mr: 2, color: '#667eea' }} />
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: 'white' }}>
                        MedScan Patient Portal
                    </Typography>
                    <IconButton onClick={fetchDashboardData} sx={{ color: 'rgba(255,255,255,0.7)', mr: 2 }}>
                        <RefreshIcon />
                    </IconButton>
                    <Chip label={user?.full_name || user?.email} sx={{ mr: 2, bgcolor: 'rgba(102, 126, 234, 0.2)', color: 'white', border: '1px solid rgba(102, 126, 234, 0.3)' }} />
                    <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.7)' }}>Logout</Button>
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 4 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>

                    {/* Health Overview Card */}
                    <BentoCard gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" sx={{ gridColumn: { md: 'span 2' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                                <PersonIcon sx={{ fontSize: 30 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                                    {dashboardData?.latest_headline || 'Welcome back!'}
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>{user?.full_name || 'Patient'}</Typography>
                            </Box>
                        </Box>
                        {hasReports && (
                            <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircleIcon sx={{ color: '#38ef7d' }} />
                                    <Typography sx={{ color: 'white', fontWeight: 600 }}>{dashboardData.total_normal} Normal</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <WarningAmberIcon sx={{ color: '#ffc107' }} />
                                    <Typography sx={{ color: 'white', fontWeight: 600 }}>{dashboardData.total_flagged} Flagged</Typography>
                                </Box>
                            </Box>
                        )}
                    </BentoCard>

                    {/* Quick Upload */}
                    <BentoCard onClick={() => setUploadOpen(true)}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', mr: 2 }}>
                                <CloudUploadIcon sx={{ color: 'white' }} />
                            </Box>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Quick Upload</Typography>
                        </Box>
                        <Typography sx={{ color: 'white', fontWeight: 600, mb: 1 }}>Upload Report</Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>PDF, JPG, PNG files</Typography>
                    </BentoCard>

                    {/* Compare Reports */}
                    <BentoCard onClick={() => recentReports.length >= 2 && setCompareOpen(true)} sx={{ opacity: recentReports.length >= 2 ? 1 : 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', mr: 2 }}>
                                <CompareArrowsIcon sx={{ color: 'white' }} />
                            </Box>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Compare</Typography>
                        </Box>
                        <Typography sx={{ color: 'white', fontWeight: 600, mb: 1 }}>Compare Reports</Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                            {recentReports.length >= 2 ? 'Side-by-side analysis' : 'Upload 2+ reports'}
                        </Typography>
                    </BentoCard>

                    {/* Flagged Metrics Panel */}
                    {flaggedMetrics.length > 0 && (
                        <BentoCard sx={{ gridColumn: { md: 'span 4' } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)', mr: 2 }}>
                                    <WarningAmberIcon sx={{ color: '#1a1a2e' }} />
                                </Box>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Flagged Metrics</Typography>
                            </Box>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Metric</TableCell>
                                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Value</TableCell>
                                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Status</TableCell>
                                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Category</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {flaggedMetrics.map((metric, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{metric.name}</TableCell>
                                            <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{metric.value} {metric.unit}</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}><StatusBadge status={metric.status} /></TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{metric.category}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </BentoCard>
                    )}

                    {/* My Reports */}
                    <BentoCard sx={{ gridColumn: { md: 'span 4' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', mr: 2 }}>
                                <AssignmentIcon sx={{ color: 'white' }} />
                            </Box>
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>My Reports</Typography>
                        </Box>

                        {!hasReports ? (
                            <Box sx={{ textAlign: 'center', py: 4, border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                <AssignmentIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
                                <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>No reports uploaded yet</Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, mt: 1 }}>Upload your medical reports to get started</Typography>
                            </Box>
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Report</TableCell>
                                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Type</TableCell>
                                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Status</TableCell>
                                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Date</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentReports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{report.file_name}</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{report.document_type}</TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <Chip
                                                    label={report.flagged_count > 0 ? `${report.flagged_count} flagged` : '✓ Normal'}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: report.flagged_count > 0 ? 'rgba(255, 193, 7, 0.2)' : 'rgba(56, 239, 125, 0.2)',
                                                        color: report.flagged_count > 0 ? '#ffc107' : '#38ef7d'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                {new Date(report.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </BentoCard>
                </Box>
            </Box>

            {/* Upload Modal */}
            <FileUpload open={uploadOpen} onClose={() => setUploadOpen(false)} onUploadSuccess={handleUploadSuccess} />

            {/* Compare Modal */}
            <Dialog open={compareOpen} onClose={() => { setCompareOpen(false); setComparisonData(null); }} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: '#1a1a2e', color: 'white' } }}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Compare Reports
                    <IconButton onClick={() => { setCompareOpen(false); setComparisonData(null); }} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: 'rgba(255,255,255,0.6)' }}>Report 1</InputLabel>
                            <Select value={selectedReports.report1} onChange={(e) => setSelectedReports({ ...selectedReports, report1: e.target.value })} sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}>
                                {recentReports.map(r => <MenuItem key={r.id} value={r.id}>{r.file_name}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel sx={{ color: 'rgba(255,255,255,0.6)' }}>Report 2</InputLabel>
                            <Select value={selectedReports.report2} onChange={(e) => setSelectedReports({ ...selectedReports, report2: e.target.value })} sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}>
                                {recentReports.map(r => <MenuItem key={r.id} value={r.id}>{r.file_name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Box>
                    <Button variant="contained" onClick={handleCompare} disabled={comparingLoad || !selectedReports.report1 || !selectedReports.report2} sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        {comparingLoad ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Compare'}
                    </Button>

                    {comparisonData && (
                        <Box>
                            <Typography sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>{comparisonData.summary}</Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Metric</TableCell>
                                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Report 1</TableCell>
                                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Report 2</TableCell>
                                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Change</TableCell>
                                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)' }}>Trend</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {comparisonData.metrics?.map((m, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell sx={{ color: 'white' }}>{m.name}</TableCell>
                                            <TableCell sx={{ color: 'white' }}>{m.report1_value ?? '-'} {m.unit}</TableCell>
                                            <TableCell sx={{ color: 'white' }}>{m.report2_value ?? '-'} {m.unit}</TableCell>
                                            <TableCell sx={{ color: m.change > 0 ? '#f44336' : m.change < 0 ? '#38ef7d' : 'white' }}>
                                                {m.change !== null ? (m.change > 0 ? `+${m.change}` : m.change) : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={m.trend}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: m.trend === 'improved' ? 'rgba(56,239,125,0.2)' : m.trend === 'worsened' ? 'rgba(244,67,54,0.2)' : 'rgba(255,255,255,0.1)',
                                                        color: m.trend === 'improved' ? '#38ef7d' : m.trend === 'worsened' ? '#f44336' : 'white'
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setCompareOpen(false); setComparisonData(null); }} sx={{ color: 'rgba(255,255,255,0.7)' }}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
