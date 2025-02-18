package com.cs301g2t1.log.service;

import com.cs301g2t1.log.model.LogEntry;
import com.cs301g2t1.log.repository.LogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class LogServiceImpl implements LogService {

    @Autowired
    private LogRepository logRepository;

    @Override
    public List<LogEntry> getAllLogs() {
        return logRepository.findAll();
    }

    @Override
    public LogEntry getLogById(Long id) {
        return logRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Log not found with ID: " + id));
    }

    @Transactional
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