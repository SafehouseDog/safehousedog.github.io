import { readFileSync, writeFileSync } from 'node:fs';
import { createHash, randomBytes, pbkdf2Sync, createCipheriv } from 'node:crypto';

const nodesModule = await import('../js/data.js').catch(() => null);
// data.js is browser-oriented; use a small parser instead.
const dataText = readFileSync(new URL('../js/data.js', import.meta.url), 'utf8');
const json = JSON.parse(dataText.match(/window\.WDR_DATA\s*=\s*(\{.*\});/s)[1]);

const input = process.argv[2] || 'source/15_final.mp3';
const output = process.argv[3] || 'audio/15_final.enc';
const pass1Key = json.quest.pass1Key;
const routeTarget = json.quest.routeTarget; // kept for backward compatibility in the browser decoder
const stateString = json.nodes.slice().sort((a,b)=>a.x-b.x).map(n => `${n.id}:0`).join('|');
const keyMaterial = `${pass1Key}|${stateString}|FINAL_V1`;
const salt = randomBytes(16);
const iv = randomBytes(12);
const key = pbkdf2Sync(Buffer.from(keyMaterial), salt, json.quest.secret.iterations, 32, 'sha256');
const cipher = createCipheriv('aes-256-gcm', key, iv);
const plain = readFileSync(input);
const encrypted = Buffer.concat([cipher.update(plain), cipher.final(), cipher.getAuthTag()]);
const magic = Buffer.from('WDR15v1\0');
writeFileSync(output, Buffer.concat([magic, salt, iv, encrypted]));
console.log(`encrypted ${input} -> ${output}`);
console.log(`canonical sha256: ${createHash('sha256').update(stateString).digest('hex')}`);
