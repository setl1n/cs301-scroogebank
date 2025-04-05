package com.cs301g2t1.transaction.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.cs301g2t1.transaction.model.Transaction;
import com.cs301g2t1.transaction.model.TransactionStatus;
import com.cs301g2t1.transaction.model.TransactionType;

public class TransactionUtils {
    public static List<Transaction> parseCsvToTransactions(InputStream inputStream) throws IOException {
        List<Transaction> transactions = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            String line;

            // Skip the header row
            if ((line = reader.readLine()) == null) {
                throw new IOException("CSV file is empty or missing a header row.");
            }

            while ((line = reader.readLine()) != null) {
                String[] fields = line.split(",");
                // clientId | transactionType | amount | date | status
                Transaction transaction = new Transaction();
                transaction.setClientId(Long.parseLong(fields[0]));
                transaction.setTransactionType(TransactionType.valueOf(fields[1].toUpperCase()));
                transaction.setAmount(Double.parseDouble(fields[2]));
                transaction.setDate(LocalDate.parse(fields[3]));
                transaction.setStatus(TransactionStatus.valueOf(fields[4].toUpperCase()));
                transactions.add(transaction);
            }
        }
        return transactions;
    }
}
