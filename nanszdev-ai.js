// =========================
// ELEMENT
// =========================

const sidebar = document.getElementById("sidebar");
const main = document.getElementById("main");
const dragHandle = document.getElementById("dragHandle");

const menuBtn = document.getElementById("menuBtn");
const closeSidebar = document.getElementById("closeSidebar");

const chatContainer = document.getElementById("chatContainer");

const promptInput = document.getElementById("prompt");
const sendBtn = document.getElementById("sendBtn");

const apiKeyInput = document.getElementById("apiKey");
const saveApiBtn = document.getElementById("saveApi");

const chatHistoryDiv = document.getElementById("chatHistory");
const codeHistoryDiv = document.getElementById("codeHistory");

const clearChatsBtn = document.getElementById("clearChats");
const clearCodesBtn = document.getElementById("clearCodes");

const modelSelect = document.getElementById("modelSelect");

// =========================
// STORAGE KEYS
// =========================

const STORAGE_CHAT = "ai_chat_history";
const STORAGE_CODES = "ai_code_history";
const STORAGE_MESSAGES = "ai_messages";
const STORAGE_API = "openrouter_api";
const STORAGE_MODEL = "openrouter_model";

// =========================
// DATA
// =========================

let messages = [];
let codeHistory = [];
let chatHistory = [];

let dragging = false;
let startX = 0;

// =========================
// LOAD STORAGE
// =========================

function loadStorage() {

chatHistory =
JSON.parse(
localStorage.getItem(STORAGE_CHAT)
) || [];

codeHistory =
JSON.parse(
localStorage.getItem(STORAGE_CODES)
) || [];

messages =
JSON.parse(
localStorage.getItem(STORAGE_MESSAGES)
) || [];

const api =
localStorage.getItem(STORAGE_API);

if(api){
apiKeyInput.value = api;
}

const model =
localStorage.getItem(STORAGE_MODEL);

if(model){
modelSelect.value = model;
}

renderChatHistory();
renderCodeHistory();

}

// =========================
// SAVE STORAGE
// =========================

function saveMessages(){

localStorage.setItem(
STORAGE_MESSAGES,
JSON.stringify(messages)
);

}

function saveChatHistory(){

localStorage.setItem(
STORAGE_CHAT,
JSON.stringify(chatHistory)
);

}

function saveCodeHistory(){

localStorage.setItem(
STORAGE_CODES,
JSON.stringify(codeHistory)
);

}

// =========================
// SAVE API
// =========================

saveApiBtn.addEventListener("click",()=>{

localStorage.setItem(
STORAGE_API,
apiKeyInput.value.trim()
);

alert("API Key tersimpan");

});

// =========================
// SAVE MODEL
// =========================

modelSelect.addEventListener("change",()=>{

localStorage.setItem(
STORAGE_MODEL,
modelSelect.value
);

});

// =========================
// SIDEBAR
// =========================

function openSidebar(){

sidebar.classList.remove("closed");
sidebar.classList.add("show");

main.classList.remove("full");

dragHandle.style.left = "320px";

}

function closeSide(){

sidebar.classList.add("closed");
sidebar.classList.remove("show");

main.classList.add("full");

dragHandle.style.left = "0px";

}

menuBtn.addEventListener("click",()=>{

if(sidebar.classList.contains("closed")){
openSidebar();
}else{
closeSide();
}

});

closeSidebar.addEventListener("click",()=>{
closeSide();
});

// =========================
// DRAG OPEN CLOSE
// =========================

dragHandle.addEventListener("mousedown",(e)=>{

dragging = true;
startX = e.clientX;

});

document.addEventListener("mousemove",(e)=>{

if(!dragging) return;

const x = e.clientX;

if(x < 80){

closeSide();

}

if(x > 200){

openSidebar();

}

});

document.addEventListener("mouseup",()=>{

dragging = false;

});

// =========================
// MOBILE SWIPE
// =========================

let touchStartX = 0;

document.addEventListener("touchstart",(e)=>{

touchStartX =
e.touches[0].clientX;

});

document.addEventListener("touchmove",(e)=>{

const currentX =
e.touches[0].clientX;

if(touchStartX < 30 &&
currentX > 100){

openSidebar();

}

if(currentX < 40){

closeSide();

}

});

// =========================
// AUTO SCROLL
// =========================

function scrollBottom(){

chatContainer.scrollTop =
chatContainer.scrollHeight;

}

// =========================
// CHAT HISTORY
// =========================

function addChatHistory(text){

if(!text) return;

chatHistory.unshift({
text:text,
time:Date.now()
});

if(chatHistory.length > 50){

chatHistory =
chatHistory.slice(0,50);

}

saveChatHistory();

renderChatHistory();

}

function renderChatHistory(){

chatHistoryDiv.innerHTML = "";

chatHistory.forEach(item=>{

const div =
document.createElement("div");

div.className =
"history-item";

div.textContent =
item.text.substring(0,60);

div.onclick = ()=>{

promptInput.value =
item.text;

};

chatHistoryDiv.appendChild(div);

});

}

// =========================
// CODE HISTORY
// =========================

