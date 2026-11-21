// 300자 넘는 줄을 동작이 바뀌지 않게 나눈다(3-4단계 E6).
// - 문자열·템플릿 글 안: "><" 사이에 역슬래시+줄바꿈(JS 줄 이음, 결과 글자에는 아무것도 더해지지 않음). 이어지는 줄은 들여쓰지 않는다.
// - 코드 안: ";" "," "{" "&&" "||" 뒤에서 줄바꿈하고 원래 들여쓰기를 붙인다.
// 사용: node split-long.mjs <파일...>  (파일을 그 자리에서 고친다. 검증은 verify.sh가 esbuild 압축 결과로 한다)
import { readFileSync, writeFileSync } from 'node:fs';
const LIMIT = 300, TARGET = 200;
const REGEX_PREV = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', '}', ';', '+', '-', '*', '%', '<', '>', '~', '^', '']);
function lex(src) {
  // 글자마다 상태: 'c' 코드, 's' 따옴표 문자열, 't' 템플릿 글, 'x' 주석·정규식(건드리지 않음)
  const st = new Array(src.length); const stack = []; let mode = 'c', q = '', prev = '';
  for (let i = 0; i < src.length; i++) {
    const ch = src[i], nx = src[i + 1];
    if (mode === 'c') {
      st[i] = 'c';
      if (ch === '/' && nx === '/') { mode = 'lc'; st[i] = 'x'; continue; }
      if (ch === '/' && nx === '*') { mode = 'bc'; st[i] = 'x'; continue; }
      if (ch === '/' && REGEX_PREV.has(prev)) { mode = 're'; st[i] = 'x'; continue; }
      if (ch === "'" || ch === '"') { mode = 's'; q = ch; continue; }
      if (ch === '`') { mode = 't'; continue; }
      if (ch === '{') stack.push('c');
      if (ch === '}') { const top = stack.pop(); if (top === 't') { mode = 't'; continue; } }
      if (!/\s/.test(ch)) prev = /[\w$)\]]/.test(ch) ? 'w' : ch;
    } else if (mode === 's') {
      st[i] = 's'; if (ch === '\\') { st[i + 1] = 's'; i++; continue; } if (ch === q) { mode = 'c'; prev = 'w'; }
    } else if (mode === 't') {
      st[i] = 't'; if (ch === '\\') { st[i + 1] = 't'; i++; continue; }
      if (ch === '`') { mode = 'c'; prev = 'w'; continue; }
      if (ch === '$' && nx === '{') { st[i + 1] = 't'; i++; stack.push('t'); mode = 'c'; prev = '('; continue; }
    } else if (mode === 'lc') { st[i] = 'x'; if (ch === '\n') mode = 'c'; }
    else if (mode === 'bc') { st[i] = 'x'; if (ch === '*' && nx === '/') { st[i + 1] = 'x'; i++; mode = 'c'; } }
    else if (mode === 're') { st[i] = 'x'; if (ch === '\\') { st[i + 1] = 'x'; i++; continue; } if (ch === '[') mode = 'rc'; else if (ch === '/') { mode = 'c'; prev = 'w'; } }
    else if (mode === 'rc') { st[i] = 'x'; if (ch === '\\') { st[i + 1] = 'x'; i++; continue; } if (ch === ']') mode = 're'; }
  }
  return st;
}
for (const file of process.argv.slice(2)) {
  const src = readFileSync(file, 'utf8'); const st = lex(src); let out = ''; let pos = 0, changed = 0;
  for (const line of src.split('\n')) {
    const start = pos; pos += line.length + 1;
    if ([...line].length <= LIMIT) { out += line + '\n'; continue; }
    const indent = line.match(/^\s*/)[0];
    const cuts = []; // [offset in line, kind]
    for (let k = 1; k < line.length - 1; k++) {
      const s = st[start + k];
      if ((s === 's' || s === 't') && st[start + k - 1] === s && line[k - 2] !== '\\' && line[k - 1] !== '\\' && (line[k - 1] === '>' || line[k - 1] === ';' || (line[k - 1] === ' ' && line[k] !== ' ')) && !(line[k - 1] === '$' || line[k] === '{')) cuts.push([k, 'str']);
      else if (s === 'c' && st[start + k - 1] === 'c' && (/[;,{]/.test(line[k - 1]) || (line.slice(k - 2, k) === '&&') || (line.slice(k - 2, k) === '||')) && line[k] !== ';') cuts.push([k, 'code']);
    }
    let segStart = 0, piece = '';
    let last = null;
    for (const c of cuts) {
      if (c[0] - segStart >= TARGET) { const at = last && last[0] - segStart > 40 ? last : c; piece += line.slice(segStart, at[0]) + (at[1] === 'str' ? '\\\n' : '\n' + indent); segStart = at[0]; last = null; if (at !== c) { if (c[0] - segStart >= TARGET) { piece += line.slice(segStart, c[0]) + (c[1] === 'str' ? '\\\n' : '\n' + indent); segStart = c[0]; } else last = c; } continue; }
      last = c;
    }
    if (segStart === 0) { out += line + '\n'; continue; }
    piece += line.slice(segStart); out += piece + '\n'; changed++;
  }
  out = out.slice(0, -1);
  if (changed) writeFileSync(file, out);
  const left = out.split('\n').filter(l => [...l].length > LIMIT).length;
  console.log(file, 'split', changed, 'still>300', left);
}
