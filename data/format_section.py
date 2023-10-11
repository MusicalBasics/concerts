import json
import argparse

def transform_section(section_data):
    transformed_rows = []

    for idx, row in enumerate(section_data['rows']):
        row_id = section_data['rowIdentifiers'][idx]
        transformed_row = {
            'id': row_id,
            'seats': row
        }
        transformed_rows.append(transformed_row)

    transformed_section = {
        'sectionName': section_data['sectionName'],
        'rows': transformed_rows
    }
    
    return transformed_section

def main(input_file, output_file):
    # Read the input file
    with open(input_file, 'r') as f:
        section_data = json.load(f)

    # Transform the section data
    transformed_section = transform_section(section_data)
    
    # Write the transformed data to the output file
    with open(output_file, 'w') as f:
        json.dump(transformed_section, f, indent=2)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Transforms section data to the desired format.')
    parser.add_argument('input_file', help='The path of the input JSON file containing the section data.')
    parser.add_argument('output_file', help='The path where the transformed JSON data should be saved.')
    
    args = parser.parse_args()
    
    main(args.input_file, args.output_file)
