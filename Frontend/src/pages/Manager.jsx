import { useEffect, useState, useRef } from "react"
import axios from "axios"
import TopBar from "../components/TopBar"
import API from "../api"

export default function Manager(){

const [active,setActive] = useState([])
const [completed,setCompleted] = useState([])
const [evaluation,setEvaluation] = useState([])
const [clientList,setClientList] = useState([])
const [teamList,setTeamList] = useState([])
const [typeList,setTypeList] = useState([])
const [stageList,setStageList] = useState([])
const [comments,setComments] = useState({})
const [tab,setTab] = useState("active")

const [search,setSearch] = useState("")
const [clientFilter,setClientFilter] = useState("")
const [personFilter,setPersonFilter] = useState("")
const [stageFilter,setStageFilter] = useState("")
const [statusFilter,setStatusFilter] = useState("")

const [publishDate,setPublishDate] = useState("")
const [filterPublishDate,setFilterPublishDate] = useState("")
const [dueDate,setDueDate] = useState("")

const [compact,setCompact] = useState(false)
const [showCreate,setShowCreate] = useState(false)

const [client,setClient] = useState("")
const [contentType,setContentType] = useState("")
const [stage,setStage] = useState("")
const [assigned,setAssigned] = useState("")
const [priority,setPriority] = useState("Low")

const tableRef = useRef(null)
const scrollRef = useRef(null)

function loadTasks(){

axios.get(API + "/alltasks")
.then(res=>{
setActive(res.data.active || [])
setEvaluation(res.data.evaluation || [])
setCompleted(res.data.completed || [])
})

}

useEffect(()=>{

loadTasks()

axios.get(API + "/clients").then(res=>{
setClientList(res.data)
})

axios.get(API + "/team").then(res=>{
setTeamList(res.data)
})

axios.get(API + "/contentTypes").then(res=>{
setTypeList(res.data)
})

axios.get(API + "/stages").then(res=>{
setStageList(res.data)
})

},[])


useEffect(()=>{

const table = tableRef.current
const scroll = scrollRef.current

if(!table || !scroll) return

function syncFromTable(){
scroll.scrollLeft = table.scrollLeft
}

function syncFromBar(){
table.scrollLeft = scroll.scrollLeft
}

table.addEventListener("scroll",syncFromTable)
scroll.addEventListener("scroll",syncFromBar)

return ()=>{
table.removeEventListener("scroll",syncFromTable)
scroll.removeEventListener("scroll",syncFromBar)
}

},[])

function val(row,index){
return row && row[index] ? row[index] : ""
}

function saveManagerComment(taskId){

axios.post(API + "/managerComment",{
taskId,
comment:comments[taskId] || "",
status:"ASSIGNED"
})
.then(()=>{
loadTasks()
})

}


function createTask(){

axios.post(API + "/createTask",{
client,
contentType,
stage,
assigned,
publishDate,
priority
})

.then(()=>{
alert("Task created")
setShowCreate(false)
loadTasks()
})

.catch(err=>{
console.error(err)
alert("Failed to create task")
})

}

function evaluateTask(taskId){

axios.post(API + "/evaluateTask",{taskId})
.then(()=>{

// remove immediately from UI
setEvaluation(prev =>
prev.filter(t => t[0] !== taskId)
)

// optional refresh from backend
setTimeout(()=>{
loadTasks()
},2000)

})

}

function uniqueValues(tasks,index){
return [...new Set(tasks.map(t=>val(t,index)).filter(Boolean))]
}

const combinedTasks = [...active, ...evaluation, ...completed]

const clients = uniqueValues(combinedTasks,1)
const persons = uniqueValues(combinedTasks,5)
const stages = uniqueValues(combinedTasks,4)


function applyFilter(tasks){

return tasks.filter(t=>{

const client = val(t,1)
const assigned = val(t,5)
const stage = val(t,4)
const publish = val(t,2)
const due = val(t,7)
const status = val(t,6)

const text = (val(t,0)+" "+client+" "+assigned).toLowerCase()

if(search && !text.includes(search.toLowerCase())) return false
if(clientFilter && client!==clientFilter) return false
if(personFilter && assigned!==personFilter) return false
if(stageFilter && stage!==stageFilter) return false
if(statusFilter && status !== statusFilter) return false

if(filterPublishDate && publish!==filterPublishDate) return false
if(dueDate && due!==dueDate) return false

return true

})

}

const filteredActive = applyFilter(active)
const filteredCompleted = applyFilter(completed)
const filteredEvaluation = applyFilter(evaluation)

const allTasks = [...active, ...evaluation, ...completed]

const assignedCount = evaluation.length

const pendingCount = active.filter(t=>val(t,6)==="PENDING").length

const blockedCount = active.filter(t=>val(t,6)==="BLOCKED").length

const unassignedCount = allTasks.filter(t=>!val(t,5)).length

const today = new Date().toISOString().slice(0,10)
const completedCount = completed.length

const teamStats = {}

allTasks.forEach(t => {

const person = val(t,5)

if(!person) return

if(!teamStats[person]){
teamStats[person] = {
assigned:0,
}
}

if(val(t,6) === "ASSIGNED"){
teamStats[person].assigned++
}


})

const teamRows = Object.entries(teamStats)

function clearFilters(){

setSearch("")
setClientFilter("")
setPersonFilter("")
setStageFilter("")
setFilterPublishDate("")
setDueDate("")
setStatusFilter("")

}

const rowPadding = compact ? "py-1" : "py-3"


return(

<div
className="min-h-screen"
style={{
background:"#f4f6f9"
}}
>

<TopBar title="Manager Dashboard" user="Manager"/>

<div className="max-w-7xl mx-auto p-8" style={{paddingBottom:"40px"}}>

<div style={{
display:"flex",
gap:"15px",
marginBottom:"25px",
flexWrap:"wrap"
}}>

<div style={{
background:"#ffffff",
padding:"15px 20px",
borderRadius:"8px",
boxShadow:"0 2px 6px rgba(0,0,0,0.08)"
}}>
<div style={{fontSize:"12px",color:"#666"}}>UNASSIGNED</div>
<div style={{fontSize:"20px",fontWeight:"600"}}>{unassignedCount}</div>
</div>

<div style={{
background:"#ffffff",
padding:"15px 20px",
borderRadius:"8px",
boxShadow:"0 2px 6px rgba(0,0,0,0.08)"
}}>
<div style={{fontSize:"12px",color:"#666"}}>ASSIGNED</div>
<div style={{fontSize:"20px",fontWeight:"600"}}>{assignedCount}</div>
</div>

<div style={{
background:"#ffffff",
padding:"15px 20px",
borderRadius:"8px",
boxShadow:"0 2px 6px rgba(0,0,0,0.08)"
}}>
<div style={{fontSize:"12px",color:"#666"}}>PENDING</div>
<div style={{fontSize:"20px",fontWeight:"600"}}>{pendingCount}</div>
</div>

<div style={{
background:"#ffffff",
padding:"15px 20px",
borderRadius:"8px",
boxShadow:"0 2px 6px rgba(0,0,0,0.08)"
}}>
<div style={{fontSize:"12px",color:"#666"}}>BLOCKED</div>
<div style={{fontSize:"20px",fontWeight:"600"}}>{blockedCount}</div>
</div>

<div style={{
background:"#ffffff",
padding:"15px 20px",
borderRadius:"8px",
boxShadow:"0 2px 6px rgba(0,0,0,0.08)"
}}>
<div style={{fontSize:"12px",color:"#666"}}>COMPLETED</div>
<div style={{fontSize:"20px",fontWeight:"600"}}>{completedCount}</div>
</div>

</div>

<div className="mb-4">

<button
style={{
padding:"8px 16px",
borderRadius:"6px",
border:"1px solid #ddd",
background: tab==="active" ? "#2563eb" : "#ffffff",
color: tab==="active" ? "#ffffff" : "#333",
cursor:"pointer",
marginRight:"10px",
fontWeight:"500"
}}
onClick={()=>setTab("active")}
>
Active Tasks
</button>

<button
className="px-4 py-2 border rounded-md mr-2 hover:bg-gray-100 shadow-sm"
onClick={()=>setTab("evaluation")}
>
Evaluation
</button>

<button
className="px-3 py-1 border rounded hover:bg-gray-200"
onClick={()=>setTab("history")}
>
Completed History
</button>

</div>

<button
style={{
padding:"10px 18px",
background:"#10b981",
color:"#fff",
border:"none",
borderRadius:"6px",
cursor:"pointer",
fontWeight:"500",
marginBottom:"20px"
}}
onClick={()=>setShowCreate(true)}
>
+ Create Task
</button>

{showCreate && (

<div className="border p-4 rounded bg-gray-50 mb-6">

<h3 className="font-semibold mb-3">Create Manual Task</h3>

<select
className="border px-2 py-1 mr-2 mb-2"
value={client}
onChange={e=>setClient(e.target.value)}
>
<option value="">Client</option>
{clientList.map((c,i)=>(
<option key={i} value={c[0]}>{c[0]}</option>
))}
</select>


<select
className="border px-2 py-1 mr-2 mb-2"
value={contentType}
onChange={e=>setContentType(e.target.value)}
>
<option value="">Content Type</option>
{typeList.map((c,i)=>(
<option key={i} value={c}>{c}</option>
))}
</select>


<select
className="border px-2 py-1 mr-2 mb-2"
value={stage}
onChange={e=>setStage(e.target.value)}
>
<option value="">Stage</option>
{stageList.map((s,i)=>(
<option key={i} value={s}>{s}</option>
))}
</select>


<select
className="border px-2 py-1 mr-2 mb-2"
value={assigned}
onChange={e=>setAssigned(e.target.value)}
>
<option value="">Assigned</option>
{teamList.map((p,i)=>(
<option key={i} value={p[0]}>{p[0]}</option>
))}
</select>

<label>Publish Date</label>
<input type="date"
className="border px-2 py-1 mr-2 mb-2"
onChange={e=>setPublishDate(e.target.value)}
/>

<select
className="border px-2 py-1 mr-2 mb-2"
onChange={e=>setPriority(e.target.value)}
>
<option>Low</option>
<option>High</option>
</select>

<br/>

<button
className="px-3 py-1 border rounded hover:bg-gray-200"
onClick={createTask}
>
Create
</button>

<button
className="px-3 py-1 border rounded ml-2"
onClick={()=>setShowCreate(false)}
>
Cancel
</button>

</div>

)}

<div
style={{
display:"flex",
flexWrap:"wrap",
gap:"12px",
marginBottom:"25px",
padding:"12px",
background:"#f9fafb",
borderRadius:"8px",
border:"1px solid #eee"
}}
>

<input
style={{
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
placeholder="Search"
value={search}
onChange={e=>setSearch(e.target.value)}
/>

<select
style={{
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
value={clientFilter}
onChange={e=>setClientFilter(e.target.value)}
>
<option value="">Client</option>
{clients.map(c=>(<option key={c}>{c}</option>))}
</select>

<select
style={{
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
value={personFilter}
onChange={e=>setPersonFilter(e.target.value)}
>
<option value="">Assigned</option>
{persons.map(p=>(<option key={p}>{p}</option>))}
</select>

<select
className="border px-2 py-1 rounded"
value={statusFilter}
onChange={e=>setStatusFilter(e.target.value)}
>
<option value="">Status</option>
<option value="ASSIGNED">ASSIGNED</option>
<option value="SUBMITTED">SUBMITTED</option>
<option value="WAITING FOR EVALUATION">WAITING FOR EVALUATION</option>
</select>

<select
style={{
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
value={stageFilter}
onChange={e=>setStageFilter(e.target.value)}
>
<option value="">Stage</option>
{stages.map(s=>(<option key={s}>{s}</option>))}
</select>

<label className="flex items-center gap-1">
Publish
<input
type="date"
style={{
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
value={filterPublishDate}
onChange={e=>setFilterPublishDate(e.target.value)}
/>
</label>

<label className="flex items-center gap-1">
Due
<input
type="date"
style={{
padding:"8px",
border:"1px solid #ddd",
borderRadius:"6px"
}}
value={dueDate}
onChange={e=>setDueDate(e.target.value)}
/>
</label>

<button
style={{
padding:"8px 14px",
border:"1px solid #ddd",
borderRadius:"6px",
background:"#ffffff",
cursor:"pointer"
}}
onClick={clearFilters}
>
Clear Filters
</button>

<label className="flex items-center gap-1">
<input
type="checkbox"
checked={compact}
onChange={()=>setCompact(!compact)}
/>
Compact
</label>

</div>

{tab==="active" &&(

<div ref={tableRef} style={{overflowX:"auto"}}>

<table
className="min-w-[1200px] w-full"
style={{
borderCollapse:"collapse",
fontSize:"14px"
}}
>

<thead
style={{
background:"#f1f3f6",
textAlign:"left",
position:"sticky",
top:"0",
zIndex:"5"
}}
>

<tr>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Task</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Client</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Publish</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Stage</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Assigned</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Due</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Working</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Priority</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Reschedule</th>
</tr>

</thead>

<tbody>

{filteredActive.map((t,i)=>{

const taskId = val(t,0)

return(

<tr
key={i}
style={{
borderBottom:"1px solid #eee",
cursor:"default"
}}
onMouseEnter={(e)=>e.currentTarget.style.background="#f9fafc"}
onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}
>

<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,0)}</td>
<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,1)}</td>
<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,2)}</td>
<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,4)}</td>
<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,5)}</td>
<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,7)}</td>
<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,8)}</td>
<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,10)}</td>
<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,9)}</td>

