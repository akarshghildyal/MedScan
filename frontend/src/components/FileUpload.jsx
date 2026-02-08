import { useState, useRef, useCallback } from 'react';
import {
    Box, Typography, Button, IconButton, LinearProgress, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions, Fade, Zoom
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const getFileIcon = (type) => {
    if (type === 'application/pdf') {
        return <PictureAsPdfIcon sx={{ fontSize: 40, color: '#f5576c' }} />;
    }
    if (type?.startsWith('image/')) {
        return <ImageIcon sx={{ fontSize: 40, color: '#667eea' }} />;
    }
    return <InsertDriveFileIcon sx={{ fontSize: 40, color: '#38ef7d' }} />;
};

const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

export default function FileUpload({ open, onClose, onUploadSuccess }) {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadedReport, setUploadedReport] = useState(null);
    const fileInputRef = useRef(null);

    const resetState = useCallback(() => {
        setFile(null);
        setError('');
        setUploading(false);
        setUploadProgress(0);
        setUploadSuccess(false);
        setUploadedReport(null);
    }, []);

    const handleClose = () => {
        resetState();
        onClose();
    };

    const validateFile = (file) => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Invalid file type. Please upload PDF, JPG, or PNG files only.');
            return false;
        }
        if (file.size > MAX_FILE_SIZE) {
            setError(`File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`);
            return false;
        }
        return true;
    };

    const handleFileSelect = (selectedFile) => {
        setError('');
        if (selectedFile && validateFile(selectedFile)) {
            setFile(selectedFile);
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        handleFileSelect(droppedFile);
    };

    const handleInputChange = (e) => {
        const selectedFile = e.target.files[0];
        handleFileSelect(selectedFile);
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveFile = () => {
        setFile(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/reports/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                },
            });

            setUploadProgress(100);
            setUploading(false);
            setUploadSuccess(true);
            setUploadedReport(response.data);

            // Notify parent component
            if (onUploadSuccess) {
                onUploadSuccess(response.data);
            }
        } catch (err) {
            setUploading(false);
            setUploadProgress(0);
            const errorMessage = err.response?.data?.detail || 'Upload failed. Please try again.';
            setError(errorMessage);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 3,
                    backdropFilter: 'blur(20px)',
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                pb: 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
                    }}>
                        <CloudUploadIcon sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        Upload Medical Report
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: 'rgba(255,255,255,0.5)' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ py: 4 }}>
                {uploadSuccess ? (
                    <Zoom in={uploadSuccess}>
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Box
                                sx={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 3,
                                    animation: 'pulse 2s infinite',
                                    '@keyframes pulse': {
                                        '0%': { boxShadow: '0 0 0 0 rgba(56, 239, 125, 0.4)' },
                                        '70%': { boxShadow: '0 0 0 20px rgba(56, 239, 125, 0)' },
                                        '100%': { boxShadow: '0 0 0 0 rgba(56, 239, 125, 0)' },
                                    }
                                }}
                            >
                                <CheckCircleIcon sx={{ fontSize: 48, color: 'white' }} />
                            </Box>
                            <Typography variant="h5" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                                Upload Successful!
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                Your file "{file?.name}" has been uploaded.
                            </Typography>
                            <Typography sx={{ color: '#38ef7d', fontSize: 13, mt: 1 }}>
                                AI analysis is now in progress...
                            </Typography>
                        </Box>
                    </Zoom>
                ) : (
                    <>
                        {error && (
                            <Fade in={!!error}>
                                <Alert
                                    severity="error"
                                    sx={{
                                        mb: 3,
                                        bgcolor: 'rgba(245, 87, 108, 0.1)',
                                        color: '#f5576c',
                                        border: '1px solid rgba(245, 87, 108, 0.3)',
                                        '& .MuiAlert-icon': { color: '#f5576c' }
                                    }}
                                >
                                    {error}
                                </Alert>
                            </Fade>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleInputChange}
                            style={{ display: 'none' }}
                        />

                        {!file ? (
                            <Box
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={handleBrowseClick}
                                sx={{
                                    border: `2px dashed ${isDragging ? '#667eea' : 'rgba(255,255,255,0.2)'}`,
                                    borderRadius: 3,
                                    p: 6,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    bgcolor: isDragging ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255,255,255,0.02)',
                                    '&:hover': {
                                        borderColor: '#667eea',
                                        bgcolor: 'rgba(102, 126, 234, 0.05)',
                                        transform: 'scale(1.01)',
                                    }
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 70,
                                        height: 70,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mx: 'auto',
                                        mb: 3,
                                        transition: 'transform 0.3s ease',
                                        transform: isDragging ? 'scale(1.1)' : 'scale(1)',
                                    }}
                                >
                                    <CloudUploadIcon sx={{ fontSize: 32, color: 'white' }} />
                                </Box>
                                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                                    {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.5)', mb: 2 }}>
                                    or click to browse
                                </Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                                    Supported formats: PDF, JPG, PNG • Max size: 10MB
                                </Typography>
                            </Box>
                        ) : (
                            <Fade in={!!file}>
                                <Box
                                    sx={{
                                        border: '1px solid rgba(102, 126, 234, 0.3)',
                                        borderRadius: 3,
                                        p: 3,
                                        bgcolor: 'rgba(102, 126, 234, 0.05)',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderRadius: 2,
                                                bgcolor: 'rgba(255,255,255,0.05)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            {getFileIcon(file.type)}
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography
                                                sx={{
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {file.name}
                                            </Typography>
                                            <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                                                {formatFileSize(file.size)}
                                            </Typography>
                                        </Box>
                                        {!uploading && (
                                            <IconButton
                                                onClick={handleRemoveFile}
                                                sx={{
                                                    color: 'rgba(255,255,255,0.5)',
                                                    '&:hover': {
                                                        color: '#f5576c',
                                                        bgcolor: 'rgba(245, 87, 108, 0.1)'
                                                    }
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </Box>

                                    {uploading && (
                                        <Box sx={{ mt: 3 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                                                    Uploading...
                                                </Typography>
                                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>
                                                    {Math.round(uploadProgress)}%
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={uploadProgress}
                                                sx={{
                                                    height: 6,
                                                    borderRadius: 3,
                                                    bgcolor: 'rgba(255,255,255,0.1)',
                                                    '& .MuiLinearProgress-bar': {
                                                        borderRadius: 3,
                                                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                                                    }
                                                }}
                                            />
                                        </Box>
                                    )}
                                </Box>
                            </Fade>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 0, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                {uploadSuccess ? (
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleClose}
                        sx={{
                            py: 1.5,
                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                            fontWeight: 600,
                            '&:hover': {
                                background: 'linear-gradient(135deg, #0d7d73 0%, #2ecc71 100%)',
                            }
                        }}
                    >
                        Done
                    </Button>
                ) : (
                    <>
                        <Button
                            onClick={handleClose}
                            sx={{
                                color: 'rgba(255,255,255,0.6)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            startIcon={<CloudUploadIcon />}
                            sx={{
                                px: 4,
                                py: 1.5,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                fontWeight: 600,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)',
                                },
                                '&:disabled': {
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'rgba(255,255,255,0.3)',
                                }
                            }}
                        >
                            {uploading ? 'Uploading...' : 'Upload Report'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}
