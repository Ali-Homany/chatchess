export function chessMovesToEnglish(move) {
    // define mappings for pieces and ranks
    const pieceMap = {
        'K': 'King',
        'Q': 'Queen',
        'R': 'Rook',
        'B': 'Bishop',
        'N': 'Knight'
    };
    // define the names of the files (columns)
    const filesNames = 'abcdefgh';

    // handle castling
    // check for short castling
    if (move === "O-O") {
        return "Short castling";
    } 
    // check for long castling
    else if (move === "O-O-O") {
        return "Long castling";
    }

    // check for and remove special symbols
    // check if the move is a check
    const isCheck = move.includes("+");
    // check if the move is a checkmate
    const isCheckmate = move.includes("#");

    // remove special symbols from the move
    move = move.replace(/[+#]/g, "");

    // initialize the plain english description
    let description = "";

    // check if the move is a capture
    const capture = move.includes("x");

    // handle promotion
    let promotion = null;

    // check if the move is a promotion
    if (move.length > 2 && pieceMap[move[move.length - 1]]) {
        // get the promotion piece
        promotion = pieceMap[move[move.length - 1]];
        // remove promotion piece from the move
        move = move.slice(0, -1);
    }

    // if the move starts with a piece letter, translate it
    if (pieceMap[move[0]]) {
        // add piece to the description
        description += pieceMap[move[0]] + " ";
        // remove the piece letter from the move
        move = move.slice(1);
    } else {
        // if the move does not start with a piece letter, it is a pawn move
        description += "Pawn ";
    }

    let disambiguation = "";

    // check for column disambiguation
    if (move.length > 2 && filesNames.includes(move[0])) {
        // add column disambiguation to the description
        disambiguation = "from column " + move[0] + " ";
        // remove column disambiguation from the move
        move = move.slice(1);
    }
    // check for row disambiguation
    else if (move.length > 2 && /\d/.test(move[0])) {
        // add row disambiguation to the description
        disambiguation = "from row " + move[0] + " ";
        // remove row disambiguation from the move
        move = move.slice(1);
    }

    if (capture) {
        // add capture description
        description += disambiguation + "captures on ";
        // remove the capture symbol
        move = move.replace("x", "");
    } else {
        // add move description
        description += disambiguation + "moves to ";
    }

    // add the file (column) and rank (row) to the description
    description += move[0] + " " + move[1];

    // add promotion if present
    if (promotion) {
        // add promotion to the description
        description += " and promotes to " + promotion;
    }

    // append check or checkmate status
    if (isCheckmate) {
        // add checkmate to the description
        description += " checkmate";
    } else if (isCheck) {
        // add check to the description
        description += " check";
    }
    
    return description;
}
