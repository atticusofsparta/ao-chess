#### `Message`

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
