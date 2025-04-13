import { Card, CardContent, Typography, Skeleton } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  loading: boolean;
}

export default function StatCard({ title, value, icon, loading }: StatCardProps) {
  return (
    <Card sx={{ 
      height: '100%', 
      borderRadius: 2,
      boxShadow: 'rgba(0, 0, 0, 0.04) 0px 5px 22px, rgba(0, 0, 0, 0.03) 0px 0px 0px 0.5px' 
    }}>
      <CardContent sx={{ p: 3 }}>
        {loading ? (
          <>
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={60} height={40} />
            <Skeleton variant="circular" width={40} height={40} />
          </>
        ) : (
          <>
            <Typography color="text.secondary" variant="subtitle2">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ mt: 1, mb: 2, fontWeight: 'bold' }}>
              {value}
            </Typography>
            {icon}
          </>
        )}
      </CardContent>
    </Card>
  );
} 