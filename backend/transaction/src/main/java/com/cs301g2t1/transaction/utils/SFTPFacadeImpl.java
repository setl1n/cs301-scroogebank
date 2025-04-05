package com.cs301g2t1.transaction.utils;

import org.apache.sshd.client.SshClient;
import org.apache.sshd.client.session.ClientSession;
import org.apache.sshd.sftp.client.SftpClient;
import org.apache.sshd.sftp.client.SftpClientFactory;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.logging.Logger;

// Implementation utilizing Apache MINA SSHD for SFTP operations
public class SFTPFacadeImpl implements SFTPFacade {
    private SshClient sshClient;
    private ClientSession session;
    private SftpClient sftpClient;
    private static final Logger logger = Logger.getLogger(SFTPFacadeImpl.class.getName());

    public void connect() throws Exception {
        String host = System.getenv("SFTP_HOST");
        String user = System.getenv("SFTP_USER");
        String pass = System.getenv("SFTP_PASS");
        String portStr = System.getenv("SFTP_PORT");

        if (host == null || user == null || pass == null || portStr == null) {
            throw new IllegalArgumentException("SFTP connection details are not properly set in environment variables.");
        }

        int port;
        try {
            port = Integer.parseInt(portStr);
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("SFTP_PORT must be a valid integer.", e);
        }

        sshClient = SshClient.setUpDefaultClient();
        sshClient.start();

        session = sshClient.connect(user, host, port).verify().getSession();
        session.addPasswordIdentity(pass);
        session.auth().verify();

        sftpClient = SftpClientFactory.instance().createSftpClient(session);
    }

    public List<String> listFiles(String directory, String filePattern) throws Exception {
        List<String> fileNames = new ArrayList<>();
        SftpClient.Handle handle = sftpClient.open(directory, SftpClient.OpenMode.Read);
        Iterable<SftpClient.DirEntry> entries = sftpClient.listDir(handle);

        // Convert wildcard pattern to regex
        String regex = filePattern.replace(".", "\\.").replace("*", ".*");
        Pattern pattern = Pattern.compile(regex);

        for (SftpClient.DirEntry entry : entries) {
            if (pattern.matcher(entry.getFilename()).matches()) {
                fileNames.add(entry.getFilename());
            }
        }
        return fileNames;
    }

    public InputStream downloadFile(String filePath) throws Exception {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        SftpClient.Handle handle = null;
        try {
            handle = sftpClient.open(filePath, SftpClient.OpenMode.Read);
            byte[] buffer = new byte[8192];
            long offset = 0;
            int bytesRead;
            while ((bytesRead = sftpClient.read(handle, offset, buffer)) > 0) {
                outputStream.write(buffer, 0, bytesRead);
                offset += bytesRead;
            }
            return new ByteArrayInputStream(outputStream.toByteArray());
        } finally {
            if (handle != null) {
                sftpClient.close(handle);
            }
            outputStream.close(); // Explicitly close the ByteArrayOutputStream
        }
    }

    public void moveFile(String sourcePath, String destinationPath) throws Exception {
        sftpClient.rename(sourcePath, destinationPath);
    }

    @Override
    public void close() {
        try {
            if (sftpClient != null) {
                sftpClient.close();
            }
            if (session != null) {
                session.close();
            }
            if (sshClient != null) {
                sshClient.stop();
            }
        } catch (Exception e) {
            logger.severe("Error while closing SSH resources: " + e.getMessage());
        }
    }
}
