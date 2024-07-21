// https://opentdb.com/api.php?amount=3&category=17&difficulty=medium

const myRow = document.querySelector(".row");
const form = document.querySelector("#quizOptions");
const categoryMenu = document.querySelector("#categoryMenu");
const difficultyOptions = document.querySelector("#difficultyOptions");
const questionsNumber = document.querySelector("#questionsNumber");
const btn = document.querySelector("#startQuiz");

let questions;
let myQuiz;
btn.addEventListener("click", async function () {
  if (
    categoryMenu.value == "" ||
    difficultyOptions.value == "" ||
    questionsNumber.value == ""
  ) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please fill all the fields!",
    });
    return;
  }
  let category = categoryMenu.value;
  let difficulty = difficultyOptions.value;
  let questionsNum = questionsNumber.value;

  myQuiz = new Quiz(category, difficulty, questionsNum);

  questions = await myQuiz.getAllQuestions();
  console.log(questions);
  form.classList.replace("d-flex", "d-none");

  let myQuestion = new Question(0);
  myQuestion.display();
});

//==========================================//

class Quiz {
  constructor(category, difficulty, questionsNum) {
    this.category = category;
    this.difficulty = difficulty;
    this.questionsNum = questionsNum;
    this.score = 0;
  }

  getApi() {
    return `https://opentdb.com/api.php?amount=${this.questionsNum}&category=${this.category}&difficulty=${this.difficulty}`;
  }

  async getAllQuestions() {
    let response = await fetch(this.getApi());
    let finalData = await response.json();

    return finalData.results;
  }

  showResult() {
    return `
      <div
        class="question shadow-lg col-lg-12  p-4 rounded-3 d-flex flex-column justify-content-center align-items-center gap-3"
      >
        <h2 class="mb-0"> ${
          this.score == this.questionsNum
            ? `congratulation 🎉`
            : `Your Score is ${this.score}  of ${this.questionsNum} question`
        }  </h2>
        <button class="again btn btn-primary rounded-pill"><i class="bi bi-arrow-repeat"></i> Try Again</button>
      </div>
    `;
  }
}

class Question {
  constructor(index) {
    this.index = index;
    this.question = questions[index].question;
    this.category = questions[index].category;
    this.difficulty = questions[index].difficulty;
    this.incorrectAnswers = questions[index].incorrect_answers;
    this.correctAnswer = questions[index].correct_answer;
    this.allAnswers = this.getAllAnswers();
    this.isAnswered = false;
  }

  getAllAnswers() {
    let allAnswers = [...this.incorrectAnswers, this.correctAnswer];
    allAnswers.sort();

    return allAnswers;
  }

  display() {
    const container = `
      <div
        class="question shadow-lg col-lg-6 p-4 rounded-3 d-flex flex-column justify-content-center align-items-center gap-3 animate__animated animate__bounceIn"
      >
        <div class="w-100 d-flex justify-content-between">
          <span class="btn btn-category">${this.category}</span>
          <span class="fs-6 btn btn-questions"> ${this.index + 1} of ${
      questions.length
    } </span>
        </div>
        <h2 class="text-capitalize h4 text-center">${this.question}</h2>  
        <ul class="choices w-100 list-unstyled m-0 d-flex flex-wrap text-center">
        
  ${this.allAnswers.map((answer) => `<li>${answer}</li>`).join("")}
        </ul>
        <h2 class="text-capitalize text-center score-color h3 fw-bold"><i class="bi bi-emoji-laughing"></i> Score: ${
          myQuiz.score
        } </h2>        
      </div>
    `;

    myRow.innerHTML = container;

    let allChoices = document.querySelectorAll(".choices li");

    allChoices.forEach((li) => {
      li.addEventListener("click", () => {
        this.checkAnswer(li);
        this.nextQuestion();
      });
    });
  }

  checkAnswer(choice) {
    if (!this.isAnswered) {
      this.isAnswered = true;
      if (choice.innerHTML == this.correctAnswer) {
        choice.classList.add("correct", "animate__animated", "animate__pulse");
        myQuiz.score++;
      } else {
        choice.classList.add("wrong", "animate__animated", "animate__shakeX");
      }
    }
  }

  nextQuestion() {
    this.index++;

    setTimeout(() => {
      if (this.index < questions.length) {
        let nextQuestion = new Question(this.index);
        nextQuestion.display();
      } else {
        let results = myQuiz.showResult();
        myRow.innerHTML = results;
      }

      document.querySelector(".again").addEventListener("click", () => {
        window.location.reload();
      });
    }, 1500);
  }
}
