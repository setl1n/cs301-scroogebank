package com.cs301g2t1.transaction.utils;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import net.schmizz.sshj.SSHClient;
import net.schmizz.sshj.sftp.FileAttributes;
import net.schmizz.sshj.sftp.FileMode;
import net.schmizz.sshj.sftp.RemoteFile;
import net.schmizz.sshj.sftp.RemoteResourceInfo;
import net.schmizz.sshj.sftp.SFTPClient;
import net.schmizz.sshj.transport.verification.PromiscuousVerifier;
import net.schmizz.sshj.userauth.keyprovider.KeyProvider;
import net.schmizz.sshj.userauth.password.PasswordUtils;

public class SFTPFacadeImpl implements SFTPFacade {
    private SSHClient ssh = null;
    private SFTPClient sftpClient = null;

    @Override
    public void connect() throws Exception {
        String host = System.getenv("SFTP_HOST");
        String username = "ubuntu";
        String password = System.getenv("SFTP_PASS");
        String privateKeySecretName = System.getenv("SFTP_PRIVATE_KEY_SECRET_NAME");
        String keyPassphrase = System.getenv("SFTP_KEY_PASSPHRASE");
    
        System.out.println("SSHJ: Attempting to connect to " + host + " as " + username);
        System.out.println("SSHJ: Using private key secret: " + (privateKeySecretName != null ? privateKeySecretName : "none"));
        System.out.println("SSHJ: Using key passphrase: " + (keyPassphrase != null ? "yes" : "no"));
        
        ssh = new SSHClient();
        
        // Don't check host keys (equivalent to StrictHostKeyChecking=no)
        ssh.addHostKeyVerifier(new PromiscuousVerifier());
        
        // Set connection timeout
        ssh.setConnectTimeout(30000); // 30 seconds

        try {
            // Connect to the server
            System.out.println("SSHJ: Connecting to server...");
            ssh.connect(host);
            System.out.println("SSHJ: Connected successfully to " + host);
            
            boolean authenticated = false;
            
            // Try private key authentication first if available
            if (privateKeySecretName != null && !privateKeySecretName.isEmpty()) {
                try {
                    System.out.println("SSHJ: Retrieving private key from Secrets Manager...");
                    String privateKey = SecretsManagerUtil.getSecretValue(privateKeySecretName);
                    
                    if (privateKey != null && !privateKey.isEmpty()) {
                        System.out.println("SSHJ: Private key retrieved, length: " + privateKey.length());
                        
                        // Log first part of the key for debugging
                        if (privateKey.length() > 20) {
                            System.out.println("SSHJ: Key starts with: " + privateKey.substring(0, Math.min(100, privateKey.length())) + "...");
                        }
                        
                        try {
                            // Normalize the key format
                            privateKey = normalizeKeyFormat(privateKey);
                            
                            // Create a temporary file for the private key
                            java.io.File tempKeyFile = java.io.File.createTempFile("ssh-key", ".pem");
                            try {
                                // Set restrictive permissions on the key file
                                tempKeyFile.setReadable(false, false);
                                tempKeyFile.setReadable(true, true);
                                tempKeyFile.setWritable(false, false);
                                tempKeyFile.setWritable(true, true);
                                
                                // Write the key content to the temp file
                                try (java.io.FileWriter writer = new java.io.FileWriter(tempKeyFile)) {
                                    writer.write(privateKey);
                                }
                                
                                System.out.println("SSHJ: Created temporary key file: " + tempKeyFile.getAbsolutePath());
                                
                                // Load the key from the temp file
                                KeyProvider keyProvider;
                                if (keyPassphrase != null && !keyPassphrase.isEmpty()) {
                                    keyProvider = ssh.loadKeys(tempKeyFile.getAbsolutePath(),
                                        PasswordUtils.createOneOff(keyPassphrase.toCharArray()));
                                    System.out.println("SSHJ: Loaded key with passphrase");
                                } else {
                                    keyProvider = ssh.loadKeys(tempKeyFile.getAbsolutePath(), (char[]) null);
                                    System.out.println("SSHJ: Loaded key without passphrase");
                                }
                                
                                // Authenticate with private key
                                System.out.println("SSHJ: Authenticating with private key...");
                                ssh.authPublickey(username, keyProvider);
                                System.out.println("SSHJ: Authentication with private key successful");
                                authenticated = true;
                            } finally {
                                // Always delete the temporary key file
                                if (tempKeyFile.exists()) {
                                    boolean deleted = tempKeyFile.delete();
                                    System.out.println("SSHJ: Temporary key file " + 
                                        (deleted ? "deleted" : "could not be deleted"));
                                }
                            }
                        } catch (Exception e) {
                            System.out.println("SSHJ: Failed to authenticate with private key: " + e.getMessage());
                            e.printStackTrace();
                        }
                    } else {
                        System.out.println("SSHJ: Retrieved private key is null or empty");
                    }
                } catch (Exception e) {
                    System.out.println("SSHJ: Error retrieving private key: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            // Try password authentication if private key failed
            if (!authenticated && password != null && !password.isEmpty()) {
                try {
                    System.out.println("SSHJ: Authenticating with password...");
                    ssh.authPassword(username, password);
                    System.out.println("SSHJ: Authentication with password successful");
                    authenticated = true;
                } catch (Exception e) {
                    System.out.println("SSHJ: Failed to authenticate with password: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            if (!authenticated) {
                throw new Exception("SSHJ: All authentication methods failed");
            }
            
            // Start SFTP session
            System.out.println("SSHJ: Starting SFTP session...");
            sftpClient = ssh.newSFTPClient();
            System.out.println("SSHJ: SFTP session established successfully");
            
        } catch (Exception e) {
            System.out.println("SSHJ: Connection failed: " + e.getMessage());
            if (ssh != null && ssh.isConnected()) {
                try {
                    ssh.disconnect();
                } catch (IOException ignored) {}
            }
            throw e;
        }
    }

    /**
     * Normalizes SSH key format by ensuring it has proper PEM format with correct line breaks
     */
    private String normalizeKeyFormat(String key) {
        if (key == null) return null;
        
        System.out.println("SSHJ: Normalizing key format...");
        
        // Remove extra spaces/tabs at beginning of lines
        key = key.replaceAll("(?m)^[ \\t]+", "");
        
        // Normalize line endings
        key = key.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
        
        // Detect key type
        boolean isRSA = key.contains("RSA PRIVATE KEY");
        boolean isEC = key.contains("EC PRIVATE KEY");
        boolean isOpenSSH = key.contains("OPENSSH PRIVATE KEY");
        System.out.println("SSHJ: Detected key type: " + 
                          (isRSA ? "RSA" : isEC ? "EC" : isOpenSSH ? "OpenSSH" : "Unknown"));
        
        // Check if key is in proper PEM format
        if (!key.startsWith("-----BEGIN") || !key.contains("PRIVATE KEY")) {
            System.out.println("SSHJ: Key doesn't appear to be in PEM format, may not work correctly");
        }
        
        return key;
    }

    @Override
    public List<String> listFiles(String directory, String pattern) throws Exception {
        List<String> fileList = new ArrayList<>();
        
        try {
            List<RemoteResourceInfo> ls = sftpClient.ls(directory);
            for (RemoteResourceInfo info : ls) {
                String filename = info.getName();
                
                // Skip directories and hidden files
                if (info.isDirectory() || filename.startsWith(".")) {
                    continue;
                }
                
                // Match pattern using simple glob pattern matching
                if (pattern.equals("*") ||
                        (pattern.startsWith("*") && filename.endsWith(pattern.substring(1))) ||
                        (pattern.endsWith("*") && filename.startsWith(pattern.substring(0, pattern.length() - 1))) ||
                        (pattern.contains("*") && pattern.split("\\*").length == 2 &&
                                filename.startsWith(pattern.split("\\*")[0]) &&
                                filename.endsWith(pattern.split("\\*")[1]))) {
                    fileList.add(filename);
                }
            }
        } catch (IOException e) {
            System.out.println("SSHJ: Error listing files: " + e.getMessage());
            throw e;
        }
        
        return fileList;
    }

    @Override
    public InputStream downloadFile(String filePath) throws Exception {
        try {
            RemoteFile file = sftpClient.open(filePath);
            
            // Fix for reading bytes - using RemoteFileInputStream instead of getInputStream()
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            byte[] buffer = new byte[8192];
            InputStream is = file.new RemoteFileInputStream(); // Fixed method call
            int read;
            while ((read = is.read(buffer)) != -1) {
                baos.write(buffer, 0, read);
            }
            is.close();
            file.close();
            
            return new ByteArrayInputStream(baos.toByteArray());
        } catch (IOException e) {
            System.out.println("SSHJ: Error downloading file: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public void moveFile(String sourceFilePath, String destinationFilePath) throws Exception {
        try {
            // Ensure the destination directory exists
            String destinationDir = destinationFilePath.substring(0, destinationFilePath.lastIndexOf('/'));
            createDirectoryRecursively(destinationDir);
            
            // Move the file
            sftpClient.rename(sourceFilePath, destinationFilePath);
        } catch (IOException e) {
            System.out.println("SSHJ: Error moving file: " + e.getMessage());
            throw e;
        }
    }

    private void createDirectoryRecursively(String path) throws IOException {
        String[] folders = path.split("/");
        String currentPath = "";
        
        for (String folder : folders) {
            if (folder.isEmpty()) {
                currentPath += "/";
                continue;
            }
            
            currentPath += folder + "/";
            
            try {
                FileAttributes attrs = sftpClient.stat(currentPath);
                // Fix for directory type check - using isDirectory() from the attributes 
                if (!attrs.getType().equals(FileMode.Type.DIRECTORY)) {
                    throw new IOException(currentPath + " exists but is not a directory");
                }
            } catch (IOException e) {
                // Directory doesn't exist, create it
                if (e.getMessage().contains("No such file")) {
                    sftpClient.mkdir(currentPath);
                } else {
                    throw e;
                }
            }
        }
    }

    @Override
    public void close() {
        try {
            if (sftpClient != null) {
                sftpClient.close();
            }
            if (ssh != null) {
                ssh.disconnect();
            }
        } catch (IOException e) {
            System.out.println("SSHJ: Error closing connection: " + e.getMessage());
        }
    }
}
