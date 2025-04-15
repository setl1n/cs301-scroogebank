import { api } from './api';
import type { AuthContextProps } from 'react-oidc-context';

export interface VerificationDocument {
  id: string;
  fileName: string;
  url: string;
  uploadDate: string;
  fileType: string;
  size: number;
}

export const verificationService = {
  // Get verification documents for a client by email
  async getClientDocuments(email: string, auth?: AuthContextProps): Promise<VerificationDocument[]> {
    return api.get(`/verification/documents?email=${encodeURIComponent(email)}`, auth);
  }
};

export default verificationService; 