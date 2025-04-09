import pandas as pd
import random
from datetime import datetime, timedelta

# Number of mock records to generate
num_records = 100

# Generate mock data
ids = [i for i in range(1, num_records + 1)]  # Auto-generated Long IDs
client_ids = [random.randint(1, 50) for _ in range(num_records)]  # Random Long Client IDs
transaction_types = [random.choice(['D', 'W']) for _ in range(num_records)]  # Transaction types: Deposit (D) or Withdrawal (W)
amounts = [round(random.uniform(10, 1000), 2) for _ in range(num_records)]  # Random double amounts
dates = [(datetime.now() - timedelta(days=random.randint(0, 365))).strftime('%Y-%m-%d') for _ in range(num_records)]  # Random LocalDates within the past year
statuses = [random.choice(['Completed', 'Pending', 'Failed']) for _ in range(num_records)]  # Transaction statuses

# Create a DataFrame
data = {
    'Id': ids,
    'Client ID': client_ids,
    'Transaction': transaction_types,
    'Amount': amounts,
    'Date': dates,
    'Status': statuses
}
transactions_df = pd.DataFrame(data)

# Save the DataFrame to a CSV file
csv_filename = 'mock_transactions.csv'
transactions_df.to_csv(csv_filename, index=False)

print(f"CSV file '{csv_filename}' has been created.")
