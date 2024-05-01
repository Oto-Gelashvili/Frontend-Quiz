const jsonFilePath = './data.json';

document.addEventListener("DOMContentLoaded", function() {
  const body = document.body;
  let selectedSubjects = [];
  let selectedTypes =[];
  let selectedAmountOfQuestions;

  if (body.id === "index") {
    // JavaScript code specific to the landing page (index.html)
    // This could include event listeners for sliders, checkboxes, start button, etc.
  const slider = document.getElementById("slider");
 const labelValue = document.querySelector(".label-value");
 const sliderLabel = document.querySelector(".slider-label");
 sliderDisplay();
 function sliderDisplay(){
 let max = parseInt(slider.getAttribute("max"));
 let min = parseInt(slider.getAttribute("min"));
 let sliderStepAmount = max - min;  
 let stepPercent = 100/sliderStepAmount;
 let currentMarginLeft = 15;
 let marginLeftByStep = currentMarginLeft/sliderStepAmount;
 labelValue.innerHTML = slider.value;
    document.documentElement.style.setProperty('--progress', (slider.value*stepPercent)-stepPercent*slider.getAttribute("min") + "%");
    sliderLabel.style.left = (slider.value*stepPercent)-stepPercent*slider.getAttribute("min") + "%";
    // -7.5 is starting margin when value is 0,so we start from there and add marginLeftByStep accordingly
    sliderLabel.style.marginLeft = -7.5 + slider.value*-marginLeftByStep + (min * marginLeftByStep) + "px";
 }
 slider.addEventListener("input",function (){
    sliderDisplay();
 });
 
 function updateSliderValues(){
  if(selectedBtns<2){
    slider.setAttribute("min",1);
    slider.setAttribute("max",10);
    slider.value=5;
    sliderDisplay();

  }else if(selectedBtns === 2){
      slider.setAttribute("min",10);
      slider.setAttribute("max",20);
      slider.value=15;
      sliderDisplay();

  }else{
      slider.setAttribute("min",10);
      slider.setAttribute("max",30);
      slider.value=20;
      sliderDisplay();
    }
}

 document.addEventListener("keydown", function(event) {
   if (event.key === "Enter") {
       const focusedElement = document.activeElement;
       if (focusedElement.tagName === "LABEL" && focusedElement.htmlFor) {
           const associatedCheckbox = document.getElementById(focusedElement.htmlFor);
           if (associatedCheckbox && associatedCheckbox.type === "checkbox") {
               associatedCheckbox.checked = !associatedCheckbox.checked;
           }
       }
   }
});

  const buttons = document.querySelectorAll("button");
  const startBtn = document.querySelector(".start");
  const buttonsP = document.querySelector(".buttons p");
  let selectedBtns = 1;
  const form = document.querySelector('.types');
  const typesLabels = document.querySelectorAll(".types label")

  function isAnyCheckboxChecked() {
      const checkboxes = form.querySelectorAll('input[type="checkbox"]');
          for (let checkbox of checkboxes) {
        if (checkbox.checked) {
          return true;
        }
      }
      return false;
    }

  buttons.forEach(function(button) {
      button.addEventListener("click", function() {
          if (!button.classList.contains("start")) {
              if (this.classList.contains('button-selected')){
                  selectedBtns--;
                  this.classList.toggle("button-selected");
                  updateSliderValues();
              }else{
                  selectedBtns++;
                  this.classList.toggle("button-selected");
                  updateSliderValues();
              }
          }else {
              if(selectedBtns>0 && isAnyCheckboxChecked()){
                  for(let i=0;i<buttons.length;i++){
                    if(buttons[i].classList.contains('button-selected')){
                      selectedSubjects.push(buttons[i].innerText);
                    }
                  }
                  for (let j = 0; j < typesLabels.length; j++) {
                    const computedStyle = window.getComputedStyle(typesLabels[j]);
                    const backgroundColor = computedStyle.getPropertyValue("background-color");
                    if (backgroundColor === "rgb(166, 41, 240)") {
                      selectedTypes.push(typesLabels[j].innerText);
                    }
                  }             
                  selectedAmountOfQuestions = slider.value;
                  // we send data to Session Storage
                  sessionStorage.setItem('selectedSubjects', JSON.stringify(selectedSubjects));
                  sessionStorage.setItem('selectedTypes', JSON.stringify(selectedTypes));
                  sessionStorage.setItem('selectedAmountOfQuestions', selectedAmountOfQuestions);
                  window.location.href = 'quiz.html';
              }else{
                  this.style.borderColor = "red";
                  this.style.animation = "none"; // Reset animation state
                  void this.offsetHeight; // Trigger reflow
                  this.style.animation = "wrong 0.2s "; // Reapply animation
                  buttonsP.style.color = "red";
                  buttonsP.innerText = "pick at least one type and subject";
                  setTimeout(function() {
                      buttonsP.innerText = "Pick subjects below:";
                      buttonsP.style.color = "#808FA4";
                      startBtn.style.border = "none";
                  }, 2000);
              }
          }
      });
  });
  }else if (body.id === "quiz") {
    // JavaScript code specific to the quiz page (quiz.html)
    const questionText = document.querySelector("h2");
    const nextQuestion = document.querySelector(".next");
    const quizButtons = document.querySelectorAll(".answer-container button ");
    const quizButtonsP = document.querySelectorAll(".answer-container button p");
    const storedSubjects = sessionStorage.getItem('selectedSubjects');
    selectedSubjects = storedSubjects ? JSON.parse(storedSubjects) : [];
    const storedTypes = sessionStorage.getItem('selectedTypes');
    selectedTypes = storedTypes ? JSON.parse(storedTypes) : [];
    const storedSelectedAmountOfQuestionst = sessionStorage.getItem('selectedAmountOfQuestions');
    selectedAmountOfQuestions = storedSelectedAmountOfQuestionst;
    let validQuestions = [];

    
    fetch(jsonFilePath)
      .then(questionsData => {
        if (!questionsData.ok) {
          throw new Error('File not found or other network error');
        }
        return questionsData.json();
      })
      .then(questionsData => {
        const questions = questionsData.questions;
        for (const questionKey in questions) {
          const question = questions[questionKey];
          if (selectedSubjects.includes(question.subject) && selectedTypes.includes(question.type)) {
            validQuestions.push(questionKey);
          }
        }
        let actualCorrectAnswer;
        let answerCount = 0;
        let correctAnswerCount = 0;
        function displayQuestionsAndAnswers() {
          const randomIndex = Math.floor(Math.random() * validQuestions.length);
          if (selectedAmountOfQuestions > 0) {
            questionText.innerText = questions[validQuestions[randomIndex]].question;
            actualCorrectAnswer =  questions[validQuestions[randomIndex]].correctAnswer;
            for(let i=0;i<questions[validQuestions[randomIndex]].answer.length;i++){
              quizButtonsP[i].innerText = questions[validQuestions[randomIndex]].answer[i];
            }
            quizButtons.forEach(button => {
              button.addEventListener("click", function() {
                if(answerCount === 0){
                  const questionOrderContainer = document.querySelector(".text-container-scroll p");
                  if(button.innerText.includes(actualCorrectAnswer)){
                    button.style.backgroundColor ="#95BF90 ";
                    correctAnswerCount++;
                    answerCount--;
                    if(selectedAmountOfQuestions === 0){
                      questionOrderContainer.innerText = `Quiz complete, your score is ${correctAnswerCount}/${totalQuestions}`;
                      nextQuestion.innerText = "Go back To main Page";
                    }
                  }else{
                    button.style.backgroundColor ="#C1339C ";
                    answerCount--;
                    if(selectedAmountOfQuestions === 0){
                      questionOrderContainer.innerText = `Quiz complete, your score is ${correctAnswerCount}/${totalQuestions}`;
                      nextQuestion.innerText = "Go back To main Page";
                    }
                  }
                }
                questionText.innerText = actualCorrectAnswer;
              });
            });
            validQuestions.splice(randomIndex, 1);
            selectedAmountOfQuestions--;
          } else {
            questionText.innerText = "Enough questions for now!";
          }
        }
        let quetionOrder = 1;
        let totalQuestions = selectedAmountOfQuestions;
        displayQuestionOrder();
        displayQuestionsAndAnswers();
        nextQuestion.addEventListener("click", function(){
          if(answerCount<0){
          displayQuestionsAndAnswers();
          displayQuestionOrder();
          quizButtons.forEach(button=>{
            button.style.backgroundColor ="rgb(60, 76, 103)";
          })
          }
          if(nextQuestion.innerText === "Go back To main Page"){
            window.location.href = 'index.html';
          }
          answerCount = 0;
        });

        function displayQuestionOrder(){
          const questionOrderContainer = document.querySelector(".text-container-scroll p");
          if(quetionOrder<=totalQuestions){
            questionOrderContainer.innerText = `Question ${quetionOrder} of ${totalQuestions}`;
            quetionOrder++;
          }
        }
      })
      .catch(error => {
        console.error('There was a problem fetching the data:', error);
      });
  }
});
