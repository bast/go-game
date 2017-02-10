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
19x19 A9b B12w C2b
```

which translates to:

* board size is 19x19
* place black stone at A19
* place white stone at B12
* place black stone at C2

This is similar to algebraic notation used in chess where for example
"Be5" means "bishop to e5".

* The order "letter followed by number" is standard Go notation and
  what people are used to.

* Position letters (A-T) are written in uppercase since this is how
  they are traditionally marked on the board.

* To avoid confusion with letters stone colors are placed at the end
  of the expression. Since [we tend to notice only the first and last
  letter of a word](https://en.wikipedia.org/wiki/Typoglycemia) "BA6"
  could easily be misread as position "B6". This is not true of "A6B".

* For additional clarity the stone color is lowercased, as in "A6b".

* The letter "c" (as in "A6c") is used to denote a capture. It is not
  normally used in move lists since it can be computed but it is used
  internally in the code so it's useful to have a notation for it.

* Since Go moves alternate between black and white we could in
  principle leave out "b" and "w" and write "A9 B12 C2". There are two
  problems with this. First, less experienced players are sometimes
  given more than one stone at the start of the game to give white a
  handicap, as in: "C2b F9b C3b C9w". This would require extra
  notation anyway. Second, including stone color means you don't have
  to keep track of alternating colors when you read a game. Thus
  parsing a move is context free.

* Board size always includes both width and height (19x19 rather than
  just 19). This makes it visually clearer that the value is a board
  size and also allows for experimental non-square boards.

Some notes:

* Using a different separator we can put the whole game in a URL:
  `https://go-game.somedomain/game/19x19,A9b,B12w,C2b`. This allows
  you to bookmark an ongoing game.

* Should 19x19 mean "HEIGHTxWIDTH" since the letter comes first?

* Should we call this SGN (Simple Go Notation)?


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
  Empty = 0
  Black = 1
  White = 2
)
```

`Empty` is used for a position where there is no stone.

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

* Ask for a list of all stones currently on the board. This returns a
  slice of moves in the order they were placed on the board.

* Is the game over? (No more valid moves?)

* What's the score?

In addition there should be utility functions to do things like converting
between strings and `Move` slices.


## Board Rendering

We may want to support [Kifu](https://en.wikipedia.org/wiki/Kifu) at
some point.


## Tasks

* (Both) Learn Go

* (Both) Learn GopherJS

* (Ole Martin) Add letters and numbers to the SVG rendering. (Problems: how to
  center the letters and numbers and how to get the right size and font.)

* (Ole Martin) Write some code to generate the SVG from a board size and a list of moves.
