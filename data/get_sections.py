import pandas as pd
import json
import sys
import os

def process_csv_to_json(filename):
    # Load the CSV file
    data = pd.read_csv(filename)
    
    # Sort the data by ROW and SEAT NUMBER
    data.sort_values(by=['ROW', 'SEAT NUMBER'], inplace=True)
    
    # Get the unique rows and initialize the JSON output
    unique_rows = data['ROW'].unique()
    section_name = os.path.basename(filename).split('.')[0]  # Extract sectionName from filename
    output = {
        "sectionName": section_name,
        "rows": [[] for _ in range(len(unique_rows))],
        "rowIdentifiers": list(unique_rows)
    }
    
    # Populate the rows in the output
    for index, row in data.iterrows():
        row_index = list(unique_rows).index(row['ROW'])
        seat = {
            "number": str(row['SEAT NUMBER']),
            "isReserved": False,  # Assuming all seats are not reserved initially
            "isReservable": True   # Assuming all seats are reservable initially
        }
        output['rows'][row_index].append(seat)
    
    return output

def main():
    if len(sys.argv) != 2:
        print("Usage: python script.py <input-file.csv>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    json_output = process_csv_to_json(input_file)
    
    # Construct output filename and save to JSON
    output_file = f'{os.path.splitext(input_file)[0]}.json'
    with open(output_file, 'w') as f:
        json.dump(json_output, f, indent=2)
        print(f'Data saved to {output_file}')

if __name__ == "__main__":
    main()
