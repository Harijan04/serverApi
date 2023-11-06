export const errorMiddleware = (err, req, res, next) => {

    err.message = err.message || "Internal server error"
    err.statusCode = err.statusCode || 500

    res.status(400).json({ success: false, message: err.message })


}


export const asyncError = (passFunc) => (req, res, next) => {

    Promise.resolve(passFunc(req, res, next)).catch(next)

}