window.addEventListener('DOMContentLoaded', (event) => {
    const exampleModel = document.querySelector('#example-model');
    const exampleText = document.querySelector('#example-text');
    exampleModel.addEventListener("click", event => {
        exampleText.setAttribute('value', 'success');
    });
  });