function addCodeHistory(code){

if(!code) return;

codeHistory.unshift({
code:code,
time:Date.now()
});

if(codeHistory.length > 50){

codeHistory =
codeHistory.slice(0,50);

}

saveCodeHistory();

renderCodeHistory();

}

function renderCodeHistory(){

codeHistoryDiv.innerHTML = "";

codeHistory.forEach(item=>{

const div =
document.createElement("div");

div.className =
"history-item";

div.textContent =
item.code.substring(0,50);

div.onclick = ()=>{

navigator.clipboard.writeText(
item.code
);

};

codeHistoryDiv.appendChild(div);

});

}

// =========================
// CLEAR HISTORY
// =========================

clearChatsBtn.addEventListener("click",()=>{

if(!confirm("Hapus riwayat chat?"))
return;

chatHistory = [];

saveChatHistory();

renderChatHistory();

});

clearCodesBtn.addEventListener("click",()=>{

if(!confirm("Hapus riwayat kode?"))
return;

codeHistory = [];

saveCodeHistory();

renderCodeHistory();

});

// =========================
// NEW CHAT
// =========================

document.getElementById("newChat")
.addEventListener("click",()=>{

messages = [];

saveMessages();

chatContainer.innerHTML = "";

});

// =========================
// AUTO RESIZE TEXTAREA
// =========================

promptInput.addEventListener("input",()=>{

promptInput.style.height =
"auto";

promptInput.style.height =
promptInput.scrollHeight + "px";

});

// =========================
// START
// =========================

loadStorage();

scrollBottom();

// =========================
// MESSAGE UI
// =========================

function createMessage(role, text = "") {

const wrap =
document.createElement("div");

wrap.className =
`message ${role}`;

const avatar =
document.createElement("div");

avatar.className =
"avatar";

avatar.textContent =
role === "user"
? "U"
: "AI";

const bubble =
document.createElement("div");

bubble.className =
"bubble";

bubble.innerHTML = text;

wrap.appendChild(avatar);
wrap.appendChild(bubble);

chatContainer.appendChild(wrap);

scrollBottom();

return bubble;

}

// =========================
// RESTORE CHAT
// =========================

function restoreMessages(){

if(messages.length === 0)
return;

chatContainer.innerHTML = "";

messages.forEach(msg=>{

createMessage(
msg.role,
msg.content
);

});

scrollBottom();

}

restoreMessages();

// =========================
// OPENROUTER STREAM
// =========================

async function sendMessage(){

const text =
promptInput.value.trim();

if(!text) return;

const apiKey =
apiKeyInput.value.trim();

if(!apiKey){

alert(
"Masukkan OpenRouter API Key"
);

return;

}

// =========================
// USER MESSAGE
// =========================

createMessage(
"user",
text
);

messages.push({
role:"user",
content:text
});

saveMessages();

addChatHistory(text);

promptInput.value = "";
promptInput.style.height =
"50px";

// =========================
// AI MESSAGE
// =========================

const aiBubble =
createMessage(
"ai",
"Sedang berpikir..."
);

try{

// =========================
// MEMORY CHAT
// =========================

const memory =
messages.slice(-20);

// kirim 20 pesan terakhir
// agar AI ingat konteks

const response =
await fetch(
"https://openrouter.ai/api/v1/chat/completions",
{
method:"POST",
headers:{
"Authorization":
`Bearer ${apiKey}`,
"Content-Type":
"application/json"
},
body:JSON.stringify({

model:
modelSelect.value,

messages:memory,

stream:true

})
}
);

if(!response.ok){

throw new Error(
"Gagal menghubungi OpenRouter"
);

}

// =========================
// STREAM READER
// =========================

const reader =
response.body.getReader();

const decoder =
new TextDecoder();

let answer = "";

aiBubble.innerHTML = "";

while(true){

const {
done,
value
}
=
await reader.read();

if(done)
break;

const chunk =
decoder.decode(
value,
{
stream:true
}
);

const lines =
chunk.split("\n");

for(
const line
of lines
){

if(
!line.startsWith(
"data:"
)
)
continue;

const data =
line.replace(
"data:",
""
).trim();

if(
data === "[DONE]"
)
continue;

try{

const json =
JSON.parse(data);

const token =
json
?.choices?.[0]
?.delta?.content;

if(token){

answer += token;

// sementara tampil teks
aiBubble.textContent =
answer;

scrollBottom();

}

}catch(err){

console.log(err);

}

}

}

// =========================
// SIMPAN AI
// =========================

messages.push({

role:"assistant",

content:answer

});

saveMessages();

// =========================
// UPDATE RENDER
// =========================

aiBubble.innerHTML =
marked.parse(answer);

scrollBottom();

// lanjut syntax highlight
setTimeout(()=>{

if(window.hljs){

document
.querySelectorAll(
"pre code"
)
.forEach(block=>{

hljs.highlightElement(
block
);

});

}

},100);

}
catch(error){

console.error(error);

aiBubble.innerHTML =

`❌ ${error.message}`;

}

}

// =========================
// SEND BUTTON
// =========================

