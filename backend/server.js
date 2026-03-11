const express = require("express")
const cors = require("cors")
const { google } = require("googleapis")


const app = express()
app.use(cors())
app.use(express.json())

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
})

const spreadsheetId = "1eJcEqihg2AsGpciFfw7PzmcTVHr_-7r3V5Tc7cZoekM"

async function getSheets(){
  const client = await auth.getClient()
  return google.sheets({version:"v4",auth:client})
}


/* LOGIN VALIDATION */

app.post("/login", async (req,res)=>{

const {name,password} = req.body

const sheets = await getSheets()

const data = await sheets.spreadsheets.values.get({
spreadsheetId,
range:"USERS!A1:Z"
})

const rows = data.data.values

for(let i=1;i<rows.length;i++){

console.log(rows[i])

const userName = rows[i][0]
const role = rows[i][1]
const pass = rows[i][2]

if(userName === name && pass === password){

return res.json({
name:userName,
role:role
})

}

}

res.status(401).json({error:"Invalid login"})

})



/* TEAM TASKS */

app.get("/tasks/:name", async (req,res)=>{

const name = req.params.name
const sheets = await getSheets()

const data = await sheets.spreadsheets.values.get({
spreadsheetId,
range:"TASK_ENGINE!A1:N"
})

const rows = data.data.values
const headers = rows[0]

const assignedIndex = headers.indexOf("Assigned_To")
const statusIndex = headers.indexOf("Status")

const tasks = rows.slice(1).filter(r => {

if(!r) return false

const assigned = r[assignedIndex]
const status = (r[statusIndex] || "").toUpperCase()

return assigned === name && status !== "COMPLETED"

})

res.json(tasks)

})



/* EMPLOYEE COMMENT */

app.post("/employeeComment", async (req,res)=>{

const {taskId,comment} = req.body
const sheets = await getSheets()

const data = await sheets.spreadsheets.values.get({
spreadsheetId,
range:"TASK_ENGINE!A1:N"
})

const rows = data.data.values
const headers = rows[0]

const taskIndex = headers.indexOf("Task_ID")
const commentIndex = headers.indexOf("Employee_Comment")

for(let i=1;i<rows.length;i++){

if(rows[i] && rows[i][taskIndex] === taskId){

const columnLetter = String.fromCharCode(65 + commentIndex)
const cell = `TASK_ENGINE!${columnLetter}${i+1}`

await sheets.spreadsheets.values.update({
spreadsheetId,
range:cell,
valueInputOption:"RAW",
requestBody:{values:[[comment]]}
})

break
}

}

res.send("Comment saved")

})



/* MANAGER DASHBOARD */

app.get("/alltasks", async (req,res)=>{

const sheets = await getSheets()

const data = await sheets.spreadsheets.values.get({
spreadsheetId,
range:"TASK_ENGINE!A1:N"
})

const rows = data.data.values || []
const headers = rows[0] || []

const statusIndex = headers.indexOf("Status")

const active = []
const evaluation = []
const completed = []

for(let i=1;i<rows.length;i++){

const row = rows[i]
if(!row) continue

const status = (row[statusIndex] || "").toUpperCase()

const checked = row[9] === true || row[9] === "TRUE"

/* COMPLETED TAB */

if(checked || status === "COMPLETED"){

completed.push(row)

/* EVALUATION TAB */

}else if(
status === "ASSIGNED" ||
status === "SUBMITTED" ||
status === "WAITING FOR EVALUATION"
){

evaluation.push(row)

/* ACTIVE TAB */

}else{

active.push(row)

}

}

res.json({
active,
evaluation,
completed
})

})

/* MANAGER UPDATE */

app.post("/managerComment", async (req,res)=>{

const {taskId,comment} = req.body
const sheets = await getSheets()

const data = await sheets.spreadsheets.values.get({
spreadsheetId,
range:"TASK_ENGINE!A1:N"
})

const rows = data.data.values
const headers = rows[0]

const taskIndex = headers.indexOf("Task_ID")
const commentIndex = headers.indexOf("Manager_Comment")

for(let i=1;i<rows.length;i++){

if(rows[i] && rows[i][taskIndex] === taskId){

const commentCol = String.fromCharCode(65 + commentIndex)

await sheets.spreadsheets.values.update({
spreadsheetId,
range:`TASK_ENGINE!${commentCol}${i+1}`,
valueInputOption:"RAW",
requestBody:{values:[[comment]]}
})

break
}

}

res.send("Updated")

})

app.get("/clients", async(req,res)=>{

const sheets = await getSheets()

const data = await sheets.spreadsheets.values.get({
spreadsheetId,
range:"CLIENT_MASTER!A2:A"
})

res.json(data.data.values || [])

})


app.get("/team", async(req,res)=>{

const sheets = await getSheets()

const data = await sheets.spreadsheets.values.get({
spreadsheetId,
range:"TEAM_CAPACITY!A2:A"
})

res.json(data.data.values || [])

})


app.get("/contentTypes", async(req,res)=>{

const sheets = await getSheets()

const data = await sheets.spreadsheets.values.get({
spreadsheetId,
range:"TASK_RULES_PHASE2!A2:A"
})

res.json([...new Set(data.data.values.map(r=>r[0]))])

})


