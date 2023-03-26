# openmusic-api
[![Generic badge](https://img.shields.io/badge/npm-v14.16.1-blue.svg)](https://shields.io/) [![Generic badge](https://img.shields.io/badge/node-6.14.12-green.svg)](https://shields.io/)

OpenMusic is digital music service built with Hapi.js

## Table of contents
* [General info](#general-info)
* [Technologies](#technologies)
* [RESTful API Endpoints](#restful-api-endpoints)
* [Setup](#setup)

## General info
The OpenMusic API is a RESTful API that allows users to create and manage music playlists. Users can view their playlist activities and export playlists using RabbitMQ. The API provides filtering and implements authentication and authorization using JWT. Additionally, the API allows users to upload album images to local storage. This app uses Redis as a cache and Postgres as a database.
### Architecture Diagram of OpenMusic
![architecture-diagram](/src/assets/img/architecture-diagrams.png)

### Features
- [x] **CRUD Operations:** 

  The API supports basic CRUD (Create, Read, Update, Delete) operations for playlists, albums, and songs. Users can create and manage their playlists by adding or removing songs from them.
- [x] **Authentication and Authorization:** 

  This app implemented authentication and authorization mechanisms. Users need to provide their credentials to access the API, and only authorized users are allowed to perform certain actions, such as modifying or deleting playlists.
- [x] **Filtering:** 

  The API also supports filtering capabilities using endpoints. Users can filter songs by title or performer.
- [x] **Collaborators:** 
  
  Users who own a playlist can add collaborators to it. Collaborators can then add or remove songs from the playlist. This feature is useful for allowing multiple users to contribute to a single playlist.
- [x]  **Exporting Playlists:** 

  Users can export their playlists using RabbitMQ. This feature allows users to share their playlists with others. Please use [**OpenMusic Queue Consumer**](https://github.com/androsyahreza/openmusic-queue-consumer) as a consumer to get the exported playlist.
- [x] **Album Image Upload:** 

  The API uploads album images to local storage, so users can easily manage and display their album artwork.
- [x] **Redis Cache:** 

  The API uses Redis as a cache to improve performance. Redis caches frequently accessed data, reducing the need for the API to retrieve data from the PostgreSQL database.
- [x] **PostgreSQL Database:** 
  
  The OpenMusic API uses PostgreSQL as its primary data store. It stores data such as user information, song details, albums, and playlist information.
  
### ERD of OpenMusic
![erd](/src/assets/img/erd-openmusic.png)

The OpenMusic ERD consists of tables for Playlists, Songs, Albums, Users, Collaborations, and other junction tables.

## Technologies
Project is created with:
* node : 14.16.1
* hapi : 20.1.0
* pg : 8.10.0
* node-pg-migrate : 6.2.2
* redis : 4.6.5
* amqplib : 0.10.3

## RESTful API Endpoints
### API Endpoints
RESTful API Endpoints are shown in the table below:
### User Endpoint
| Method | Endpoint | Description |
| --- | --- | --- | 
| POST | `/users` | Register User | 
### Auth Endpoint
| Method | Endpoint | Description |
| --- | --- | --- | 
| POST | `/authentications` | Log in an existing user | 
| PUT | `/authentications` | Refresh an existing user's session token |
| DELETE | `/authentications` | Delete Refresh token |
### Album Endpoint
| Method | Endpoint | Description |
| --- | --- | --- | 
| POST | `/albums`| Add a new album |
| GET | `/albums/{id}`| View an album |
| PUT | `/albums/{id}`| Update an album |
| DELETE | `/albums/{id}`| Delete an album |
| POST | `/albums/{id}/likes`| Likes an album |
| GET | `/albums/{id}/likes`| View likes of the album |
### Song Endpoint
| Method | Endpoint | Description |
| --- | --- | --- | 
| POST | `/songs`| Add a new song |
| GET | `/songs`| View all songs |
| GET | `/songs/{id}`| View a song |
| PUT | `/songs/{id}`| Update a song |
| DELETE | `/songs/{id}`| Delete a song |
### Playlist Endpoint
| Method | Endpoint | Description |
| --- | --- | --- | 
| POST | `/playlists`| Add a new playlist |
| GET | `/playlists`| View a playlist |
| DELETE | `/playlists/{id}`| Delete a playlist |
| POST | `/playlists/{id}/songs`| Add song into playlist |
| GET | `/playlists/{id}/songs`| View song in playlist |
| DELETE | `/playlists/{id}/songs`| Delete song in playlist |
| GET | `/playlists/{id}/activities`| View playlist activities |
### Collaboration Endpoint
| Method | Endpoint | Description |
| --- | --- | --- | 
| POST | `/collaborations`| Add playlist collaborator |
| DELETE | `/collaborations`| Delete playlist collaborator |
### Export & Upload Endpoint
| Method | Endpoint | Description |
| --- | --- | --- | 
| POST | `/export/playlists/{playlistId}`| Export an playlist |
| POST | `/albums/{id}/covers`| Upload an album image |
| GET | `/upload/{param*}`| View an album image |


## Setup
To get started with the OpenMusic API, you'll need to have Node.js, Redis, and PostgreSQL installed on your machine. Once you've installed these dependencies, you can clone this repository and install the necessary packages using:
```
$ cd openmusic-api
$ npm install
```
Next, you'll need to migrate to the database by running the following command:
```
$ npm run migrate up
```
After setting up the database, you can start the server by running:
```
$ npm run start-dev
```
