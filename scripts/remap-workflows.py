"""Offline staging renderer. No API calls, activation, credentials values or data writes."""
import argparse,json,pathlib,re
p=argparse.ArgumentParser();p.add_argument('--map',required=True);p.add_argument('--variant',choices=['draft','published'],default='published');p.add_argument('--output',default='generated/import');a=p.parse_args()
root=pathlib.Path(__file__).resolve().parents[1];cfg=json.loads(pathlib.Path(a.map).read_text());manifest=json.loads((root/'config/export-manifest.json').read_text())
ids={e['workflow']:e['cloud_id'] for e in manifest['exports']}
if set(cfg.get('workflow_ids',{}))!=set(ids):raise SystemExit('Map must contain local IDs for all A–J workflows.')
if len(set(cfg['workflow_ids'].values()))!=10:raise SystemExit('Local workflow IDs must be unique.')
if not cfg.get('base_url','').startswith(('http://localhost:','https://')):raise SystemExit('Supply the staging base_url.')
replacements={old:cfg['workflow_ids'][letter] for letter,old in ids.items()}
schema=json.loads((root/'schemas/google-sheets.json').read_text())
for kind in ['creator','personal','news']:
    target=cfg.get('sheet_ids',{}).get(kind)
    if not target:raise SystemExit('Supply an explicitly chosen '+kind+' spreadsheet ID.')
    old=schema[kind+'_database']
    if old==target and not cfg.get('allow_existing_sheets',False):raise SystemExit('Use isolated test Sheets, or explicitly allow existing Sheets for reviewed cutover.')
    replacements[old]=target
replacements[manifest['source']]=cfg['base_url'].rstrip('/')
if any(not isinstance(v,str) or not v or v.startswith('REPLACE_') for v in replacements.values()):raise SystemExit('Unfilled configuration value.')
def replace(x):
    if isinstance(x,str):
        for old,new in replacements.items():x=x.replace(old,new)
        return x
    if isinstance(x,list):return [replace(v) for v in x]
    if isinstance(x,dict):return {k:replace(v) for k,v in x.items()}
    return x
out=root/a.output;out.mkdir(parents=True,exist_ok=True)
for letter in ids:
    variant='draft' if letter=='J' else a.variant
    w=replace(json.loads((root/f'workflows/{variant}/{letter}.json').read_text()))
    w['id']=cfg['workflow_ids'][letter];w['active']=False
    for n in w['nodes']:
        for typ,binding in manifest['credential_bindings'].items():
            if f'{letter}/{variant}/{n["name"]}' not in binding['nodes']:continue
            ref=cfg.get('credentials',{}).get(typ)
            if not ref or not ref.get('id') or not ref.get('name') or set(ref)!={'id','name'}:raise SystemExit('Supply credential reference (id, name) for '+typ+'; never a key/token.')
            n.setdefault('credentials',{})[typ]=ref
    serialized=json.dumps(w,ensure_ascii=False,indent=2)+'\n'
    for old,new in replacements.items():
        if old!=new and old in serialized:raise SystemExit('Unmapped source identifier remains: '+old)
    (out/f'{letter}.json').write_text(serialized)
print(f'Wrote 10 inactive workflows to {out}. Review before importing; nothing was deployed.')

