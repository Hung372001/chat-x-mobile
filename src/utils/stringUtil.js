import moment from 'moment';

export function replaceToEng(string, isLowerCase = false) {
    string = string?.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
    string = string?.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
    string = string?.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
    string = string?.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
    string = string?.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
    string = string?.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
    string = string?.replace(/đ/g, 'd');
    // Some system encode vietnamese combining accent as individual utf-8 characters
    string = string?.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ''); // Huyền sắc hỏi ngã nặng
    string = string?.replace(/\u02C6|\u0306|\u031B/g, ''); // Â, Ê, Ă, Ơ, Ư
    if (isLowerCase) {
        return string.toLowerCase();
    } else {
        return string;
    }
}

export function validateNumber(email) {
    const re = /^[0-9]+$/;
    return re.test(email);
}

export function validateEmail(email) {
    const re =
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

export function localDate(date, format = 'DD/MM/YYYY') {
    const dateFormat = moment(new Date(date)).format(format);
    return dateFormat;
}

export const updateLocale = (language) => {
    moment.updateLocale(language, {
        relativeTime: {
            future: 'trong %s',
            past: `%s trước`,
            s: `Vài giây`,
            ss: `%d giây`,
            m: `Một phút`,
            mm: `%d phút`,
            h: `Một giờ`,
            hh: `%d giờ`,
            d: `Một ngày`,
            dd: `%d ngày`,
            w: `Một tuần`,
            ww: `%d tuần`,
            M: `Một tháng`,
            MM: `%d tháng`,
            y: `Một năm`,
            yy: `%d năm`,
        },
    });
};
