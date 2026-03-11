export default function TopBar({title,user}){

return(

<div style={{
width:"100%",
padding:"15px 30px",
background:"#ffffff",
borderBottom:"1px solid #ddd",
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}>

<h3>{title}</h3>

<div>

<span style={{marginRight:"15px"}}>
{user}
</span>

<button onClick={()=>window.location="/"}>

Logout

</button>

</div>

</div>

)

}