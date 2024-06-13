let formElem = document.forms[0],
    treeElem = document.querySelector('.tree-wrapper'),
    errorMessageElem = document.querySelector('.error-message'),
    exampleElem = document.querySelector('.example');

formElem.addEventListener('submit', initFunc);
exampleElem.addEventListener('click', copyExample);

function copyExample(e) {
    var copyText = e.target.innerHTML;
    navigator.clipboard.writeText(copyText);
}

let timeOutId;
function showErrorMessage(text) {
    errorMessageElem.innerHTML = text;
    treeElem.innerHTML = '';
    errorMessageElem.classList.add('show');
    clearTimeout(timeOutId);
    timeOutId = setTimeout(() => {
        errorMessageElem.classList.remove('show');
    }, 5000);
}

function initFunc(e) {
    e.preventDefault();
    const data = new FormData(e.target);
    let value = data.get('tree-string');
    if (!value) {
        showErrorMessage('Please, enter value');
        return false;
    }
    parseString(value);
}

function parseString(value) {
    let itemsArr = [];
    let id = 0;
    let parentId = 0;
    let currentLevel = 0;
    let currentValue = '';

    function pushCurrentValue() {
        if (currentValue) {
            id++;
            itemsArr.push({
                id,
                currentValue,
                parentId,
                currentLevel,
            });
            currentValue = '';
        }
    }

    for (let i = 0; i < value.length; i++) {
        switch (value[i]) {
            case '(':
                pushCurrentValue();
                if (itemsArr.length) {
                    parentId = itemsArr.at(-1).id;
                }
                currentLevel++;
                break;
            case ')':
                pushCurrentValue();
                if (parentId) {
                    parentId = itemsArr[parentId - 1]['parentId'];
                }
                currentLevel--;
                break;
            case ' ':
                pushCurrentValue();
                break;
            default:
                currentValue += value[i];
        }
    }
    pushCurrentValue();

    if (currentLevel) {
        showErrorMessage('Something is not right with brackets');
        return false;
    }

    drawTree(itemsArr);
}

function drawTree(itemsArr) {
    if (!itemsArr.length) {
        showErrorMessage('Your tree is empty');
        return false;
    }

    function getItemsLength() {
        let valuesArr = itemsArr.map((item) => item.currentValue);
        let longestItem = valuesArr.reduce(function (a, b) {
            return a.length > b.length ? a : b;
        });

        return longestItem.length + 4;
    }
    function checkParentSiblings(currentItem) {
        let childrensArr = itemsArr.filter((item) => {
            return currentItem.parentId
                ? item.parentId ==
                      itemsArr[currentItem.parentId - 1]['parentId'] &&
                      currentItem.id < item.id
                : false;
        });

        return childrensArr.length ? true : false;
    }
    function checkChildren(currentItem) {
        let childrensArr = itemsArr.filter(
            (item) => item.parentId == currentItem.id
        );

        return childrensArr.length ? true : false;
    }
    function drawParrentSibling(currentItem, currentLevel) {
        if (currentLevel > 0) {
            if (currentItem.parentId) {
                drawParrentSibling(
                    itemsArr[currentItem.parentId - 1],
                    currentLevel - 1
                );
            }
        }
        if (checkParentSiblings(currentItem)) {
            treeCode += '|'.padStart(itemMaxLength, ' ');
        } else {
            if (currentLevel > 0) {
                treeCode += ''.padStart(itemMaxLength, ' ');
            }
        }
    }
    function drawChildren(currentItem) {
        if (checkChildren(currentItem)) {
            treeCode += '+'.padStart(itemMaxLength, '-');
        }
    }
    function drawItem(currentItem) {
        drawParrentSibling(currentItem, currentItem.currentLevel);
        treeCode += currentItem.currentValue.padStart(itemMaxLength, ' ');
        drawChildren(currentItem);
    }

    let itemMaxLength = getItemsLength();

    let treeCode = '';
    itemsArr.forEach((item) => {
        treeCode += '<p>';
        drawItem(item);
        treeCode += '</p>';
    });
    treeElem.innerHTML = treeCode;
}
