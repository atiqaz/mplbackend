import multer from "multer";

// Configure storage (memory or disk)
const storage = ()=> multer.diskStorage({
    destination: function (req, file, cb) {
      const {subFolder} = req.body
      console.log({subFolder})
      cb(null, `public/${subFolder}`)
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix + '.png')
    }
  })

// Initialize `multer` with storage settings
const uploadImageSingle =()=> multer({ storage:storage() }).single('file');

export { uploadImageSingle };