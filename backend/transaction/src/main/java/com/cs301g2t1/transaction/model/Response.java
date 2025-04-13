package com.cs301g2t1.transaction.model;

public class Response<T> {
    private boolean result;
    private String errorMessage;
    private T data;

    public Response() {
    }

    public Response(boolean result, String errorMessage, T data) {
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

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}
