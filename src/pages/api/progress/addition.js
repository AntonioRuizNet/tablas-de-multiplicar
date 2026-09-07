import { db } from "../../../lib/db";
import { requireUser } from "../../../lib/auth";

export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({ok:false});
  const user=await requireUser(req,res); if(!user) return;
  const level=Number(req.body?.level), a=Number(req.body?.a), b=Number(req.body?.b), answer=Number(req.body?.answer);
  if(!Number.isInteger(level)||level<1||level>7||![a,b,answer].every(Number.isInteger)||a<0||b<0) return res.status(400).json({ok:false,error:"Datos de suma no válidos."});
  try{await db.query(`INSERT INTO addition_operations (user_id,level,addend_a,addend_b,answer,is_correct) VALUES ($1,$2,$3,$4,$5,$6)`,[user.id,level,a,b,answer,answer===a+b]);return res.status(201).json({ok:true});}
  catch(error){console.error(error);return res.status(500).json({ok:false,error:"No se ha podido guardar la operación."});}
}
