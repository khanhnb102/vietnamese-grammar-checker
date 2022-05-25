const labanApi = require('./labanApi');
const NO_END_STRING_CHARS = ['~', '`', '@', '#', '^', '&', '*', '_', '-', '+', '=',
    '{', '[', ']', '}', '|', '\\', ':', ';', '\'', ',', '<', '>', '/', '(', ' ']
const NEW_SENTENCE_CHARS = ['!', '?', ';', ':']
const NEW_LINE_CHARS = ['\n']
const NOT_USE_SPACE_BEFORE_AND_AFTER_CHARS = ['-', '/']
const MUST_USE_SPACE_BEFORE_AND_AFTER_CHARS = ['–', '&']
const USE_SPACE_BEFORE_AND_NOT_USE_AFTER_CHARS = ['(', '{', '[']
const USE_SPACE_AFTER_AND_NOT_USE_BEFORE_CHARS = [')', '}', ']', '%']
const DIFFERENCE_INDEX_WITH_LABAN = -1;
const CODE_SPECIAL_CHAR = 688;

const isWhiteSpaceChar = (char) => {
    return char === ' ';
}

const isAlphabeticChar = (char) => {
    return char.toLowerCase() != char.toUpperCase();
}

const isLowerCase = (char) => {
    return char === char.toLowerCase();
}

const isDigitChar = (char) => {
    return char >= '0' && char <= '9';
}

