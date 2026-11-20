import { PGlite } from '@electric-sql/pglite'
import fs from 'node:fs'
// Applies the migrations in order to an in-process Postgres (PGlite) and checks the owner-token rules as the anon role.
// Run: node scripts/migration-test.mjs
const db = new PGlite()
await db.exec(`create role anon nologin; create role authenticated nologin; create schema if not exists extensions;`)
const dir=new URL('../supabase/migrations/', import.meta.url).pathname
let init = fs.readFileSync(dir+'20250101000000_init.sql','utf8').replace('create extension if not exists pgcrypto;','')
await db.exec(`alter default privileges in schema public grant all on tables to anon, authenticated;`)
await db.exec(init)
await db.exec(`grant usage on schema public to anon, authenticated`)
await db.exec(fs.readFileSync(dir+'20250102000000_owner_edit_token.sql','utf8'))
await db.exec(fs.readFileSync(dir+'20250102000000_owner_edit_token.sql','utf8'))
const hash = (await db.query(`select encode(sha256(convert_to('tok','utf8')),'hex') h`)).rows[0].h
const hid='00000000-0000-4000-8000-000000000001', seed='00000000-0000-4000-8000-000000000002'
await db.exec(`set role anon`)
const t=async(n,q,exp)=>{let r;try{await db.query(q);r='ok'}catch(e){r='err: '+e.message}
 const pass = exp==='err'? r.startsWith('err') : r==='ok'; console.log(pass?'PASS':'FAIL',n,pass?'':r); if(!pass) process.exitCode=1}
await t('insert owned',`insert into homesteads(id,neighbourhood_slug,name,edit_token_hash) values('${hid}','soho','mine','${hash}')`)
await t('insert seed',`insert into homesteads(id,neighbourhood_slug,name) values('${seed}','soho','seedy')`)
await t('bad hash',`insert into homesteads(id,neighbourhood_slug,name,edit_token_hash) values(gen_random_uuid(),'soho','bad','x')`,'err')
await t('select cols',`select id,name,blocks from homesteads`)
await t('select hash denied',`select edit_token_hash from homesteads`,'err')
await t('select * denied',`select * from homesteads`,'err')
await t('direct update denied',`update homesteads set title='x'`,'err')
await t('direct delete denied',`delete from homesteads`,'err')
await t('rpc wrong token',`select update_homestead('${hid}','nope','t','{}','[]',true)`,'err')
await t('rpc seed page',`select update_homestead('${seed}','tok','t','{}','[]',true)`,'err')
await t('rpc ok',`select update_homestead('${hid}','tok','Hello','{}','[]',false)`)
console.log((await db.query(`select title,published from homesteads where id='${hid}'`)).rows)
await t('sign',`insert into guestbook_entries(id,homestead_id,author_name,message) values('00000000-0000-4000-8000-0000000000aa','${hid}','a','m')`)
await t('direct gb delete denied',`delete from guestbook_entries`,'err')
await t('gb delete wrong',`select delete_guestbook_entry('00000000-0000-4000-8000-0000000000aa','bad')`,'err')
await t('gb delete ok',`select delete_guestbook_entry('00000000-0000-4000-8000-0000000000aa','tok')`)
console.log((await db.query(`select count(*) from guestbook_entries`)).rows)
await t('seed views seedpage',`select seed_page_views('${seed}',500)`)
await t('seed views owned (noop)',`select seed_page_views('${hid}',500)`)
console.log((await db.query(`select * from page_views`)).rows)
await t('increment',`select increment_page_views('${seed}')`)
await t('page_views direct insert denied',`insert into page_views values('${hid}',9)`,'err')
await t('hs_token_matches denied',`select hs_token_matches('${hid}','tok')`,'err')
