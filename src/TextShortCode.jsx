import React, { useState,useEffect } from 'react';
import 'draft-js/dist/Draft.css';
import RichEditorExample from './draft';
const idb = window.indexedDB

const crearteCollection = () => {
    if (!idb) {
      console.log("no db found");
      return
    }
    const request = idb.open("test-db", 1)
    request.onerror = (e) => {
      console.log("error", e);
    }
    request.onupgradeneeded = (e) => {
      const db = request.result
      if (!db.objectStoreNames.contains('wrtiterData')) {
        db.createObjectStore("wrtiterData", {
          keyPath: 'short_code'
        })
      }
    }
  
    request.onsuccess = () => {
      console.log('db is success')
    }
  }


export default function TextShortCode(){
  const [values, setValues] = useState({
    label: "",
    short_code: "",
    text_content: null
  })
  // @ts-ignore
  const items = JSON.parse(window.localStorage.getItem('content'))

  useEffect(() => {
    crearteCollection()
    setValues({...values, text_content: items})
  }, [])
  // validate rich text content empty or not
  const validateTextContent = (items) => {
    let result
    items?.blocks && items?.blocks.map(item=>{
      if(item.text !== ""){
        result = 1
      }
      return result
    })
    return result
  }

  // validate if short code already used or not
  const validateShortCode=(shorCode)=>{
    let result = false
    const request = idb.open("test-db", 1)
    request.onsuccess = () => {
      const db = request.result

      const tx = db.transaction('wrtiterData', 'readonly')
      const data = tx.objectStore('wrtiterData')

      console.log(shorCode);
      const dataEntries = data.get(JSON.stringify(shorCode))
      dataEntries.onerror=(err)=>{
        console.log("err");
      }
      dataEntries.onsuccess = () => {
        console.log("success");
        result = true
      }
    }
    return result
  }
  // const textarea = useRef(null)
  const saveData = () => {
    // validate label field
    if(!values.label ){
      alert("please enter a label")
      return
    }
    // validate short code
    if(!values.short_code || values.short_code[0] !== '/' || values.short_code.length < 4 ){
      alert("please enter valid short code")
      return
    }
    // validate short code already used or not
    if(validateShortCode(values.short_code) ){
      alert("please enter a unique short code")
      return
    }
    // validating rich text empty or not
    if(!validateTextContent(items)){
      alert("please enter text content")
      return
    }
    
    console.log(values, window.localStorage.getItem('content'));
    // open indexeddb instance
    const request = idb.open("test-db", 1)
    // saving data to indexeddb
    request.onsuccess = () => {
      const db = request.result

      const tx = db.transaction('wrtiterData', 'readwrite')

      const data = tx.objectStore('wrtiterData')
      const dataEntries = data.put(values)

      dataEntries.onsuccess = () => {
        tx.oncomplete = () => {
          db.close();
        }
        setValues({
          label: "",
          short_code: "",
          text_content: null
        })
        window.localStorage.clear()
        alert("text shortcut added")
      }

    }

  };

  return <>
  <div className='container mx-auto py-3'>
    <label htmlFor="label" className='block mt-3'>Label</label>
    <input className='block border border-black rounded px-4 py-3 valid:border-green-500 w-96' required type="text" name='label' placeholder='please enter your shortcode label' onChange={(e)=>{setValues({...values, label: e.target.value})}}/>
    <label className='block mt-3' htmlFor="shortCode">Short code</label>
    <input className='block border border-black rounded px-4 py-3 valid:border-green-500 w-96' required type="text" name='shortCode' minLength={4} placeholder='please enter your shortcode eg: /shortcode' onChange={(e)=>{setValues({...values,short_code: e.target.value})}}/>
    <label className='block mt-3' htmlFor="content">Text content</label>
    {/* <div className='block border border-black rounded px-4 py-3'> */}
      <RichEditorExample />
      {/* <p contentEditable={true}>{editorState}</p> */}
    {/* </div> */}
    <button className='border rounded-md cursor-pointer mt-5 px-5 py-2 bg-black text-white' onClick={saveData}>Submit</button>
  </div>
    
  </>
}