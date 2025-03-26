package com.cs301g2t1.log.repository;

import com.cs301g2t1.log.model.LogEntry;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class LogRepositoryImpl implements LogRepository {

    private static final String JDBC_URL = System.getenv("JDBC_URL");
    private static final String JDBC_USER = System.getenv("JDBC_USER");
    private static final String JDBC_PASSWORD = System.getenv("JDBC_PASSWORD");

    private static LogRepositoryImpl instance;

    private LogRepositoryImpl() {}

    public static synchronized LogRepositoryImpl getInstance() {
        if (instance == null) {
            instance = new LogRepositoryImpl();
        }
        return instance;
    }

    @Override
    public List<LogEntry> findAll() {
        List<LogEntry> logs = new ArrayList<>();
        try (Connection connection = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery("SELECT * FROM logs")) {

            while (resultSet.next()) {
                LogEntry log = mapRowToLogEntry(resultSet);
                logs.add(log);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to fetch logs", e);
        }
        return logs;
    }

    @Override
    public Optional<LogEntry> findById(Long id) {
        try (Connection connection = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
             PreparedStatement statement = connection.prepareStatement("SELECT * FROM logs WHERE id = ?")) {

            statement.setLong(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                if (resultSet.next()) {
                    return Optional.of(mapRowToLogEntry(resultSet));
                } else {
                    return Optional.empty();
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to fetch log", e);
        }
    }

    @Override
    public LogEntry save(LogEntry logEntry) {
        if (logEntry.getId() == null) {
            return insertLogEntry(logEntry);
        } else {
            return updateLogEntry(logEntry);
        }
    }

    private LogEntry insertLogEntry(LogEntry logEntry) {
        try (Connection connection = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
             PreparedStatement statement = connection.prepareStatement(
                     "INSERT INTO logs (operation, attribute_name, before_value, after_value, agent_id, client_id, date_time) VALUES (?, ?, ?, ?, ?, ?, ?)",
                     Statement.RETURN_GENERATED_KEYS)) {

            statement.setString(1, logEntry.getOperation());
            statement.setString(2, logEntry.getAttributeName());
            statement.setString(3, logEntry.getBeforeValue());
            statement.setString(4, logEntry.getAfterValue());
            statement.setLong(5, logEntry.getAgentId());
            statement.setLong(6, logEntry.getClientId());
            statement.setTimestamp(7, Timestamp.valueOf(logEntry.getDateTime()));
            statement.executeUpdate();

            try (ResultSet generatedKeys = statement.getGeneratedKeys()) {
                if (generatedKeys.next()) {
                    logEntry.setId(generatedKeys.getLong(1));
                } else {
                    throw new SQLException("Creating log entry failed, no ID obtained.");
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to create log entry", e);
        }
        return logEntry;
    }

    private LogEntry updateLogEntry(LogEntry logEntry) {
        try (Connection connection = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
             PreparedStatement statement = connection.prepareStatement(
                     "UPDATE logs SET operation = ?, attribute_name = ?, before_value = ?, after_value = ?, agent_id = ?, client_id = ?, date_time = ? WHERE id = ?")) {

            statement.setString(1, logEntry.getOperation());
            statement.setString(2, logEntry.getAttributeName());
            statement.setString(3, logEntry.getBeforeValue());
            statement.setString(4, logEntry.getAfterValue());
            statement.setLong(5, logEntry.getAgentId());
            statement.setLong(6, logEntry.getClientId());
            statement.setTimestamp(7, Timestamp.valueOf(logEntry.getDateTime()));
            statement.setLong(8, logEntry.getId());
            int rowsAffected = statement.executeUpdate();

            if (rowsAffected == 0) {
                throw new IllegalArgumentException("Log entry not found with ID: " + logEntry.getId());
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to update log entry", e);
        }
        return logEntry;
    }

    @Override
    public void deleteById(Long id) {
        try (Connection connection = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
             PreparedStatement statement = connection.prepareStatement("DELETE FROM logs WHERE id = ?")) {

            statement.setLong(1, id);
            int rowsAffected = statement.executeUpdate();

            if (rowsAffected == 0) {
                throw new IllegalArgumentException("Log entry not found with ID: " + id);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to delete log entry", e);
        }
    }

    @Override
    public boolean existsById(Long id) {
        try (Connection connection = DriverManager.getConnection(JDBC_URL, JDBC_USER, JDBC_PASSWORD);
             PreparedStatement statement = connection.prepareStatement("SELECT 1 FROM logs WHERE id = ?")) {

            statement.setLong(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next();
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to check if log entry exists", e);
        }
    }

    private LogEntry mapRowToLogEntry(ResultSet resultSet) throws SQLException {
        LogEntry logEntry = new LogEntry();
        logEntry.setId(resultSet.getLong("id"));
        logEntry.setOperation(resultSet.getString("operation"));
        logEntry.setAttributeName(resultSet.getString("attribute_name"));
        logEntry.setBeforeValue(resultSet.getString("before_value"));
        logEntry.setAfterValue(resultSet.getString("after_value"));
        logEntry.setAgentId(resultSet.getLong("agent_id"));
        logEntry.setClientId(resultSet.getLong("client_id"));
        logEntry.setDateTime(resultSet.getTimestamp("date_time").toLocalDateTime());
        return logEntry;
    }
}