"""Seal Tickerwise bundles: public bundle gzip'd; private bundle gzip'd + encrypted to the owner's public key (ECDH P-256 + HKDF-SHA256 + AES-256-GCM)."""
import json, gzip, os, sys, base64
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
SRC, OUT, PUBKEY = sys.argv[1], sys.argv[2], sys.argv[3]   # folder with pub.json/priv.json, output folder, owner public key json {x,y}
b64d = lambda s: base64.urlsafe_b64decode(s + '=' * (-len(s) % 4))
k = json.load(open(PUBKEY))
owner = ec.EllipticCurvePublicNumbers(int.from_bytes(b64d(k['x']), 'big'), int.from_bytes(b64d(k['y']), 'big'), ec.SECP256R1()).public_key()
os.makedirs(OUT, exist_ok=True)
open(OUT + '/pub.json.gz', 'wb').write(gzip.compress(open(SRC + '/pub.json', 'rb').read(), 9, mtime=0))
eph = ec.generate_private_key(ec.SECP256R1())
shared = eph.exchange(ec.ECDH(), owner)
key = HKDF(algorithm=hashes.SHA256(), length=32, salt=None, info=b'tickerwise-v1').derive(shared)
iv = os.urandom(12)
ct = AESGCM(key).encrypt(iv, gzip.compress(open(SRC + '/priv.json', 'rb').read(), 9, mtime=0), None)
epub = eph.public_key().public_bytes(serialization.Encoding.X962, serialization.PublicFormat.UncompressedPoint)
open(OUT + '/priv.bin', 'wb').write(b'TW1' + epub + iv + ct)
print('pub.json.gz', os.path.getsize(OUT + '/pub.json.gz'), 'priv.bin', os.path.getsize(OUT + '/priv.bin'))
