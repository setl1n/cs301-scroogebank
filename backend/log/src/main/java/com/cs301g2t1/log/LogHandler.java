package com.cs301g2t1.log;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.SQSEvent;
import com.cs301g2t1.log.model.LogEntry;
import com.cs301g2t1.log.service.LogService;
import com.cs301g2t1.log.service.LogServiceImpl;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class LogHandler implements RequestHandler<SQSEvent, Void> {

    private static final Gson GSON = new GsonBuilder().create();
    private final LogService logService = new LogServiceImpl();

    public static class Request {
        private String operation;
        private Long logEntryId;
        private LogEntry logEntry;

        public String getOperation() {
            return operation;
        }
        public void setOperation(String operation) {
            this.operation = operation;
        }
        public Long getLogEntryId() {
            return logEntryId;
        }
        public void setLogEntryId(Long logEntryId) {
            this.logEntryId = logEntryId;
        }
        public LogEntry getLogEntry() {
            return logEntry;
        }
        public void setLogEntry(LogEntry logEntry) {
            this.logEntry = logEntry;
        }
    }

    public void dateTimeMapping(Request request) {
        if (request.getLogEntry().getDateTime() != null && !request.getLogEntry().getDateTime().toString().isEmpty()) {
            String dateTimeStr = request.getLogEntry().getDateTime().toString();
            request.getLogEntry().setDateTimeStr(dateTimeStr);
        }
        else {
            String currentTime = java.time.LocalDateTime.now().toString();
            request.getLogEntry().setDateTimeStr(currentTime);
        }
    }

    @Override
    public Void handleRequest(SQSEvent event, Context context) {
        context.getLogger().log("Received " + event.getRecords().size() + " messages");

        for (SQSEvent.SQSMessage message : event.getRecords()) {

            try {
                String body = message.getBody();
                context.getLogger().log("Raw message body: " + body);

                Request request = GSON.fromJson(message.getBody(), Request.class);    
                processRequest(request, context);

            } catch (Exception e) {
                context.getLogger().log("Error processing message: " + e.getMessage());
                e.printStackTrace();
            }
        }

        return null;
    }

    private void processRequest(Request request, Context context) {
        String op = request.getOperation();
        try {

            if ("GET".equalsIgnoreCase(op)) {
                LogEntry logEntry = logService.getLogById(request.getLogEntryId());
                context.getLogger().log("GET operation processed: " + logEntry);
            } 

            else if ("POST".equalsIgnoreCase(op)) {
                dateTimeMapping(request); // handle difference
                LogEntry logEntry = logService.createLog(request.getLogEntry());
                context.getLogger().log("POST operation processed: " + logEntry);
            } 

            else if ("PUT".equalsIgnoreCase(op)) {
                LogEntry logEntry = logService.updateLog(request.getLogEntryId(), request.getLogEntry());
                context.getLogger().log("PUT operation processed: " + logEntry);
            } 

            else if ("DELETE".equalsIgnoreCase(op)) {
                logService.deleteLog(request.getLogEntryId());
                context.getLogger().log("DELETE operation processed");
            } 
            else {
                throw new IllegalArgumentException("Invalid operation: " + op);
            }
            
        } catch (Exception e) {
            context.getLogger().log("Failed to process request: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }
}
