;var EN2BG = (function() {
    'use strict';
    var storage = window.localStorage;
    var excapeWordArray = ['---', 'EN', 'BG', 'Коментар'];
    var symbolArray = null;
    var wordArray = JSON.parse(storage.getItem('wordArray')) || [];
    var sep = '*****';
    var inputField = document.getElementById('search-word');
    var searchBtn = document.getElementById('search-btn');
    var resultBG = document.getElementById('result-bg');
    var resultEN = document.getElementById('result-en');
    var errorDiv = document.getElementById('error');
    var searchResult = '';

    function genReg(word) {
        return new RegExp('(\\|){0,1}(\\s)*' + word + '(\\s)*(\\|){0,1}', "\g");
    }

    function replaceWithNL(text, expr) {
        return text.replace(expr, '\n');
    }

    function parseWord(line) {
        var lineArr = line.replace(/(\s)*\|(\s)*/, sep).split(sep);
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
            var respText = this.responseText;
            if(respText.length  === wordArray.length) {
                wordArray = JSON.parse(storage.get('wordArray'));
                return ready();
            }
            parser(respText);
            storage.setItem('wordArray', JSON.stringify(wordArray));
            ready();
        });
        req.open("GET", "https://raw.githubusercontent.com/stelf/en2bg4term/master/readme.md");
        req.send();
    });

    function setSearchResult(result) {
        errorDiv.classList.add('hidden');
        result.forEach(function(el){
            console.log(el);
        });
    }

    function setError(message) {
        errorDiv.innerHTML = message;
        errorDiv.classList.remove('hidden');
    }

    function search(event) {
        var inputValue = inputField.value;
        inputField.value = '';
        var firstChar = inputValue[0];
        if(!firstChar) setError('Моля въведете текст!');
        var symbolIndex = symbolArray.indexOf(inputValue[0].toUpperCase());
        if(symbolIndex === -1) return setError('Няма намерени резултати.');
        var re = new RegExp("\n" + inputValue + "(.*)\n", "g");
        var resultArray = wordArray[symbolIndex].match(re);
        if(resultArray === null) return setError('Няма намерени резултати.');
        return setSearchResult(resultArray.map(parseWord));
    }

    searchBtn.addEventListener('click', search);
}());
