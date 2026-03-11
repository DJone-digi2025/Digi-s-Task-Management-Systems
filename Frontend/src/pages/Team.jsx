import {useEffect,useState} from "react"
import axios from "axios"
import {useParams} from "react-router-dom"
import TopBar from "../components/TopBar"
import API from "../api"

export default function Team(){

const {name} = useParams()

const [tasks,setTasks] = useState([])
const [comments,setComments] = useState({})

useEffect(()=>{

axios.get(API + "/tasks/"+name)
.then(res=>{

setTasks(res.data)

const existing = {}

res.data.forEach(t=>{
existing[t[0]] = t[11] || ""
})

setComments(existing)

})

},[])



function submitComment(taskId){

axios.post(API + "/employeeComment",{
taskId,
comment:comments[taskId]
})

}



function submitTask(taskId){

axios.post(API + "/submitTask",{taskId})
.then(()=>{

setTasks(tasks.map(t=>{
if(t[0]===taskId){
t[6] = "SUBMITTED"
}
return t
}))

})

}



function val(row,index){
return row && row[index] ? row[index] : ""
}



return(

<div style={{background:"#f5f6fa",minHeight:"100vh"}}>

<TopBar title="My Tasks" user={name}/>

<div style={{padding:"30px"}}>

<table style={{
width:"100%",
background:"#fff",
borderRadius:"10px",
overflow:"hidden",
boxShadow:"0 3px 10px rgba(0,0,0,0.08)"
}}>

<thead style={{background:"#f1f3f6"}}>

<tr>
<th style={{padding:"12px"}}>Task</th>
<th>Client</th>
<th>Content Type</th>
<th>Stage</th>
<th>Priority</th>
<th>Status</th>
<th>Manager Comment</th>
<th>Delay Reason</th>
<th>Save</th>
<th>Submit</th>
</tr>

</thead>

<tbody>

{tasks.map((t,i)=>{

const taskId = val(t,0)

return(

<tr key={i} style={{borderBottom:"1px solid #eee"}}>

<td style={{padding:"12px"}}>{val(t,0)}</td>

<td>{val(t,1)}</td>

<td>{val(t,3)}</td>

<td>{val(t,4)}</td>

<td>{val(t,10)}</td>


<td>

{val(t,6)==="ASSIGNED" && (
<span style={{color:"#2563eb",fontWeight:"600"}}>
ASSIGNED
</span>
)}

{val(t,6)==="SUBMITTED" && (
<span style={{color:"#f59e0b",fontWeight:"600"}}>
WAITING FOR EVALUATION
</span>
)}

</td>


<td>

{val(t,12) && (
<span style={{
background:"#fff8db",
padding:"4px 6px",
borderRadius:"4px",
fontSize:"13px"
}}>
{val(t,12)}
</span>
)}

</td>


<td>

<input
value={comments[taskId] || ""}
placeholder="Reason if delayed"
style={{
width:"100%",
padding:"6px",
border:"1px solid #ddd",
borderRadius:"5px"
}}
onChange={(e)=>setComments({
...comments,
[taskId]:e.target.value
})}
/>

</td>

<td>

<button
disabled={!comments[taskId] || comments[taskId].trim()===""}
style={{
padding:"6px 10px",
border:"none",
background: comments[taskId] ? "#6366f1" : "#ccc",
color:"#fff",
borderRadius:"5px",
cursor:"pointer"
}}
onClick={()=>{

if(window.confirm("Save delay reason?")){
submitComment(taskId)
}

}}
>
Save
</button>

</td>

<td>

<button
disabled={comments[taskId] && comments[taskId].trim() !== ""}
style={{
padding:"6px 10px",
border:"none",
background: comments[taskId] ? "#ccc" : "#10b981",
color:"#fff",
borderRadius:"5px",
cursor:"pointer"
}}
onClick={()=>{

if(window.confirm("Submit task for evaluation?")){
submitTask(taskId)
}

}}
>
Submit
</button>

</td>

</tr>

)

})}

</tbody>

</table>

</div>

</div>

)

}