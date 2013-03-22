```bash
$ brew install mongodb node
$ curl https://install.meteor.com | /bin/sh
$ cd channely
$ npm install
$ cd meteor
$ npm install -g meteorite
$ mrt
$ node ../app
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