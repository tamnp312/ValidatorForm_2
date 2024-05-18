var Validator = function (selector ) {


    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }else {
                element = element.parentElement;
            }
        }
    }

    var formRules = {};

    var ValidatorRules = {
        required: function(value){
            return value ? undefined : "Vui lòng nhập trường này "
        },
        email: function(value){
            const regex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
            return regex.test(value) ? undefined : "Vui lòng nhập đúng địa chỉ email" ;
        },
        min : function(min){
            return (value) => {
                return value.length >= min? undefined : `Vui lòng nhập ít nhất ${min} ký tự` ;
            }
        }
    }
    // lays ra form element trong Dom 
    var formElement = document.querySelector(selector);
    // console.log(formElement);

    if(formElement){
        var inputs = formElement.querySelectorAll('[name][rules]');
        // console.log(inputs);

        for(let input of inputs){

            var rules = input.getAttribute('rules').split('|');
            // console.log(rules);

            for(let rule of rules){
                var isRuleHasValue = rule.includes(':');
                var ruleInfo ;
                if(isRuleHasValue){
                    ruleInfo = rule.split(':');
                    rule = ruleInfo[0];
                }
                var ruleFunc= ValidatorRules[rule];
                if(isRuleHasValue){
                    ruleFunc = ruleFunc(ruleInfo[1]);
                }
                if(Array.isArray(formRules[input.name])){
                    formRules[input.name].push(ruleFunc);
                }else {
                    formRules[input.name] = [ruleFunc];
                }
            }
            input.onblur = handleValidate;
            input.oninput = handleClearError;
        }

        function handleValidate(event){
            var inputElement = event.target;
            if(inputElement) {
                var rules = formRules[inputElement.name];
                var errorMessage ;
                for(var rule of rules) {
                    errorMessage = rule(inputElement.value);
                    if(errorMessage) break;
                }
                // rules.find((rule) => errorMessage = rule(inputElement.value));
                // console.log(errorMessage);

                if(errorMessage ){
                    var formGroup = getParent(inputElement,'.form-group');
                    if(formGroup){ 

                        var errorElement = formGroup.querySelector('.form-message');

                        if(errorElement){
                            errorElement.innerText = errorMessage;
                            formGroup.classList.add('invalid');
                        }
                    }
                }
                return !errorMessage;
            }

        }

        function handleClearError(event){
            var inputElement = event.target;
            var formGroup = getParent(inputElement,'.form-group');
            if(formGroup){
                var errorElement = formGroup.querySelector('.form-message');
                if(errorElement){
                    errorElement.innerText = '';
                    formGroup.classList.remove('invalid');
                }
            }
        }

        // console.log(formRules);
    }

    formElement.onsubmit = (event) => {
        event.preventDefault();
        var isValid = true;
        var inputs = formElement.querySelectorAll('[name][rules]');
        for(let input of inputs){
            if(!handleValidate({ target: input}) ){
                isValid = false;
            }
        }
        if(isValid){ 
            if(typeof this.onSubmit === 'function'){
                var enableInput = formElement.querySelectorAll('[name]:not([disabled])');
                var formValues = Array.from(enableInput).reduce((results , input) => {
                    switch(input.type) {
                        case 'radio':
                            if(input.matches(':checked')) {
                                results[input.name] = input.value;
                            }
                            break;
                        case 'checkbox':
                            if(!input.matches(':checked')) {
                                results[input.name] = [];
                                return results;
                            }
                            if(!Array.isArray( results[input.name])) {
                                results[input.name] = [];
                            }
                            results[input.name].push(input.value);
                            break;
                        case 'file':
                            results[input.name] = input.files;
                            break;
                        default:
                            results[input.name] = input.value;
                            break;
                    }
                    return results;
                },{});
                this.onSubmit(formValues);
            }else {
                formElement.submit();
            }
        }


    }


}