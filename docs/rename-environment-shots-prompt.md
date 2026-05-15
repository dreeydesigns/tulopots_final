# Rename Environment Placement Shots — Claude Co-worker Prompt

Use this prompt in a **new Claude Code session** (or paste into Claude.ai) to rename all environment/lifestyle placement images.

---

## PROMPT

```
I need you to rename all environment placement shots in my Tulopots images folder.
These are photos of pots placed in real rooms, corners, desks, floors — not the
clean cream-background product shots.

### Folder to scan
C:\Users\Muti\Desktop\tulo_final\public\images\environment

If that folder is empty, the environment shots may still be inside the pot subfolders
under C:\Users\Muti\Desktop\tulo_final\public\images\products\
Look for files matching *environment* or *interior* or *lifestyle* in those subfolders
and move/rename them here.

### Goal
Rename each image to:
  [potId]_[size]_[plant]_environment.jpg

All lowercase. Hyphens in plant names (e.g. snake-plant). Underscores between parts.

### Allowed potId values (exactly these)
ayo, kito, kora, nuru, safi, tulo-noir, tulo-one, tulo-terra, zola, zuma

### Allowed size values
small, medium, large

### Plant name rules
Use the common name, lowercase, replace spaces with hyphens. Examples:
- snake-plant
- peace-lily
- zz-plant
- pothos
- aloe-vera
- fiddle-leaf-fig
- areca-palm
- monstera

If you see more than one plant in the image, choose the dominant one.
If completely unrecognisable, use plant-unknown and log it.

### How to analyse each image

Step 1 — Identify the pot shape using these visual clues:
  ayo        — round bulbous body, wide flared opening, two small stub handles
  kito       — tall ribbed barrel, cream-white slip glaze, vertical black ink marks
  kora       — round ribbed barrel, deep matte charcoal exterior, warm terracotta rim interior
  nuru       — short squat ribbed form, concave waist, white paint splatter marks, raw terracotta
  safi       — globe with all-over hand-pressed circular dimples, wide open rim, raw terracotta
  tulo-noir  — globe with dimples, narrow neck, full black semi-gloss glaze
  tulo-one   — low wide dimpled globe, terracotta-to-charcoal ombré gradient
  tulo-terra — dimpled globe with semi-closed neck, raw unglazed terracotta (no glaze, no gradient)
  zola       — low squat cauldron shape with a flat disc lid
  zuma       — cylinder with three pairs of rounded clay knob studs on each side

Step 2 — Estimate pot size:
  small  — fits on a desk, shelf, windowsill; roughly ≤25cm tall
  medium — sits on a console, sideboard, or low surface; roughly 25–45cm tall
  large  — stands on the floor as a statement piece; roughly >45cm tall

Step 3 — Identify the plant from the image.

Step 4 — Build filename:
  [potId]_[size]_[plant]_environment.jpg
  Example: kora_medium_peace-lily_environment.jpg
  Example: tulo-one_small_zz-plant_environment.jpg

### Actions

1. List all .jpg, .jpeg, and .png files in:
   C:\Users\Muti\Desktop\tulo_final\public\images\environment
   (and check the pot subfolders under .../products/ for lifestyle/interior shots)

2. For each image:
   - Use vision to determine potId, size, and plant.
   - Compute the new filename.
   - If the new name differs from the current name, rename the file.
   - If a conflict exists (same new name, different content), append _2, _3, etc.
   - If a conflict exists (same new name, identical bytes), delete the duplicate.
   - If you cannot confidently identify the pot, size, or plant:
     move the file to an _unrecognised subfolder and log it.

3. Convert any .png or .jpeg to .jpg (high quality) and rename.

4. Create two output files in the environment folder:
   rename_log.txt — detailed log: original path → new name, conflicts, errors
   environment_images.csv — columns: new_filename, pot_id, size, plant, original_path

5. After renaming, print a summary table:

   Pot ID      | Small | Medium | Large | Total
   ------------|-------|--------|-------|------
   ayo         |       |        |       |
   kito        |       |        |       |
   ...
   TOTAL       |       |        |       |

### Important rules
- Do NOT rename cream-background product shots — those already live in /products/
  and follow [potId]_[variant].jpg naming. Leave them alone.
- Preserve files until logging is complete.
- Only delete confirmed byte-identical duplicates.

### After renaming
Once done, I will use environment_images.csv to upload images via the admin panel
and associate them with the correct product galleries.

Start by listing the first 10 files in the folder (show current names + your
vision analysis for each). Wait for my confirmation before running the full batch.
```

---

## Where to run this

1. Open a new Claude Code session in the `tulo_final` project directory.
2. Paste the prompt above.
3. Claude will list the first 10 files and ask for confirmation.
4. Confirm → it runs the full batch.
5. Check `rename_log.txt` and `environment_images.csv` in the environment folder.
6. Use the CSV to upload via admin panel → Products → Edit → Product Gallery.

---

## After uploading

Once images are uploaded via the admin panel (Vercel Blob), copy the Blob URLs and
add them to the product gallery arrays in `lib/products.ts`, or update the DB via
the admin sync endpoint.
