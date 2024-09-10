# Chess registry

## APIs

### Read

#### `Chess-Registry.Get-Games`
fetch the list of all games (live and historical)

- filter by user address
- filter by game IDs
- filter by live/historical

- Accepts `Game-Ids` tag to fetch a specific message by game Id. Will error if game id is not found.
- Multiple `Game-Ids`, provided as a comma separated string, are accepted.
- Accepts `Player-Id` tag to fetch all games (live and historical) for a specific player. Will error if Player Id is not found.
- Returns all games if neither `Game-Id` or `Player-Id` is provided

- Action tag for successful request is `Chess-Registry.Get-Games-Notice`
- json encoded game data included in Data tag for successful request

- Accepts `Type` tag "Live | Historical | undefined | nil" to filter results only from the selected table


#### `Chess-Registry.Get-Players`
fetch all players
- filter by address list

- Accepts `Player-Ids` tag to fetch specific players. Will error if any player not found.
- `Player-Ids` must be a stringified array. 
- Player game history will be compressed to only return game Ids, not entire game objects.

### Write

#### `Chess-Registry.Join-Registry`
registers a new player to the registry
- Accepts optional `Username` tag
- set default elo of 1500
- will error if user already registered
- Data in response message is "Successfully registered"

#### `Chess-Registry.Edit-Profile`
update friendly name of registered profile
- Accept `Username` tag
- Player profile for sending wallet will be updated with new username
- Will error if player profile does not exist
- Will error if `Username` tag not present.
- Data in response message is "Updated username"

#### `Chess-Registry.Create-Game`
Spawn a new game process and record the ID in the games registry
- add the game id to the live games list
- add the game id to the creators game list

#### `Spawned`
Spawned is a reserved action handler name in aos that is sent to a parent process from a child process it spawned.

Use the forwarded tags to identify the game creator and update the games and players tables appropriately

#### `Chess-Registry.Join-Game`
Message handler for when opponent joins a game, only accessible by the spawned game process, which sends the message to the chess registry after a player joins
- add the game to the opponents list

#### `Chess-Registry.Game-Result`
Returns the final score and winner of the game
- calculate new ELO's and update both players elo and set them to the players profiles
- update the status of the game as complete and move the the historical games list
- set the wins, losses, stalemates, and surrenders appropriately