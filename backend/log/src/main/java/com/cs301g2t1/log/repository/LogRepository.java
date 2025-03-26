package com.cs301g2t1.log.repository;

import com.cs301g2t1.log.model.LogEntry;
import java.util.List;
import java.util.Optional;

public interface LogRepository {
    List<LogEntry> findAll();
    Optional<LogEntry> findById(Long id);
    LogEntry save(LogEntry logEntry);
    void deleteById(Long id);
    boolean existsById(Long id);
}