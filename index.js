const NO_END_STRING_CHARS = ['~', '`', '@', '#', '^', '&', '*', '_', '-', '+', '=',
    '{', '[', ']', '}', '|', '\\', ':', ';', '\'', ',', '<', '>', '/', '(']
const NEW_SENTENCE_CHARS = ['.', '!', '?', ';', ':', '...']
const NEW_LINE_CHARS = ['\n']
const USE_SPACE_AFTER_CHARS = [',']

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

const checkVNGrammer = (inputText) => {
    if (inputText !== null && inputText !== undefined && typeof (inputText) === 'string' && inputText.length > 0) {
        const inputTextNomalizer = inputText.normalize("NFKC");
        var output = []
        var isFirstString = true;

        var needSpace = false;
        var needUpperCase = true;

        var isBeforeSpaceChar = false;
        var isBeforeAlphabetic = false;
        var isBeforeDigitChar = false;
        var isBeforeDot = false;
        var numbDots = 0;
        var isBeforeNewLine = true;
        var isBeforeNewSentence = false;
        var isBeforeNoEndString = false;
        var isBeforeUsedGroupSpaceAfterChar = false;


        var startIndex = -1;
        var lastAlphabeticOrDigit = -1;
        var haveError = false;
        var violatedRuleIds = []

        for (var i = 0; i < inputTextNomalizer.length; i++) {
            var char = inputTextNomalizer.charAt(i);
            if (isAlphabeticChar(char)) {
                var suggestedText = ''
                var endIndexTemp = i - 1;

                if (!needSpace && !isFirstString && !isBeforeNewLine) {
                    suggestedText = ' ';
                }

                if (needSpace) {
                    suggestedText = ' '
                    //rule 6
                    if (!isBeforeSpaceChar) {
                        violatedRuleIds.push(6)
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
                            violatedRuleIds.push(2)
                        } else {
                            violatedRuleIds.push(7)
                        }
                        if (!haveError) {
                            haveError = true
                            startIndex = i
                        }
                    }
                }

                if (haveError) {
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
                        'violatedRuleIds': violatedRuleIds,
                        'mistakeText': inputTextNomalizer.substring(startIndex, endIndexTemp + 1),
                        'suggestedText': suggestedText
                    })
                    startIndex = -1;
                    haveError = false;
                    violatedRuleIds = []
                }

                needSpace = false;
                needUpperCase = false;

                isBeforeSpaceChar = false;
                isBeforeAlphabetic = true;
                isBeforeDigitChar = false;
                isBeforeDot = false;
                numbDots = 0;
                isBeforeNewLine = false;
                isBeforeNewSentence = false;
                isBeforeNoEndString = false;
                isBeforeUsedGroupSpaceAfterChar = false;

                isFirstString = false;
                lastAlphabeticOrDigit = i;
            } else
                if (isDigitChar(char)) {
                    var suggestedText = ''
                    var endIndexTemp = i - 1;
                    if (!needSpace && !isFirstString && !isBeforeNewLine) {
                        suggestedText = ' ';
                    }

                    if (needSpace) {
                        suggestedText = ' '
                        if (!isBeforeSpaceChar) {
                            //rule 6
                            violatedRuleIds.push(6)
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

                    if (haveError) {
                        output.push({
                            'startIndex': startIndex,
                            'endIndex': endIndexTemp,
                            'violatedRuleIds': violatedRuleIds,
                            'mistakeText': inputTextNomalizer.substring(startIndex, endIndexTemp + 1),
                            'suggestedText': suggestedText
                        })
                        startIndex = -1;
                        haveError = false;
                        violatedRuleIds = []
                    }
                    needSpace = false;
                    needUpperCase = false;

                    isBeforeSpaceChar = false;
                    isBeforeAlphabetic = false;
                    isBeforeDigitChar = true;
                    isBeforeDot = false;
                    numbDots = 0;
                    isBeforeNewLine = false;
                    isBeforeNoEndString = false;
                    isBeforeUsedGroupSpaceAfterChar = false;

                    isFirstString = false;
                    lastAlphabeticOrDigit = i;
                } else {
                    if (isBeforeNewLine) {
                        haveError = true;
                        if (startIndex === -1) {
                            if (isFirstString) {
                                //rule 1
                                startIndex = i - 1;
                                violatedRuleIds.push(1)
                            } else {
                                //rule 10
                                startIndex = i;
                                violatedRuleIds.push(10)
                            }
                        }
                        // needSpace = false;
                        // needUpperCase = false;

                        // isBeforeSpaceChar = false;
                        isBeforeAlphabetic = false;
                        isBeforeDigitChar = false;
                        // isBeforeDot = false;
                        // numbDots = 0;
                        // isBeforeNewLine = true;
                        // isBeforeNoEndString = false;
                    // isBeforeUsedGroupSpaceAfterChar = false

                        // isFirstString = false;
                    } else {
                        if (isWhiteSpaceChar(char)) {
                            if (isFirstString) {
                                haveError = true;
                                if (startIndex === -1) {
                                    //rule 1
                                    startIndex = i;
                                    violatedRuleIds.push(1)
                                }
                            } else {
                                if (isBeforeSpaceChar && !haveError) {
                                    haveError = true;
                                    // rule 3
                                    if (startIndex === -1) {
                                        startIndex = i - 1;
                                        violatedRuleIds.push(3)
                                    }
                                }
                            }
                            // if (needSpace) {
                            //     needSpace = false;
                            // }
                            // needUpperCase = false;

                            isBeforeSpaceChar = true;
                            isBeforeAlphabetic = false;
                            isBeforeDigitChar = false;
                            isBeforeDot = false;
                            numbDots = 0;
                            isBeforeNewLine = false;
                            isBeforeNewSentence = false
                            isBeforeNoEndString = false;
                            isBeforeUsedGroupSpaceAfterChar = false;

                            // isFirstString = false;
                        } else
                            if (char === '.') {
                                if (isFirstString) {
                                    haveError = true;
                                    if (startIndex === -1) {
                                        //rule 1
                                        startIndex = i;
                                        violatedRuleIds.push(1)
                                    }
                                } else {
                                    // if (isBeforeSpaceChar && !haveError) {
                                    //     haveError = true;
                                    //     // rule 3
                                    //     if (startIndex === -1) {
                                    //         startIndex = i - 1;
                                    //         violatedRuleIds.push(3)
                                    //     }
                                    // } else
                                    if (isBeforeDot) {
                                        if (numbDots === 1 || numbDots === 3) {
                                            haveError = true;
                                            // rule 5
                                            if (startIndex === -1) {
                                                startIndex = i;
                                                violatedRuleIds.push(5)
                                            }
                                        } else
                                            if (numbDots === 2) {
                                                haveError = false;
                                                // remove rule 5
                                                if (startIndex !== -1) {
                                                    startIndex = -1;
                                                    violatedRuleIds = []
                                                }
                                            }
                                    } else {
                                        if (haveError) {
                                            output.push({
                                                'startIndex': startIndex,
                                                'endIndex': i - 1,
                                                'violatedRuleIds': violatedRuleIds,
                                                'mistakeText': inputTextNomalizer.substring(startIndex, i),
                                                'suggestedText': ''
                                            })
                                            startIndex = -1;
                                            haveError = false;
                                            violatedRuleIds = []
                                        } else {
                                            if (isBeforeSpaceChar || isBeforeNewLine || isBeforeUsedGroupSpaceAfterChar) {
                                                violatedRuleIds.push(5)
                                                output.push({
                                                    'startIndex': i - 1,
                                                    'endIndex': i - 1,
                                                    'violatedRuleIds': violatedRuleIds,
                                                    'mistakeText': inputTextNomalizer.substring(i - 1, i),
                                                    'suggestedText': ''
                                                })
                                            }
                                            violatedRuleIds = []
                                        }
                                    }
                                }

                                needSpace = true;
                                if (numbDots < 2) {
                                    needUpperCase = true;
                                } else {
                                    needUpperCase = false;
                                }

                                isBeforeSpaceChar = false;
                                isBeforeAlphabetic = false;
                                isBeforeDigitChar = false;
                                isBeforeDot = true;
                                numbDots++;
                               
                                isBeforeNewLine = false;
                                isBeforeNewSentence = true;
                                isBeforeNoEndString = false;
                                isBeforeUsedGroupSpaceAfterChar = false;
                            } else
                                if (NEW_LINE_CHARS.includes(char)) {
                                    if (isBeforeNewLine) {
                                        //add rule 10
                                        if (!haveError) {
                                            haveError = true
                                            if (startIndex === -1) {
                                                startIndex = i;
                                                violatedRuleIds.push(10)
                                            }
                                        }
                                    } else
                                        if (isBeforeNoEndString) {
                                            //add rule 9
                                            violatedRuleIds.push(9)
                                            var tempStartIndex = i - 1;
                                            if (haveError) {
                                                tempStartIndex = startIndex
                                            }
                                            output.push({
                                                'startIndex': tempStartIndex,
                                                'endIndex': i - 1,
                                                'violatedRuleIds': violatedRuleIds,
                                                'mistakeText': inputTextNomalizer.substring(tempStartIndex, i),
                                                'suggestedText': ''
                                            })
                                            startIndex = -1;
                                            haveError = false;
                                            violatedRuleIds = []
                                        } else {
                                            if (haveError) {
                                                output.push({
                                                    'startIndex': startIndex,
                                                    'endIndex': i - 1,
                                                    'violatedRuleIds': violatedRuleIds,
                                                    'mistakeText': inputTextNomalizer.substring(startIndex, i),
                                                    'suggestedText': ''
                                                })
                                                startIndex = -1;
                                                haveError = false;
                                                violatedRuleIds = []
                                            }
                                        }
                                    needSpace = false;
                                    needUpperCase = true;

                                    isBeforeSpaceChar = false;
                                    isBeforeAlphabetic = false;
                                    isBeforeDigitChar = false;
                                    isBeforeDot = false;
                                    numbDots = 0;
                                    isBeforeNewLine = true;
                                    isBeforeNewSentence = false;
                                    isBeforeNoEndString = false;
                                    isBeforeUsedGroupSpaceAfterChar = false;
                                }
                                else {
                                    if (i === inputTextNomalizer.length - 1) {
                                        if (NO_END_STRING_CHARS.includes(char)) {
                                            //rule 4
                                            violatedRuleIds.push(4)
                                            if (haveError) {
                                                output.push({
                                                    'startIndex': startIndex,
                                                    'endIndex': i,
                                                    'violatedRuleIds': violatedRuleIds,
                                                    'mistakeText': inputTextNomalizer.substring(startIndex, i + 1),
                                                    'suggestedText': ''
                                                })
                                                startIndex = -1;
                                                haveError = false;
                                                violatedRuleIds = []
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
                                                    'violatedRuleIds': violatedRuleIds,
                                                    'mistakeText': inputTextNomalizer.substring(tempStartIndex, i + 1),
                                                    'suggestedText': ''
                                                })
                                            }
                                            startIndex = -1;
                                            haveError = false;
                                            violatedRuleIds = []
                                        }
                                        isBeforeSpaceChar = false;
                                        isBeforeAlphabetic = false;
                                        isBeforeDigitChar = false;
                                        isBeforeDot = false;
                                        numbDots = 0;
                                        isBeforeNewLine = false;
                                        isBeforeNewSentence = false;
                                        isBeforeNoEndString = true;
                                        isBeforeUsedGroupSpaceAfterChar = false;
                                    } else
                                        if (NEW_SENTENCE_CHARS.includes(char)) {
                                            if (haveError) {
                                                output.push({
                                                    'startIndex': startIndex,
                                                    'endIndex': i - 1,
                                                    'violatedRuleIds': violatedRuleIds,
                                                    'mistakeText': inputTextNomalizer.substring(startIndex, i),
                                                    'suggestedText': ''
                                                })
                                                startIndex = -1;
                                                haveError = false;
                                                violatedRuleIds = []
                                            } else {
                                                if (isBeforeSpaceChar || isBeforeNewLine || isBeforeUsedGroupSpaceAfterChar || isBeforeDot) {
                                                    violatedRuleIds.push(5)
                                                    output.push({
                                                        'startIndex': i - 1,
                                                        'endIndex': i - 1,
                                                        'violatedRuleIds': violatedRuleIds,
                                                        'mistakeText': inputTextNomalizer.substring(i - 1, i),
                                                        'suggestedText': ''
                                                    })
                                                }
                                                violatedRuleIds = []
                                            }
                                            needSpace = true;
                                            needUpperCase = true;

                                            isBeforeSpaceChar = false;
                                            isBeforeAlphabetic = false;
                                            isBeforeDigitChar = false;
                                            isBeforeDot = false;
                                            numbDots = 0;
                                            isBeforeNewLine = false;
                                            isBeforeNewSentence = true;
                                            isBeforeNoEndString = false;
                                            isBeforeUsedGroupSpaceAfterChar = false;
                                        } else
                                            if (USE_SPACE_AFTER_CHARS.includes(char)) {
                                                if (isBeforeUsedGroupSpaceAfterChar) {
                                                    if (!haveError) {
                                                        // rule 6
                                                        violatedRuleIds.push(5)
                                                        haveError = true;
                                                        if (startIndex === -1) {
                                                            startIndex = i;
                                                        }
                                                    }
                                                }
                                                needSpace = true;
                                                needUpperCase = false;

                                                isBeforeSpaceChar = false;
                                                isBeforeAlphabetic = false;
                                                isBeforeDigitChar = false;
                                                isBeforeDot = false;
                                                numbDots = 0;
                                                isBeforeNewLine = false;
                                                isBeforeNewSentence = false;
                                                isBeforeNoEndString = false;
                                                isBeforeUsedGroupSpaceAfterChar = true;
                                            } else {
                                                // other char
                                                needSpace = false;
                                                needUpperCase = false;

                                                isBeforeSpaceChar = false;
                                                isBeforeAlphabetic = false;
                                                isBeforeDigitChar = false;
                                                isBeforeDot = false;
                                                numbDots = 0;
                                                isBeforeNewLine = false;
                                                isBeforeNewSentence = false;
                                                isBeforeNoEndString = false;
                                                isBeforeUsedGroupSpaceAfterChar = false;
                                            }
                                }
                    }
                }
        }
        return output;
    }
    return null;
}

module.exports = { checkVNGrammer: checkVNGrammer };
// const input1 = "chi,bbcbc,. hhhh. [abc,,, ancb, HHHH]]]]]";
// const input1 = "chúng tôi có thịt chó chấm mắm tôm, cà chua.... và nhiều sản phẩm khác";
// const input1 = '[()]  chuẩn.1 hóa .. dấu,về  ,.kiểu   phổ  ..... thông  \n . \n   Ví dụ : [hoà] -> [hòa]  ~]]]'
// const output1 = checkVNGrammer(input1)
// const output2 = checkVNGrammer(input2)
// console.log(output1)
// console.log(input2)
// console.log(output2);
// loi ,. chua bac dc
// loi space ở ký tự đầu tiên