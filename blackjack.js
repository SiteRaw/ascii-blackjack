const suits = ['♥', '♦', '♣', '♠'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function createDeck() {
    const deck = [];

    // Generate the deck
    for (const suit of suits) {
        for (const rank of ranks) {
            deck.push({ rank, suit });
        }
    }

    // Fisher-Yates Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap elements
    }

    return deck;
}

function renderCard({ rank, suit }) {
    return `
+------+
|      |
| ${rank.padEnd(3, ' ')}${suit} |
|      |
+------+`;
}

function updateHand(handDiv, cards) {
    handDiv.innerHTML = '';
    cards.forEach(card => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.textContent = renderCard(card);
        handDiv.appendChild(cardDiv);
    });
}

function showPlayerTotal(total, iddiv) {
	document.getElementById(iddiv).innerHTML = total;
}

function calculatePlayerTotal(playerCards) {
    let total = 0;
    let hasAce = false;

    playerCards.forEach(card => {
        let rank = card['rank'];
        if (rank === 'Q' || rank === 'J' || rank === 'K') {
            total += 10; // Convert face cards to 10
        } else if (rank === 'A') {
            hasAce = true; // Mark that we have an Ace
            total += 11;   // Temporarily count Ace as 11
        } else {
            total += Number(rank); // Add numerical cards as they are
        }
    });

    // Adjust Ace value if total is over 21
    if (hasAce && total > 21) {
        total -= 10; // Count Ace as 1 instead of 11
    }

    return total;
}

// Function to calculate the total for the dealer or player
function calculatePlayerTotal(cards) {
    let total = 0;
    let aces = 0;

    // Calculate total and count aces
    for (let card of cards) {
        if (['J', 'Q', 'K'].includes(card.rank)) {
            total += 10;
        } else if (card.rank === 'A') {
            total += 11;
            aces += 1;
        } else {
            total += parseInt(card.rank);
        }
    }

    // Adjust for aces if total exceeds 21
    while (total > 21 && aces > 0) {
        total -= 10;
        aces -= 1;
    }

    return total;
}

// Function for the dealer's turn
function dealerTurn(bust = 0) {
    // Disable further actions for the player
    document.getElementById('hit-button').disabled = true;
    document.getElementById('hold-button').disabled = true;
    let dealerTotal = calculatePlayerTotal(dealerCards);

    while (bust === 0 && dealerTotal < 17 || (dealerTotal === 17 && dealerHasSoft17(dealerCards))) {
        dealerCards.push(deck.pop());
        dealerTotal = calculatePlayerTotal(dealerCards);
    }

    updateHand(dealerHandDiv, dealerCards); // Update dealer's hand visually
    let rtext = ["It's a tie!", "Player Wins!", "Dealer Wins!", "<strong>Blackjack!</strong> Player Wins!"];
    let result = determineWinner(playerTotal, dealerTotal);
    if(bust === 2) { result = 3; }
    document.getElementById('restart-button').disabled = false;
    document.getElementById('dtotal').innerHTML = "Dealer reveal: "+dealerTotal+" ... "+rtext[result];
}

// Helper function to check for a soft 17
function dealerHasSoft17(cards) {
    let total = 0;
    let aces = 0;

    for (let card of cards) {
        if (['J', 'Q', 'K'].includes(card.rank)) {
            total += 10;
        } else if (card.rank === 'A') {
            total += 11;
            aces += 1;
        } else {
            total += parseInt(card.rank);
        }
    }

    return total === 17 && aces > 0;
}

function determineWinner(playerTotal, dealerTotal) {
    if (playerTotal > 21) {
        return 2;
    } else if (dealerTotal > 21) {
        return 1;
    } else if (playerTotal === dealerTotal) {
        return 0;
    } else if (playerTotal > dealerTotal) {
        return 1;
    } else {
        return 2;
    }
}

const hidden = `+------+
|      |
|      |
|      |
+------+`;

// Game initialization
let deck = createDeck();
let playerCards = [deck.pop(), deck.pop()];
let dealerCards = [deck.pop(), deck.pop()];
let playerTotal = calculatePlayerTotal(playerCards);

const dealerHandDiv = document.getElementById('dealer-hand');
const playerHandDiv = document.getElementById('player-hand');

updateHand(dealerHandDiv, [dealerCards[0]]);
dealerHandDiv.innerHTML += '<div class="card">'+hidden+'</div>';
updateHand(playerHandDiv, playerCards);

if (playerTotal == 21) { dealerTurn(2); }

// HIT and HOLD buttons functionality
document.getElementById('hit-button').addEventListener('click', () => {
    playerCards.push(deck.pop());
    updateHand(playerHandDiv, playerCards);
    playerTotal = calculatePlayerTotal(playerCards);
    showPlayerTotal(playerTotal, 'ptotal');
    if (playerTotal >= 21) {
        // Automatically proceed to dealer's turn
        dealerTurn(1); // This is your function for the dealer's logic
    }
});

document.getElementById('hold-button').addEventListener('click', () => {
    updateHand(dealerHandDiv, dealerCards); // Reveal dealer's hand
    dealerTurn();
});

showPlayerTotal(playerTotal, 'ptotal');

// Function to reset the game
function restartGame() {
    // Reinitialize variables
    deck = createDeck();
    playerCards = [deck.pop(), deck.pop()];
    dealerCards = [deck.pop(), deck.pop()];
    playerTotal = calculatePlayerTotal(playerCards);

    // Reset the UI
    updateHand(dealerHandDiv, [dealerCards[0]]);
    dealerHandDiv.innerHTML += '<div class="card">' + hidden + '</div>';
    updateHand(playerHandDiv, playerCards);

    // Reset player total display
    showPlayerTotal(playerTotal, 'ptotal');

    // Enable HIT and HOLD buttons
    document.getElementById('hit-button').disabled = false;
    document.getElementById('hold-button').disabled = false;
    document.getElementById('dtotal').innerHTML = '';
}

// Add event listener for the "Start Over" button
document.getElementById('restart-button').addEventListener('click', restartGame);
