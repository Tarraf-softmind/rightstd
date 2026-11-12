"""Extract an All-in-One WP Migration .wpress archive. Usage: extract-wpress.py <file.wpress> <dest_dir>"""
import os, sys

HEADER = 4377  # name 255 + size 14 + mtime 12 + path 4096

def extract(src, dest):
    dest = os.path.realpath(dest)
    count = 0
    with open(src, 'rb') as f:
        while True:
            h = f.read(HEADER)
            if len(h) < HEADER or h == b'\0' * HEADER:
                break
            name = h[:255].rstrip(b'\0').decode()
            size = int(h[255:269].rstrip(b'\0') or 0)
            prefix = h[281:].rstrip(b'\0').decode()
            out = os.path.realpath(os.path.join(dest, prefix, name))
            if not out.startswith(dest + os.sep):  # archive is untrusted: block path traversal
                raise SystemExit(f'unsafe path in archive: {prefix}/{name}')
            os.makedirs(os.path.dirname(out), exist_ok=True)
            with open(out, 'wb') as o:
                left = size
                while left:
                    chunk = f.read(min(left, 1 << 20))
                    if not chunk:
                        raise SystemExit(f'truncated archive at {name}')
                    o.write(chunk); left -= len(chunk)
            count += 1
    return count

if __name__ == '__main__':
    n = extract(sys.argv[1], sys.argv[2])
    assert os.path.isfile(os.path.join(sys.argv[2], 'database.sql')), 'database.sql missing'
    print(f'extracted {n} files')
