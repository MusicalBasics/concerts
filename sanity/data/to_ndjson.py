import json
import jsonlines
import sys

def convert_to_ndjson(json_file, ndjson_file):
    with open(json_file, 'r') as jf:
        data = json.load(jf)
    
    with jsonlines.open(ndjson_file, mode='w') as writer:
        for item in data:
            writer.write(item)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python script.py <input-json-file> <output-ndjson-file>")
        sys.exit(1)
    
    json_file = sys.argv[1]
    ndjson_file = sys.argv[2]
    
    convert_to_ndjson(json_file, ndjson_file)
