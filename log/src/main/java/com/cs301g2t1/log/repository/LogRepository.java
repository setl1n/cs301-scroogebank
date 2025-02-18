package com.cs301g2t1.log.repository;

import com.cs301g2t1.log.model.LogEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LogRepository extends JpaRepository<LogEntry, Long> {
}