import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../store/authSlice';
import FileUpload from '../components/FileUpload';
import api from '../services/api';
import {
    Box, Typography, AppBar, Toolbar, Button, Chip, Avatar,
    CircularProgress, Table, TableBody, TableCell, TableHead, TableRow,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
    Grid, Paper, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import ShareIcon from '@mui/icons-material/Share';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import { TextField, List, ListItem, ListItemText, Divider } from '@mui/material';
import Plot from 'react-plotly.js';

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
    const s = String(status).toLowerCase();
    const colors = {
        normal: { bg: 'rgba(56, 239, 125, 0.2)', text: '#38ef7d', icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> },
        low: { bg: 'rgba(255, 193, 7, 0.2)', text: '#ffc107', icon: <WarningAmberIcon sx={{ fontSize: 16 }} /> },
        high: { bg: 'rgba(255, 152, 0, 0.2)', text: '#ff9800', icon: <WarningAmberIcon sx={{ fontSize: 16 }} /> },
        critical: { bg: 'rgba(244, 67, 54, 0.2)', text: '#f44336', icon: <WarningAmberIcon sx={{ fontSize: 16 }} /> }
    };
    const style = colors[s] || colors.normal;

    return (
        <Chip
            icon={style.icon}
            label={s.toUpperCase()}
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
    const [reports, setReports] = useState([]);

    // View Report Modal State
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [selectedReportId, setSelectedReportId] = useState(null);
    const [reportDetail, setReportDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // Trend Modal State
    const [trendModalOpen, setTrendModalOpen] = useState(false);
    const [trendData, setTrendData] = useState(null);
    const [trendLoading, setTrendLoading] = useState(false);
    const [selectedMarker, setSelectedMarker] = useState(null);

    // Share Modal State
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [doctorIdInput, setDoctorIdInput] = useState('');
    const [shareMessage, setShareMessage] = useState({ text: '', type: '' });

    // Chat Modal State
    const [chatModalOpen, setChatModalOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'patient') {
            navigate('/login');
        } else {
            fetchReports();
        }
    }, [user, navigate]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await api.get('/reports/');
            setReports(response.data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewReport = async (reportId) => {
        setSelectedReportId(reportId);
        setViewModalOpen(true);
        setDetailLoading(true);
        try {
            const response = await api.get(`/reports/${reportId}`);
            setReportDetail(response.data);
        } catch (error) {
            console.error('Failed to fetch report detail:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleViewTrend = async (markerName, unit) => {
        setSelectedMarker({ name: markerName, unit });
        setTrendModalOpen(true);
        setTrendLoading(true);
        try {
            const response = await api.get(`/trends/${encodeURIComponent(markerName)}`);
            setTrendData(response.data);
        } catch (error) {
            console.error('Failed to fetch trend data:', error);
            setTrendData([]);
        } finally {
            setTrendLoading(false);
        }
    };

    const handleShareReport = async () => {
        if (!doctorIdInput.trim()) return;
        setShareMessage({ text: 'Sharing...', type: 'info' });
        try {
            const response = await api.post('/sharing/share', {
                report_id: selectedReportId,
                doctor_id: doctorIdInput.trim()
            });
            setShareMessage({ text: response.data.message || 'Shared successfully!', type: 'success' });
            setTimeout(() => {
                setShareModalOpen(false);
                setShareMessage({ text: '', type: '' });
                setDoctorIdInput('');
            }, 2000);
        } catch (error) {
            setShareMessage({
                text: error.response?.data?.detail || 'Failed to share report.',
                type: 'error'
            });
        }
    };

    const handleSendChat = async () => {
        if (!chatInput.trim()) return;
        const param = {
            report_id: selectedReportId,
            question: chatInput.trim()
        };
        const newHistory = [...chatHistory, { role: 'user', text: param.question }];
        setChatHistory(newHistory);
        setChatInput('');
        setChatLoading(true);

        try {
            const response = await api.post('/chat/query', param);
            setChatHistory([...newHistory, { role: 'assistant', text: response.data.answer }]);
        } catch (error) {
            console.error('Chat error:', error);
            setChatHistory([...newHistory, { role: 'assistant', text: 'Sorry, I encountered an error answering your question.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const handleUploadSuccess = () => {
        setUploadOpen(false);
        fetchReports();
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
                <CircularProgress sx={{ color: '#667eea' }} />
            </Box>
        );
    }

    const hasReports = reports.length > 0;

    // Calculate global stats from the list of reports
    let totalFlagged = 0;
    let totalNormal = 0;

    reports.forEach(r => {
        if (r.status === 'analyzed') {
            // We don't have full markers in the list view, so we estimate based on status.
            // Or we could wait for the detail view. 
            // The API spec for `GET /reports` returns only high level data.
        }
    });

    return (
        <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
            {/* App Bar */}
            <AppBar position="static" sx={{ background: 'transparent', boxShadow: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Toolbar>
                    <MedicalServicesIcon sx={{ mr: 2, color: '#667eea' }} />
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700, color: 'white' }}>
                        MedScan Patient Portal
                    </Typography>
                    <IconButton onClick={fetchReports} sx={{ color: 'rgba(255,255,255,0.7)', mr: 2 }}>
                        <RefreshIcon />
                    </IconButton>
                    <Chip label={user?.full_name || user?.email} sx={{ mr: 2, bgcolor: 'rgba(102, 126, 234, 0.2)', color: 'white', border: '1px solid rgba(102, 126, 234, 0.3)' }} />
                    <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.7)' }}>Logout</Button>
                </Toolbar>
            </AppBar>

            <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>

                    {/* Health Overview Card */}
                    <BentoCard gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" sx={{ gridColumn: { md: 'span 3' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                                <PersonIcon sx={{ fontSize: 30 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                                    Welcome back, {user?.full_name || 'Patient'}!
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.8)' }}>
                                    {hasReports ? `You have ${reports.length} pathology reports in your history.` : 'Upload a pathology report to get started.'}
                                </Typography>
                            </Box>
                        </Box>
                    </BentoCard>

                    {/* Quick Upload Card */}
                    <BentoCard onClick={() => setUploadOpen(true)} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                        <Box sx={{ p: 2, borderRadius: 2, background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', mb: 2 }}>
                            <CloudUploadIcon sx={{ color: 'white', fontSize: 32 }} />
                        </Box>
                        <Typography sx={{ color: 'white', fontWeight: 600 }}>Upload New Report</Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>PDF format only</Typography>
                    </BentoCard>

                    {/* My Reports List */}
                    <BentoCard sx={{ gridColumn: { md: 'span 4' } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', mr: 2 }}>
                                <AssignmentIcon sx={{ color: 'white' }} />
                            </Box>
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>Report History</Typography>
                        </Box>

                        {!hasReports ? (
                            <Box sx={{ textAlign: 'center', py: 6, border: '2px dashed rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                <AssignmentIcon sx={{ fontSize: 48, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
                                <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>No reports uploaded yet</Typography>
                                <Button
                                    variant="outlined"
                                    onClick={() => setUploadOpen(true)}
                                    sx={{ mt: 2, color: '#667eea', borderColor: '#667eea' }}
                                >
                                    Upload First Report
                                </Button>
                            </Box>
                        ) : (
                            <Table size="medium">
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Filename</TableCell>
                                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Type</TableCell>
                                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Date Uploaded</TableCell>
                                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Status</TableCell>
                                        <TableCell align="right" sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reports.map((report) => (
                                        <TableRow key={report.report_id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                                            <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                {report.file_name}
                                                {report.summary && <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', mt: 0.5, maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{report.summary}</Typography>}
                                            </TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                {report.report_type || 'Unknown'}
                                            </TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                {new Date(report.upload_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <Chip
                                                    label={report.status.toUpperCase()}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: report.status === 'analyzed' ? 'rgba(56, 239, 125, 0.2)' : report.status === 'failed' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(255, 193, 7, 0.2)',
                                                        color: report.status === 'analyzed' ? '#38ef7d' : report.status === 'failed' ? '#f44336' : '#ffc107',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 'bold'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    disabled={report.status !== 'analyzed'}
                                                    onClick={() => handleViewReport(report.report_id)}
                                                    sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', mr: 1 }}
                                                >
                                                    View
                                                </Button>
                                                <IconButton
                                                    size="small"
                                                    disabled={report.status !== 'analyzed'}
                                                    onClick={() => { setSelectedReportId(report.report_id); setShareModalOpen(true); }}
                                                    sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#38ef7d' } }}
                                                    title="Share Report"
                                                >
                                                    <ShareIcon fontSize="small" />
                                                </IconButton>
                                                <IconButton
                                                    size="small"
                                                    disabled={report.status !== 'analyzed'}
                                                    onClick={() => { setSelectedReportId(report.report_id); setChatHistory([]); setChatModalOpen(true); }}
                                                    sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#667eea' } }}
                                                    title="Chat with Report"
                                                >
                                                    <ChatIcon fontSize="small" />
                                                </IconButton>
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

            {/* View Report Detail Modal */}
            <Dialog
                open={viewModalOpen}
                onClose={() => setViewModalOpen(false)}
                maxWidth="lg"
                fullWidth
                PaperProps={{ sx: { bgcolor: '#121212', color: 'white', minHeight: '80vh' } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
                            Report Analysis
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
                            {reportDetail?.file_name} ({reportDetail?.report_type})
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setViewModalOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 4 }}>
                    {detailLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                            <CircularProgress sx={{ color: '#667eea' }} />
                        </Box>
                    ) : reportDetail ? (
                        <Grid container spacing={4}>
                            {/* Left Column: Summary & Interpretation */}
                            <Grid item xs={12} md={7}>
                                <Paper sx={{ p: 3, mb: 3, bgcolor: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.3)', borderRadius: 2 }}>
                                    <Typography variant="h6" sx={{ color: '#667eea', fontWeight: 600, mb: 1 }}>
                                        AI Summary
                                    </Typography>
                                    <Typography sx={{ color: 'white', fontSize: '1.1rem', lineHeight: 1.6 }}>
                                        {reportDetail.summary}
                                    </Typography>
                                </Paper>

                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                                    Detailed Explanation
                                </Typography>
                                <Paper sx={{ p: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.8)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                                        {reportDetail.detailed_analysis}
                                    </Typography>
                                </Paper>
                            </Grid>

                            {/* Right Column: Key Alerts & Markers */}
                            <Grid item xs={12} md={5}>
                                {/* Insights Panel */}
                                {reportDetail.insights?.length > 0 && (
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center' }}>
                                            <WarningAmberIcon sx={{ color: '#ffc107', mr: 1 }} /> Key Clinical Insights
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            {reportDetail.insights.map((insight, i) => (
                                                <Paper key={i} sx={{ p: 2, bgcolor: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)', borderRadius: 2 }}>
                                                    <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>
                                                        {insight}
                                                    </Typography>
                                                </Paper>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {/* Extracted Markers */}
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                                    Extracted Values
                                </Typography>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Marker</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Value</TableCell>
                                            <TableCell sx={{ color: 'rgba(255,255,255,0.7)', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {reportDetail.markers?.map((m, i) => (
                                            <TableRow key={i}>
                                                <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    {m.name}
                                                    <br />
                                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>Ref: {m.reference_min !== null ? m.reference_min : '?'}-{m.reference_max !== null ? m.reference_max : '?'} {m.unit}</span>
                                                </TableCell>
                                                <TableCell sx={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: m.status !== 'normal' ? 'bold' : 'normal' }}>
                                                    {m.value} {m.unit}
                                                </TableCell>
                                                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <StatusBadge status={m.status} />
                                                        {!isNaN(parseFloat(m.value)) && (
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleViewTrend(m.name, m.unit)}
                                                                sx={{ color: '#667eea', '&:hover': { bgcolor: 'rgba(102, 126, 234, 0.1)' } }}
                                                                title="View Trend"
                                                            >
                                                                <InsertChartOutlinedIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Grid>
                        </Grid>
                    ) : (
                        <Typography sx={{ color: 'white' }}>Failed to load report data.</Typography>
                    )}
                </DialogContent>
            </Dialog>

            {/* View Trend Modal */}
            <Dialog
                open={trendModalOpen}
                onClose={() => setTrendModalOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{ sx: { bgcolor: '#1a1a2e', color: 'white' } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', pb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Historical Trend: {selectedMarker?.name}
                    </Typography>
                    <IconButton onClick={() => setTrendModalOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 4, minHeight: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {trendLoading ? (
                        <CircularProgress sx={{ color: '#667eea' }} />
                    ) : trendData && trendData.length > 0 ? (
                        <Box sx={{ width: '100%', height: '100%' }}>
                            <Plot
                                data={[
                                    {
                                        x: trendData.map(d => d.date),
                                        y: trendData.map(d => d.value),
                                        type: 'scatter',
                                        mode: 'lines+markers',
                                        marker: { color: '#667eea', size: 8 },
                                        line: { color: '#667eea', shape: 'spline', width: 3 },
                                        name: selectedMarker?.name
                                    }
                                ]}
                                layout={{
                                    width: undefined, // Let it responsive
                                    autosize: true,
                                    paper_bgcolor: 'transparent',
                                    plot_bgcolor: 'transparent',
                                    font: { color: 'rgba(255,255,255,0.8)' },
                                    xaxis: {
                                        title: 'Date',
                                        gridcolor: 'rgba(255,255,255,0.1)',
                                        zerolinecolor: 'rgba(255,255,255,0.1)'
                                    },
                                    yaxis: {
                                        title: `Value (${selectedMarker?.unit || ''})`,
                                        gridcolor: 'rgba(255,255,255,0.1)',
                                        zerolinecolor: 'rgba(255,255,255,0.1)'
                                    },
                                    margin: { t: 20, r: 20, l: 60, b: 60 }
                                }}
                                style={{ width: '100%', height: '400px' }}
                                config={{ responsive: true, displayModeBar: false }}
                            />
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center' }}>
                            <InsertChartOutlinedIcon sx={{ fontSize: 60, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                No historical data found for {selectedMarker?.name}.
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, mt: 1 }}>
                                Upload more reports containing this marker to see the trend.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* Share Modal */}
            <Dialog open={shareModalOpen} onClose={() => setShareModalOpen(false)} PaperProps={{ sx: { bgcolor: '#1a1a2e', color: 'white', border: '1px solid rgba(255,255,255,0.1)' } }}>
                <DialogTitle>Share Report</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2, color: 'rgba(255,255,255,0.7)' }}>
                        Enter the Doctor's ID to share this report securely.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Doctor ID"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={doctorIdInput}
                        onChange={(e) => setDoctorIdInput(e.target.value)}
                        sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.5)' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&:hover fieldset': { borderColor: '#667eea' }, '&.Mui-focused fieldset': { borderColor: '#11998e' } } }}
                    />
                    {shareMessage.text && (
                        <Typography sx={{ mt: 2, fontSize: 13, color: shareMessage.type === 'error' ? '#f5576c' : shareMessage.type === 'success' ? '#38ef7d' : '#667eea' }}>
                            {shareMessage.text}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setShareModalOpen(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}>Cancel</Button>
                    <Button onClick={handleShareReport} variant="contained" sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>Share</Button>
                </DialogActions>
            </Dialog>

            {/* Chat Modal */}
            <Dialog open={chatModalOpen} onClose={() => setChatModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#121212', color: 'white', minHeight: '50vh', border: '1px solid rgba(255,255,255,0.1)' } }}>
                <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ChatIcon sx={{ color: '#667eea' }} />
                        <Typography variant="h6">MedScan Medical Assistant</Typography>
                    </Box>
                    <IconButton onClick={() => setChatModalOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '400px' }}>
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
                        {chatHistory.length === 0 ? (
                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', mt: 4 }}>
                                Ask a question about your report (e.g., "What does my high Glucose mean?")
                            </Typography>
                        ) : (
                            <List>
                                {chatHistory.map((msg, idx) => (
                                    <ListItem key={idx} sx={{ justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', mb: 1 }}>
                                        <Box sx={{
                                            maxWidth: '75%', p: 2, borderRadius: 2,
                                            bgcolor: msg.role === 'user' ? '#667eea' : 'rgba(255,255,255,0.1)',
                                            color: 'white', whiteSpace: 'pre-wrap'
                                        }}>
                                            <Typography variant="body2">{msg.text}</Typography>
                                        </Box>
                                    </ListItem>
                                ))}
                                {chatLoading && (
                                    <ListItem sx={{ justifyContent: 'flex-start' }}>
                                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.05)' }}>
                                            <CircularProgress size={20} sx={{ color: 'white' }} />
                                        </Box>
                                    </ListItem>
                                )}
                            </List>
                        )}
                    </Box>
                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type your question..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => { if (e.key === 'Enter') handleSendChat(); }}
                            sx={{ input: { color: 'white' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' }, '&:hover fieldset': { borderColor: '#667eea' } } }}
                        />
                        <Button variant="contained" onClick={handleSendChat} disabled={chatLoading} sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minWidth: '50px' }}>
                            <SendIcon />
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box >
    );
}
