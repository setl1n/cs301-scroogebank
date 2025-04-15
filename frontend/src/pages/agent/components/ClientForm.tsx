import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Stack
} from '@mui/material';
import { Client } from '../../../types/Client';

interface ClientFormProps {
  initialData?: Partial<Client>;
  onSubmit: (data: Omit<Client, 'clientId'>) => void;
}

const genderOptions = [
  'Male',
  'Female',
  'Non-binary',
  'Prefer not to say'
];

const ClientForm: React.FC<ClientFormProps> = ({ 
  initialData = {}, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState<Partial<Client>>({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    dateOfBirth: initialData.dateOfBirth || '',
    gender: initialData.gender || '',
    emailAddress: initialData.emailAddress || '',
    phoneNumber: initialData.phoneNumber || '',
    address: initialData.address || '',
    city: initialData.city || '',
    state: initialData.state || '',
    country: initialData.country || 'Singapore',
    postalCode: initialData.postalCode || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    const requiredFields = [
      'firstName', 'lastName', 'dateOfBirth', 'gender', 
      'emailAddress', 'phoneNumber', 'address', 'city', 
      'state', 'country', 'postalCode'
    ];
    
    requiredFields.forEach(field => {
      if (!formData[field as keyof Client]) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
      }
    });
    
    // Email validation
    if (formData.emailAddress && !/^\S+@\S+\.\S+$/.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Invalid email format';
    }
    
    // Phone validation
    if (formData.phoneNumber && !/^\+?[0-9]{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be between 10 and 15 digits';
    }
    
    // Age validation
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18 || age > 100) {
        newErrors.dateOfBirth = 'Client must be between 18 and 100 years old';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Cast to required type for submission
      const clientData = formData as Omit<Client, 'clientId'>;
      onSubmit(clientData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Personal Information
      </Typography>
      
      <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          required
          name="firstName"
          label="First Name"
          value={formData.firstName}
          onChange={handleChange}
          error={!!errors.firstName}
          helperText={errors.firstName}
        />
        
        <TextField
          fullWidth
          required
          name="lastName"
          label="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          error={!!errors.lastName}
          helperText={errors.lastName}
        />
      </Stack>
      
      <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          required
          name="dateOfBirth"
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          error={!!errors.dateOfBirth}
          helperText={errors.dateOfBirth || 'DD-MM-YYYY format'}
          InputLabelProps={{
            shrink: true,
          }}
        />
        
        <FormControl required error={!!errors.gender} fullWidth>
          <FormLabel id="gender-label">Gender</FormLabel>
          <RadioGroup
            row
            aria-labelledby="gender-label"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            {genderOptions.map(option => (
              <FormControlLabel 
                key={option} 
                value={option} 
                control={<Radio />} 
                label={option} 
              />
            ))}
          </RadioGroup>
          {errors.gender && (
            <Typography color="error" variant="caption">
              {errors.gender}
            </Typography>
          )}
        </FormControl>
      </Stack>
      
      <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} sx={{ mb: 4 }}>
        <TextField
          fullWidth
          required
          name="emailAddress"
          label="Email Address"
          type="email"
          value={formData.emailAddress}
          onChange={handleChange}
          error={!!errors.emailAddress}
          helperText={errors.emailAddress}
        />
        
        <TextField
          fullWidth
          required
          name="phoneNumber"
          label="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
          error={!!errors.phoneNumber}
          helperText={errors.phoneNumber || "Format: +65XXXXXXXX"}
        />
      </Stack>
      
      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Address Information
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          required
          name="address"
          label="Address"
          value={formData.address}
          onChange={handleChange}
          error={!!errors.address}
          helperText={errors.address}
        />
      </Box>
      
      <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          required
          name="city"
          label="City"
          value={formData.city}
          onChange={handleChange}
          error={!!errors.city}
          helperText={errors.city}
        />
        
        <TextField
          fullWidth
          required
          name="state"
          label="State/Province"
          value={formData.state}
          onChange={handleChange}
          error={!!errors.state}
          helperText={errors.state}
        />
      </Stack>
      
      <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          required
          name="country"
          label="Country"
          value={formData.country}
          onChange={handleChange}
          error={!!errors.country}
          helperText={errors.country}
        />
        
        <TextField
          fullWidth
          required
          name="postalCode"
          label="Postal Code"
          value={formData.postalCode}
          onChange={handleChange}
          error={!!errors.postalCode}
          helperText={errors.postalCode}
        />
      </Stack>
      
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
        >
          Save Client
        </Button>
      </Box>
    </Box>
  );
};

export default ClientForm; 