import random
from backend.utils.chess_game import ChessGame, Move

class ChessBot(ChessGame):
    """Bot (dumbest bot ever) to manage and play a game of chess with the user"""
    def __init__(self, player_is_white: bool | None = None):
        super().__init__()
        if player_is_white is not None:
            self.player_is_white = player_is_white
        else:
            self.player_is_white = random.random() >= 0.5

    def reset(self):
        super().reset()

    def get_legal_moves(self) -> list[Move]:
        return list(self.board.generate_legal_moves())

    def is_players_turn(self) -> bool:
        return self.board.turn == self.player_is_white

    def play_move(self):
        legal_moves = self.get_legal_moves()
        if not legal_moves:
            return 'No legal moves are available!'
        # dumbest chess engine ever
        move = random.choice(legal_moves)
        move_str = self.board.san(move)
        self.board.push(move)
        self.move_nb += int(not self.player_is_white)
        return move_str
