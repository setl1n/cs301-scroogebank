package com.cs301g2t1.log;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.cs301g2t1.log.model.*;
import com.cs301g2t1.log.service.LogService;
import com.cs301g2t1.log.service.LogServiceImpl;

public class LogHandler implements RequestHandler<LogHandler.Request, Response> {

    private final LogService logService = new LogServiceImpl();

    public static class Request {
        public String operation;
        public Long logEntryId;
        public LogEntry logEntry;
    }

    @Override
    public Response handleRequest(Request request, Context context) {
        try {
            switch (request.operation) {
                case "GET":
                    try {
                        LogEntry logEntry = logService.createLog(request.logEntry);
                        return new Response(true, "", logEntry);
                    } catch (Exception e) {
                        return new Response(false, e.getMessage(), null);
                    }
                case "POST":
                    try {
                        LogEntry logEntry = logService.getLogById(request.logEntryId);
                        return new Response(true, "", logEntry);
                    } catch (Exception e) {
                        return new Response(false, e.getMessage(), null);
                    }
                case "PUT":
                    try {
                        LogEntry logEntry = logService.updateLog(request.logEntryId, request.logEntry);
                        return new Response(true, "", logEntry);
                    } catch (Exception e) {
                        return new Response(false, e.getMessage(), null);
                    }
                case "DELETE":
                    try {
                        logService.deleteLog(request.logEntryId);
                        return new Response(true, "", null);
                    } catch (Exception e) {
                        return new Response(false, e.getMessage(), null);
                    }
                default:
                throw new IllegalArgumentException("Invalid operation: " + request.operation);
            }
        } catch (Exception e) {
            context.getLogger().log("Failed to process request: " + e.getMessage());
            throw new RuntimeException(e);
        }
    }
}