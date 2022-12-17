import { Editor, EditorState, convertFromRaw } from 'draft-js';
import ReactDOM from 'react-dom';
import moment from 'moment';


import React, { useState } from 'react';

const InsertText = () => {
  const [content, setContent] = useState({})

  const insertValue = (e) => {
    // console.log(e.target.innerText);
    const idb = window.indexedDB
    const request = idb.open("test-db", 1)
    request.onsuccess = () => {
      const db = request.result

      const tx = db.transaction('wrtiterData', 'readonly')
      const data = tx.objectStore('wrtiterData')

      const dataEntries = data.get(e.target.innerText)

      dataEntries.onsuccess = () => {
        const textContent = dataEntries.result.text_content
        textContent.blocks.forEach(element => {
          if (element.text.match(/{{.+?}}/gmi)) {
            const format = element.text.match(/(?<={{).+?(?=}})/gmi)[0]
            element.text = element.text.replace(/{{.+?}}/gmi, moment().format(format))
          }
        })
        const content = convertFromRaw(textContent)
        const editorState = EditorState.createWithContent(content)

        ReactDOM.render(<Editor editorState={editorState}/>, e.target)
      }
    }
  }
  return (
    <div>
      <div contentEditable="true" style={{ border: "1px solid" }} onInput={insertValue}></div>
    </div>
  );
}

export default InsertText;
