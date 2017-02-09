// Basic data structures for Go.
package main

import (
	"fmt"
)

// Letters for quick lookup.
// These are the letters marked on top of the board.  "I" is
// always left out, likely to avoid confusion with "1".
const BoardLetters = "ABCDEFGHJKLMNOPQRST"
const ColorChars = "CBW"

// Here it would be nice if the type system allows us to say
// "integer with one of these value: 0, 1, 2.
type Stone int

const (
	// Stone colors. Used for board state.
	Clear = 0 // No stone here.
	Black = 1
	White = 2

	// Moves. These correspond to board state making it easy to
	// translate between the two. (A capture will clear that position on
	// the board.)
	Capture    = 0
	PlaceBlack = 1
	PlaceWhite = 2
)

// Position where a stone can be placed.
type Pos struct {
	X int // Left to right, 0-18 (marked as 1-19 on board.)
	Y int // Bottom to top, 0-18 (ABCDEFGHJKLMNOPQRST.)
}

// A move. (Place or capture stone.)
type Move struct {
	Action Stone // (Hmm, this looks a bit weird here.)
	Pos
}

func (move Move) String() string {
	// Todo: check if values are out of range?
	color := ColorChars[move.Action]
	letter := BoardLetters[move.X]
	number := move.Y + 1

	return fmt.Sprintf("%c%c%d", color, letter, number)
}

// The board is just a cache of moves. We can recompute the board from
// the moves.
type Game struct {
	Size  int
	Moves []Move
	// Here we should have a stack (or slice) of boards so that we have
	// a history of previous board states.
	Board map[Pos]Stone

	// + We need to keep score somehow. (Number of captured stones for
	// each player.)
}

func (game *Game) AddMove(move Move) {
	game.Moves = append(game.Moves, move)
	game.Board[move.Pos] = move.Action
}

func (game *Game) AddMoves(moves []Move) {
	for _, move := range moves {
		fmt.Println(move)
		game.AddMove(move)
	}
}

func (game *Game) PrintBoard() {
	stoneChars := ".BW"

	fmt.Println("   " + BoardLetters)

	for y := game.Size; y >= 0; y-- {
		line := ""
		for x := 0; x < game.Size; x++ {
			line += fmt.Sprintf("%c", stoneChars[game.Board[Pos{x, y}]])
		}
		fmt.Printf("%2d %s\n", y+1, line)
	}
}

func NewGame(size int) Game {
	return Game{Size: size, Board: make(map[Pos]Stone)}
}

func main() {
	game := NewGame(19)
	moves := []Move{{PlaceBlack, Pos{0, 0}}, {PlaceWhite, Pos{1, 6}}}
	game.AddMoves(moves)

	game.PrintBoard()

	// fmt.Println(game.Board[Pos{}])
	// fmt.Println(game.Board[Pos{1, 1}])

	// fmt.Println(moves)
}
