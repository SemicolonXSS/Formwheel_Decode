let mode="encode";

const $=id=>document.getElementById(id);


/* =========================
   도구 설명
========================= */

const toolInfo={

base64:[
"Base64",
"텍스트를 Base64 문자열로 변환하거나 다시 UTF-8 텍스트로 복원합니다."
],

base32:[
"Base32",
"텍스트를 Base32 형식으로 변환하거나 복원합니다."
],

hex:[
"Hex / Base16",
"UTF-8 데이터를 16진수 바이트로 변환합니다."
],

url:[
"URL Encode",
"URL에서 안전하게 사용할 수 있도록 특수문자를 인코딩합니다."
],

html:[
"HTML Entity",
"<, >, &, 따옴표 등의 문자를 HTML Entity로 변환합니다."
],

rot13:[
"ROT13",
"영문 알파벳을 13칸 이동합니다. Encode와 Decode가 동일한 방식으로 작동합니다."
],

rot47:[
"ROT47",
"ASCII 출력 가능 문자 영역을 47칸 이동합니다."
],

atbash:[
"Atbash",
"영문 알파벳의 순서를 뒤집어 변환합니다."
],

binary:[
"Binary / 2진법",
"UTF-8 데이터를 0과 1로 이루어진 2진수로 변환합니다."
],

decimal:[
"Decimal / 10진법",
"UTF-8 바이트를 10진수 숫자로 표현합니다."
],

hexnumber:[
"Hex Number / 16진법",
"숫자를 16진수로 변환하거나 16진수를 10진수로 복원합니다."
],

octal:[
"Octal / 8진법",
"UTF-8 바이트를 8진수로 표현합니다."
],

ascii:[
"ASCII",
"문자와 ASCII 숫자 코드 사이를 변환합니다."
],

unicode:[
"Unicode Escape",
"문자를 \\uXXXX 형태의 Unicode Escape로 변환합니다."
],

morse:[
"Morse Code",
"문자를 점과 선으로 이루어진 모스 부호로 변환합니다."
]

};


function updateToolInfo(){

  const m=$("method").value;
  $("toolName").textContent=toolInfo[m][0];
  $("toolDescription").textContent=toolInfo[m][1];

}


/* =========================
   Encode / Decode
========================= */

function setMode(m){

  mode=m;

  $("encodeBtn").classList.toggle("active",m==="encode");
  $("decodeBtn").classList.toggle("active",m==="decode");

  $("status").textContent="";

}


/* =========================
   UTF-8
========================= */

function utf8Encode(s){

  return new TextEncoder().encode(s);

}

function utf8Decode(bytes){

  return new TextDecoder("utf-8",{fatal:true}).decode(bytes);

}


/* =========================
   Base64
========================= */

function base64Encode(s){

  let bytes=utf8Encode(s);
  let binary="";

  for(const b of bytes){
    binary+=String.fromCharCode(b);
  }

  return btoa(binary);

}

function base64Decode(s){

  s=s.trim();

  let binary=atob(s);

  let bytes=Uint8Array.from(
    binary,
    c=>c.charCodeAt(0)
  );

  return utf8Decode(bytes);

}


/* =========================
   Base32
========================= */

const base32Alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(s){

  const bytes=utf8Encode(s);

  let bits="";

  for(const b of bytes){
    bits+=b.toString(2).padStart(8,"0");
  }

  while(bits.length%5!==0){
    bits+="0";
  }

  let out="";

  for(let i=0;i<bits.length;i+=5){

    out+=base32Alphabet[
      parseInt(bits.slice(i,i+5),2)
    ];

  }

  while(out.length%8!==0){
    out+="=";
  }

  return out;

}

