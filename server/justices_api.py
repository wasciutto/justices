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

        filtered_df = self.df[(self.df['date_service_start'] <= date) & (self.df['date_service_end'] >= date)]
        return filtered_df.to_json(orient="records")


app = Flask(__name__)
CORS(app)
data = JusticesData()
# filtered = data.get_justices_at_date("January 1, 1800")
# print(filtered)

@app.route("/get_justices_at_date")
def get_justices_at_date():
    app.logger.info(f"Processing date: {request.args.get('date')}")
    return data.get_justices_at_date(request.args.get('date'))