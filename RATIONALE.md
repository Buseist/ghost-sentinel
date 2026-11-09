# Rationale — Ghost Sentinel

## Idea

Ghost Sentinel is an arcade game in which the player collects stars while avoiding a ghost that repeats the player's earlier movements. The ghost is created from the player's own recorded path rather than following a separately designed route. Every movement therefore matters: a route that was safe a moment ago can become dangerous when it returns.

## Premise A and B

The first premise is **Temporality**. The game records the player's position over time, and `ghostAt()` retrieves the position from three seconds earlier. The `GHOST_DELAY_MS` setting controls this interval. Time becomes part of the game rule: the player must think not only about where to move now, but also about where earlier movement will bring the ghost.

The second premise is **Feedback**. The ghost, its dashed route preview, countdown, score, lives and status messages make the game's changing state visible. These signals help the player understand the consequences of earlier actions. The premises depend on each other: the delay creates the ghost's threat, while feedback makes that delayed threat readable. Without the delay, the ghost would simply copy the player; without feedback, its route would be harder to anticipate.

## Theory

Jota, Ng, Dietz and Wigdor (2013) study how input-to-display latency affects performance in direct-touch pointing tasks. Their research informed my decision to make the ghost's delay intentional and adjustable through `GHOST_DELAY_MS`, rather than allowing accidental interface lag. A limitation is that their study examines technical response latency, not a deliberately delayed game character.

Shneiderman (1983) argues that direct-manipulation interfaces should keep relevant objects visible and show the results of actions. This informed the visible player, ghost, route preview and score/lives display. These elements help players understand the game without lengthy instructions. However, Ghost Sentinel complicates immediate feedback: the ghost represents a past action, so the player must connect the visible result to an earlier decision.

## What I learned

I tested the game with someone who had not played it before. They understood the controls and played comfortably without needing an explanation. This showed me that the short instruction and keyboard/on-screen controls were clear enough for a first-time player. Since the tester did not struggle, I kept the basic control scheme unchanged.

**Live link:** [Add your published GitHub Pages URL here]

## References

- Jota, R., Ng, A., Dietz, P., & Wigdor, D. (2013). How Fast is Fast Enough? A Study of the Effects of Latency in Direct-Touch Pointing Tasks. *Proceedings of CHI 2013*, 2291–2300. https://www.tactuallabs.com/papers/howFastIsFastEnoughCHI13.pdf
- Shneiderman, B. (1983). Direct Manipulation: A Step Beyond Programming Languages. *Computer, 16*(8), 57–69. https://www.cs.umd.edu/~ben/papers/Shneiderman1983Direct.pdf
