require('dotenv').config();
const express=require('express');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const app=express();
const PORT=3000;
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@adr1243.xnehwod.mongodb.net/?retryWrites=true&w=majority`,{
    useNewUrlParser:true,
    useUnifiedTopology:true
});
const db=mongoose.connection;
db.on('error',error=>console.error('Error al conectar a MongoDB:',error));
db.once('open',()=>console.log('Conectado a MongoDB'));
const rankingSchema=new mongoose.Schema({
    name:String,
    score:Number,
    totalTime:Number,
});
const Ranking=mongoose.model('Ranking',rankingSchema);
app.use(express.static('public'));
app.use(bodyParser.json());
app.get('/favicon.ico',(req,res)=>res.status(204));
app.get('/rankings',async(req,res)=>{
    try{
        const rankings=await Ranking.find().sort({score:-1}).limit(20);
        res.json(rankings);
    }catch(err){
        res.status(500).json({message:err.message});
    }
});
app.post('/rankings',async(req,res)=>{
    const rank=new Ranking({
        name:req.body.name,
        score:req.body.score,
        totalTime:req.body.totalTime,
    });
    try{
        await rank.save();
        res.json({status:'success'});
    }catch(err){
        res.status(400).json({message:err.message});
    }
});
function clearPlayerData(){
    Ranking.deleteMany({}).then(result=>{
        console.log("Datos de los jugadores borrados exitosamente.");
    }).catch(err=>{
        console.error("Error al borrar datos:",err);
    }).finally(()=>{
        mongoose.connection.close(()=>{
            console.log("Mongoose default connection is disconnected due to application termination");
            process.exit(0);
        });
    });
}
process.on('SIGINT',()=>{
    console.log("\nDetectado Ctrl+C, borrando datos...");
    clearPlayerData();
    setTimeout(()=>{
        process.exit();
    },2000);
});
process.on('SIGTERM',()=>{
    console.log("\nDetectado SIGTERM, borrando datos...");
    clearPlayerData();
    setTimeout(()=>{
        process.exit();
    },2000);
});
app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});