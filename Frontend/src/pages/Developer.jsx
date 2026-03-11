import {useEffect,useState} from "react"
import axios from "axios"
import {Link} from "react-router-dom"

const hoverEffect = e => {
e.currentTarget.style.transform = "translateY(-3px)"
e.currentTarget.style.boxShadow = "0 8px 18px rgba(0,0,0,0.12)"
}

const leaveEffect = e => {
e.currentTarget.style.transform = "translateY(0px)"
e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"
}

export default function Developer(){

const [team,setTeam] = useState([])

useEffect(()=>{

axios.get("/team")
.then(res=>{
setTeam(res.data || [])
})

},[])

return(

<div style={page}>

<h2 style={{marginBottom:"30px"}}>Developer Console</h2>


{/* SYSTEM */}

<h3 style={sectionTitle}>SYSTEM</h3>

<div style={grid}>

<Link to="/manager">
<div style={card} onMouseEnter={hoverEffect} onMouseLeave={leaveEffect}>Manager Dashboard</div>
</Link>

<Link to="/instructor">
<div style={card} onMouseEnter={hoverEffect} onMouseLeave={leaveEffect}>Instructor Dashboard</div>
</Link>

</div>



{/* TEAM DASHBOARDS */}

<h3 style={sectionTitle}>TEAM DASHBOARDS</h3>

<div style={grid}>

{team.map((t,i)=>{

const name = t[0]

return(

<Link key={i} to={"/team/"+name}>
<div style={card} onMouseEnter={hoverEffect} onMouseLeave={leaveEffect}>{name}</div>
</Link>

)

})}

</div>



{/* TOOLS */}

<h3 style={sectionTitle}>TOOLS</h3>

<div style={grid}>

<a href="https://docs.google.com/spreadsheets" target="_blank">
<div style={cardGreen} onMouseEnter={hoverEffect} onMouseLeave={leaveEffect}>Open Sheets</div>
</a>

<Link to="/manager">
<div style={cardGreen} onMouseEnter={hoverEffect} onMouseLeave={leaveEffect}>Task Engine</div>
</Link>

</div>


</div>

)

}



const page = {
padding:"50px",
background:"linear-gradient(135deg,#eef2f7,#f8fafc)",
minHeight:"100vh",
fontFamily:"Segoe UI, Arial",
color:"#333"
}

const sectionTitle = {
marginTop:"40px",
marginBottom:"18px",
fontSize:"18px",
fontWeight:"700",
letterSpacing:"0.5px",
color:"#444"
}

const grid = {
display:"grid",
gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",
gap:"18px"
}

const card = {
background:"#ffffff",
padding:"22px",
borderRadius:"10px",
boxShadow:"0 4px 12px rgba(0,0,0,0.08)",
cursor:"pointer",
textAlign:"center",
fontWeight:"600",
fontSize:"15px",
transition:"all 0.18s ease",
border:"1px solid #f1f1f1"
}

const cardGreen = {
background:"#e8f7ef",
padding:"22px",
borderRadius:"10px",
boxShadow:"0 4px 12px rgba(0,0,0,0.08)",
cursor:"pointer",
textAlign:"center",
fontWeight:"600",
fontSize:"15px",
transition:"all 0.18s ease",
border:"1px solid #d8efe3"
}