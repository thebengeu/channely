# Channely API endpoint documentation
### So you know, we don't drive you insane.

This should be updated every time you change an endpoint.

# Auth
We're using a variant of X-Auth. Essentially, client sends over HTTPS:

Body parameters:

- ClientID
- Client Secret

and with basic HTML auth:

- Username 
- Password

(Both the client ID and client secret are to be hardcoded into the app.)

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

Hitting this API endpoint generates and stores a new access_token.

__Failures__:

- If the clientSecret is wrong, the app will return a __403__ error.
- If the username or password in HTTP Basic Auth fails, the app will return a __401__ error. 

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
FOR BENG TO FILL UP

# Posts

