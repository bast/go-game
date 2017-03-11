// Basic data structures for Go.
package main

import (
	"errors"
	"fmt"
	"math/rand"
	// "time"
)

// Letters for quick lookup.
// These are the letters marked on top of the board.  "I" is
// always left out, likely to avoid confusion with "1".
const BoardLetters = "ABCDEFGHJKLMNOPQRST"
const ActionChars = "cbw"

// Here it would be nice if the type system allows us to say
// "integer with one of these value: 0, 1, 2.
type Color int

const (
	// Stone colors. Used for board state.
	Empty = 0 // No stone here.
	Black = 1
	White = 2
)

// Point where a stone can be placed.
type Point struct {
	X int // Left to right, 0-18 (marked as 1-19 on board.)
	Y int // Bottom to top, 0-18 (ABCDEFGHJKLMNOPQRST.)
}

type Size struct {
	Width  int
	Height int
}

// A move. (Place or capture stone.)
type Move struct {
	Point
	Color
}

func (move Move) String() string {
	return FormatMove(move)
}

func ParseMove(text string) (Move, error) {
	// letter := text[0]
	// number := text[1:len(text)-1]
	// color := text[len(text)-1]

	return Move{}, errors.New("Parser not written")
}

func FormatMove(move Move) string {
	// Todo: check if values are out of range?
	letter := BoardLetters[move.X]
	number := move.Y + 1
	stoneColor := ActionChars[move.Color]

	return fmt.Sprintf("%c%d%c", letter, number, stoneColor)
}

type Group struct {
	Color
	Points    map[Point]bool
	Liberties map[Point]bool
}

// The board is just a cache of moves. We can recompute the board from
// the moves.
type Game struct {
	Size
	Board map[Point]Color
	Moves []Move
	// Here we should have a stack (or slice) of boards so that we have
	// a history of previous board states.

	// + We need to keep score somehow. (Number of captured stones for
	// each player.)
}

func (game *Game) AddMove(move Move) {
	game.Moves = append(game.Moves, move)
	game.Board[move.Point] = move.Color
}

func (game *Game) AddMoves(moves []Move) {
	for _, move := range moves {
		game.AddMove(move)
	}
}

func (game *Game) PrintBoard() {
	colorChars := ".bw"

	fmt.Print("   ")
	for x := 0; x < game.Width; x++ {
		fmt.Printf(" %c", BoardLetters[x])
	}
	fmt.Println()

	for y := game.Height - 1; y >= 0; y-- {
		line := ""
		for x := 0; x < game.Width; x++ {
			line += fmt.Sprintf(" %c", colorChars[game.Board[Point{x, y}]])
		}
		fmt.Printf(" %2d%s\n", y+1, line)
	}
}

func NewGame(boardSize Size) Game {
	return Game{
		Size:  boardSize,
		Board: make(map[Point]Color),
	}
}

// returns a list of random moves
// the moves are not guaranteed to be valid
// this function can place multiple stones on top of each other
// this is used for debugging detection of invalid moves
// and for implementing grouping and detection of dead groups
func (game *Game) generateRandomMoves(numMoves int) []Move {
	// rand.Seed(time.Now().UnixNano())

	moves := []Move{}
	for i := 0; i < numMoves; i++ {
		randomColor := Color(rand.Intn(2) + 1) // either black or white stone
		randomX := rand.Intn(game.Width)
		randomY := rand.Intn(game.Height)
		moves = append(moves, Move{Point{randomX, randomY}, randomColor})
	}
	return moves
}

// finds up to four neighbors for a reference point (east, north, west, south)
// does not check whether the reference point is actually on the board
func (game *Game) findNeighbors(point Point) []Point {
	neighbors := []Point{}
	// east
	if point.X < game.Width-1 {
		neighbors = append(neighbors, Point{point.X + 1, point.Y})
	}
	// north
	if point.Y < game.Height-1 {
		neighbors = append(neighbors, Point{point.X, point.Y + 1})
	}
	// west
	if point.X > 0 {
		neighbors = append(neighbors, Point{point.X - 1, point.Y})
	}
	// south
	if point.Y > 0 {
		neighbors = append(neighbors, Point{point.X, point.Y - 1})
	}
	return neighbors
}

func (game *Game) findCapturedGroups() {

	groups := []Group{}
	groupedPoints := make(map[Point]bool)

	for point, color := range game.Board {
		if color != 0 {
			if !groupedPoints[point] {
				group := Group{
					Color:     color,
					Points:    make(map[Point]bool),
					Liberties: make(map[Point]bool),
				}

				todo := []Point{}
				todo = append(todo, point)

				for len(todo) > 0 {
					// pop the last element
					// see https://github.com/golang/go/wiki/SliceTricks
					point, todo = todo[len(todo)-1], todo[:len(todo)-1]

					if !groupedPoints[point] {
						_color := game.Board[point]
						if _color == 0 {
							group.Liberties[point] = true
						} else if _color == group.Color {
							group.Points[point] = true
							groupedPoints[point] = true
							// extend the todo array by neighbors
							todo = append(todo, game.findNeighbors(point)...)
						}
					}
				}
				groups = append(groups, group)
			}
		}
	}

	// for debugging
	boardNumLiberties := make([]int, game.Width*game.Height)

	for _, group := range groups {
		numLiberties := len(group.Liberties)
		for point, _ := range group.Points {
			boardNumLiberties[point.Y*game.Width+point.X] = numLiberties
		}
	}

	fmt.Println("\nLiberties of groups:\n")

	for y := game.Height - 1; y >= 0; y-- {
		fmt.Print("   ")
		for x := 0; x < game.Width; x++ {
			numLiberties := boardNumLiberties[y*game.Width+x]
			if numLiberties == 0 {
				if game.Board[Point{x, y}] == Empty {
					fmt.Print(" .")
				} else {
					fmt.Print(" *")
				}
			} else {
				fmt.Printf("%2d", boardNumLiberties[y*game.Width+x])
			}
		}
		fmt.Print("\n")
	}
}

func main() {
	game := NewGame(Size{9, 11})

	moves := game.generateRandomMoves(135)

	fmt.Println()
	fmt.Println("Moves:", moves)
	fmt.Println()
	game.AddMoves(moves)
	game.PrintBoard()
	game.findCapturedGroups()

	// fmt.Println(game.Board[Point{}])
	// fmt.Println(game.Board[Point{1, 1}])

	// fmt.Println(moves)
}
