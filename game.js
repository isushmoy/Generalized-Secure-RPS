const crypto = require('crypto');

// Class for generating cryptographically secure keys and HMACs
class Security {
    static generateKey() {
        return crypto.randomBytes(32).toString('hex');  // 256-bit key
    }

    static generateHMAC(key, move) {
        return crypto.createHmac('sha256', key).update(move).digest('hex');
    }
}

// Class for handling the rules of the game
class Rules {
    constructor(moves) {
        this.moves = moves;
        this.numMoves = moves.length;
    }

    getWinner(playerMove, computerMove) {
        const playerIndex = this.moves.indexOf(playerMove);
        const computerIndex = this.moves.indexOf(computerMove);

        if (playerIndex === computerIndex) return 'Draw';

        const half = Math.floor(this.numMoves / 2);

        // Check who wins based on the circular order of moves
        if ((computerIndex > playerIndex && computerIndex <= playerIndex + half) || 
            (computerIndex + this.numMoves <= playerIndex + half)) {
            return 'Computer Wins';
        } else {
            return 'Player Wins';
        }
    }

    static validateMoves(moves) {
        if (moves.length % 2 === 0 || moves.length < 3) {
            throw new Error('The number of moves must be an odd number greater than or equal to 3.');
        }

        const uniqueMoves = new Set(moves);
        if (uniqueMoves.size !== moves.length) {
            throw new Error('Moves must be unique.');
        }
    }
}

// Class for generating the help table (ASCII Table)
class HelpTable {
    constructor(moves) {
        this.moves = moves;
    }

    generateTable() {
        const numMoves = this.moves.length;
        let table = '      | ' + this.moves.join(' | ') + ' |\n';
        table += '----------------------------------------\n';

        for (let i = 0; i < numMoves; i++) {
            table += this.moves[i].padEnd(6) + '| ';
            for (let j = 0; j < numMoves; j++) {
                if (i === j) {
                    table += 'Draw'.padEnd(6);
                } else {
                    const winner = new Rules(this.moves).getWinner(this.moves[i], this.moves[j]);
                    table += (winner === 'Player Wins' ? 'Win' : 'Lose').padEnd(6);
                }
                table += '| ';
            }
            table += '\n';
        }

        console.log(table);
    }
}

// Main class for running the game
class Game {
    constructor(moves) {
        Rules.validateMoves(moves);
        this.moves = moves;
        this.rules = new Rules(moves);
        this.security = new Security();
        this.key = Security.generateKey();
        this.computerMove = this.moves[Math.floor(Math.random() * this.moves.length)];
        this.hmac = Security.generateHMAC(this.key, this.computerMove);
    }

    start() {
        console.log(`HMAC: ${this.hmac}`);
        this.displayMenu();
    }

    displayMenu() {
        console.log('\nMake your choice:');
        this.moves.forEach((move, index) => {
            console.log(`${index + 1} - ${move}`);
        });
        console.log('0 - Exit');
        console.log('h - Help');
        this.promptUser();
    }

    promptUser() {
        const stdin = process.stdin;
        stdin.setEncoding('utf-8');

        stdin.on('data', (input) => {
            input = input.trim();
            if (input === '0') {
                console.log('Exiting the game.');
                process.exit(0);
            } else if (input === 'h') {
                new HelpTable(this.moves).generateTable();
                this.displayMenu();
            } else {
                const choice = parseInt(input);
                if (choice >= 1 && choice <= this.moves.length) {
                    const playerMove = this.moves[choice - 1];
                    this.determineOutcome(playerMove);
                } else {
                    console.log('Invalid choice. Try again.');
                    this.displayMenu();
                }
            }
        });
    }

    determineOutcome(playerMove) {
        console.log(`Your move: ${playerMove}`);
        console.log(`Computer's move: ${this.computerMove}`);

        const result = this.rules.getWinner(playerMove, this.computerMove);
        console.log(result);

        console.log(`Key: ${this.key}`);
        process.exit(0);
    }
}

// Main program execution
const moves = process.argv.slice(2);
if (moves.length === 0) {
    console.error('Please provide moves as command-line arguments (e.g., Rock Paper Scissors).');
    process.exit(1);
}

try {
    const game = new Game(moves);
    game.start();
} catch (err) {
    console.error(err.message);
    console.log('Example: node game.js Rock Paper Scissors Lizard Spock');
    process.exit(1);
}
