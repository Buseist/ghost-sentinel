# Ghost Sentinel

**Premises:** Temporality × Feedback

Ghost Sentinel is an arcade game about facing the consequences of your own past movements. Collect 15 stars while avoiding the ghost that replays your recorded path three seconds later.

## How to play
- Move with the arrow keys or W, A, S, D.
- On a touch screen, use the four labelled on-screen direction buttons.
- Collect stars to increase your score.
- Avoid the ghost: it follows the path you took three seconds earlier.
- You have three lives. Reach 15 stars to win.
- Press Enter or select Restart to start a new game.

## The two premises

### Temporality
The game records the player's position over time. `ghostAt()` retrieves the position from `GHOST_DELAY_MS` milliseconds in the past, so the ghost re-enacts an earlier moment of the player's movement.

### Feedback
The ghost, its visible label, dashed route preview, countdown, score, remaining lives and status messages make the game's changing state understandable. The delayed ghost turns the player's past actions into a consequence they must respond to in the present.

## Project files
- `index.html` — page structure and controls
- `style.css` — visual design and layout
- `script.js` — game logic and the `CONFIG` settings
- `RATIONALE.md` — design rationale and references

## Changing the game
The main settings are grouped at the top of `script.js` in the `CONFIG` object:
- `GHOST_DELAY_MS`: change the time delay
- `GHOST_ENABLED`: turn the ghost on or off
- `SHOW_TRAIL`: show or hide the route preview
- `PLAYER_SPEED`: change player movement speed
- `LIVES`: change the number of lives
- `WIN_SCORE`: change the number of stars needed to win

## Credits
- The project concept is adapted from the “Ghost Chase” experiment in the NMED 3203 Interactive Media Applications lab.
- The game's code and visual presentation were developed for this project with assistance from ChatGPT.

## AI Use Note
ChatGPT was used during development to generate ideas, assist with writing code and improve the game mechanics.

One improvement was refining the ghost movement by adding interpolation, allowing the ghost to follow the player's recorded path more smoothly between stored frames. The generated code was reviewed and adjusted to fit the project's requirements.