app.get("/stages", async(req,res)=>{

const sheets = await getSheets()

const data = await sheets.spreadsheets.values.get({
spreadsheetId,
range:"TASK_RULES_PHASE2!B2:B"
})

res.json([...new Set(data.data.values.map(r=>r[0]))])

})

/* ANALYTICS DASHBOARD */

app.get("/analytics", async (req,res)=>{

const {month,date} = req.query

const sheets = await getSheets()

const data = await sheets.spreadsheets.values.get({
spreadsheetId,
range:"TASK_ENGINE!A1:N",
valueRenderOption:"FORMATTED_VALUE",
dateTimeRenderOption:"FORMATTED_STRING"
})

const rows = data.data.values
const headers = rows[0]

const publishIndex = headers.indexOf("Publish_Date")
const assignedIndex = headers.indexOf("Assigned_To")
const statusIndex = headers.indexOf("Status")

let total = 0
let completed = 0
let pending = 0
let assigned = 0
let unassigned = 0

const completedByPerson = {}

for(let i=1;i<rows.length;i++){

const row = rows[i]
if(!row) continue

const publishRaw = row[publishIndex]
if(!publishRaw) continue

let publishDate

if(typeof publishRaw === "number"){
publishDate = new Date((publishRaw - 25569) * 86400 * 1000)
}else{
publishDate = new Date(publishRaw)
}

if(isNaN(publishDate)) continue

const publishMonth =
publishDate.getFullYear() + "-" +
String(publishDate.getMonth()+1).padStart(2,"0")

const publishDay =
publishDate.getFullYear() + "-" +
String(publishDate.getMonth()+1).padStart(2,"0") + "-" +
String(publishDate.getDate()).padStart(2,"0")

/* DATE FILTER */

if(date){
if(publishDay !== date){
continue
}
}

/* MONTH FILTER */

else if(month){
if(publishMonth !== month){
continue
}
}

total++

const assignedPerson = row[assignedIndex]
const status = (row[statusIndex] || "").toUpperCase()

if(!assignedPerson){
unassigned++
}

if(status === "ASSIGNED"){
assigned++
}

if(status === "COMPLETED"){

completed++

if(assignedPerson){

if(!completedByPerson[assignedPerson]){
completedByPerson[assignedPerson] = 0
}

completedByPerson[assignedPerson]++

}

}

if(status === "PENDING" || status === "BLOCKED"){
pending++
}

}

res.json({
total,
assigned,
completed,
pending,
unassigned,
completedByPerson
})

})

app.post("/submitTask", async (req,res)=>{

const {taskId} = req.body

const sheets = await getSheets()

const data = await sheets.spreadsheets.values.get({
spreadsheetId,
range:"TASK_ENGINE!A1:N"
})

const rows = data.data.values
const headers = rows[0]

const taskIndex = headers.indexOf("Task_ID")
const statusIndex = headers.indexOf("Status")

for(let i=1;i<rows.length;i++){

if(rows[i] && rows[i][taskIndex] === taskId){

const statusCol = String.fromCharCode(65 + statusIndex)

await sheets.spreadsheets.values.update({
spreadsheetId,
range:`TASK_ENGINE!${statusCol}${i+1}`,
valueInputOption:"RAW",
requestBody:{values:[["SUBMITTED"]]}
})

break

}

}

res.send("Task submitted")

})

app.post("/createTask", async (req,res)=>{

try{

const {client,contentType,stage,assigned,publishDate,priority} = req.body

const sheets = await getSheets()

const today = new Date().toISOString().slice(0,10)

// create request id for manual request
const taskId =
client + "_" +
contentType + "_" +
Date.now()

// row for MANUAL_TASKS sheet
const newRow = [
taskId,
client,
contentType,
stage,
assigned,
publishDate,
priority,
today,
"PENDING"
]

// find next empty row
const existing = await sheets.spreadsheets.values.get({
spreadsheetId,
range:"MANUAL_TASKS!A:A"
})

const nextRow = (existing.data.values || []).length + 1

await sheets.spreadsheets.values.update({
spreadsheetId,
range:`MANUAL_TASKS!A${nextRow}`,
valueInputOption:"USER_ENTERED",
requestBody:{
values:[newRow]
}
})

res.send("Manual Task Requested")

}catch(err){

console.error(err)
res.status(500).send("Error creating task")

}

})

/* EVALUATION COMPLETE */

/* EVALUATION COMPLETE */

app.post("/evaluateTask", async (req,res)=>{

const {taskId} = req.body

const sheets = await getSheets()

const data = await sheets.spreadsheets.values.get({
spreadsheetId,
range:"EVALUATION_PANEL!A2:J"
})

const rows = data.data.values || []

for(let i=0;i<rows.length;i++){

if(rows[i][0] === taskId){

await sheets.spreadsheets.values.update({
spreadsheetId,
range:`EVALUATION_PANEL!J${i+2}`,
valueInputOption:"USER_ENTERED",
requestBody:{
values:[[true]]
}
})

break

}

}

res.send("Task marked complete")

})

app.listen(5000,()=>{
console.log("Server running on port 5000")
})