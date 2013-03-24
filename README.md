To run Node.js API bit:
```bash
$ brew install mongodb node
$ cd channely
$ npm install
$ node app
```

To run Meteor web bit:
```bash
$ curl https://install.meteor.com | /bin/sh
$ npm install -g meteorite
$ cd channely/meteor
$ MONGO_URL=mongodb://127.0.0.1:27017/meteor mrt
```

Add to .ssh/config:
```
Host channely
Hostname 54.251.249.119
IdentityFile ~/.ssh/cs3217.pem
User ubuntu
```

To deploy:
```bash
$ git remote add channely ssh://channely/ebs/channely.git
$ git push channely master
```