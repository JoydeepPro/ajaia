"use client";
import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Bold, Italic, Underline as UnderlineIcon, Heading1, Heading2, List, ListOrdered, Trash2, Save, Edit3, ArrowLeft, Eye, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function Editor({ id }: { id:string }) {
  const [doc,setDoc]=useState<any>(null), [title,setTitle]=useState(""), [status,setStatus]=useState("Loading…");
  const [error,setError]=useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  const router=useRouter(); const timer=useRef<any>(null); const titleRef = useRef<HTMLInputElement>(null);
  const editor=useEditor({
    immediatelyRender:false,
    extensions:[StarterKit,Underline,Placeholder.configure({placeholder:"Start writing…"})],
    content:"",
    editable:false,
    onUpdate:({editor})=>{
      if(!doc?.access?.canEdit)return;
      setStatus("Unsaved changes");
      clearTimeout(timer.current);
      timer.current=setTimeout(()=>save(undefined,editor.getJSON(), true),700);
    }
  });

  useEffect(()=>{(async()=>{
    try{
      const d=await api<any>(`/api/documents/${id}`); setDoc(d);setTitle(d.title);setStatus("Saved");
      editor?.commands.setContent(d.content||""); editor?.setEditable(d.access.canEdit);
    }catch(e:any){setError(e.message); toast.error("Failed to load document");}
  })()},[id,editor]);

  async function save(newTitle?:string,content?:any, isAutoSave: boolean = false){
    if (isSaving) return;
    setIsSaving(true);
    try{
      await api(`/api/documents/${id}`,{method:"PATCH",body:JSON.stringify({...(newTitle!==undefined?{title:newTitle}:{}),...(content?{content}: {})})});
      setStatus("Saved");
      if (!isAutoSave) toast.success("Document saved!");
    }catch(e:any){setStatus("Save failed");setError(e.message); toast.error(e.message);}
    finally { setIsSaving(false); }
  }

  async function remove(){
    if(!confirm("Delete this document permanently?"))return;
    try{await api(`/api/documents/${id}`,{method:"DELETE"}); toast.success("Document deleted"); router.push("/dashboard");}catch(e:any){setError(e.message); toast.error(e.message);}
  }
  if(error&&!doc)return <main className="center"><h2>{error}</h2><button className="button" onClick={()=>router.push("/dashboard")}>Back</button></main>;
  const btn=(icon:any,active:boolean,action:()=>void,title:string)=><button type="button" title={title} className={active?"active":""} onClick={action} disabled={!doc?.access?.canEdit}>{icon}</button>;

  return <main className="editor-shell">
    <header className="editor-header">
      <button className="button" style={{padding:'8px', borderRadius:'12px', border:'none', boxShadow:'none'}} onClick={()=>router.push("/dashboard")} title="Back to Dashboard"><ArrowLeft size={22} /></button>
      <div className="title-area">
        <div className="title-input-wrapper">
          <input ref={titleRef} value={title} disabled={!doc?.access?.canEdit} onChange={e=>setTitle(e.target.value)}
            onBlur={()=>{
              if(title.trim()&&title!==doc?.title){
                save(title.trim());
                toast.success("Document renamed");
              }
            }} placeholder="Document Title"/>
          {doc?.access?.canEdit && <button type="button" title="Rename" style={{background:'transparent',border:'none',boxShadow:'none',padding:'4px',color:'var(--text-muted)'}} onClick={()=>titleRef.current?.focus()}><Edit3 size={16}/></button>}
        </div>
        <small>{doc?.access?.isOwner?"Owned by you":`Shared by ${doc?.ownerEmail}`}</small>
      </div>
      
      <div className="header-actions">
        <span className={`save-status ${status==='Saved'?'saved':'unsaved'}`}>
          {status==='Saved' ? <CheckCircle2 size={16}/> : (status==='Unsaved changes' ? <AlertCircle size={16}/> : null)} {status}
        </span>
        {doc?.access?.canEdit && <button className="button" disabled={isSaving} onClick={()=>save(title.trim(), editor?.getJSON())}><Save size={16}/> {isSaving ? "Saving..." : "Save"}</button>}
        {doc?.access?.isOwner&&<>
          <button className="danger button" onClick={remove}><Trash2 size={16}/> Delete</button>
        </>}
      </div>
    </header>
    {error&&<div className="error banner">{error}<button onClick={()=>setError("")}>×</button></div>}
    
    <div className="toolbar">
      {btn(<Bold size={18}/>,!!editor?.isActive("bold"),()=>editor?.chain().focus().toggleBold().run(), "Bold")}
      {btn(<Italic size={18}/>,!!editor?.isActive("italic"),()=>editor?.chain().focus().toggleItalic().run(), "Italic")}
      {btn(<UnderlineIcon size={18}/>,!!editor?.isActive("underline"),()=>editor?.chain().focus().toggleUnderline().run(), "Underline")}
      <span style={{width:'1px', background:'var(--border)', margin:'4px 8px'}}></span>
      {btn(<Heading1 size={18}/>,!!editor?.isActive("heading",{level:1}),()=>editor?.chain().focus().toggleHeading({level:1}).run(), "Heading 1")}
      {btn(<Heading2 size={18}/>,!!editor?.isActive("heading",{level:2}),()=>editor?.chain().focus().toggleHeading({level:2}).run(), "Heading 2")}
      <span style={{width:'1px', background:'var(--border)', margin:'4px 8px'}}></span>
      {btn(<List size={18}/>,!!editor?.isActive("bulletList"),()=>editor?.chain().focus().toggleBulletList().run(), "Bullet List")}
      {btn(<ListOrdered size={18}/>,!!editor?.isActive("orderedList"),()=>editor?.chain().focus().toggleOrderedList().run(), "Numbered List")}
      {!doc?.access?.canEdit&&<span className="readonly"><Eye size={16} style={{display:'inline', verticalAlign:'text-bottom', marginRight:'4px'}}/> View only</span>}
    </div>
    
    <div className="page"><EditorContent editor={editor}/></div>
  </main>
}