function base32Decode(s){
  if(!String(s).trim())return "";

  const compact=String(s).toUpperCase().replace(/\s+/g,'');
  if(compact.includes('=')){const raw=compact.replace(/=+$/,'');const pad=compact.length-raw.length;if(!/^[A-Z2-7]+={1,6}$/.test(compact)||compact.length%8!==0||pad!==((8-raw.length%8)%8))throw Error('Base32 패딩이 올바르지 않습니다.');}
  s=s
    .toUpperCase()
    .replace(/\s+/g,"")
    .replace(/=+$/,"");

  let bits="";

  for(const c of s){

    const n=base32Alphabet.indexOf(c);

    if(n<0){
      throw Error("올바르지 않은 Base32 문자열입니다.");
    }

    bits+=n.toString(2).padStart(5,"0");

  }

  const bytes=[];

  for(let i=0;i+8<=bits.length;i+=8){

    bytes.push(
      parseInt(bits.slice(i,i+8),2)
    );

  }

  const remainder=bits.slice(bytes.length*8);
  if(![0,2,4,5,7].includes(s.length%8)||/1/.test(remainder))throw Error("Base32 길이 또는 끝 비트가 올바르지 않습니다.");
  return utf8Decode(new Uint8Array(bytes));

}


/* =========================
   Hex
========================= */

function hexEncode(s){

  return [...utf8Encode(s)]
    .map(x=>x.toString(16).padStart(2,"0"))
    .join(" ");

}

function hexDecode(s){
  if(!String(s).trim())return "";

  s=s
    .replace(/0x/gi,"")
    .replace(/[\s:]/g,"");

  if(
    !s ||
    !/^[0-9a-fA-F]+$/.test(s) ||
    s.length%2!==0
  ){
    throw Error("Hex 형식이 올바르지 않습니다.");
  }

  const bytes=new Uint8Array(
    s.match(/../g).map(x=>parseInt(x,16))
  );

  return utf8Decode(bytes);

}


/* =========================
   URL
========================= */

function urlEncode(s){

  return encodeURIComponent(s);

}

function urlDecode(s){

  return decodeURIComponent(s);

}


/* =========================
   HTML Entity
========================= */

function htmlEncode(s){

  const div=document.createElement("div");

  div.textContent=s;

  return div.innerHTML;

}

function htmlDecode(s){

  const parser=new DOMParser();

  const doc=parser.parseFromString(
    s,
    "text/html"
  );

  return doc.documentElement.textContent;

}


/* =========================
   ROT13
========================= */

function rot13(s){

  return s.replace(/[A-Za-z]/g,c=>{

    const base=c<="Z"?65:97;

    return String.fromCharCode(
      base+(c.charCodeAt(0)-base+13)%26
    );

  });

}


/* =========================
   ROT47
========================= */

function rot47(s){

  return [...s].map(c=>{

    const n=c.charCodeAt(0);

    if(n>=33 && n<=126){

      return String.fromCharCode(
        33+(n-33+47)%94
      );

    }

    return c;

  }).join("");

}


/* =========================
   Atbash
========================= */

function atbash(s){

  return s.replace(/[A-Za-z]/g,c=>{

    const base=c<="Z"?65:97;

    return String.fromCharCode(
      base+25-(c.charCodeAt(0)-base)
    );

  });

}


/* =========================
   Binary
========================= */

function binaryEncode(s){

  return [...utf8Encode(s)]
    .map(x=>x.toString(2).padStart(8,"0"))
    .join(" ");

}

function binaryDecode(s){
  if(!String(s).trim())return "";

  const parts=s.trim().split(/\s+/);

  if(
    !parts.length ||
    parts.some(x=>!/^[01]{1,8}$/.test(x))
  ){
    throw Error("2진수는 0과 1만 사용해야 합니다.");
  }

  return utf8Decode(
    new Uint8Array(
      parts.map(x=>parseInt(x,2))
    )
  );

}


/* =========================
   Decimal
========================= */

function decimalEncode(s){

  return [...utf8Encode(s)]
    .map(x=>x.toString(10))
    .join(" ");

}

function decimalDecode(s){
  if(!String(s).trim())return "";

  const parts=s.trim().split(/\s+/);

  if(
    !parts.length ||
    parts.some(x=>!/^\d+$/.test(x))
  ){
    throw Error("10진수 형식이 올바르지 않습니다.");
  }

  const nums=parts.map(x=>{

    const n=Number(x);

    if(n<0 || n>255){
      throw Error("UTF-8 바이트는 0~255 범위여야 합니다.");
    }

    return n;

  });

  return utf8Decode(
    new Uint8Array(nums)
  );

}


