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
- Games with a wager must be joined via a forwarded transfer message
- wager games require the `x-Player-Id` tag
- specifying color when you join/create game not implemented
- refunds not implemented
- forwarded messages will error if game has no wager
- Wager game requires action tag `Chess-Game.Join-Wager-Game`

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
