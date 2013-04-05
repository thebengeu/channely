# Channely API endpoint documentation
### So you know, we don't drive you insane.

This should be updated every time you change an endpoint.

# Auth
We're using a variant of X-Auth. Essentially, client sends over HTTPS:

HTTP Headers:

- ClientID
- Client Secret

and with basic HTML auth:

- Username 
- Password

(Both the client ID and client secret are to be hardcoded into the app. They indicate the client, after all)

```
POST /oauth/token
```

__Returns:__

```
HTTP STATUS 200
{ 
access_token: xxxx,
username: elijames,
userId: 51557cb1af60b225e5000001
}
```

Take and store the access_token - this would be required for access to all protected API endpoints. 

Hitting this API endpoint generates and stores a new access_token everytime.

__Failures__:

- If the clientSecret is wrong, the app will return a __403__ error.
- If the username or password in HTTP Basic Auth fails, the app will return a __401__ error. 

# Client
__This is NOT an official endpoint.__ Essentially the following endpoints are created to allow us to quickly perform CRUD on clients without mucking around the DB:

    POST /clients //- creates a new client
    GET /clients //- list all clientIDs and their clientSecrets
    DELETE /clients/:id //- deletes client with :id

These endpoints __should be deleted or disabled__ when in production.

_Note: clients are basically API consumer devices. So our iPad app should have a clientID + clientSecret, and a theoretical Android app would have a different pair._

# User
The user endpoints are for __getting__, __creating__ and __updating__ a user.

## Create User

    POST /users

with params:

- username: your_username
- password: a_password

__Returns:__

```
HTTP STATUS 201
{
  "_id" : "5157c1b51b24cb0a07000002",
  "__v" : 0,
  "username" : "bengish"
}
```

## Show User

    GET /users/:id

__Returns:__

```
HTTP STATUS 200
{
  "_id" : "5157c1b51b24cb0a07000002",
  "__v" : 0,
  "username" : "bengish"
}
```

## Update User
Updating a user requires an access token. Users are only allowed to edit their own accounts.

    PUT /users/:id?access_token=xxxx
    
with the optional params: 

- username: new_username
- password: new_password

(both are optional - if you only want to change the username, just provide the username parameter in the body, and leave out password):

__Returns__:

```
HTTP STATUS 201
{
  "_id" : "5157c1b51b24cb0a07000002",
  "__v" : 0,
  "username" : "bengish"
}
```

__Failures__:

- If user attempts to edit the account of another user, the app returns a __403__ error.

# Channel
The channel endpoints are for __creating__, __editing__, __getting__ and __deleting__ channels. The create, delete and update endpoints are protected.

## List All Channels

    GET /channels
    
__Results__:

```
HTTP STATUS 200
[
  {
    "owner" : "515409c602df6886b8000001",
    "_id" : "5156a1148dd1f00000000001",
    "__v" : 0,
    "createdAt" : "2013-03-31T06:43:44.654Z",
    "name" : "Friday Hacks"
  },
  {
    "owner" : "515409c602df6886b8000001",
    "_id" : "5156a1168dd1f00000000002",
    "__v" : 0,
    "createdAt" : "2013-03-31T06:43:44.655Z",
    "name" : "Melock"
  },
  {
    "owner" : "515409c602df6886b8000001",
    "_id" : "5156a8f8cbaaa50000000001",
    "__v" : 0,
    "createdAt" : "2013-03-31T06:43:44.655Z",
    "name" : "Noncey"
  }
]
```

## Create Channel
The create channel endpoint is protected, and requires an access_token. 

    POST /channels?access_token=xxxx
    
with parameters:

- name: a_unique_channel_name
    
__Results:__

```
HTTP STATUS 201
{
  "owner" : "515409c602df6886b8000001",
  "_id" : "5157db98b59e30870a000001",
  "__v" : 0,
  "name" : "SuperTest"
}
```

__Failure:__

If the provided channel name is not available, the API returns:

TODO: FIX THIS AND FILL IT IN LATER

## Update Channel
The update channel endpoint is protected, and requires an access_token. 

    PUT /channels/:id?access_token=xxxx
   
__Results__:

```
HTTP STATUS 200
{
  "_id" : "5157dfafdddf9f550d000001",
  "owner" : "515409c602df6886b8000001",
  "__v" : 0,
  "createdAt" : "2013-03-31T07:05:14.855Z",
  "name" : "Blah"
}
```

__Failure__:

- If a user attempts to edit a channel that he/she doesn't own, the API will return a __403__ unauthorized error.

## Delete Channel
The delete channel endpoint is protected, and requires an access_token.

    DELETE /channels/:id?access_token=xxx

__Results__:

    HTTP STATUS 204
    
# Events
The events endpoints are for __creating__, __getting__, __deleting__ and __searching__ for events. The create and delete endpoints are protected.

