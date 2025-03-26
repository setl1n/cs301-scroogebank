package com.cs301g2t1.transaction.model;

public class Response {
    private boolean result;
    private String errorMessage;
    private Transaction data;

    public Response() {
    }

    public Response(boolean result, String errorMessage, Transaction data) {
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

    public Transaction getData() {
        return data;
    }

    public void setData(Transaction data) {
        this.data = data;
    }
}
