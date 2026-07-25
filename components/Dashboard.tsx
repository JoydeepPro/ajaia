"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { FileText, Plus, Upload, Search, Clock } from "lucide-react";
import toast from "react-hot-toast";

type Doc = { _id:string; title:string; ownerId:string; ownerEmail:string; updatedAt:string; shares:any[] };

export default function Dashboard({ userId, email }: { userId:string; email:string }) {
  const [docs,setDocs]=useState<Doc[]>([]);
  const [error,setError]=useState("");
  const router=useRouter();

  async function load(){ 
    try { setDocs(await api<Doc[]>("/api/documents")); } 
    catch(e:any) { setError(e.message); toast.error("Failed to load documents"); } 
  }
  useEffect(()=>{load()},[]);

  async function create(content?: any, title?: string) {
    try {
      const d=await api<Doc>("/api/documents",{method:"POST",body:JSON.stringify({title:title||"Untitled document",content})});
      toast.success(title ? "Document imported successfully!" : "New document created!");
      router.push(`/documents/${d._id}`);
    } catch(e:any) { setError(e.message); toast.error(e.message); }
  }

  function importFile(file?: File) {
    if (!file) return;
    if (!/\.(txt|md)$/i.test(file.name)) return toast.error("Only .txt and .md files are supported.");
    const reader=new FileReader();
    reader.onload=()=> {
      const text=String(reader.result||"");
      create({type:"doc",content:text.split(/\n\n+/).map(t=>({type:"paragraph",content:t?[{type:"text",text:t}]:[]}))},file.name.replace(/\.(txt|md)$/i,""));
    };
    reader.readAsText(file);
  }

  const owned=docs.filter(d=>d.ownerId===userId);
  const section=(title:string, list:Doc[]) => <section>
    <h2>{title}</h2>
    <div className="grid">{list.length ? list.map(d=><button className="doc-card" key={d._id} onClick={()=>router.push(`/documents/${d._id}`)}>
      <div className="icon-wrapper"><FileText size={24} /></div>
      <strong>{d.title}</strong>
      <span>Owned by you</span>
      <small><Clock size={12} style={{display:'inline', marginRight:'4px', verticalAlign:'middle'}}/> Updated {new Date(d.updatedAt).toLocaleString()}</small>
    </button>) : <div className="empty">No documents here yet.</div>}</div>
  </section>;

  return <main className="dashboard">
    <header className="topbar">
      <div><span className="brand">Ajaia Docs</span><span className="muted user-email">{email}</span></div>
    </header>
    <div className="hero">
      <div><h1>Your documents</h1><p className="muted">Create, import, edit and manage documents seamlessly.</p></div>
      <div className="actions">
        <label className="button"><Upload size={18}/> Import .txt / .md<input hidden type="file" accept=".txt,.md,text/plain,text/markdown" onChange={e=>importFile(e.target.files?.[0])}/></label>
        <button className="primary" onClick={()=>create()}><Plus size={18}/> New document</button>
      </div>
    </div>
    {error&&<p className="error banner">{error}</p>}
    {section("My Documents",owned)}
  </main>
}
