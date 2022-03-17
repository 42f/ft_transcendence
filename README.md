# ft_transcendence
Web application of an amazing pong game.

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
