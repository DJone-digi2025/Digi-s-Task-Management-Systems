import {useState} from "react"
import {useNavigate} from "react-router-dom"
import axios from "axios"
import API from "../api"

export default function Login(){

const [name,setName] = useState("")
const [password,setPassword] = useState("")
const nav = useNavigate()

function login(){

axios.post(API + "/login",{name,password})
.then(res=>{

if(res.data.role === "manager"){
nav("/manager")
}

else if(res.data.role === "instructor"){
nav("/instructor")
}

else if(res.data.role === "developer"){
nav("/dev")
}

else{
nav("/team/"+res.data.name)
}

})
.catch(()=>{
alert("Invalid login")
})

}

return(

<div style={{
height:"100vh",
display:"flex",
alignItems:"center",
justifyContent:"center",
background:"#f5f6fa"
}}>

<div style={{
width:"320px",
background:"#fff",
padding:"30px",
borderRadius:"10px",
boxShadow:"0 4px 15px rgba(0,0,0,0.1)"
}}>

<h2 style={{textAlign:"center",marginBottom:"20px"}}>
DigisAilor Digital Marketing
</h2>

<input
placeholder="Name"
style={{
width:"100%",
padding:"10px",
marginBottom:"10px"
}}
onChange={e=>setName(e.target.value)}
/>

<input
type="password"
placeholder="Password"
style={{
width:"100%",
padding:"10px",
marginBottom:"15px"
}}
onChange={e=>setPassword(e.target.value)}
/>

<button
style={{
width:"100%",
padding:"10px",
cursor:"pointer"
}}
onClick={login}
>
Login
</button>

</div>

</div>

)

}