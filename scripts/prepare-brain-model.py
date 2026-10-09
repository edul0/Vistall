"""Build the small, local WebGL brain asset from licensed BodyParts3D surfaces."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json
import urllib.request
import struct
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / "tools" / "brain-source"
CACHE.mkdir(parents=True, exist_ok=True)
commit = "c20c30e9c4628b9d129ecf061ff8cce99f358490"
req = urllib.request.Request(f"https://api.github.com/repos/ssrpw2/brain-atlas/contents/brain_obj?ref={commit}", headers={"User-Agent": "Vistall-asset-preparation"})
files = json.load(urllib.request.urlopen(req))
regions = {
    "superior_frontal_gyrus": 0, "middle_frontal_gyrus": 0, "inferior_frontal_gyrus": 0,
    "precentral_gyrus": 0, "orbital_gyrus": 0,
    "postcentral_gyrus": 1, "angular_gyrus": 1, "supramarginal_gyrus": 1,
    "superior_parietal_lobule": 1, "occipital_lobe": 1,
    "superior_temporal_gyrus": 1, "middle_temporal_gyrus": 1, "inferior_temporal_gyrus": 1,
    "fusiform_gyrus": 1, "parahippocampal_gyrus": 1, "cingulate_gyrus": 1, "insula": 1,
    "cerebellum": 2, "pons": 2, "medulla_oblongata": 2, "midbrain": 2,
}
selected = [f for f in files if f["name"].rsplit("_FJ", 1)[0] in regions]

def download(file):
    path = CACHE / file["name"]
    if not path.exists():
        url = f"https://raw.githubusercontent.com/ssrpw2/brain-atlas/{commit}/brain_obj/{file['name']}"
        path.write_bytes(urllib.request.urlopen(url).read())
    return path

with ThreadPoolExecutor(max_workers=6) as executor:
    paths = list(executor.map(download, selected))

vertices, triangles, groups = [], [], []
offset = 0
for path in paths:
    local, faces = [], []
    for line in path.read_text().splitlines():
        if line.startswith("v "):
            local.append([float(x) for x in line.split()[1:4]])
        elif line.startswith("f "):
            face = [int(x.split("/")[0])-1 for x in line.split()[1:]]
            faces.extend([[face[0], face[j], face[j+1]] for j in range(1, len(face)-1)])
    vertices.extend(local)
    triangles.extend([[i+offset for i in face] for face in faces])
    groups.extend([regions[path.stem.rsplit("_FJ", 1)[0]]] * len(faces))
    offset += len(local)

v = np.asarray(vertices, dtype=np.float64)[:, [0, 2, 1]]
v[:, 2] *= -1  # anatomical vertical axis becomes screen Y; anterior becomes positive Z.
f = np.asarray(triangles, dtype=np.int64)
v -= (v.max(axis=0) + v.min(axis=0)) / 2
v *= 1.8 / np.ptp(v, axis=0).max()

# Weld nearby vertices without smoothing away the cortical sulci.
cells = np.round(v / .016).astype(np.int32)
_, inverse = np.unique(cells, axis=0, return_inverse=True)
count = np.bincount(inverse)
welded = np.column_stack([np.bincount(inverse, weights=v[:, d])/count for d in range(3)])
faces = inverse[f]
keep = (faces[:, 0] != faces[:, 1]) & (faces[:, 0] != faces[:, 2]) & (faces[:, 1] != faces[:, 2])
faces = faces[keep]
groups = np.asarray(groups)[keep]
assert len(welded) < 65536
cross = np.cross(welded[faces[:, 1]]-welded[faces[:, 0]], welded[faces[:, 2]]-welded[faces[:, 0]])
normals = np.zeros_like(welded)
for i in range(3):
    np.add.at(normals, faces[:, i], cross)
normals /= np.maximum(np.linalg.norm(normals, axis=1)[:, None], 1e-9)

# Even surface coverage; no particles filling the interior like the previous sphere.
rng = np.random.default_rng(137)
area = np.linalg.norm(cross, axis=1)
indices = rng.choice(len(faces), 32000, p=area/area.sum())
bary = rng.random((len(indices), 2))
bary = np.where((bary.sum(axis=1) > 1)[:, None], 1-bary, bary)
weights = np.column_stack([1-bary.sum(axis=1), bary])
point_vertices = faces[indices]
points = (welded[point_vertices]*weights[:, :, None]).sum(axis=1)
point_normals = (normals[point_vertices]*weights[:, :, None]).sum(axis=1)
point_normals /= np.maximum(np.linalg.norm(point_normals, axis=1)[:, None], 1e-9)
points += point_normals * .005
mesh = np.column_stack([welded, normals]).astype(np.float32)
cloud = np.column_stack([points, point_normals, groups[indices], rng.random(len(indices))]).astype(np.float32)
asset = struct.pack("<4I", 1, len(mesh), faces.size, len(cloud)) + mesh.astype("<f4").tobytes() + faces.astype("<u2").tobytes() + cloud.astype("<f4").tobytes()
(ROOT / "public" / "vistall-brain-anatomy.bin").write_bytes(asset)
(ROOT / "public" / "vistall-brain-attribution.txt").write_text(
    "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.\n"
    "https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html\n"
    "License: https://creativecommons.org/licenses/by/4.0/\n"
    f"Source OBJ collection: https://github.com/ssrpw2/brain-atlas/tree/{commit}/brain_obj\n"
    "Adaptation for Vistall: selected cortical surfaces, cerebellum and brainstem; coordinate normalization, vertex welding, surface particle sampling and recoloring.\n"
    "This decorative presentation does not associate professional skills with neurological functions.\n", encoding="utf-8")
print(json.dumps({"vertices": len(mesh), "triangles": len(faces), "particles": len(cloud), "bytes": len(asset), "source": commit}))
