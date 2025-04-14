import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Button, 
  Alert, 
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import config from '../../config';

interface VerificationParams {
  token: string | null;
  email: string | null;
}

const VerificationPage = () => {
  const [params, setParams] = useState<VerificationParams>({
    token: null,
    email: null,
  });
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    // Extract query parameters from URL
    const searchParams = new URLSearchParams(window.location.search);
    setParams({
      token: searchParams.get("token"),
      email: searchParams.get("email"),
    });
  }, []);

  const validateFile = (file: File): boolean => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const isValidType = allowedTypes.includes(file.type) || 
                        ['jpg', 'jpeg', 'png', 'pdf'].includes(fileExtension || '');
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    const isValidSize = file.size <= maxSize;
    
    if (!isValidType) {
      setFileError("Invalid file type. Only PNG, JPEG, and PDF files are allowed.");
      return false;
    }
    
    if (!isValidSize) {
      setFileError("File is too large. Maximum size is 10MB.");
      return false;
    }
    
    setFileError(null);
    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      } else {
        setFile(null);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      } else {
        setFile(null);
        // Reset the input to allow selecting the same file again
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) return;
    if (fileError) return;
    if (!params.token || !params.email) {
      setUploadStatus("error");
      setErrorMessage("Missing required parameters in URL");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("token", params.token);
      formData.append("email", params.email);

      // Use the correct endpoint for verification uploads
      const response = await fetch(`${config.apiBaseUrl}/verification/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      setUploadStatus("success");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        width: '100%',
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center',
        py: 5,
        bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            overflow: 'hidden',
            borderRadius: 3,
          }}
        >
          <Box sx={{ p: 4 }}>
            <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
              Verification Upload
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Upload your verification document for {params.email || "verification"}
            </Typography>

            <form onSubmit={handleSubmit}>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: isDragging 
                    ? 'primary.main' 
                    : file 
                      ? 'success.light' 
                      : fileError 
                        ? 'error.light' 
                        : 'divider',
                  borderRadius: 2,
                  p: 4,
                  mb: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: isDragging 
                    ? alpha(theme.palette.primary.main, 0.1)
                    : file 
                      ? alpha(theme.palette.success.light, 0.1)
                      : fileError 
                        ? alpha(theme.palette.error.light, 0.1)
                        : 'transparent',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  }
                }}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("verification-file-upload")?.click()}
              >
                <input 
                  id="verification-file-upload" 
                  type="file" 
                  style={{ display: 'none' }} 
                  onChange={handleFileChange} 
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  {file ? (
                    <CheckCircleOutlineIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                  ) : fileError ? (
                    <ErrorOutlineIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
                  ) : (
                    <UploadFileIcon color="action" sx={{ fontSize: 40, mb: 1 }} />
                  )}
                  
                  {file ? (
                    <Box>
                      <Typography variant="subtitle1" color="success.main" fontWeight="medium">
                        File Selected
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {file.name}
                      </Typography>
                    </Box>
                  ) : fileError ? (
                    <Box>
                      <Typography variant="subtitle1" color="error.main" fontWeight="medium">
                        Invalid File
                      </Typography>
                      <Typography variant="body2" color="error">
                        {fileError}
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="subtitle1" fontWeight="medium">
                        Drop your file here or click to browse
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Supports PDF, JPG, PNG (max 10MB)
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {uploadStatus === "success" && (
                <Alert 
                  severity="success" 
                  sx={{ mb: 3, borderRadius: 2 }}
                  icon={<CheckCircleOutlineIcon />}
                >
                  <Typography variant="subtitle2">Success</Typography>
                  <Typography variant="body2">
                    Your verification document has been uploaded successfully.
                  </Typography>
                </Alert>
              )}

              {uploadStatus === "error" && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 3, borderRadius: 2 }}
                  icon={<ErrorOutlineIcon />}
                >
                  <Typography variant="subtitle2">Error</Typography>
                  <Typography variant="body2">
                    {errorMessage || "There was an error uploading your document. Please try again."}
                  </Typography>
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={!file || !!fileError || isUploading}
                sx={{ 
                  borderRadius: 2,
                  py: 1.5,
                  position: 'relative'
                }}
              >
                {isUploading && (
                  <CircularProgress 
                    size={24} 
                    sx={{ 
                      position: 'absolute',
                      left: 24,
                      color: 'primary.contrastText'
                    }} 
                  />
                )}
                {isUploading ? "Uploading..." : "Submit Verification"}
              </Button>
            </form>
          </Box>
          <Box sx={{ px: 3, py: 2, bgcolor: 'background.default', borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2" color="text.secondary" align="center">
              Secure verification portal
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default VerificationPage;