## List Events for a Particular Channel

    GET /channels/:id/events

__Results:__

```
HTTP STATUS 200
[
  {
    "_id" : "5157e36d9a08979a0d000001",
    "location" : [
      16.80569,
      51.05693
    ],
    "__v" : 0,
    "startDateTime" : "2013-03-15T06:54:47.636Z",
    "_channel" : "5157dfafdddf9f550d000001",
    "endDateTime" : "2013-03-15T06:54:47.636Z",
    "name" : "Friday Hacks #13"
  },
  {
    "_id" : "5157e46e9a08979a0d000002",
    "location" : [
      16.80569,
      51.05693
    ],
    "__v" : 0,
    "startDateTime" : "2013-03-16T04:54:47.636Z",
    "_channel" : "5157dfafdddf9f550d000001",
    "endDateTime" : "2013-03-16T06:54:47.636Z",
    "name" : "Friday Hacks #14"
  },
  {
    "_id" : "5157e4f19a08979a0d000003",
    "location" : [
      16.80569,
      51.05693
    ],
    "__v" : 0,
    "startDateTime" : "2013-03-17T06:54:47.636Z",
    "_channel" : "5157dfafdddf9f550d000001",
    "endDateTime" : "2013-03-17T04:54:47.636Z",
    "name" : "Friday Hacks #15"
  }
]
```

## Create Event
The create event endpoint is protected and requires an access_token.

    POST /events?access_token=xxxx

with body params (example below):

- name: 'Friday Hacks #17'
- channelId: 5157dfafdddf9f550d000001
- longitude: 16.80569
- latitude: 51.05693
- startDateTime: 2013-03-15T04:54:47.636Z
- endDateTime: 2013-03-15T06:54:47.636Z

__Results:__

```
HTTP STATUS 201
{
  "_id" : "5157e36d9a08979a0d000001",
  "location" : [
    16.80569,
    51.05693
  ],
  "__v" : 0,
  "startDateTime" : "2013-03-15T04:54:47.636Z",
  "_channel" : "5157dfafdddf9f550d000001",
  "endDateTime" : "2013-03-15T06:54:47.636Z",
  "name" : "Friday Hacks #13"
}
```

__Failures:__

- The API will return a __422__ error code if `endDateTime` is before `startDateTime`.

## Delete Event

    DELETE /events/:id?access_token=xxx

__Results:__

    HTTP STATUS 204
    
__Failures:__

- If a user tries to delete a channel he doesn't own, the API returns a __403__ error.

## Search Events
    
    GET /events/search
    
with query params:

- latitude: latitude of point
- longitude: longitude of point
- maxDistance: optional maximum distance in metres to search for events around point

__Example:__

    GET /events/search?latitude=1.342797&longitude=103.953536&maxDistance=1000
    
__Results:__

```
HTTP STATUS 200
[
  {
    "name": "Friday Hacks #13",
    "startDateTime": "2013-03-28T11:30:39.175Z",
    "endDateTime": "2013-03-28T12:30:39.175Z",
    "details": "Many many details",
    "_channel": {
      "name": "NUS Hackers",
      "description": "",
      "_id": "d35d493382d09ab2a7070325"
    },
    "_id": "51558baa0b8c492036000002",
    "__v": 0,
    "longitude": 103.953536,
    "latitude": 1.342797
  },
  {
    "name": "Friday Hacks #14",
    "startDateTime": "2013-03-28T11:30:39.175Z",
    "endDateTime": "2013-03-28T12:30:39.175Z",
    "details": "Many many details",
    "_channel": {
      "name": "NUS Hackers",
      "description": "",
      "_id": "d35d493382d09ab2a7070325"
    },
    "_id": "51558b390b8c492036000001",
    "__v": 0,
    "longitude": 103.953538,
    "latitude": 1.342795
  }
]
```

# Posts
There are 3 kinds of posts: text, image and video. Each of these post types exist under their own domain.

## Get all posts for a channel

This endpoint returns all posts (regardless of type) for a particular channel.

    GET /channel/:id/posts

__Results__:

```
[
  {
    "owner" : "515409c602df6886b8000001",
    "content" : "Hello there! Is all well?",
    "_id" : "5157ef13773cc2ca0f000002",
    "__v" : 0,
    "time" : "2013-03-31T08:08:51.738Z",
    "_channel" : "5156a1168dd1f00000000002"
  },
  {
    "_id" : "5157ef4f773cc2ca0f000003",
    "content" : "I hate this sepaker!",
    "time" : "2013-03-31T08:09:51.778Z",
    "__v" : 0,
    "_channel" : "5156a1168dd1f00000000002",
    "username" : "anon"
  }
]
```

## Get all text posts for a channel
This endpoint returns only the text posts for a particular channel.

    GET /channel/:id/posts/text
    
