from chess import Board, Move
from chess import InvalidMoveError, IllegalMoveError, AmbiguousMoveError
import logging
logger = logging.getLogger(__name__)


class ChessGame:
    """Manages and a game of chess between 2 players (simple wrap around chess.Board)"""
    def __init__(self):
        self.reset()

    def reset(self):
        self.board = Board()

    def update_board(self, move_uci: str):
        logger.debug(f"Move '{move_uci}'")
        try:
            move = Move.from_uci(move_uci)
        except InvalidMoveError:
            try:
                # maybe move is written in standard algebraic notation
                move = self.board.parse_san(move_uci)
            except (InvalidMoveError, AmbiguousMoveError):
                raise ValueError(f'Given move {move_uci} is not a valid move')
            except IllegalMoveError:
                raise ValueError(f'Given move {move_uci} is not a legal move')
        if not self.board.is_legal(move):
            raise ValueError(f'Given move {move_uci} is not a legal move')
        self.board.push(move)

    def is_game_ended(self) -> dict | None:
        outcome = self.board.outcome()
        if outcome:
            return {
                'is_draw': outcome.winner is None,
                'is_white_winner': outcome.winner,
                'termination_type': outcome.termination.name
            }
    
    def is_white_turn(self) -> bool:
        return self.board.turn


if __name__ == "__main__":
    game = ChessGame()
    game.update_board("e4")
    game.update_board("f5")
    game.update_board("d4")
    game.update_board("g5")
    game.update_board("Qh5")
    print(game.is_game_ended())
