# Berglokal Single Page Application

The application is based on a responsive template.
So one can use it on desktop and on mobile devices.

The users can search for huts in the alps by name.
A list of huts and the markers on the map get filtered accordingly.

The backend is hosted on Google Cloud Platform with Google App Engine.
Google Cloud Endpoints is used to load the list of huts - via an
AJAX call to the backend.

The map is loaded from Google Maps.

Another API is used for the videos of the huts.
Users can watch YouTube Videos, if the hut has a meaningful video on
YouTube.

When a user selects a certain hut, the view automatically zooms in to
the detail view.

All communication is secured with SSL.

You can view the deployed app on [Berglokal](https://berglokal.de)

Used APIs:

1. own backend app with Google Cloud Endpoints
2. Google Maps
3. YouTube Data API

## How to run the app locally for testing purposes

- Download the files to your local machine
- Run the app on http://localhost:63342/p6/index.html (otherwise your request to Google Maps is blocked)

