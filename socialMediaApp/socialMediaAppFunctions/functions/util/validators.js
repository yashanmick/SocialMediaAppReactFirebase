//validating email
const isEmail = (email) => {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (email.match(regEx)) return true;
    else return false;
}

//helper function to check the string empty or not
const isEmpty = (string) => {
    //eleminate any white spaces
    if (string.trim() === '') return true;
    else return false;
}

exports.validateSignupData = (data) => {
    let errors = {};        //initializing errors object

    //email validation
    if (isEmpty(data.email)) {
        errors.email = 'Must not be empty'
    } else if (!isEmail(data.email)) {
        errors.email = 'Must be a valid email address'
    }

    //check if password is empty
    if (isEmpty(data.password)) {
        errors.password = 'Must not be empty'
    }

    //check if password matches
    if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Password does not match'
    }

    //handle validation
    if (isEmpty(data.handle)) {
        errors.handle = 'Must not be empty'
    }

    //if any above error happens return error
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

exports.validateLoginData = (data) => {
    let errors = {};

    //login validation
    if (isEmpty(data.email)) {
        errors.email = 'Must not be empty'
    }

    if (isEmpty(data.password)) {
        errors.password = 'Must not be empty'
    }

    //if any above error happens return error
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

