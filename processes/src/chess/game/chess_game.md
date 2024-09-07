## APIs
### Read
#### `Get-FEN`
Returns the fen string of the game
#### `Get-PGN`
returns the pgn string of the game


### Write

#### `Join-Game`
Opponent messages the process to join the game
- sends notice that opponent joined to the chess registry

#### `Move`
Move api is same as [chess.js](https://github.com/jhlywa/chess.js)

In the msg.Data provide stringified JSON of the move

```json
{
    "from": "h7",
    "to": "h8",
    "promotion": "q"
}
```
If the move results in game over, send the results to the `Game-Result` api on the [Chess Registry](../registry/chess_registry.md)
