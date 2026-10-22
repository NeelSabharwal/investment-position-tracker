"""Generate readable per-node JS copies from the selected export, no network."""
import argparse,json,pathlib,re
p=argparse.ArgumentParser();p.add_argument('--variant',choices=['draft','published'],default='published');a=p.parse_args()
root=pathlib.Path(__file__).resolve().parents[1]
for wf in sorted((root/'workflows'/a.variant).glob('*.json')):
    for i,n in enumerate(json.loads(wf.read_text())['nodes']):
        code=n.get('parameters',{}).get('jsCode')
        if code is None:continue
        name=re.sub(r'[^A-Za-z0-9_-]+','-',n['name']).strip('-')
        out=root/'generated/code'/a.variant/wf.stem/f'{i:03}-{name}.js';out.parent.mkdir(parents=True,exist_ok=True)
        out.write_text('// Node: '+n['name']+'\n// Generated view; edit the workflow JSON as the authority.\n'+code+'\n')
print('Code views written under generated/code; no Cloud changes.')

