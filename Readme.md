## RabbitMQ test

- Run rabbitmq (using docker)
```
docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.9-management
```

- Run the service one
```
cd first-m
```
```
npm i
```
```
npm run start
```


- Run the service two
```
cd second-m
```
```
npm i
```
```
npm run start
```

- GET request to http://localhost:4001/multiplication

The message is sent from first-m to the queue (names "test").
The message is read by the stopwatch and sent back to the first in the temporary queue, which waits for this message and sends it to the client.