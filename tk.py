from __future__ import print_function
import pickle
import os.path
from googleapiclient.discovery import build
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
# If modifying these scopes, delete the file token.pickle
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
pkl_path = 'token.pickle'
credentials_path = 'credentials.json'
def get_creds():
    creds = None
    if os.path.exists(pkl_path):
        with open(pkl_path, 'rb') as token:
            creds = pickle.load(token)
    if creds:
        if creds.scopes == SCOPES:
            if creds.valid:
                return creds
            elif creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                creds = None
        else:
            creds = None
    if creds is None:
        flow = InstalledAppFlow.from_client_secrets_file(credentials_path, SCOPES)
        creds = flow.run_local_server(port=0)
    with open(pkl_path, 'wb') as token:
        pickle.dump(creds, token)
    return creds

def get_data(service, spreadsheet_id):
    data_pkl = 'data.pkl'
    if os.path.exists(data_pkl):
        with open(data_pkl, 'rb') as fh:
            data = pickle.load(fh)
            print('loaded data', len(data))
            return data

    result = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
    sheets = [i['properties']['title'] for i in result['sheets']]
    data = {}
    print(len(sheets))
    for sheet in sheets:
        print(sheet)
        sheet_result = service.spreadsheets().values().get(spreadsheetId=spreadsheet_id, range=sheet).execute()
        data[sheet] = sheet_result['values']
    with open(data_pkl, 'wb') as fh:
        pickle.dump(data, fh)
    return data

def parse_data(name, d):
    return {'properties': {'title': name}, 'data': {'rowData':
        [{'values': [{'userEnteredValue': {"stringValue": i}} for i in row]} for row in d]
    }}

def main():
    creds = get_creds()
    service = build('sheets', 'v4', credentials=creds)
    spreadsheet_id = '11ETDnPJuku2ref3PzODMpZ4y7e5_wfILR2aPv83WpSw'
    raw_data = get_data(service, spreadsheet_id)
    data = [parse_data(name, raw_data[name]) for name in sorted(raw_data)]
    body = {
        'properties': {
            'title': spreadsheet_id
        },
        'sheets': data
    }
    spreadsheet = service.spreadsheets() \
        .create(body=body, fields='spreadsheetId') \
        .execute()
    id = spreadsheet['spreadsheetId']
    print('Spreadsheet ID: {0}'.format(id))
    print('url: https://docs.google.com/spreadsheets/d/%s' % id)

if __name__ == '__main__':
    main()