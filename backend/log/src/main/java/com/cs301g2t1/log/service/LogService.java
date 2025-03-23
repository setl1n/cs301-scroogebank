package com.cs301g2t1.log.service;

import com.cs301g2t1.log.model.LogEntry;
import java.util.List;

public interface LogService {
    List<LogEntry> getAllLogs();
    LogEntry getLogById(Long id);
    LogEntry createLog(LogEntry logEntry);
    LogEntry updateLog(Long id, LogEntry logEntry);
    void deleteLog(Long id);
}