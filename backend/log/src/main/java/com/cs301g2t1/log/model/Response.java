package com.cs301g2t1.log.model;

public class Response {
    private boolean result;
    private String errorMessage;
    private LogEntry data;

    public Response() {
    }

    public Response(boolean result, String errorMessage, LogEntry data) {
        this.result = result;
        this.errorMessage = errorMessage;
        this.data = data;
    }

    public boolean isResult() {
        return result;
    }

    public void setResult(boolean result) {
        this.result = result;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public LogEntry getData() {
        return data;
    }

    public void setData(LogEntry data) {
        this.data = data;
    }
}