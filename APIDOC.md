# Channely API endpoint documentation
### So you know, we don't drive you insane.

This should be updated every time you change an endpoint.

## Auth
We're using a very bastardized of OAuth. Essentially, client sends over HTTPS:

- User's Username
- User's Password
- ClientID
- Client Secret

(Both the client ID and client secret are to be hardcoded into the app.)

```
POST /oauth/token
```

__Returns:__

```
HTTP STATUS 200
{ 
access_token: xxx,
username: elijames
userId: 51557cb1af60b225e5000001
}
```

## User
The user endpoints are for getting, creating and updating a user.
```

