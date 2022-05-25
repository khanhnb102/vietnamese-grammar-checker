const axios = require('axios')

exports.getData = async (inputText) => {
    const form = new URLSearchParams();
    form.append('text', JSON.stringify(inputText));
    form.append('app_type', 'zad')
    var options = {
        method: 'POST',
        url: 'https://nlp.laban.vn/wiki/spelling_checker_api/',
        headers:
        {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        data: form,
        json: true
    };
    const res = await axios(options)
    return res
}