/* =========================
   Hex Number
========================= */

function hexNumberEncode(s){

  if(!/^-?\d+$/.test(s.trim())){
    throw Error("정수를 입력하세요.");
  }

  return BigInt(s.trim())
    .toString(16)
    .toUpperCase();

}

function hexNumberDecode(s){
  if(!String(s).trim())return "";

  s=s.trim();const negative=s.startsWith("-");if(negative)s=s.slice(1);s=s.replace(/^0x/i,"");

  if(!/^[0-9a-fA-F]+$/.test(s)){
    throw Error("16진수 숫자가 아닙니다.");
  }

  return ((negative?-1n:1n)*BigInt("0x"+s)).toString(10);

}


/* =========================
   Octal
========================= */

function octalEncode(s){

  return [...utf8Encode(s)]
    .map(x=>x.toString(8).padStart(3,"0"))
    .join(" ");

}

function octalDecode(s){
  if(!String(s).trim())return "";

  const parts=s.trim().split(/\s+/);

  if(
    !parts.length ||
    parts.some(x=>!/^[0-7]+$/.test(x))
  ){
    throw Error("8진수 형식이 올바르지 않습니다.");
  }

  const nums=parts.map(x=>{

    const n=parseInt(x,8);

    if(n>255){
      throw Error("각 값은 255 이하의 바이트여야 합니다.");
    }

    return n;

  });

  return utf8Decode(
    new Uint8Array(nums)
  );

}


/* =========================
   ASCII
========================= */

function asciiEncode(s){

  return [...s]
    .map(c=>c.codePointAt(0))
    .join(" ");

}

function asciiDecode(s){
  if(!String(s).trim())return "";

  const parts=s.trim().split(/\s+/);

  if(
    !parts.length ||
    parts.some(x=>!/^\d+$/.test(x))
  ){
    throw Error("ASCII 숫자 형식이 올바르지 않습니다.");
  }

  return parts.map(x=>{

    const n=Number(x);

    if(!Number.isInteger(n)||n>1114111||(n>=55296&&n<=57343)){
      throw Error("유효하지 않은 문자 코드입니다.");
    }

    return String.fromCodePoint(n);

  }).join("");

}


/* =========================
   Unicode Escape
========================= */

function unicodeEncode(s){

  return [...s].map(c=>{

    const cp=c.codePointAt(0);

    if(cp<=0xffff){

      return "\\u"+
        cp.toString(16).padStart(4,"0");

    }

    return "\\u{"+
      cp.toString(16)+
      "}";

  }).join("");

}

function unicodeDecode(s){
 const valid=/\\u(?:\{[0-9a-fA-F]{1,6}\}|[0-9a-fA-F]{4})/g;
 if(/\\u/.test(s.replace(valid,'')))throw Error('Unicode Escape 형식이 잘못되었습니다.');
 const decoded=s.replace(/\\u\{([0-9a-fA-F]{1,6})\}/g,(_,h)=>String.fromCodePoint(parseInt(h,16))).replace(/\\u([0-9a-fA-F]{4})/g,(_,h)=>String.fromCharCode(parseInt(h,16)));
 for(const char of decoded){const cp=char.codePointAt(0);if(cp>=0xd800&&cp<=0xdfff)throw Error('완성되지 않은 서로게이트 문자입니다.');}return decoded;
}


/* =========================
   Morse
========================= */

const morseMap={
A:".-",B:"-...",C:"-.-.",D:"-..",E:".",
F:"..-.",G:"--.",H:"....",I:"..",J:".---",
K:"-.-",L:".-..",M:"--",N:"-.",O:"---",
P:".--.",Q:"--.-",R:".-.",S:"...",T:"-",
U:"..-",V:"...-",W:".--",X:"-..-",
Y:"-.--",Z:"--..",

0:"-----",1:".----",2:"..---",3:"...--",
4:"....-",5:".....",6:"-....",7:"--...",
8:"---..",9:"----."
};

