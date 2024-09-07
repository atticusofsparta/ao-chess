## Write

### `Move`
Move api is same as [chess.js](https://github.com/jhlywa/chess.js)

In the msg.Data provide stringified JSON

```json
{
    "from": "h7",
    "to": "h8",
    "promotion": "q"
}
```

### `Message`
Player can send a message to the chat.

in msg.Data encode a json object:
```json
{
    "private": false, // if true, the message was e2e encrypted for the other player only
    "recipient": "0x...", // target user to message
    "message": "my message here", // can be any string supported mime type
    "encoding": "text/*", // mime type, can drive renderers for audio, video, images and html embeds
    "compression": "gzip" // default compression from all messages.
}
```

## Read

### `getFEN`

### `getPGN`

### `getChat`
Returns all the chat history of the game