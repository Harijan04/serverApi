import  multer from "multer"


const storage = multer.memoryStorage();


export const multipleUpload = multer({
    storage,
   // Set the maximum number of files to 3 (adjust as needed)
}).array("files",10);


export const singleUpload= multer({
    storage,
}).single("file")




