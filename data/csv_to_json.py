import pandas as pd
import argparse
import os


def convert_csv_to_json(csv_file_path):
    """Convert a CSV file to a JSON file."""
    # Load the CSV data into a DataFrame
    data = pd.read_csv(csv_file_path)

    # Convert the DataFrame to a JSON string
    json_str = data.to_json(orient="records", lines=True)

    # Determine the JSON file path
    base_name = os.path.basename(csv_file_path)
    name_without_extension = os.path.splitext(base_name)[0]
    json_file_path = os.path.join(
        os.path.dirname(csv_file_path), f"{name_without_extension}.json"
    )

    # Write the JSON string to a file
    with open(json_file_path, "w") as json_file:
        json_file.write(json_str)

    print(f"Data has been written to {json_file_path}")


def main():
    """Convert a CSV file to a JSON file."""
    parser = argparse.ArgumentParser(description="Convert a CSV file to a JSON file.")
    parser.add_argument("csv_file_path", help="The path of the CSV file to convert.")
    args = parser.parse_args()

    convert_csv_to_json(args.csv_file_path)


if __name__ == "__main__":
    main()