const syntaxChecker = async (inputText) => {
    if (inputText !== null && inputText !== undefined && typeof (inputText) === 'string' && inputText.length > 0) {
        const inputTextNomalizer = inputText.normalize("NFKC");
        var output = []
        var isFirstString = true;

        var needSpaceBefore = false;
        var needNoSpaceBefore = false;
        var needUpperCase = true;

        var isBeforeSpaceChar = false;
        var isBeforeAlphabetic = false;
        var isBeforeDigitChar = false;
        var isBeforeDot = false;
        var isBeforeComma = false;
        var numbDots = 0;
        var isBeforeNewLine = true;
        var isBeforeNewSentence = false;
        var isBeforeNoEndString = false;


        var startIndex = -1;
        var lastAlphabeticOrDigit = -1;
        var haveError = false;
        var violatedRuleIds = new Set()

        for (var i = 0; i < inputTextNomalizer.length; i++) {
            var char = inputTextNomalizer.charAt(i);
            if (isAlphabeticChar(char)) {
                var suggestedText = ''
                var endIndexTemp = i - 1;

                if (!needSpaceBefore && !isFirstString && !isBeforeNewLine) {
                    suggestedText = ' ';
                }

                if (needSpaceBefore) {
                    suggestedText = ' '
                    //rule 6
                    if (!isBeforeSpaceChar) {
                        violatedRuleIds.add(6)
                        if (!haveError) {
                            haveError = true;
                            if (startIndex === -1) {
                                startIndex = i;
                                endIndexTemp = i;
                            }
                        }
                    }
                }
                if (needUpperCase) {
                    if (isLowerCase(char)) {
                        endIndexTemp = i
                        //rule 2 or 7
                        if (isFirstString) {
                            violatedRuleIds.add(2)
                        } else {
                            violatedRuleIds.add(7)
                        }
                        if (!haveError) {
                            haveError = true
                            startIndex = i
                        }
                    }
                }

                if (needNoSpaceBefore && isBeforeSpaceChar) {
                    suggestedText = ''
                    if (!haveError) {
                        haveError = true;
                        startIndex = i -1;
                    }
                    if (!violatedRuleIds.has(5)) {
                        violatedRuleIds.add(5)
                    }
                }

                if (haveError) {
                    if (startIndex === i && needSpaceBefore && isBeforeSpaceChar) {
                        suggestedText = ''
                    }
                    if (endIndexTemp === i) {
                        if (needUpperCase) {
                            suggestedText = suggestedText + char.toUpperCase()
                        } else {
                            suggestedText = suggestedText + char
                        }
                    }
                    output.push({
                        'startIndex': startIndex,
                        'endIndex': endIndexTemp,
                        'violatedRuleIds': [...violatedRuleIds],
                        'mistakeText': inputTextNomalizer.substring(startIndex, endIndexTemp + 1),
                        'suggestedTexts': [suggestedText]
                    })
                    startIndex = -1;
                    haveError = false;
                    violatedRuleIds = new Set()
                }

                needSpaceBefore = false;
                needNoSpaceBefore = false;
                needUpperCase = false;

                isBeforeSpaceChar = false;
                isBeforeAlphabetic = true;
                isBeforeDigitChar = false;
                isBeforeDot = false;
                numbDots = 0;
                isBeforeNewLine = false;
                isBeforeNewSentence = false;
                isBeforeNoEndString = false;
                isBeforeComma = false;

                isFirstString = false;
                lastAlphabeticOrDigit = i;
            } else
                if (isDigitChar(char)) {
                    var suggestedText = ''
                    var endIndexTemp = i - 1;
                    if (!needSpaceBefore && !isFirstString && !isBeforeNewLine) {
                        suggestedText = ' ';
                    }
                    if (isBeforeDigitChar && (isBeforeComma || (isBeforeDot && numbDots ===1))) {
                        needSpaceBefore = false;
                        needNoSpaceBefore = true;
                    }
                    if (needSpaceBefore) {
                        suggestedText = ' '
                        if (!isBeforeSpaceChar) {
                            //rule 6
                            violatedRuleIds.add(6)
                            if (!haveError) {
                                suggestedText = suggestedText + char
                                haveError = true;
                                if (startIndex === -1) {
                                    startIndex = i;
                                    endIndexTemp = i;
                                }
                            }
                        }
                    }
                
                    if (needNoSpaceBefore && isBeforeSpaceChar) {
                        suggestedText = ''
                        if (!haveError) {
                            haveError = true;
                            startIndex = i -1;
                        }
                        if (!violatedRuleIds.has(5)) {
                            violatedRuleIds.add(5)
                        }
                    }

                    if (haveError) {
                        output.push({
                            'startIndex': startIndex,
                            'endIndex': endIndexTemp,
                            'violatedRuleIds': [...violatedRuleIds],
                            'mistakeText': inputTextNomalizer.substring(startIndex, endIndexTemp + 1),
                            'suggestedTexts': [suggestedText]
                        })
                        startIndex = -1;
                        haveError = false;
                        violatedRuleIds = new Set()
                    }
                    needSpaceBefore = false;
                    needNoSpaceBefore = false;
                    needUpperCase = false;

                    isBeforeSpaceChar = false;
                    isBeforeAlphabetic = false;
                    isBeforeDigitChar = true;
                    isBeforeDot = false;
                    numbDots = 0;
                    isBeforeNewLine = false;
                    isBeforeNoEndString = false;
                    isBeforeComma = false;

                    isFirstString = false;
                    lastAlphabeticOrDigit = i;
                } else {
                    if (isBeforeNewLine) {
                        haveError = true;
                        if (startIndex === -1) {
                            if (isFirstString) {
                                //rule 1
                                startIndex = i - 1;
                                if (startIndex < 0) {
                                    startIndex = 0;
                                }
                                violatedRuleIds.add(1)
                            } else {
                                //rule 10
                                startIndex = i;
                                violatedRuleIds.add(10)
                            }
                        }
                        // needSpaceBefore = false;
                        // needUpperCase = false;

                        // isBeforeSpaceChar = false;
                        isBeforeAlphabetic = false;
                        isBeforeDigitChar = false;
                        // isBeforeDot = false;
                        // numbDots = 0;
                        // isBeforeNewLine = true;
                        // isBeforeNoEndString = false;
                        // isBeforeComma = false

                        // isFirstString = false;
                    } else {
                            if (char === '.') {
                                if (isFirstString) {
                                    haveError = true;
                                    if (startIndex === -1) {
                                        //rule 1
                                        startIndex = i;
                                        violatedRuleIds.add(1)
                                    }
                                } else {
                                    // if (isBeforeSpaceChar && !haveError) {
                                    //     haveError = true;
                                    //     // rule 3
                                    //     if (startIndex === -1) {
                                    //         startIndex = i - 1;
                                    //         violatedRuleIds.add(3)
                                    //     }
                                    // } else
                                    if (isBeforeDot) {
                                        if (numbDots === 1 || numbDots === 3) {
                                            haveError = true;
                                            // rule 5
                                            if (startIndex === -1) {
                                                startIndex = i;
                                                violatedRuleIds.add(5)
                                            }
                                            lastAlphabeticOrDigit = i -1;
                                        } else
                                            if (numbDots === 2) {
                                                haveError = false;
                                                // remove rule 5
                                                if (startIndex !== -1) {
                                                    startIndex = -1;
                                                    violatedRuleIds = new Set()
                                                }
                                            }
                                    } else {
                                        if (haveError) {
                                            output.push({
                                                'startIndex': startIndex,
                                                'endIndex': i - 1,
                                                'violatedRuleIds': [...violatedRuleIds],
                                                'mistakeText': inputTextNomalizer.substring(startIndex, i),
                                                'suggestedTexts': ['']
                                            })
                                            startIndex = -1;
                                            haveError = false;
                                            violatedRuleIds = new Set()
                                        } else {
                                            if (isBeforeSpaceChar || isBeforeNewLine || isBeforeComma) {
                                                violatedRuleIds.add(5)
                                                output.push({
                                                    'startIndex': i - 1,
                                                    'endIndex': i - 1,
                                                    'violatedRuleIds': [...violatedRuleIds],
                                                    'mistakeText': inputTextNomalizer.substring(i - 1, i),
                                                    'suggestedTexts': ['']
                                                })
                                            }
                                            violatedRuleIds = new Set()
                                        }
                                    }
                                }

                                needSpaceBefore = true;
                                needNoSpaceBefore = false;
                                if (numbDots < 2) {
                                    needUpperCase = true;
                                } else {
                                    needUpperCase = false;
                                }

                                isBeforeSpaceChar = false;
                                isBeforeAlphabetic = false;
                                // isBeforeDigitChar = false;
                                isBeforeDot = true;
                                numbDots++;

                                isBeforeNewLine = false;
                                isBeforeNewSentence = true;
                                isBeforeNoEndString = false;
                                isBeforeComma = false;
                                if (numbDots === 1 || numbDots === 3) {
                                    if (!isFirstString) {
                                        lastAlphabeticOrDigit = i;
                                    }
                                } 
                            } else
                                if (NEW_LINE_CHARS.includes(char)) {
                                    if (isBeforeNewLine) {
                                        //add rule 10
                                        if (!haveError) {
                                            haveError = true
                                            if (startIndex === -1) {
                                                startIndex = i;
                                                violatedRuleIds.add(10)
                                            }
                                        }
                                    } else
                                        if (isBeforeNoEndString) {
                                            //add rule 9
                                            if (!violatedRuleIds.has(9)) {
                                                violatedRuleIds.add(9)
                                            }
                                            var tempStartIndex = i - 1;
                                            if (haveError) {
                                                tempStartIndex = startIndex
                                            }
                                            output.push({
                                                'startIndex': tempStartIndex,
                                                'endIndex': i - 1,
                                                'violatedRuleIds': [...violatedRuleIds],
                                                'mistakeText': inputTextNomalizer.substring(tempStartIndex, i),
                                                'suggestedTexts': ['']
                                            })
                                            startIndex = -1;
                                            haveError = false;
                                            violatedRuleIds = new Set()
                                        } else {
                                            if (haveError) {
                                                output.push({
                                                    'startIndex': startIndex,
                                                    'endIndex': i - 1,
                                                    'violatedRuleIds': [...violatedRuleIds],
                                                    'mistakeText': inputTextNomalizer.substring(startIndex, i),
                                                    'suggestedTexts': ['']
                                                })
                                                startIndex = -1;
                                                haveError = false;
                                                violatedRuleIds = new Set()
                                            }
                                        }
                                    needSpaceBefore = false;
                                    needNoSpaceBefore = false;
                                    needUpperCase = true;

                                    isBeforeSpaceChar = false;
                                    isBeforeAlphabetic = false;
                                    isBeforeDigitChar = false;
                                    isBeforeDot = false;
                                    numbDots = 0;
                                    isBeforeNewLine = true;
                                    isBeforeNewSentence = false;
                                    isBeforeNoEndString = false;
                                    isBeforeComma = false;
                                }
                                else {
                                        if (NEW_SENTENCE_CHARS.includes(char)) {
                                            if (haveError) {
                                                output.push({
                                                    'startIndex': startIndex,
                                                    'endIndex': i - 1,
                                                    'violatedRuleIds': [...violatedRuleIds],
                                                    'mistakeText': inputTextNomalizer.substring(startIndex, i),
                                                    'suggestedTexts': ['']
                                                })
                                                startIndex = -1;
                                                haveError = false;
                                                violatedRuleIds = new Set()
                                            } else {
                                                if (isBeforeSpaceChar || isBeforeNewLine || isBeforeComma || isBeforeDot) {
                                                    violatedRuleIds.add(5)
                                                    output.push({
                                                        'startIndex': i - 1,
                                                        'endIndex': i - 1,
                                                        'violatedRuleIds': [...violatedRuleIds],
                                                        'mistakeText': inputTextNomalizer.substring(i - 1, i),
                                                        'suggestedTexts': ['']
                                                    })
                                                }
                                                violatedRuleIds = new Set()
                                            }
                                            needSpaceBefore = true;
                                            needNoSpaceBefore = false;
                                            needUpperCase = true;

                                            isBeforeSpaceChar = false;
                                            isBeforeAlphabetic = false;
                                            isBeforeDigitChar = false;
                                            isBeforeDot = false;
                                            numbDots = 0;
                                            isBeforeNewLine = false;
                                            isBeforeNewSentence = true;
                                            isBeforeNoEndString = false;
                                            isBeforeComma = false;
                                            if (!isFirstString) {
                                                lastAlphabeticOrDigit = i;
                                            }
                                        } else {
                                            if (char === ',') {
                                                if (isFirstString) {
                                                    haveError = true;
                                                    if (startIndex === -1) {
                                                        //rule 1
                                                        startIndex = i;
                                                        violatedRuleIds.add(1)
                                                    }
                                                } else {
                                                    if (isBeforeComma) {
                                                        if (!haveError) {
                                                            // rule 5
                                                            if (!violatedRuleIds.has(5)) {
                                                                violatedRuleIds.add(5)
                                                            }
                                                            haveError = true;
                                                            if (startIndex === -1) {
                                                                startIndex = i;
                                                            }
                                                        }
                                                    }
                                                    if (isBeforeSpaceChar && !haveError) {
                                                        haveError = true;
                                                        // rule 5
                                                        if (startIndex === -1) {
                                                            startIndex = i - 1;
                                                            violatedRuleIds.add(5)
                                                        }
                                                    }
                                                    if (haveError && (isBeforeSpaceChar || isBeforeAlphabetic || isBeforeDigitChar)) {
                                                        output.push({
                                                            'startIndex': startIndex,
                                                            'endIndex': i - 1,
                                                            'violatedRuleIds': [...violatedRuleIds],
                                                            'mistakeText': inputTextNomalizer.substring(startIndex, i),
                                                            'suggestedTexts': ['']
                                                        })
                                                        startIndex = -1;
                                                        haveError = false;
                                                        violatedRuleIds = new Set()
                                                    }
                                                }
                                               
                                                needSpaceBefore = true;
                                                needNoSpaceBefore = false;
                                                needUpperCase = false;

                                                isBeforeSpaceChar = false;
                                                isBeforeAlphabetic = false;
                                                // isBeforeDigitChar = false;
                                                isBeforeDot = false;
                                                numbDots = 0;
                                                isBeforeNewLine = false;
                                                isBeforeNewSentence = false;
                                                isBeforeNoEndString = true;
                                                isBeforeComma = true;
                                            } 
                                            else 
                                            if (NOT_USE_SPACE_BEFORE_AND_AFTER_CHARS.includes(char)) {
                                                if (isFirstString) {
                                                    haveError = true;
                                                    if (startIndex === -1) {
                                                        //rule 1
                                                        startIndex = i;
                                                        violatedRuleIds.add(1)
                                                    }
                                                } else {
                                                    if (isBeforeSpaceChar && !haveError) {
                                                        haveError = true;
                                                        // rule 5
                                                        if (startIndex === -1) {
                                                            startIndex = i - 1;
                                                            violatedRuleIds.add(5)
                                                        }
                                                    }
                                                    if (haveError && (isBeforeSpaceChar || isBeforeAlphabetic || isBeforeDigitChar)) {
                                                        output.push({
                                                            'startIndex': startIndex,
                                                            'endIndex': i - 1,
                                                            'violatedRuleIds': [...violatedRuleIds],
                                                            'mistakeText': inputTextNomalizer.substring(startIndex, i),
                                                            'suggestedTexts': ['']
                                                        })
                                                        startIndex = -1;
                                                        haveError = false;
                                                        violatedRuleIds = new Set()
                                                    }
                                                }
                                               
                                                needSpaceBefore = false;
                                                needNoSpaceBefore = true;
                                                needUpperCase = false;

                                                isBeforeSpaceChar = false;
                                                isBeforeAlphabetic = false;
                                                isBeforeDigitChar = false;
                                                isBeforeDot = false;
                                                numbDots = 0;
                                                isBeforeNewLine = false;
                                                isBeforeNewSentence = false;
                                                isBeforeNoEndString = true;
                                                isBeforeComma = false;
                                            } else 
                                            if (USE_SPACE_AFTER_AND_NOT_USE_BEFORE_CHARS.includes(char)) {
                                                if (isFirstString) {
                                                    haveError = true;
                                                    if (startIndex === -1) {
                                                        //rule 1
                                                        startIndex = i;
                                                        violatedRuleIds.add(1)
                                                    }
                                                } else {
                                                    if (isBeforeSpaceChar && !haveError) {
                                                        haveError = true;
                                                        // rule 6
                                                        if (startIndex === -1) {
                                                            startIndex = i - 1;
                                                            violatedRuleIds.add(6)
                                                        }
                                                    }
                                                    if (haveError && (isBeforeSpaceChar || isBeforeAlphabetic || isBeforeDigitChar)) {
                                                        output.push({
                                                            'startIndex': startIndex,
                                                            'endIndex': i -1,
                                                            'violatedRuleIds': [...violatedRuleIds],
                                                            'mistakeText': inputTextNomalizer.substring(startIndex, i),
                                                            'suggestedTexts': ['']
                                                        })
                                                        startIndex = -1;
                                                        haveError = false;
                                                        violatedRuleIds = new Set()
                                                    }
                                                }
                                               
                                                needSpaceBefore = true;
                                                needNoSpaceBefore = false;
                                                needUpperCase = false;

                                                isBeforeSpaceChar = false;
                                                isBeforeAlphabetic = false;
                                                isBeforeDigitChar = false;
                                                isBeforeDot = false;
                                                numbDots = 0;
                                                isBeforeNewLine = false;
                                                isBeforeNewSentence = false;
                                                isBeforeNoEndString = true;
                                                isBeforeComma = false;
                                            }
                                            else
                                            if (USE_SPACE_BEFORE_AND_NOT_USE_AFTER_CHARS.includes(char)) {
                                                if (isFirstString) {
                                                    haveError = true;
                                                    if (startIndex === -1) {
                                                        //rule 1
                                                        startIndex = i;
                                                        violatedRuleIds.add(1)
                                                    }
                                                } else {
                                                    if (!isBeforeSpaceChar && !haveError) {
                                                        haveError = true;
                                                        // rule 6
                                                        if (startIndex === -1) {
                                                            startIndex = i;
                                                            violatedRuleIds.add(6)
                                                        }
                                                    }
                                                    if (haveError && (isBeforeSpaceChar || isBeforeAlphabetic || isBeforeDigitChar)) {
                                                        output.push({
                                                            'startIndex': startIndex,
                                                            'endIndex': i,
                                                            'violatedRuleIds': [...violatedRuleIds],
                                                            'mistakeText': inputTextNomalizer.substring(startIndex, i + 1),
                                                            'suggestedTexts': [' ' + char]
                                                        })
                                                        startIndex = -1;
                                                        haveError = false;
                                                        violatedRuleIds = new Set()
                                                    }
                                                }
                                               
                                                needSpaceBefore = false;
                                                needNoSpaceBefore = true;
                                                needUpperCase = false;

                                                isBeforeSpaceChar = false;
                                                isBeforeAlphabetic = false;
                                                isBeforeDigitChar = false;
                                                isBeforeDot = false;
                                                numbDots = 0;
                                                isBeforeNewLine = false;
                                                isBeforeNewSentence = false;
                                                isBeforeNoEndString = true;
                                                isBeforeComma = false;
                                            } else
                                            if (MUST_USE_SPACE_BEFORE_AND_AFTER_CHARS.includes(char)) {
                                                if (isFirstString) {
                                                    haveError = true;
                                                    if (startIndex === -1) {
                                                        //rule 1
                                                        startIndex = i;
                                                        violatedRuleIds.add(1)
                                                    }
                                                } else {
                                                    if (!isBeforeSpaceChar && !haveError) {
                                                        haveError = true;
                                                        // rule 6
                                                        if (startIndex === -1) {
                                                            startIndex = i - 1;
                                                            violatedRuleIds.add(6)
                                                        }
                                                    }
                                                    if (haveError && (isBeforeSpaceChar || isBeforeAlphabetic || isBeforeDigitChar)) {
                                                        output.push({
                                                            'startIndex': startIndex,
                                                            'endIndex': i-1,
                                                            'violatedRuleIds': [...violatedRuleIds],
                                                            'mistakeText': inputTextNomalizer.substring(startIndex, i),
                                                            'suggestedTexts': [' ']
                                                        })
                                                        startIndex = -1;
                                                        haveError = false;
                                                        violatedRuleIds = new Set()
                                                    }
                                                }
                                               
                                                needSpaceBefore = true;
                                                needNoSpaceBefore = false;
                                                needUpperCase = false;

                                                isBeforeSpaceChar = false;
                                                isBeforeAlphabetic = false;
                                                isBeforeDigitChar = false;
                                                isBeforeDot = false;
                                                numbDots = 0;
                                                isBeforeNewLine = false;
                                                isBeforeNewSentence = false;
                                                isBeforeNoEndString = true;
                                                isBeforeComma = false;
                                            }
                                            else      
                                            if (isWhiteSpaceChar(char)) {
                    
                                                isBeforeSpaceChar = true;
                                                isBeforeAlphabetic = false;
                                                // isBeforeDigitChar = false;
                                                // isBeforeDot = false;
                                                // numbDots = 0;
                                                isBeforeNewLine = false;
                                                isBeforeNewSentence = false
                                                isBeforeNoEndString = true;
                                                // isBeforeComma = false;
                    
                                                // isFirstString = false;
                                            } else {
                                                // other char
                                                if (char.charCodeAt(0)>= CODE_SPECIAL_CHAR) {
                                                    // special char
                                                    if(!violatedRuleIds.has(12)) {
                                                        violatedRuleIds.add(12)
                                                    }
                                                    if (!haveError) {
                                                        haveError = true;
                                                        if (startIndex === -1) {
                                                            startIndex = i;
                                                        }
                                                    }
                                                }
                                                needSpaceBefore = false;
                                                needNoSpaceBefore = false;
                                                needUpperCase = false;

                                                isBeforeSpaceChar = false;
                                                isBeforeAlphabetic = false;
                                                isBeforeDigitChar = false;
                                                isBeforeDot = false;
                                                numbDots = 0;
                                                isBeforeNewLine = false;
                                                isBeforeNewSentence = false;
                                                isBeforeNoEndString = false;
                                                isBeforeComma = false;
                                            }
                                            if (i === inputTextNomalizer.length - 1) {
                                                if (NO_END_STRING_CHARS.includes(char)) {
                                                    //rule 4
                                                    violatedRuleIds.add(4)
                                                    if (haveError) {
                                                        output.push({
                                                            'startIndex': startIndex,
                                                            'endIndex': i,
                                                            'violatedRuleIds': [...violatedRuleIds],
                                                            'mistakeText': inputTextNomalizer.substring(startIndex, i + 1),
                                                            'suggestedTexts': ['']
                                                        })
                                                        startIndex = -1;
                                                        haveError = false;
                                                        violatedRuleIds = new Set()
                                                    } else {
                                                        var tempStartIndex = i;
                                                        // if (isBeforeSpaceChar) {
                                                        //     tempStartIndex = i - 1
                                                        // }
                                                        if (lastAlphabeticOrDigit != -1) {
                                                            tempStartIndex = lastAlphabeticOrDigit + 1
                                                        }
                                                        output.push({
                                                            'startIndex': tempStartIndex,
                                                            'endIndex': i,
                                                            'violatedRuleIds': [...violatedRuleIds],
                                                            'mistakeText': inputTextNomalizer.substring(tempStartIndex, i + 1),
                                                            'suggestedTexts': ['']
                                                        })
                                                    }
                                                    startIndex = -1;
                                                    haveError = false;
                                                    violatedRuleIds = new Set()
                                                } else {
                                                    if (haveError) {
                                                        output.push({
                                                            'startIndex': startIndex,
                                                            'endIndex': i -1,
                                                            'violatedRuleIds': [...violatedRuleIds],
                                                            'mistakeText': inputTextNomalizer.substring(startIndex, i),
                                                            'suggestedTexts': ['']
                                                        })
                                                        startIndex = -1;
                                                        haveError = false;
                                                        violatedRuleIds = new Set()
                                                    }
                                                }
                                            } 
                                        }
                                }
                    }
                }
        }
        return output;
    }
    return null;
}
const semanticChecker = async (inputText) => {
    const rs = await labanApi.getData(inputText)
    if (rs.status === 200) {
        console.log(rs.data)
        return rs.data
    } else {
        return null;
    }
}
/**
 * 
 * @param {*} array1 format     'startIndex': int,
                                'endIndex': int,
                                'violatedRuleIds': array(int),
                                'mistakeText': string,
                                'suggestedTexts': array[string]
 * @param {*} array2 
 */