const reverseMorse=
Object.fromEntries(
  Object.entries(morseMap)
    .map(([k,v])=>[v,k])
);

function morseEncode(s){

  return [...s.toUpperCase()]
    .map(c=>{

      if(c===" ") return "/";

      return morseMap[c]||c;

    })
    .join(" ");

}

function morseDecode(s){

  return s.trim()
    .split(/\s+/)
    .map(x=>{

      if(x==="/") return " ";

      return reverseMorse[x]||x;

    })
    .join("");

}


/* =========================
   메인 변환
========================= */

function convert(){

  const s=$("input").value;
  const m=$("method").value;

  try{

    let result="";

    switch(m){

      case "base64":
        result=mode==="encode"
          ?base64Encode(s)
          :base64Decode(s);
        break;

      case "base32":
        result=mode==="encode"
          ?base32Encode(s)
          :base32Decode(s);
        break;

      case "hex":
        result=mode==="encode"
          ?hexEncode(s)
          :hexDecode(s);
        break;

      case "url":
        result=mode==="encode"
          ?urlEncode(s)
          :urlDecode(s);
        break;

      case "html":
        result=mode==="encode"
          ?htmlEncode(s)
          :htmlDecode(s);
        break;

      case "rot13":
        result=rot13(s);
        break;

      case "rot47":
        result=rot47(s);
        break;

      case "atbash":
        result=atbash(s);
        break;

      case "binary":
        result=mode==="encode"
          ?binaryEncode(s)
          :binaryDecode(s);
        break;

      case "decimal":
        result=mode==="encode"
          ?decimalEncode(s)
          :decimalDecode(s);
        break;

      case "hexnumber":
        result=mode==="encode"
          ?hexNumberEncode(s)
          :hexNumberDecode(s);
        break;

      case "octal":
        result=mode==="encode"
          ?octalEncode(s)
          :octalDecode(s);
        break;

      case "ascii":
        result=mode==="encode"
          ?asciiEncode(s)
          :asciiDecode(s);
        break;

      case "unicode":
        result=mode==="encode"
          ?unicodeEncode(s)
          :unicodeDecode(s);
        break;

      case "morse":
        result=mode==="encode"
          ?morseEncode(s)
          :morseDecode(s);
        break;

    }

    $("output").value=result;

    setStatus("✓ 변환 완료","success");

  }catch(e){

    $("output").value="";

    setStatus(
      "⚠ "+e.message,
      "error"
    );

  }

}


/* =========================
   상태 메시지
========================= */

function setStatus(text,type=""){

  const el=$("status");

  el.textContent=text;
  el.className="status "+type;

}


/* =========================
   복사 / 초기화
========================= */

async function copyResult(){

  const text=$("output").value;

  if(!text){
    setStatus("복사할 결과가 없습니다.","error");
    return;
  }

  try{

    await navigator.clipboard.writeText(text);

    setStatus(
      "✓ 결과를 클립보드에 복사했습니다.",
      "success"
    );

  }catch(e){

    $("output").select();
    document.execCommand("copy");

    setStatus(
      "✓ 결과를 복사했습니다.",
      "success"
    );

  }

}


async function pasteText(){

  try{

    $("input").value=
      await navigator.clipboard.readText();

    detect();

    setStatus(
      "✓ 클립보드 내용을 붙여넣었습니다.",
      "success"
    );

  }catch(e){

    setStatus(
      "⚠ 클립보드 접근이 차단되었습니다.",
      "error"
    );

  }

}


function clearAll(){

  $("input").value="";
  $("output").value="";
  $("decimalInput").value="";

  $("numberResult").innerHTML=`
    <div class="num"><b>2진수</b><code>-</code></div>
    <div class="num"><b>8진수</b><code>-</code></div>
    <div class="num"><b>10진수</b><code>-</code></div>
    <div class="num"><b>16진수</b><code>-</code></div>
  `;

  $("detectResult").innerHTML=`
    <div class="detect">
      <strong>대기 중</strong>
      <span>입력 내용을 넣으면 자동으로 형식을 분석할 수 있습니다.</span>
    </div>
  `;

  setStatus("");

}


