import random
from collections import namedtuple, defaultdict, deque

Point = namedtuple('Point', ['x', 'y'])
Size = namedtuple('Size', ['w', 'h'])

EMPTY = 0
BLACK = 1
WHITE = 2

BOARD_LETTERS = 'ABCDEFGHJKLMNOPQRST'


class Group:
    def __init__(self, color):
        self.color = color
        self.points = set()
        self.liberties = set()

    @property
    def is_alive(self):
        return len(self.liberties) > 0

    @property
    def is_dead(self):
        return len(self.liberties) == 0

    def __len__(self):
        return len(self.points)

    def __repr__(self):
        return '<group color={} {} points {} liberties>'.format(
            self.color, len(self.points), len(self.liberties))


class Board:
    def __init__(self, size):
        self.size = size
        self.stones = {}

    def random_fill(self, seed=None):
        rand = random.Random(seed)

        for point in self.iter_points():
            color = rand.choice([EMPTY, BLACK, WHITE])
            if color != EMPTY:
                self.stones[point] = color

    def is_inside(self, point):
        return 0 <= point.x < self.size.w and 0 <= point.y < self.size.h

    def get_color(self, point):
        return self.stones.get(point, 0)

    def get_neighbours(self, point):
        x, y = point

        points = [Point(x-1, y), Point(x+1, y), Point(x, y-1), Point(x, y+1)]
        points = [p for p in points if self.is_inside(p)]

        return points

    def iter_points(self):
        for x in range(self.size.w):
            for y in range(self.size.h):
                yield Point(x, y)

    def find_groups(self):
        groups = []
        grouped_points = set()

        for point, color in self.stones.items():
            # This should not happen but let's test just in case.
            if color == EMPTY:
                continue

            if point in grouped_points:
                continue

            group = Group(color)

            todo = [point]
            while todo:
                point = todo.pop()
                color = self.stones.get(point, EMPTY)

                if point in grouped_points:
                    continue
                elif color == EMPTY:
                    group.liberties.add(point)
                elif color == group.color:
                    group.points.add(point)
                    grouped_points.add(point)
                    todo.extend(self.get_neighbours(point))

            groups.append(group)

        return groups


def print_board(board):
    color_chars = {
        # Characters that are easy to tell apart at a glance.
        EMPTY: '.',
        BLACK: '#',
        WHITE: 'o',
    }

    print()
    print('    ', ' '.join(BOARD_LETTERS[:board.size.w]))
    print()

    for y in range(board.size.h):
        line = []
        for x in reversed(range(board.size.w)):
            line.append(color_chars[board.get_color(Point(x, y))])

        rownum = board.size.h - y

        print(' {:2} '.format(rownum), ' '.join(line))
    print()


def print_dead_groups(groups, board_size):
    board = Board(board_size)
    for group in groups:
        if group.is_dead:
            for point in group.points:
                board.stones[point] = group.color

    print_board(board)


board = Board(Size(9, 9))
board.random_fill(seed=13)

print('Board:')
print_board(board)

groups = board.find_groups()

print('Dead groups:')
print_dead_groups(groups, board.size)
