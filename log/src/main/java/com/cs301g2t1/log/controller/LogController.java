package com.cs301g2t1.log.controller;

import com.cs301g2t1.log.model.LogEntry;
import com.cs301g2t1.log.service.LogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/logs")
@Validated
public class LogController {

    @Autowired
    private LogService logService;

    @GetMapping
    public ResponseEntity<List<LogEntry>> getAllLogs() {
        List<LogEntry> logs = logService.getAllLogs();
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LogEntry> getLogById(@PathVariable("id") Long id) {
        try {
            LogEntry log = logService.getLogById(id);
            return ResponseEntity.ok(log);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<LogEntry> createLog(@Valid @RequestBody LogEntry logEntry) {
        LogEntry createdLog = logService.createLog(logEntry);
        return new ResponseEntity<>(createdLog, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLog(@PathVariable("id") Long id,
                                       @Valid @RequestBody LogEntry logEntry) {
        try {
            LogEntry updated = logService.updateLog(id, logEntry);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLog(@PathVariable("id") Long id) {
        try {
            logService.deleteLog(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }
}