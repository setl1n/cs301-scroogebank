package com.cs301g2t1.user.model;

public class Response {
    private boolean result;
    private String errorMessage;
    private User data;

    public Response() {
    }

    public Response(boolean result, String errorMessage, User data) {
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

    public User getData() {
        return data;
    }

    public void setData(User data) {
        this.data = data;
    }
}