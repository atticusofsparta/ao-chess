# Chess registry

## APIs

### Read

#### `Chess-Registry.Get-Games`
fetch the list of all games (live and historical)

- filter by user address
- filter by game IDs
- filter by live/historical

- Accepts `Game-Id` tag to fetch a specific message by game Id. Will error if game id is not found.
- Accepts `Player-Id` tag to fetch all games (live and historical) for a specific player. Will error if Player Id is not found.
- Returns all games if neither `Game-Id` or `Player-Id` is provided

- Action tag for successful request is `ChessMessage`
- json encoded game data included in Data tag for successful request

- Accepts `Type` tag "Live | Historical" to filter results only from the selected table


#### `Chess-Registry.Get-Players`
fetch all players
- filter by address list

### Write

#### `Chess-Registry.Join-Registry`
registers a new player to the registry
- takes in friendly name
- set default elo of 1500

#### `Chess-Registry.Edit-Profile`
update friendly name of registered profile
- takes in friendly name of user

#### `Chess-Registry.Create-Game`
Spawn a new game process and record the ID in the games registry
- add the game id to the live games list
- add the game id to the creators game list

#### `Spawned`
Spawned is a reserved action handler name in aos that is sent to a parent process from a child process it spawned.

Use the forwarded tags to identify the game creator and update the games and players tables appropriately

#### `Chess-Registry.JoinGame`
Message handler for when opponent joins a game, only accessible by the spawned game process, which sends the message to the chess registry after a player joins
- add the game to the opponents list

#### `Chess-Registry.Game-Result`
Returns the final score and winner of the game
- calculate new ELO's and update both players elo and set them to the players profiles
- update the status of the game as complete and move the the historical games list
- set the wins, losses, draws, and surrenders appropriately