package com.cs301g2t1.transaction.repository;

import com.cs301g2t1.transaction.model.Transaction;
import com.cs301g2t1.transaction.model.TransactionStatus;
import com.cs301g2t1.transaction.model.TransactionType;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class TransactionRepositoryImpl implements TransactionRepository {

    private static final String JDBC_URL = System.getenv("JDBC_URL");
    private static final String JDBC_USER = System.getenv("JDBC_USER");
    private static final String JDBC_PASSWORD = System.getenv("JDBC_PASSWORD");

    private static TransactionRepositoryImpl instance;

    // Modified constructor to initialize the database table
    private TransactionRepositoryImpl() {
        initializeDatabase();
    }

    // Initialize database table
    private void initializeDatabase() {
        try {
            // Load the PostgreSQL driver
            Class.forName("org.postgresql.Driver");
            
            try (Connection connection = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD)) {
                String createTableSQL = "CREATE TABLE IF NOT EXISTS transactions ("
                    + "id SERIAL PRIMARY KEY, "
                    + "client_id BIGINT NOT NULL, "
                    + "transaction_type VARCHAR(50) NOT NULL, "
                    + "amount DECIMAL(15,2) NOT NULL, "
                    + "date DATE NOT NULL, "
                    + "status VARCHAR(50) NOT NULL"
                    + ")";
                    
                try (Statement statement = connection.createStatement()) {
                    statement.execute(createTableSQL);
                }
            }
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("Failed to load PostgreSQL driver", e);
        } catch (SQLException e) {
            throw new RuntimeException("Failed to initialize database: " + e.getMessage(), e);
        }
    }

    public static synchronized TransactionRepositoryImpl getInstance() {
        if (instance == null) {
            instance = new TransactionRepositoryImpl ();
        }
        return instance;
    }

    @Override
    public List<Transaction> findAll() {
        List<Transaction> transactions = new ArrayList<>();
        try (Connection connection = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery("SELECT * FROM transactions")) {

            while (resultSet.next()) {
                Transaction transaction = mapRowToTransaction(resultSet);
                transactions.add(transaction);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to fetch transactions", e);
        }
        return transactions;
    }

    @Override
    public Optional<Transaction> findById(Long id) {
        try (Connection connection = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
             PreparedStatement statement = connection.prepareStatement("SELECT * FROM transactions WHERE id = ?")) {

            statement.setLong(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return Optional.of(mapRowToTransaction(resultSet));
                } else {
                    return Optional.empty();
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to fetch transaction", e);
        }
    }

    @Override
    public Transaction save(Transaction transaction) {
        if (transaction.getId() == null) {
            return insertTransaction(transaction);
        } else {
            if (existsById(transaction.getId())) {
                return updateTransaction(transaction);
            } else {
                return insertTransaction(transaction);
            }
        }
    }

    private Transaction insertTransaction(Transaction transaction) {
        try (Connection connection = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
             PreparedStatement statement = connection.prepareStatement(
                     "INSERT INTO transactions (client_id, transaction_type, amount, date, status) VALUES (?, ?, ?, ?, ?)",
                     Statement.RETURN_GENERATED_KEYS)) {

            statement.setLong(1, transaction.getClientId());
            statement.setString(2, transaction.getTransactionType().toString());
            statement.setDouble(3, transaction.getAmount());
            statement.setDate(4, Date.valueOf(transaction.getDate()));
            statement.setString(5, transaction.getStatus().toString());
            statement.executeUpdate();

            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    transaction.setId(generatedKeys.getLong(1));
                } else {
                    throw new SQLException("Creating transaction failed, no ID obtained.");
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to create transaction", e);
        }
        return transaction;
    }

    private Transaction updateTransaction(Transaction transaction) {
        try (Connection connection = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
             PreparedStatement statement = connection.prepareStatement(
                     "UPDATE transactions SET client_id = ?, transaction_type = ?, amount = ?, date = ?, status = ? WHERE id = ?")) {

            statement.setLong(1, transaction.getClientId());
            statement.setString(2, transaction.getTransactionType().toString());
            statement.setDouble(3, transaction.getAmount());
            statement.setDate(4, Date.valueOf(transaction.getDate()));
            statement.setString(5, transaction.getStatus().toString());
            statement.setLong(6, transaction.getId());
            int rowsAffected = statement.executeUpdate();

            if (rowsAffected == 0) {
                throw new IllegalArgumentException("Transaction not found with ID: " + transaction.getId());
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to update transaction", e);
        }
        return transaction;
    }

    @Override
    public void deleteById(Long id) {
        try (Connection connection = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
             PreparedStatement statement = connection.prepareStatement("DELETE FROM transactions WHERE id = ?")) {

            statement.setLong(1, id);
            int rowsAffected = statement.executeUpdate();

            if (rowsAffected == 0) {
                throw new IllegalArgumentException("Transaction not found with ID: " + id);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to delete transaction", e);
        }
    }

    @Override
    public boolean existsById(Long id) {
        try (Connection connection = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
             PreparedStatement statement = connection.prepareStatement("SELECT 1 FROM transactions WHERE id = ?")) {

            statement.setLong(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next();
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to check if transaction exists", e);
        }
    }

    @Override
    public List<Transaction> findAllByClientId(Long clientId) {
        List<Transaction> transactions = new ArrayList<>();
        try (Connection connection = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
             PreparedStatement statement = connection.prepareStatement("SELECT * FROM transactions WHERE client_id = ?")) {

            statement.setLong(1, clientId);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    Transaction transaction = mapRowToTransaction(resultSet);
                    transactions.add(transaction);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to fetch transactions for client", e);
        }
        return transactions;
    }

    private Transaction mapRowToTransaction(ResultSet resultSet) throws SQLException {
        Transaction transaction = new Transaction();
        transaction.setId(resultSet.getLong("id"));
        transaction.setClientId(resultSet.getLong("client_id"));
        transaction.setTransactionType(TransactionType.valueOf(resultSet.getString("transaction_type")));
        transaction.setAmount(resultSet.getDouble("amount"));
        transaction.setDate(resultSet.getDate("date").toLocalDate());
        transaction.setStatus(TransactionStatus.valueOf(resultSet.getString("status")));
        return transaction;
    }
}