</tr>

)

})}

</tbody>

</table>

</div>

)}

{tab==="history" &&(

<table
className="w-full"
style={{minWidth:"1400px"}}
>

<thead className="bg-gray-100 text-left text-sm font-semibold">

<tr>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Task</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Client</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Publish</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Assigned</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Due</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Priority</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Completed</th>
</tr>

</thead>

<tbody>

{filteredCompleted.map((t,i)=>(

<tr
key={i}
style={{
borderBottom:"1px solid #eee",
cursor:"default"
}}
onMouseEnter={(e)=>e.currentTarget.style.background="#f9fafc"}
onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}
>

<td className="px-3 py-2">{val(t,0)}</td>
<td className="px-3 py-2">{val(t,1)}</td>
<td className="px-3 py-2">{val(t,2)}</td>
<td className="px-3 py-2">{val(t,5)}</td>
<td className="px-3 py-2">{val(t,7)}</td>
<td className="px-3 py-2">{val(t,10)}</td>
<td className="px-3 py-2">{val(t,8)}</td>

</tr>

))}

</tbody>

</table>

)}

</div>


{tab==="evaluation" &&(

<div ref={tableRef} style={{overflowX:"auto"}}>

<table
className="min-w-[1200px] w-full"
style={{
borderCollapse:"collapse",
fontSize:"14px"
}}
>

<thead
style={{
background:"#f1f3f6",
textAlign:"left",
position:"sticky",
top:"0",
zIndex:"5"
}}
>

<tr>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Task</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Client</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Publish</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Stage</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Assigned</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Status</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Due</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Working</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Priority</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Reschedule</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Employee Reason</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Manager Comment</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Send</th>
<th
style={{
padding:"12px",
fontWeight:"600",
fontSize:"13px",
color:"#444",
borderBottom:"1px solid #ddd"
}}
>Evaluate</th>
</tr>

</thead>

<tbody>

{filteredEvaluation.map((t,i)=>{

const taskId = val(t,0)

return(

<tr
key={i}
style={{
borderBottom:"1px solid #eee",
cursor:"default"
}}
onMouseEnter={(e)=>e.currentTarget.style.background="#f9fafc"}
onMouseLeave={(e)=>e.currentTarget.style.background="transparent"}
>

<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,0)}</td>
<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,1)}</td>
<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,2)}</td>
<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,4)}</td>
<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,5)}</td>
<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,6)}</td>
<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,7)}</td>
<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,8)}</td>
<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,10)}</td>
<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>{val(t,9)}</td>

<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>
{val(t,11)}
</td>

<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>

<input
value={comments[taskId] || ""}
placeholder="Manager comment"
className="border px-2 py-1 rounded w-full"
onChange={(e)=>setComments({
...comments,
[taskId]:e.target.value
})}
/>

</td>

<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>

<button
onClick={()=>{
if(window.confirm("Save manager comment?")){
saveManagerComment(taskId)
}
}}
>
Send
</button>

</td>

<td
style={{
padding:"10px",
color:"#333"
}}
className={rowPadding}
>

<button
onClick={()=>{
if(window.confirm("Mark this task as completed?")){
evaluateTask(taskId)
}
}}
>
Complete
</button>

</td>

</tr>

)

})}

</tbody>

</table>

</div>


)}


<div
ref={scrollRef}
style={{
position:"fixed",
bottom:"0",
left:"0",
right:"0",
overflowX:"auto",
background:"#f5f6fa",
borderTop:"1px solid #ccc",
height:"14px"
}}
>

<div style={{width:"2000px",height:"1px"}}></div>


<div
style={{
width: tableRef.current ? tableRef.current.scrollWidth : "2000px",
height:"1px"
}}
></div>

</div>

</div>

)
}