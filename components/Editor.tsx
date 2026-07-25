"use client";
import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function Editor({ id }: { id:string }) {
  const [doc,setDoc]=useState<any>(null), [title,setTitle]=useState(""), [status,setStatus]=useState("Loading…");
  const [shareOpen,setShareOpen]=useState(false),[shareEmail,setShareEmail]=useState(""),[permission,setPermission]=useState("edit"),[error,setError]=useState("");
  const router=useRouter(); const timer=useRef<any>(null);
  const editor=useEditor({
    immediatelyRender:false,
    extensions:[StarterKit,Underline,Placeholder.configure({placeholder:"Start writing…"})],
    content:"",
    editable:false,
    onUpdate:({editor})=>{
      if(!doc?.access?.canEdit)return;
      setStatus("Unsaved changes");
      clearTimeout(timer.current);
      timer.current=setTimeout(()=>save(undefined,editor.getJSON()),700);
    }
  });

  useEffect(()=>{(async()=>{
    try{
      const d=await api<any>(`/api/documents/${id}`); setDoc(d);setTitle(d.title);setStatus("Saved");
      editor?.commands.setContent(d.content||""); editor?.setEditable(d.access.canEdit);
    }catch(e:any){setError(e.message)}
  })()},[id,editor]);

  async function save(newTitle?:string,content?:any){
    try{
      await api(`/api/documents/${id}`,{method:"PATCH",body:JSON.stringify({...(newTitle!==undefined?{title:newTitle}:{}),...(content?{content}: {})})});
      setStatus("Saved");
    }catch(e:any){setStatus("Save failed");setError(e.message)}
  }
  async function share(){
    try{await api(`/api/documents/${id}/share`,{method:"POST",body:JSON.stringify({email:shareEmail,permission})});setShareEmail("");setShareOpen(false);setStatus("Shared");}
    catch(e:any){setError(e.message)}
  }
  async function remove(){
    if(!confirm("Delete this document permanently?"))return;
    try{await api(`/api/documents/${id}`,{method:"DELETE"});router.push("/dashboard");}catch(e:any){setError(e.message)}
  }
  if(error&&!doc)return <main className="center"><h2>{error}</h2><button onClick={()=>router.push("/dashboard")}>Back</button></main>;
  const btn=(label:string,active:boolean,action:()=>void)=><button type="button" className={active?"active":""} onClick={action} disabled={!doc?.access?.canEdit}>{label}</button>;

  return <main className="editor-shell">
    <header className="editor-header">
      <button className="logo" onClick={()=>router.push("/dashboard")}>A</button>
      <div className="title-area">
        <input value={title} disabled={!doc?.access?.canEdit} onChange={e=>setTitle(e.target.value)}
          onBlur={()=>title.trim()&&title!==doc?.title&&save(title.trim())}/>
        <small>{doc?.access?.isOwner?"Owned by you":`Shared by ${doc?.ownerEmail}`} · {status}</small>
      </div>
      {doc?.access?.isOwner&&<><button onClick={()=>setShareOpen(true)}>Share</button><button className="danger" onClick={remove}>Delete</button></>}
    </header>
    {error&&<div className="error banner">{error}<button onClick={()=>setError("")}>×</button></div>}
    <div className="toolbar">
      {btn("B",!!editor?.isActive("bold"),()=>editor?.chain().focus().toggleBold().run())}
      {btn("I",!!editor?.isActive("italic"),()=>editor?.chain().focus().toggleItalic().run())}
      {btn("U",!!editor?.isActive("underline"),()=>editor?.chain().focus().toggleUnderline().run())}
      {btn("H1",!!editor?.isActive("heading",{level:1}),()=>editor?.chain().focus().toggleHeading({level:1}).run())}
      {btn("H2",!!editor?.isActive("heading",{level:2}),()=>editor?.chain().focus().toggleHeading({level:2}).run())}
      {btn("• List",!!editor?.isActive("bulletList"),()=>editor?.chain().focus().toggleBulletList().run())}
      {btn("1. List",!!editor?.isActive("orderedList"),()=>editor?.chain().focus().toggleOrderedList().run())}
      {!doc?.access?.canEdit&&<span className="readonly">View only</span>}
    </div>
    <div className="page"><EditorContent editor={editor}/></div>
    {shareOpen&&<div className="modal-bg"><div className="modal"><h2>Share “{title}”</h2><p className="muted">Grant access using an email address.</p>
      <input type="email" placeholder="teammate@example.com" value={shareEmail} onChange={e=>setShareEmail(e.target.value)}/>
      <select value={permission} onChange={e=>setPermission(e.target.value)}><option value="edit">Can edit</option><option value="view">Can view</option></select>
      <div className="modal-actions"><button onClick={()=>setShareOpen(false)}>Cancel</button><button className="primary" onClick={share}>Share</button></div>
    </div></div>}
  </main>
}
