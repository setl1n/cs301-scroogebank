import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Stack,
  useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import EditClient from './EditClient';

interface AgentCardProps {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export default function AgentCard({ id, name, email, phone }: AgentCardProps) {
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const theme = useTheme();
  
  const handleEditClick = () => {
    setOpenEditDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenEditDialog(false);
  };
  
  return (
    <>
      <Card 
        elevation={0}
        sx={{
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: theme.shadows[2],
            borderColor: 'transparent',
          },
        }}
      >
        <CardContent sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          '&:last-child': { pb: 2 }
        }}>
          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight="medium">{name}</Typography>
              <Chip 
                label={`ID: ${id}`}
                size="small"
                variant="outlined"
                sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
              />
            </Box>
            {email && (
              <Typography variant="body2" color="text.secondary">{email}</Typography>
            )}
            {phone && (
              <Typography variant="body2" color="text.secondary">{phone}</Typography>
            )}
          </Stack>
          
          <IconButton 
            onClick={handleEditClick}
            size="small"
            color="primary"
            sx={{ 
              backgroundColor: theme => alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: theme => alpha(theme.palette.primary.main, 0.2),
              }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </CardContent>
      </Card>
      
      <EditClient 
        open={openEditDialog}
        onClose={handleCloseDialog}
        client={{ id, name, email, phone }}
      />
    </>
  );
}