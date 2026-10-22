"""Static repository checks, using Python standard library only."""
import json,pathlib,hashlib,re,sys
root=pathlib.Path(__file__).resolve().parents[1];manifest=json.loads((root/'config/export-manifest.json').read_text());errors=[];count=0
patterns=[r'AIza[0-9A-Za-z_-]{30,}',r'gh[pousr]_[A-Za-z0-9]{20,}',r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',r'https://(?:discord\.com|discordapp\.com)/api/webhooks/\d+/[A-Za-z0-9_.-]{20,}',r'Bearer [A-Za-z0-9_.-]{30,}']
for e in manifest['exports']:
    p=root/e['file'];b=p.read_bytes();w=json.loads(b);count+=1
    if hashlib.sha256(b).hexdigest()!=e['repository_export_sha256']:errors.append(f'{p}: hash mismatch')
    if w.get('active') is not False:errors.append(f'{p}: must be inactive')
    if w.get('pinData'):errors.append(f'{p}: pinned data present')
    names=[n['name'] for n in w['nodes']]
    if len(names)!=len(set(names)):errors.append(f'{p}: duplicate node name')
    for n in w['nodes']:
        if n.get('credentials'):errors.append(f'{p}: source credential binding present')
    for source,channels in w['connections'].items():
        if source not in names:errors.append(f'{p}: missing connection source {source}')
        for branches in channels.values():
            for branch in branches:
                for edge in branch:
                    if edge['node'] not in names:errors.append(f'{p}: missing target {edge["node"]}')
    for pattern in patterns:
        if re.search(pattern,b.decode()):errors.append(f'{p}: potential secret pattern found')
    if 'Recent interview with Jason Simpson' in b.decode():errors.append(f'{p}: excluded newsletter excerpt present')
if count!=19:errors.append('Expected 19 captured exports.')
result={'export_files':count,'structural_and_secret_pattern_checks':'PASS' if not errors else 'FAIL','errors':errors,'limitations':'Pattern scan does not guarantee detection of every secret. Export payloads were also reviewed before commit.'}
(root/'evidence/repository-validation.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2));sys.exit(bool(errors))