sendBtn.addEventListener(
"click",
sendMessage
);

// =========================
// ENTER TO SEND
// =========================

promptInput
.addEventListener(
"keydown",
(e)=>{

if(
e.key === "Enter" &&
!e.shiftKey
){

e.preventDefault();

sendMessage();

}

}
);

// =========================
// KEEP MEMORY
// =========================

// Pesan lama tetap tersimpan
// dan dikirim kembali ke AI
// sehingga AI dapat mengingat
// percakapan sebelumnya

window.addEventListener(
"beforeunload",
()=>{
saveMessages();
}
);

// =========================
// MARKED CONFIG
// =========================

marked.setOptions({
breaks:true,
gfm:true
});

// =========================
// RENDER CODE BLOCK
// =========================

function renderCodeBlocks(){

const blocks =
document.querySelectorAll(
"pre code"
);

blocks.forEach(block=>{

// syntax highlight
if(window.hljs){

hljs.highlightElement(
block
);

}

// simpan ke riwayat kode

const code =
block.textContent.trim();

if(
code.length > 20
){

const exists =
codeHistory.some(
item =>
item.code === code
);

if(!exists){

addCodeHistory(code);

}

}

// =========================
// WRAP CODE
// =========================

const pre =
block.parentElement;

if(
pre.parentElement.classList
.contains(
"code-wrapper"
)
)
return;

const wrapper =
document.createElement("div");

wrapper.className =
"code-wrapper";

const header =
document.createElement("div");

header.className =
"code-header";

const lang =
document.createElement("span");

lang.className =
"lang";

let language =
"Code";

const classList =
block.className;

if(
classList.includes(
"language-"
)
){

language =
classList
.replace(
"language-",
""
);

}

lang.textContent =
language;

// =========================
// COPY BUTTON
// =========================

const copyBtn =
document.createElement(
"button"
);

copyBtn.className =
"copy-btn";

copyBtn.textContent =
"Copy";

copyBtn.onclick =
async ()=>{

try{

await navigator
.clipboard
.writeText(code);

copyBtn.textContent =
"Copied";

setTimeout(()=>{

copyBtn.textContent =
"Copy";

},1500);

}
catch{

copyBtn.textContent =
"Error";

}

};

header.appendChild(lang);
header.appendChild(copyBtn);

// =========================
// REPLACE
// =========================

pre.parentNode.insertBefore(
wrapper,
pre
);

wrapper.appendChild(
header
);

wrapper.appendChild(
pre
);

});

}

// =========================
// MARKDOWN RENDER
// =========================

function renderMarkdown(
element,
text
){

element.innerHTML =
marked.parse(text);

renderCodeBlocks();

scrollBottom();

}

// =========================
// OVERRIDE CREATE MESSAGE
// =========================

const originalCreate =
createMessage;

createMessage =
function(role,text=""){

const wrap =
document.createElement(
"div"
);

wrap.className =
`message ${role}`;

const avatar =
document.createElement(
"div"
);

avatar.className =
"avatar";

avatar.textContent =
role === "user"
? "U"
: "AI";

const bubble =
document.createElement(
"div"
);

bubble.className =
"bubble";

if(role === "ai"){

bubble.innerHTML =
marked.parse(text);

}
else{

bubble.textContent =
text;

}

wrap.appendChild(
avatar
);

wrap.appendChild(
bubble
);

chatContainer
.appendChild(
wrap
);

renderCodeBlocks();

scrollBottom();

return bubble;

};

// =========================
// RELOAD MESSAGE FORMAT
// =========================

function reloadMessages(){

if(messages.length === 0)
return;

chatContainer.innerHTML = "";

messages.forEach(msg=>{

if(
msg.role === "assistant"
){

createMessage(
"ai",
msg.content
);

}
else{

createMessage(
"user",
msg.content
);

}

});

scrollBottom();

}

// =========================
// EXPORT CHAT
// =========================

function exportChat(){

const data =
JSON.stringify(
messages,
null,
2
);

const blob =
new Blob(
[data],
{
type:
"application/json"
}
);

const url =
URL.createObjectURL(
blob
);

const a =
document.createElement(
"a"
);

a.href = url;

a.download =
"chat-history.json";

a.click();

URL.revokeObjectURL(
url
);

}

// =========================
// SHORTCUT CTRL+S
// =========================

document.addEventListener(
"keydown",
e=>{

if(
e.ctrlKey &&
e.key.toLowerCase()
=== "s"
){

e.preventDefault();

exportChat();

}

}
);

// =========================
// AUTO SAVE
// =========================

setInterval(()=>{

saveMessages();
saveChatHistory();
saveCodeHistory();

},3000);

// =========================
// AUTO SCROLL STREAM
// =========================

const observer =
new MutationObserver(
()=>{

scrollBottom();

}
);

observer.observe(
chatContainer,
{
childList:true,
subtree:true
}
);

// =========================
// FIRST LOAD
// =========================

reloadMessages();

renderCodeBlocks();

scrollBottom();

// =========================
// READY
// =========================

console.log(
"AI Chat Ready"
);

