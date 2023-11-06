class ErrorHandler extends Error{
    constructor(message,statusCode){
super(message)
this.statusCode= statusCode;  //overriding the default error message of javascript
    }
}

export default ErrorHandler