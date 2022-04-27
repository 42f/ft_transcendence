# ft_transcendence
Web application of an amazing pong game.
This is a project made with 4 other students at École 42 Paris: [Jibus22](https://github.com/Jibus22), [kazuumaVII](https://github.com/kazuumaVII), [violettagoldman](https://github.com/violettagoldman), [mrouchy](https://github.com/mrouchy).

It is a fullstack application which allows user to log in with their École 42 Oauth, play a pong game online, watch current games in real time, chat among each other with public, private rooms and direct messages.

### Backend
The backend consists of a REST Api made with NestJs framework using typescript, a PostgreSQL db, deployed on a docker container.

### Frontend
The frontend uses React framework.

### how to use

With docker started on your computer, run `make` will build and run containers for both frontend and backend.
Then go on `http://localhost`

## Tests

### Run all end to end tests

`make test`

### Run specific end to end tests

`make test [name of test file]`


### DEBUG conf to attach vscode to docker container:
```
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Docker: Attach to Node",
      "type": "pwa-node",
      "request": "attach",
      "restart": true,
      "port": 9229,
      "address": "localhost",
      "localRoot": "${workspaceFolder}/back_end",
      "remoteRoot": "/usr/src/app",
      "protocol": "inspector"
    }
  ]
}
```
