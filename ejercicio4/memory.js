class Card {
    constructor(name, img) {
        this.name = name;
        this.img = img;
        this.isFlipped = false;
        this.element = this.#createCardElement();
    }

    #createCardElement() {
        const cardElement = document.createElement("div");
        cardElement.classList.add("cell");
        cardElement.innerHTML = `
          <div class="card" data-name="${this.name}">
              <div class="card-inner">
                  <div class="card-front"></div>
                  <div class="card-back">
                      <img src="${this.img}" alt="${this.name}">
                  </div>
              </div>
          </div>
      `;
        return cardElement;
    }

    #flip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.add("flipped");
    }

    #unflip() {
        const cardElement = this.element.querySelector(".card");
        cardElement.classList.remove("flipped");
    }
    toggleFlip(){
        this.isFlipped = !this.isFlipped
        this.isFlipped ? this.#flip() : this.#unflip() 
    }
    matches(otherCard){
        return this.name=== otherCard.name;
    }
}

class Board {
    constructor(cards) {
        this.cards = cards;
        this.fixedGridElement = document.querySelector(".fixed-grid");
        this.gameBoardElement = document.getElementById("game-board");
    }

    #calculateColumns() {
        const numCards = this.cards.length;
        let columns = Math.floor(numCards / 2);

        columns = Math.max(2, Math.min(columns, 12));

        if (columns % 2 !== 0) {
            columns = columns === 11 ? 12 : columns - 1;
        }

        return columns;
    }

    #setGridColumns() {
        const columns = this.#calculateColumns();
        this.fixedGridElement.className = `fixed-grid has-${columns}-cols`;
    }
    shuffleCards(){
        this.cards.sort(() => Math.random() - 0.5);
        this.render();
    }
    flipDownAllCards(){
        this.cards.forEach(card =>{
            if (card.isFlipped){
                card.toggleFlip();
            }
        });
    }
    reset(){
        this.shuffleCards();
        this.flipDownAllCards();
    }

    render() {
        this.#setGridColumns();
        this.gameBoardElement.innerHTML = "";
        this.cards.forEach((card) => {
            card.element
                .querySelector(".card")
                .addEventListener("click", () => this.onCardClicked(card));
            this.gameBoardElement.appendChild(card.element);
        });
    }

    onCardClicked(card) {
        if (this.onCardClick) {
            this.onCardClick(card);
        }
    }
}

class MemoryGame {
    constructor(board, flipDuration = 500) {
        this.board = board;
        this.flippedCards = [];
        this.matchedCards = [];
        if (flipDuration < 350 || isNaN(flipDuration) || flipDuration > 3000) {
            flipDuration = 350;
            alert(
                "La duración de la animación debe estar entre 350 y 3000 ms, se ha establecido a 350 ms"
            );
        }
        this.flipDuration = flipDuration;
        this.board.onCardClick = this.#handleCardClick.bind(this);
        this.board.reset();
        this.startTimer();
    }

    #handleCardClick(card) {
        if (this.flippedCards.length < 2 && !card.isFlipped) {
            card.toggleFlip();
            this.flippedCards.push(card);

            if (this.flippedCards.length === 2) {
                setTimeout(() => this.checkForMatch(), this.flipDuration);
            }
        }
    }
    checkForMatch(){
        const [card1, card2] = this.flippedCards;
        if( card1.matches(card2)){
            this.matchedCards.push(card1, card2);
            if(this.matchedCards.length === this.board.cards.length){
                this.endGame();
            }
        }else{
            card1.toggleFlip();
            card2.toggleFlip();
        }
        this.flippedCards =[];
    }
    resetGame(){
        this.board.reset();
        this.flippedCards = [];
        this.matchedCards = [];
        this.moves = 0;
        this.startTime = null;
        this.stopTimer();
        this.startTimer();
    }
    startTimer(){
        this.startTime = Date.now();
        this.timerInterval = setInterval(()=>{
            const elapsedTime = Math.floor((Date.now()-this.startTime)/ 1000);
            document.getElementById('timer').textContent =`Tiempo: ${elapsedTime} s`;
        }, 1000);
    }
    stopTimer(){
        clearInterval(this.timerInterval);
    }
    endGame(){
        this.stopTimer();
        const elapsedTime = Math.floor((Date.now()- this.startTime)/1000);
        alert(`Finalizo el juego. Movimientos: ${this.moves}, Tiempo: ${elapsedTime} s`);

    }
}

document.addEventListener("DOMContentLoaded", () => {
    const cardsData = [
        { name: "Python", img: "./img/Python.svg" },
        { name: "JavaScript", img: "./img/JS.svg" },
        { name: "Java", img: "./img/Java.svg" },
        { name: "CSharp", img: "./img/CSharp.svg" },
        { name: "Go", img: "./img/Go.svg" },
        { name: "Ruby", img: "./img/Ruby.svg" },
    ];

    const cards = cardsData.flatMap((data) => [
        new Card(data.name, data.img),
        new Card(data.name, data.img),
    ]);
    const board = new Board(cards);
    const memoryGame = new MemoryGame(board, 1000);

    document.getElementById("restart-button").addEventListener("click", () => {
        memoryGame.resetGame();
    });
});
