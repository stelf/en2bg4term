;(function() {
    'use strict';
    var inputField = document.getElementById('search-word');
    var resultCell = document.getElementById('result-cell');
    var searchBtn = document.getElementById('search-btn');
    var resultBox = document.getElementById('result-box');
    var resultBG = document.getElementById('result-bg');
    var resultEN = document.getElementById('result-en');
    var errorDiv = document.getElementById('error');
    var excapeWordArray = ['---', 'EN', 'BG', 'Коментар'];
    var symbolArray = null;
    var wordArray = null;
    var sep = '*****';
    var searchResult = '';

    function genReg(word) {
        return new RegExp('(\\|){0,1}(\\s)*' + word + '(\\s)*(\\|){0,1}', "\g");
    }

    function replaceWithNL(text, expr) {
        return text.replace(expr, '\n');
    }

    function parseWord(line) {
        var lineArr = line.replace(/(\s)*\|(\s)*/g, sep).split(sep);
        return {
            en: lineArr[0] || null,
            bg: lineArr[1] || null,
            comment: lineArr[2] || null
        };
    }

    function identity(x) {
        return x;
    }

    function ready() {
        console.log('ready');
    }

    function parser(respText) {
        var re = /### [A-Z]/g;
        respText = excapeWordArray.map(genReg).reduce(replaceWithNL, respText);
        symbolArray = respText.match(re).map(function(el) { return el.replace('### ', ''); });
        wordArray = respText.split(re).slice(1);
    }

    document.addEventListener("DOMContentLoaded", function() {
        var req = new XMLHttpRequest();
        req.addEventListener("load", function loadHandeler() {
            parser(this.responseText);
            ready();
        });
        req.open("GET", "https://raw.githubusercontent.com/stelf/en2bg4term/master/readme.md");
        req.send();
    });

    function setSearchResult(result) {
        errorDiv.classList.add('hidden');
        result.forEach(function(el, index) {
            var newCell = resultCell.cloneNode(true);
            newCell.id = 'cell-' + index;
            newCell.querySelector('.result-bg').innerHTML = el.bg;
            newCell.querySelector('.result-en').innerHTML = el.en;
            /*if(!el.comment) {
                var comment = newCell.querySelector('.result-comment');
                comment.innerHTML = el.comment;
                newCell.querySelector('.comment-icon').classList.remove('hidden');
            }*/
            newCell.classList.remove('hidden');
            resultBox.appendChild(newCell);
        });
    }

    function setError(message) {
        errorDiv.innerHTML = message;
        errorDiv.classList.remove('hidden');
    }

    function search(event) {
        resultBox.classList.remove('hidden');
        resultBox.innerHTML = '';
        var inputValue = inputField.value;
        //inputField.value = '';
        var firstChar = inputValue[0];
        if(!firstChar) return setError('Моля въведете текст!');
        var symbolIndex = symbolArray.indexOf(inputValue[0].toUpperCase());
        if(symbolIndex === -1) return setError('Няма намерени резултати.');
        var re = new RegExp("^" + inputValue + ".*", "gm");
        var resultArray = wordArray[symbolIndex].match(re);
        if(resultArray === null) return setError('Няма намерени резултати.');
        return setSearchResult(resultArray.map(parseWord));
    }

    function selectText() {
        inputField.select();
    }

    function isPropertySupported(property) {
        return property in document.body.style;
    }

    var hasBGC = isPropertySupported('background-clip') || isPropertySupported('-webkit-background-clip');
    var hasTFC = isPropertySupported('-webkit-text-fill-color') || isPropertySupported('text-fill-color');

    if(!hasBGC || !hasTFC) {
        var enFlag = document.getElementById('en-flag');
        var bgFlag = document.getElementById('bg-flag');
        enFlag.style.backgroundImage = 'none';
        enFlag.style.color = 'white';

        bgFlag.style.backgroundImage = 'none';
        bgFlag.style.color = 'white';
    }

    function keyUpHandler(e) {
        if (e.keyCode == 13) search();
    }

    function tableClick(e) {
        return;
        var target = e.target;
        if(target.classList.contains('comment-holder') || target.classList.contains('comment-icon')) {
            target.parentNode.querySelector('.result-comment').classList.toggle('hidden');
        }
    }

    searchBtn.addEventListener('click', search);
    inputField.addEventListener('click', selectText);
    inputField.addEventListener('keyup', keyUpHandler);
    resultBox.addEventListener('click', tableClick);
}());
