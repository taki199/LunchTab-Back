const mongoose =require('mongoose')

module.exports=async()=>{
    try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to database")

    }catch(err){
        console.log('connection failed ',err)

    }
}