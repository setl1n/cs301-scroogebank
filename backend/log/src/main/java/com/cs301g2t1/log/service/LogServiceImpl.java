package com.cs301g2t1.log.service;

import com.cs301g2t1.log.model.LogEntry;
import com.cs301g2t1.log.repository.LogRepository;
import com.cs301g2t1.log.repository.LogRepositoryImpl;

import java.util.List;


public class LogServiceImpl implements LogService {

    private LogRepository logRepository = LogRepositoryImpl.getInstance();

    @Override
    public List<LogEntry> getAllLogs() {
        return logRepository.findAll();
    }

    @Override
    public LogEntry getLogById(Long id) {
        return logRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Log not found with ID: " + id));
    }

    @Override
    public LogEntry createLog(LogEntry logEntry) {
        return logRepository.save(logEntry);
    }

    @Override
    public LogEntry updateLog(Long id, LogEntry updatedLog) {
        LogEntry existingLog = logRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Log not found with ID: " + id));
        existingLog.setOperation(updatedLog.getOperation());
        existingLog.setAttributeName(updatedLog.getAttributeName());
        existingLog.setBeforeValue(updatedLog.getBeforeValue());
        existingLog.setAfterValue(updatedLog.getAfterValue());
        existingLog.setAgentId(updatedLog.getAgentId());
        existingLog.setClientId(updatedLog.getClientId());
        existingLog.setDateTime(updatedLog.getDateTime());
        return logRepository.save(existingLog);
    }

    @Override
    public void deleteLog(Long id) {
        if (!logRepository.existsById(id)) {
            throw new IllegalArgumentException("Log not found with ID: " + id);
        }
        logRepository.deleteById(id);
    }
}