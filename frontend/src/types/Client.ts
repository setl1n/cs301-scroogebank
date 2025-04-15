export interface Client {
  clientId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO date string
  gender: string;
  emailAddress: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  verificationStatus?: string; // Added for client verification functionality
}

// Helper function to format client name
export const formatClientName = (client: Client): string => {
  return `${client.firstName} ${client.lastName}`;
};

// Validation helper to check if client is valid
export const isValidClient = (client: Client): boolean => {
  return Boolean(
    client.firstName &&
    client.lastName &&
    client.emailAddress &&
    client.phoneNumber
  );
}; 