__Results:__

```
[
  {
    "owner" : "515409c602df6886b8000001",
    "content" : "Hello there! Is all well?",
    "_id" : "5157ef13773cc2ca0f000002",
    "__v" : 0,
    "time" : "2013-03-31T08:08:51.738Z",
    "_channel" : "5156a1168dd1f00000000002"
  },
  {
    "_id" : "5157ef4f773cc2ca0f000003",
    "content" : "I hate this sepaker!",
    "time" : "2013-03-31T08:09:51.778Z",
    "__v" : 0,
    "_channel" : "5156a1168dd1f00000000002",
    "username" : "anon"
  }
]
```

## Create text post
This endpoint is 'somewhat' protected. 

If a user would like to associate his post with his user account, pass an `access_token` while making the request. Otherwise, the user __must__ provide a `username` in the request's body.

If both `username` and `access_token` are provided, the access token is given precedence and the post is associated with the user's account.

Therefore, you can make the following request both with and without the access token:

    POST /channels/:id/posts/text
    
and
    
    POST /channels/:id/posts/text?access_token=xxxx

With body parameters:

- content: "A full text post commenting on the event or wtv!"
- username: "An anon username" (optional)

__Results:__

If an access_token is given:

```
HTTP STATUS 201
{
  "owner" : "515409c602df6886b8000001",
  "content" : "Hello there! Is everyone here happy?",
  "_id" : "5157ef13773cc2ca0f000002",
  "__v" : 0,
  "time" : "2013-03-31T08:08:51.738Z",
  "_channel" : "5156a1168dd1f00000000002"
}
```

If only a username is given:

```
HTTP STATUS 201
{
  "_id" : "5157ef4f773cc2ca0f000003",
  "content" : "Hello there! Is everyone here happy?",
  "time" : "2013-03-31T08:09:51.778Z",
  "__v" : 0,
  "_channel" : "5156a1168dd1f00000000002",
  "username" : "anon"
}
```

__Failures:__

- if neither a username or an access_token is provided, API returns __400__ Bad Request error.

## Delete Text Posts
This endpoint is protected. 

A user is only able to delete a text post IF the post is associated with his user account. This means nobody can delete an anon post.

    DELETE /posts/text/:id

__Results:__

    HTTP STATUS 204
    
__Failures:__

- If a user attempts to delete a post that is not associated with his account, or is not associated with any user account (is anonymous) the API will return a __403__ error.

# HTTP Live Streaming
The HLS endpoints are for creating and stopping video recordings, and uploading video chunks. The HLS playlist associated with the video will be regenerated every time any of the endpoints is called.

## Create Video Recording
	
	POST /hls/recordings
	
with body params (example below):

- startDate: 2013-03-15T04:54:47.636Z

__Results:__

```
HTTP STATUS 201
{
  "_id" : "515e65b7ce4ec1642d000002",
  "__v" : 0,
  "startDate" : "2013-03-15T04:54:47.636Z",
  "playlistURL" : "http://upthetreehouse.com/hls/515e65b7ce4ec1642d000002/playlist.m3u8"
}
```
	
## Stop Video Recording
	
	POST /hls/recordings/:id/stop

with body params (example below):

- endDate: 2013-03-15T05:54:47.636Z
- endSeqNo: 217

__Results:__

```
{
  "_id" : "515e65b7ce4ec1642d000002",
  "endDate" : "2013-03-15T05:54:47.636Z",
  "startDate" : "2013-03-15T04:54:47.636Z",
  "__v" : 0,
  "playlistURL" : "http://upthetreehouse.com/hls/515e65b7ce4ec1642d000002/playlist.m3u8",
  "endSeqNo" : 217
}
```
	
## Upload Video Chunk
If video chunk is already in TS format, adds to the recording's playlist. Otherwise, if video chunk is in MP4 format, converts chunk before adding to the recording's playlist.
	
	POST /hls/recordings/:id/chunks

with body params (example below):

- duration: 10.0 (in seconds)
- seqNo: 15

and with the chunk attached as multipart/form-data, with name="chunk":

```
Content-Disposition: form-data; name="chunk"; filename="chunk.mp4"
Content-Type: video/mp4
```

__Results:__

```
{
  "__v": 0,
  "duration": 10.0,
  "seqNo": 15,
  "url": "http://upthetreehouse.com/hls/5158187a7e9baf07dd000001/eb043264d298907035d786b91d49e3e7.ts",
  "_recording": "5158187a7e9baf07dd000001",
  "_id": "515e66c7ce4ec1642d000003""
}
```

__Failures:__

- If there is a problem encountered with processing the chunk, the API will return a __422__ Unprocessable Entity error.
- If there is no HLS recording with the given ID, the API will return a __404__ error.
- If the extension is not .ts or .mp4, the API will return a __500__ error.