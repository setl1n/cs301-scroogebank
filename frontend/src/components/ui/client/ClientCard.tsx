import { Card, CardContent, Typography, Box, Skeleton, Button } from '@mui/material';
import { Client, formatClientName } from '../../../types/Client';
import { Link } from 'react-router-dom';

interface ClientCardProps {
  clients: Client[];
  loading: boolean;
  title: string;
  viewAllLink?: string;
}

export default function ClientCard({ clients, loading, title, viewAllLink }: ClientCardProps) {
  const recentClients = clients.slice(-5).reverse();
  
  return (
    <Card
      variant="outlined"
      sx={{ height: '100%', borderRadius: 2 }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="h2">
            {title}
          </Typography>
          {viewAllLink && (
            <Button 
              component={Link}
              to={viewAllLink}
              variant="text"
              size="small"
              sx={{ textTransform: 'none' }}
            >
              View All
            </Button>
          )}
        </Box>
        
        <Box>
          {loading ? (
            // Loading skeleton
            Array(5).fill(0).map((_, index) => (
              <ClientListItem key={index} loading={true} />
            ))
          ) : recentClients.length > 0 ? (
            // Client list
            recentClients.map(client => (
              <ClientListItem key={client.clientId} client={client} loading={false} />
            ))
          ) : (
            // No clients message
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No clients available. Add new clients to get started.
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

// Client list item component
const ClientListItem = ({ client, loading }: { client?: Client, loading: boolean }) => (
  <Box sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
    {loading ? (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
        <Box>
          <Skeleton variant="text" width={120} />
          <Skeleton variant="text" width={180} />
        </Box>
      </Box>
    ) : client ? (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ 
          width: 32, 
          height: 32, 
          borderRadius: '50%', 
          bgcolor: 'primary.light', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white',
          mr: 2,
          fontSize: '0.875rem',
          fontWeight: 'bold'
        }}>
          {client.firstName[0]}{client.lastName[0]}
        </Box>
        <Box>
          <Typography variant="subtitle2">
            {formatClientName(client)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {client.emailAddress}
          </Typography>
        </Box>
      </Box>
    ) : (
      <Typography variant="body2" color="text.secondary">No client data available</Typography>
    )}
  </Box>
); 