function swapText(){

  const temp=$("input").value;

  $("input").value=$("output").value;
  $("output").value=temp;

  detect();

}


function useResult(){

  $("input").value=$("output").value;

  detect();

  setStatus(
    "✓ 결과를 입력 영역으로 옮겼습니다.",
    "success"
  );

}


/* =========================
   자동 인식
========================= */

function detect(showStatus=false){

  const text=$("input").value.trim();

  const box=$("detectResult");

  if(!text){

    box.innerHTML=`
      <div class="detect">
        <strong>입력이 없습니다.</strong>
        <span>분석할 문자열을 입력하세요.</span>
      </div>
    `;

    return [];

  }

  const found=[];

  function add(
    method,
    name,
    description,
    confidence
  ){

    found.push({
      method,
      name,
      description,
      confidence
    });

  }


  /* URL */

  if(/%(?:[0-9A-Fa-f]{2})/.test(text)){

    try{

      decodeURIComponent(text);

      add(
        "url",
        "URL Encoding",
        "%XX 형태의 URL 인코딩이 발견되었습니다.",
        95
      );

    }catch(e){}

  }


  /* HTML */

  if(
    /&(?:amp|lt|gt|quot|apos|nbsp);/i.test(text) ||
    /&#(?:\d+|x[0-9a-f]+);/i.test(text)
  ){

    add(
      "html",
      "HTML Entity",
      "HTML Entity가 포함되어 있습니다.",
      96
    );

  }


  /* Unicode */

  if(
    /\\u[0-9a-fA-F]{4}/.test(text) ||
    /\\u\{[0-9a-fA-F]{1,6}\}/.test(text)
  ){

    add(
      "unicode",
      "Unicode Escape",
      "\\uXXXX 또는 \\u{XXXXX} 형태입니다.",
      98
    );

  }


  /* Binary */

  if(
    /^[01]+(?:\s+[01]+)*$/.test(text)
  ){

    add(
      "binary",
      "Binary",
      "0과 1만으로 구성된 2진수 형태입니다.",
      94
    );

  }


  /* Hex */

  const hexCandidate=
    text
      .replace(/0x/gi,"")
      .replace(/[\s:]/g,"");

  if(
    /^[0-9a-fA-F]+$/.test(hexCandidate) &&
    hexCandidate.length%2===0 &&
    hexCandidate.length>=2
  ){

    add(
      "hex",
      "Hex / Base16",
      "16진수 바이트 문자열로 해석할 수 있습니다.",
      90
    );

  }


  /* Base64 */

  if(
    /^[A-Za-z0-9+/]+={0,2}$/.test(text) &&
    text.length%4===0 &&
    text.length>=4
  ){

    try{

      const decoded=base64Decode(text);

      if(decoded){

        add(
          "base64",
          "Base64",
          "유효한 Base64 문자열로 해석됩니다.",
          88
        );

      }

    }catch(e){}

  }


  /* Base32 */

  if(
    /^[A-Z2-7]+=*$/i.test(text) &&
    text.replace(/=/g,"").length>=2
  ){

    try{

      base32Decode(text);

      add(
        "base32",
        "Base32",
        "Base32 형식으로 해석될 가능성이 있습니다.",
        80
      );

    }catch(e){}

  }


  /* Octal */

  if(
    /^[0-7]+(?:\s+[0-7]+)*$/.test(text) &&
    text.includes(" ")
  ){

    add(
      "octal",
      "Octal / 8진법",
      "공백으로 구분된 8진수 형태입니다.",
      78
    );

  }


  /* Decimal */

  if(
    /^\d+(?:\s+\d+)+$/.test(text)
  ){

    add(
      "decimal",
      "Decimal / 10진법",
      "공백으로 구분된 10진수 바이트 형태입니다.",
      76
    );

    add(
      "ascii",
      "ASCII",
      "ASCII 문자 코드일 가능성이 있습니다.",
      74
    );

  }


  /* Morse */

  if(
    /^[.\-\/\s]+$/.test(text) &&
    /[.\-]/.test(text)
  ){

    add(
      "morse",
      "Morse Code",
      "점과 선으로 구성된 모스 부호 형태입니다.",
      92
    );

  }


  /* 정렬 */

  found.sort(
    (a,b)=>b.confidence-a.confidence
  );


  if(!found.length){

    box.innerHTML=`
      <div class="detect">
        <strong>특정 형식을 찾지 못했습니다.</strong>
        <span>
          일반 텍스트이거나 지원하지 않는 형식일 수 있습니다.
        </span>
      </div>
    `;

    return [];

  }


  box.innerHTML=found.map((item,index)=>`

    <div class="detect ${index===0?"primary":""}">

      <strong>
        ${index===0?"⭐ ":""}${item.name} 후보
      </strong>

      <span>
        ${item.description}
      </span>

      <span style="margin-top:5px">
        추정 우선순위: ${item.confidence}점 · 통계적 확률이 아닙니다
      </span>

      <button
        class="small ${index===0?"success":""}"
        onclick="useDetected('${item.method}')"
      >
        ${index===0?"이 형식으로 Decode":"선택"}
      </button>

    </div>

  `).join("");

  if(showStatus){

    setStatus(
      `✓ ${found.length}개의 가능한 형식을 찾았습니다.`,
      "success"
    );

  }

  return found;

}


