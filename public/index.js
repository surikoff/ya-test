'use strict';

class Form {

    constructor(id, timeout) {
        this.formID = id;
        $(id).on('submit', () => this.submit.apply(this));
    }

    validate(fields) {
        let result = {
            isValid: true,
            errorFields: []
        }

        if (!/(\s*[^\s.-]+-?[^\s.-]*){3}$/.test(fields.fio)) result.errorFields.push('fio');

        if (!/^([a-z0-9_-]+\.)*[a-z0-9_-]+@(ya.ru|yandex.ru|yandex.ua|yandex.by|yandex.kz|yandex.com)$/.test(fields.email)) result.errorFields.push('email');

        let isPhone = /^((\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/.test(fields.phone);

        let sum = 0;
        for (let i = 0; i < fields.phone.length; i++) {
            let d = parseInt(fields.phone.charAt(i))
            if (!isNaN(d)) sum += d;
        }
        if ((!isPhone) || (sum > 30)) result.errorFields.push('phone');

        if (result.errorFields.length) result.isValid = false;
        return result;
    }

    getData() {
        let fields = {};
        $(this.formID + ' input').each((index, item) => fields[$(item)[0].id] = $(item).val());
        return fields;
    }

    setData(fields) {
        $(this.formID + ' #fio').val(fields.fio);
        $(this.formID + ' #email').val(fields.email);
        $(this.formID + ' #phone').val(fields.phone);
    }

    submit() {
        let fields = this.getData();
        let res = this.validate(fields);
        $(this.formID + ' input').each((index, item) => {
            if (res.errorFields.indexOf($(item)[0].id) != -1) $(item).addClass('error')
            else $(item).removeClass('error');
        });
        if (!res.isValid) return false;

        $(this.formID + ' #submitButton').attr('disabled', true);
        $(this.formID + ' #submitButton').addClass('disabled');
        this.query(fields, this);
        return false;
    }

    query(fields, self) {
        fetch($(self.formID).attr('action'), {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                method: 'post',
                body: fields
            })
            .then((res) => {
                return res.json();
            })
            .then((res) => {
                let resCont = self.formID + ' #resultContainer';
                $(resCont).removeClass();
                $(resCont).addClass(res.status);
                $(resCont).html(res.status);

                if (res.status === 'progress')
                    setTimeout(self.query, res.timeout, fields, self);
                else if (res.status === 'error')
                    $(resCont).html(res.reason);

                if ((res.status === 'success') || (res.status === 'error')) {
                    $(self.formID + ' #submitButton').removeAttr('disabled', true);
                    $(self.formID + ' #submitButton').removeClass('disabled');
                }
            })
            .catch((err) => console.log(err));
    }
}

$(() => {
    let form = new Form('#myForm');
});
