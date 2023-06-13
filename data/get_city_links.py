import argparse
import json
from datetime import datetime
from operator import itemgetter

# Initialize parser
parser = argparse.ArgumentParser()

# Adding optional argument
parser.add_argument("-f", "--file", default="cities.json", help="Input JSON file with city data")

# Read arguments from command line
args = parser.parse_args()

# Read data from the input file
with open(args.file) as f:
    data = json.load(f)

# Create a dictionary where the keys are the time frames and the values are lists of cities
timeframe_cities = {}
for city in data:
    timeframe = city['startDate'] + ' - ' + city['endDate']
    if timeframe not in timeframe_cities:
        timeframe_cities[timeframe] = []

    timeframe_cities[timeframe].append({
        'name': city['name'],
        'link': "/cities/" + str(city['id'])
    })

# Convert dictionary to a list of dictionaries
list_timeframe_cities = [{'dateRange': k, 'cities': v} for k, v in timeframe_cities.items()]

# Sort list of dictionaries by date range
sorted_list_timeframe_cities = sorted(list_timeframe_cities, key=lambda x: datetime.strptime(x['dateRange'].split(' - ')[0], '%b %Y'))

# Write sorted list of dictionaries to a file
with open('city_links.json', 'w') as f:
    json.dump(sorted_list_timeframe_cities, f)