/* =========================
   자동 인식 → Decode
========================= */

function autoDecode(){

  const found=detect(true);

  if(!found.length){

    setStatus(
      "⚠ 자동으로 Decode할 형식을 찾지 못했습니다.",
      "error"
    );

    return;

  }

  if(found.length>1){setStatus("여러 해석이 가능합니다. 후보 설명을 보고 형식을 직접 선택해주세요. 원문은 유지됩니다.");return;}
  const best=found[0];

  $("method").value=best.method;

  updateToolInfo();

  setMode("decode");

  convert();

}


/* =========================
   감지된 도구 사용
========================= */

function useDetected(method){

  $("method").value=method;

  updateToolInfo();

  setMode("decode");

  convert();

  document
    .getElementById("converter")
    .scrollIntoView({
      behavior:"smooth",
      block:"start"
    });

}


/* =========================
   도구 카드
========================= */

function selectTool(method){

  $("method").value=method;

  updateToolInfo();

  document
    .getElementById("converter")
    .scrollIntoView({
      behavior:"smooth",
      block:"start"
    });

}


/* =========================
   진법 변환
========================= */

function convertNumbers(){

  const raw=$("decimalInput").value.trim();

  if(!/^-?\d+$/.test(raw)){

    $("numberResult").innerHTML=`
      <div class="num" style="grid-column:1/-1">
        <b>오류</b>
        <code>정수를 입력하세요. 예: 255</code>
      </div>
    `;

    return;

  }

  try{

    const n=BigInt(raw);

    $("numberResult").innerHTML=`

      <div class="num">
        <b>2진수</b>
        <code>${n.toString(2)}</code>
      </div>

      <div class="num">
        <b>8진수</b>
        <code>${n.toString(8)}</code>
      </div>

      <div class="num">
        <b>10진수</b>
        <code>${n.toString(10)}</code>
      </div>

      <div class="num">
        <b>16진수</b>
        <code>${n.toString(16).toUpperCase()}</code>
      </div>

    `;

  }catch(e){

    $("numberResult").innerHTML=`
      <div class="num" style="grid-column:1/-1">
        <b>오류</b>
        <code>올바른 정수를 입력하세요.</code>
      </div>
    `;

  }

}


/* =========================
   이벤트
========================= */

$("input").addEventListener(
  "input",
  ()=>detect(false)
);

$("decimalInput").addEventListener(
  "keydown",
  e=>{
    if(e.key==="Enter"){
      convertNumbers();
    }
  }
);

$("input").addEventListener(
  "keydown",
  e=>{
    if(
      (e.ctrlKey||e.metaKey) &&
      e.key==="Enter"
    ){
      convert();
    }
  }
);


/* 초기화 */

updateToolInfo();
