from PIL import Image, ImageEnhance

src = r"C:\Users\USER\.cursor\projects\c-Users-USER-Desktop-W3B-m-portfolio\assets\c__Users_USER_AppData_Roaming_Cursor_User_workspaceStorage_33b01b56b4752540ab21dbbaa7973d10_images_image-2c7260db-a1c5-41a7-aa6c-35a77b651b61.png"
out = r"C:\Users\USER\Desktop\W3B\m_portfolio\public\arnold-profile.png"

img = Image.open(src).convert("RGB")
w, h = img.size

# Remove bottom-left flowers; keep full face (subject sits right-of-center in original)
left = int(w * 0.36)
top = int(h * 0.06)
right = int(w * 0.96)
bottom = int(h * 0.60)
cropped = img.crop((left, top, right, bottom))

cw, ch = cropped.size
size = min(cw, ch)
cx = int(cw * 0.52)
cy = int(ch * 0.36)
left2 = max(0, min(cx - size // 2, cw - size))
top2 = max(0, min(cy - size // 2, ch - size))
square = cropped.crop((left2, top2, left2 + size, top2 + size))

result = square.resize((900, 900), Image.Resampling.LANCZOS)
result = ImageEnhance.Contrast(result).enhance(1.05)
result = ImageEnhance.Sharpness(result).enhance(1.1)
result = ImageEnhance.Brightness(result).enhance(1.02)

result.save(out, "PNG", optimize=True)
print("Saved:", out, result.size)
