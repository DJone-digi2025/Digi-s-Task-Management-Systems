import { useEffect, useState } from "react"
import axios from "axios"
import TopBar from "../components/TopBar"
import API from "../api"

import {
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
CartesianGrid,
PieChart,
Pie,
ResponsiveContainer
} from "recharts"

export default function Instructor(){

const [data,setData] = useState({})

const [month,setMonth] = useState("")
const [date,setDate] = useState("")

useEffect(()=>{

const params = {}

if(date){
params.date = date
}else if(month){
params.month = month
}

axios.get(API + "/analytics",{ params })
.then(res=>{
setData(res.data)
})

},[month,date])

/* KPI DATA */

const total = data.total || 0
const completed = data.completed || 0
const pending = data.pending || 0
const assigned = data.assigned || 0
const unassigned = data.unassigned || 0



/* CHART DATA */

const overviewData = [
{ name:"Total", value:total },
{ name:"Assigned", value:assigned },
{ name:"Completed", value:completed },
{ name:"Pending", value:pending },
{ name:"Unassigned", value:unassigned }
]

const teamData = Object.keys(data.completedByPerson || {}).map(person=>({
name:person,
completed:data.completedByPerson[person]
}))

const pieData = [
{ name:"Completed", value:completed },
{ name:"Assigned", value:assigned },
{ name:"Pending", value:pending }
]


return(

<div className="min-h-screen bg-gray-100">

<TopBar title="Instructor Dashboard" user="Instructor"/>

<div className="max-w-7xl mx-auto p-8">

<h2 className="text-xl font-semibold mb-6">
Instructor Analytics Dashboard
</h2>


{/* FILTERS */}

<div className="flex gap-4 mb-8">

<input
type="month"
className="border px-3 py-2 rounded"
value={month}
onChange={(e)=>setMonth(e.target.value)}
/>

<input
type="date"
className="border px-3 py-2 rounded"
value={date}
onChange={(e)=>setDate(e.target.value)}
/>

<button
className="px-3 py-2 border rounded"
onClick={()=>{
setMonth("")
setDate("")
}}
>
Clear
</button>

</div>



{/* KPI CARDS */}

<div className="grid grid-cols-5 gap-6 mb-10">

<div className="bg-white p-6 rounded shadow text-center">
<p className="text-gray-500">Total Tasks</p>
<h3 className="text-2xl font-bold">{total}</h3>
</div>

<div className="bg-white p-6 rounded shadow text-center">
<p className="text-gray-500">Assigned</p>
<h3 className="text-2xl font-bold text-blue-600">{assigned}</h3>
</div>

<div className="bg-white p-6 rounded shadow text-center">
<p className="text-gray-500">Completed</p>
<h3 className="text-2xl font-bold text-green-600">{completed}</h3>
</div>

<div className="bg-white p-6 rounded shadow text-center">
<p className="text-gray-500">Pending</p>
<h3 className="text-2xl font-bold text-yellow-600">{pending}</h3>
</div>

<div className="bg-white p-6 rounded shadow text-center">
<p className="text-gray-500">Unassigned</p>
<h3 className="text-2xl font-bold text-red-600">{unassigned}</h3>
</div>

</div>



{/* CHARTS */}

<div className="grid grid-cols-2 gap-8">


{/* TASK OVERVIEW */}

<div className="bg-white p-6 rounded shadow">

<h3 className="text-lg font-semibold mb-4">
Task Overview
</h3>

<ResponsiveContainer width="100%" height={300}>

<BarChart data={overviewData}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="name"/>

<YAxis/>

<Tooltip/>

<Bar dataKey="value" fill="#4f46e5"/>

</BarChart>

</ResponsiveContainer>

</div>



{/* TEAM COMPLETION */}

<div className="bg-white p-6 rounded shadow">

<h3 className="text-lg font-semibold mb-4">
Team Completion
</h3>

<ResponsiveContainer width="100%" height={300}>

<BarChart data={teamData}>

<CartesianGrid strokeDasharray="3 3"/>

<XAxis dataKey="name"/>

<YAxis/>

<Tooltip/>

<Bar dataKey="completed" fill="#10b981"/>

</BarChart>

</ResponsiveContainer>

</div>



{/* COMPLETION RATIO */}

<div className="bg-white p-6 rounded shadow col-span-2">

<h3 className="text-lg font-semibold mb-4">
Completion Ratio
</h3>

<ResponsiveContainer width="100%" height={300}>

<PieChart>

<Pie
data={pieData}
dataKey="value"
nameKey="name"
outerRadius={120}
fill="#6366f1"
label
/>

</PieChart>

</ResponsiveContainer>

</div>

</div>

</div>

</div>

)

}