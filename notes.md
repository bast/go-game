# Notes


## Board Size

According to [Sensei's Library](http://senseis.xmp.net/?DifferentSizedBoards)
common board sizes are 5x5, 6x6, 7x7, 9x9, 11x11, 13x13, 15x15, 17x17
and 19x19. The code should accept anything from 1x1 (or perhaps even
0x0) and up, but in the GUI it would make more sense to have a list to
pick from.


## Moves

There are two valid moves a player can make:

* place a black piece
* place a white piece

In addition a capture results in an implicit move:

* capture a piece

This means a complete game can be represented as a board size and a
sequence of moves. This can be expressed very compactly:

```
19x19 bA9 wB12 bC2
```

which translates to:

* board size is 19x19
* place black stone at A 19
* place white stone at B 12
* place black stone at C 2

This is similar to algebraic notation used in chess, where for example
"Be5" means "bishop to e5".

Unlike in chess letters for positions are uppercase since that is how
they're commonly marked on the board. Lowercase letters are used for
colors to make them stand out. For example "BA6" could easily be
misread as position "B6".

Using a different separator we can put the whole game in a URL:

```
https://go-game.somedomain/game/19x19,bA9,wB12,bC2
```

This allows you to bookmark an ongoing game.

Some notes:

* Since the board is square we could simply say "19", but "19x19" makes it clear that this is a board size.

* The double letters makes the moves a bit hard to read. For example it's easy to misread "bA9" as position "A9".

* Should the moves be case insensitive?

* The letter "c" could be used for a capture.

* Should we allow non-square boards?



## Data Structures

A position on the board:

```go
type Pos struct {
  X int
  Y int
}
```

A stone can just be an int:

```go
type Stone int
```

There are three possible values:

```go
const (
  Clear = 0
  Black = 1
  White = 2
)
```

`Clear` is used for a position where there is no stone. (There may be a better
name for this.)

Radovan: suggest word `Empty` - I am now reading a book about Scientology and have
strange associations with the word `Clear`.

The values of `Black` and `White` are arbitrary, but since black always starts
it makes some kind of sense for it to have the lowest value.

Using these building blocks the board can be represented as:

```go
board := map[Pos]Stone
```

Placing a stone:

```go
board[Pos{1, 2}] = Black
```

If a value is not in the map Go will return the default value, in this case 0.
This means we don't have to worry about initializing the board.

The possible moves are:

```go
type Action int

const (
  Capture = 0
  PlaceBlack = 1
  PlaceWhite = 2
)
```

These correspond to the stone values above making it easy to translate between
the two. A move can be represented as:

```go
type Move struct {
  // Using "Stone" here is perhaps a bit confusing.
  Action Stone
  Pos
}
```

Since the values are the same for moves and stones performing a move is
straight forward:

```go
board[move.Pos] = move.Action
```

A sequence of moves can be a slice:

```go
moves := []Move{{PlaceBlack, Pos{0, 0}}, {PlaceWhite, Pos{0, 1}}}
```

This can all be contained in a `Game` struct:

```go
type Game struct {
  Size int
  Moves []Move
  Board map[Pos]Stone
}
```

(The maps need to be allocated so a `NewGame()` function is required.)


## GUI and Game Engine

The program is split into two parts: GUI and game engine. The game engine holds
all game state and logic while the GUI interacts with the user and renders the
board.

The GUI can call functions in the game engine to do things like:

* Create a new game.

* Ask if a move is valid. Returns a (possibly empty) list of moves or an error
  such as "there's already a stone there", "no liberties" or "breaks rule 2
  (cycle)".

* Perform a move. Same return value as before.

* Perform a dry-run move. This can be used to visualize the effect of a move.

* Ask for a list of liberties for a given stone or for every stone on the board.

* Is the game over? (No more valid moves?)

* What's the score?

In addition there should be utility functions to do things like converting
between strings and `Move` slices.
