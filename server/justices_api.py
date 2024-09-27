from flask import Flask, request
from flask_cors import CORS
import pandas as pd

class JusticesData:
    SCHEMA = {
        'name': 'string',
        'state_appointed_from': 'string',
        'president_appointed_by': 'string',
        'date_service_start': 'string',
        'date_service_end' : 'string',
        'rank': 'string'
    }

    def __init__(self):
        self.df = pd.read_csv("justices.csv", dtype=self.SCHEMA)
        self.df['date_service_start'] = pd.to_datetime(self.df['date_service_start'], format='%B %d, %Y')
        self.df['date_service_end'] = pd.to_datetime(self.df['date_service_end'], format='%B %d, %Y')
    
    # Takes dates like 'January 1, 1800'
    def get_justices_at_date(self, date):
        date = pd.to_datetime(date)

        out_json = {}  # Initialize the output dictionary

        # Replace missing `date_service_end` with today's date
        today = pd.Timestamp('now')
        self.df.loc[self.df['date_service_end'].isna(), 'date_service_end'] = today
        
        # Filter justices serving on the given date
        filtered_df = self.df[(self.df['date_service_start'] <= date) & (self.df['date_service_end'] >= date)]

        # Slice out the chief justice
        chief_df = filtered_df[filtered_df['rank'] == 'chief']
        chief_dict = chief_df.iloc[0].to_dict() if not chief_df.empty else None
        
        # Set the rest as associate justices
        associates_df = filtered_df[filtered_df['rank'] != 'chief']
        # Add an id to the associates list
        associates_df.insert(1, 'id', associates_df.index)
        # Convert to dict
        associates_dict = associates_df.assign(rank='associate').to_dict(orient="records")
        
        
        # Assign to output dictionary
        out_json['chief'] = chief_dict
        out_json['associates'] = associates_dict
        
        return out_json


app = Flask(__name__)
CORS(app)
data = JusticesData()
# filtered = data.get_justices_at_date("September 1, 2024")
# print(filtered)
# Missing chief justice: July 6th, 1921

@app.route("/get_justices_at_date")
def get_justices_at_date():
    app.logger.info(f"Processing date: {request.args.get('date')}")
    return data.get_justices_at_date(request.args.get('date'))