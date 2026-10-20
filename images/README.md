# 圖片放置指南 (Images Guide)

## 資料夾結構說明
```
images/
└── projects/
    ├── project-01/
    │   ├── cover.jpg      # 作品封面（首頁輪播與作品清單卡片）
    │   ├── fig-1.jpg      # 詳細彈窗圖 1（透視圖 / 軸測圖）
    │   └── fig-2.jpg      # 詳細彈窗圖 2（平面圖 / 剖面圖）
    ├── project-02/
    ├── project-03/
    ├── project-04/
    └── project-05/
```

## 如何啟用圖片
1. 將你的圖片放入對應專案資料夾（例如 `images/projects/project-01/cover.jpg`）。
2. 打開 `data/projects.json`，將對應專案的 `"image"` 或 `"galleryImages"` 改為實際路徑：
   ```json
   {
     "id": "project-01",
     "image": "images/projects/project-01/cover.jpg",
     "galleryImages": [
       "images/projects/project-01/fig-1.jpg",
       "images/projects/project-01/fig-2.jpg",
       "images/projects/project-01/fig-3.jpg",
       "images/projects/project-01/fig-4.jpg",
       "images/projects/project-01/fig-5.jpg"
     ]
   }
   ```
3. **圖片數量無限制**：`galleryImages` 陣列內可以放任意數量的圖片（例如第一個專案放 5 張，第二個專案放 3 張），彈窗會自動依照數量依序由上而下排列，並自動編號（FIG 1.1, FIG 1.2 ...）。
4. **尺寸與比例特性**：
   - **封面圖 (Cover)**：外框固定為 1:1 正方形（`object-fit: cover`），若上傳長方形照片不會被拉長變形，而是自動以中心裁切填滿。
   - **彈窗內頁圖 (Gallery)**：寬度填滿欄位（`width: 100%`），高度隨圖片比例自適應（`height: auto`）。無論是橫向全景圖、直式長圖、正方形都能完整呈現，完全不會被裁切。
5. **安全容錯**：若欄位維持為空字串 `""`，網站會自動呈現建築幾何圖案（SVG fallback），不會破圖。
