window.addEventListener('DOMContentLoaded', (event) => {
    const exampleModel = document.querySelector('#model-treasureBox');
    exampleModel.addEventListener("click", event => {
        // 點選後設定animation-mixer屬性
        exampleModel.setAttribute('animation-mixer', 'loop: once');
        // 2秒後JV哥貓頭出現並觸發動畫
        setTimeout(function() {
            var testModel = document.getElementById('model-JVhead');
            testModel.setAttribute('animation', 'property: scale; to: 1 1 1; dur: 2000; easing: easeInOutQuad');
            exampleModel.setAttribute('animation', 'property: scale; to: 0 0 0; dur: 2000; easing: easeInOutQuad');

        }, 2000);
    });
  });