// Basic data structures for Go.
package main

import (
	"errors"
	"fmt"
)

// Letters for quick lookup.
// These are the letters marked on top of the board.  "I" is
// always left out, likely to avoid confusion with "1".
const BoardLetters = "ABCDEFGHJKLMNOPQRST"
const ActionChars = "cbw"

// Here it would be nice if the type system allows us to say
// "integer with one of these value: 0, 1, 2.
type Stone int

const (
	// Stone colors. Used for board state.
	Empty = 0 // No stone here.
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

type BoardSize struct {
	Width  int
	Height int
}

// A move. (Place or capture stone.)
type Move struct {
	Action Stone // (Hmm, this looks a bit weird here.)
	Pos
}

func (move Move) String() string {
	return FormatMove(move)
}

func ParseMove(text string) (Move, error) {
	// letter := text[0]
	// number := text[1:len(text)-1]
	// action := text[len(text)-1]

	return Move{}, errors.New("Parser not written")
}

func FormatMove(move Move) string {
	// Todo: check if values are out of range?
	letter := BoardLetters[move.X]
	number := move.Y + 1
	stoneColor := ActionChars[move.Action]

	return fmt.Sprintf("%c%d%c", letter, number, stoneColor)
}

// The board is just a cache of moves. We can recompute the board from
// the moves.
type Game struct {
	BoardSize
	Board map[Pos]Stone
	Moves []Move
	// Here we should have a stack (or slice) of boards so that we have
	// a history of previous board states.

	// + We need to keep score somehow. (Number of captured stones for
	// each player.)
}

func (game *Game) AddMove(move Move) {
	game.Moves = append(game.Moves, move)
	game.Board[move.Pos] = move.Action
}

func (game *Game) AddMoves(moves []Move) {
	for _, move := range moves {
		game.AddMove(move)
	}
}

func (game *Game) PrintBoard() {
	stoneChars := ".bw"

	fmt.Println("   " + BoardLetters)

	for y := game.Height - 1; y >= 0; y-- {
		line := ""
		for x := 0; x < game.Width; x++ {
			line += fmt.Sprintf("%c", stoneChars[game.Board[Pos{x, y}]])
		}
		fmt.Printf("%2d %s\n", y+1, line)
	}
}

func NewGame(boardSize BoardSize) Game {
	return Game{
		BoardSize: boardSize,
		Board:     make(map[Pos]Stone),
	}
}

func main() {
	game := NewGame(BoardSize{19, 19})
	moves := []Move{{PlaceBlack, Pos{0, 0}}, {PlaceWhite, Pos{1, 6}}}
	fmt.Println()
	fmt.Println("Moves:", moves)
	fmt.Println()
	game.AddMoves(moves)
	game.PrintBoard()

	// fmt.Println(game.Board[Pos{}])
	// fmt.Println(game.Board[Pos{1, 1}])

	// fmt.Println(moves)
}