const mergeArrayGrammar = (array1, array2) => {
    const inputArray = [...array1, ...array2]
    inputArray.sort((a, b) => {
        if (a.startIndex !== b.startIndex) {
            return a.startIndex - b.startIndex;
        } else {
            return b.endIndex - a.endIndex;
        }
    });
    let output = [];
    let startIndex = -1;
    for (item of inputArray) {
        if (item.startIndex >= startIndex) {
            // add output
            output.push(item)
            startIndex = item.endIndex + 1
        }
    }
    return output;
}
/**
 * 
 * @param {*} inputText 
 * @returns 
 */
const checkVNGrammar = async (inputText) => {
    try {
        // check input
        if (inputText !== null && inputText !== undefined && typeof (inputText) === 'string' && inputText.length > 0) {
            const rsSemanticAsync = semanticChecker(inputText)
            const rsSyntax = await syntaxChecker(inputText)
            const rsSemanticInput = await rsSemanticAsync;
            let rsSemantic = []
            if (rsSemanticInput != null) {
                let offset = 0;
                if (rsSemanticInput.result && rsSemanticInput.result.length > 0) {
                    for (result of rsSemanticInput.result) {
                        offset = offset + DIFFERENCE_INDEX_WITH_LABAN;
                        for (mistake of result.mistakes) {
                            let startOffset = offset + mistake.start_offset;
                            let startIndex = inputText.indexOf(mistake.text, startOffset);
                            while (startIndex === -1 && startOffset > 0) {
                                offset = offset - 1;
                                startOffset = offset + mistake.start_offset;
                                startIndex = inputText.indexOf(mistake.text, startOffset);
                            }
                            let suggestedTexts = []
                            if (mistake.suggest.length > 0) {
                                for (suggestedText of mistake.suggest) {
                                    suggestedTexts.push(suggestedText[0])
                                }
                            }
                            rsSemantic.push({
                                'startIndex': startIndex,
                                'endIndex': startIndex + mistake.text.length - 1,
                                'violatedRuleIds': [11],
                                'mistakeText': mistake.text,
                                'suggestedTexts': suggestedTexts
                            })
                        }
                        offset = offset + result.text.length + DIFFERENCE_INDEX_WITH_LABAN
                        if (offset < -1) {
                            offset = -1
                        }
                    }
                }

            }

            return mergeArrayGrammar(rsSemantic, rsSyntax)
        }
    } catch (e) {

    }
    return null;
}

