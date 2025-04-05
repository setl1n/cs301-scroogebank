package com.cs301g2t1.transaction.utils;

import java.util.List;
import java.io.InputStream;

public interface SFTPFacade extends AutoCloseable {
    // Establish connection to the SFTP server
    void connect() throws Exception;

    // List files in the specified directory matching the given pattern
    List<String> listFiles(String directory, String filePattern) throws Exception;
    
    // Download files from specified filepath as an InputStream
    InputStream downloadFile(String filePath) throws Exception;

    // Move files from source to destination path on the SFTP server
    void moveFile(String sourcePath, String destinationPath) throws Exception;

    // Close the SFTP connection
    void close() throws Exception;
}
