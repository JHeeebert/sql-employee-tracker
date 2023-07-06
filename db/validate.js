const validator = require('validator');

const validate = {
validateFirstName: (input) => {
    if (validator.isEmpty(input)) {
        return 'Please enter a first name.'
    }
    return true
},
validateLastName: (input) => {
    if (validator.isEmpty(input)) {
        return 'Please enter a last name.'
    }
    return true
},
validateRole: (input) => {
    if (validator.isEmpty(input)) {
        return 'Please enter a role.'
    }
    return true
},
validateManager: (input) => {
    if (validator.isEmpty(input)) {
        return 'Please enter a manager.'
    }
    return true
},
validateDepartment: (input) => {
    if (validator.isEmpty(input)) {
        return 'Please enter a department.'
    }
    return true
},
validateSalary: (input) => {
    if (validator.isEmpty(input)) {
        return 'Please enter a salary.'
    }
    return true
},
validateEmployee: (input) => {
    if (validator.isEmpty(input)) {
        return 'Please enter an employee.'
    }
    return true
}
}




module.exports = validate