module.exports = { checkVNGrammar: checkVNGrammar };
// const inputText = "vs chỉnh sửa ads adada fda afda faf adf af af a !#@!#@%#@!$#@!3 \nGiúp người dùng hạne chế bị từ chối bởi những lỗi sai do chính tã gây ra trong quá trình tạo ads ";
// const inputText = "đi hà nội không    . "
// checkVNGrammar(inputText).then(rs => {
//     console.log(rs);
// })
// const input1 = "chi,bbcbc,. hhhh. [abc,,, ancb, HHHH]]]]]";
// const input1 = "chúng tôi có thịt chó chấm mắm tôm, cà chua.... và nhiều sản phẩm khác";
// const input1 = '[()]  chuẩn.1 hóa .. dấu,về  ,,.kiểu   phổ  ..... thông  \n . \n   Ví dụ : [hoà] -> [hòa]  ~]]] \n vạn ⬋⬋⬋ vật sinh sôi'
// // const input1 = 'Trời đất dung thứ, \nvạn ⬋⬋⬋ vật sinh sôi'
// const input1 = 'Mua nhà vinhomes trả góp 0đ trong 2 năm ,. chỉ cần trả trước 15)400tr/căn 1pn'
// // const input1 = 'a "Phá tan " quy chuẩn cũ'
// checkVNGrammar(input1).then(rs => {
//     console.log(rs);
// })
// const output2 = checkVNGrammar(input2)
// console.log(input2)
// console.log(output2);