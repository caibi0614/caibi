/* =========================
   🏠 菜比之家｜私人房間
========================= */

const privateRoom =
  document.getElementById(
    "privateRoom"
  );

const roomMapLayer =
  document.getElementById(
    "roomMapLayer"
  );

const playerCharacter =
  document.getElementById(
    "playerCharacter"
  );

const playerBase =
  document.getElementById(
    "playerBase"
  );

const playerSocks =
  document.getElementById(
    "playerSocks"
  );

const playerOuterwear =
  document.getElementById(
    "playerOuterwear"
  );

const playerHeadwear =
  document.getElementById(
    "playerHeadwear"
  );

const playerBottom =
  document.getElementById(
    "playerBottom"
  );

const playerTop =
  document.getElementById(
    "playerTop"
  );

const playerDress =
  document.getElementById(
    "playerDress"
  );

const playerShoes =
  document.getElementById(
    "playerShoes"
  );

const livingRoomEntrance =
  document.getElementById(
    "livingRoomEntrance"
  );

const storageButton =
  document.getElementById(
    "storageButton"
  );

const storageModal =
  document.getElementById(
    "storageModal"
  );

const storageCloseButton =
  document.getElementById(
    "storageCloseButton"
  );

const storageFurnitureGrid =
  document.getElementById(
    "storageFurnitureGrid"
  );

const roomFurnitureLayer =
  document.getElementById(
    "roomFurnitureLayer"
  );

const furnitureEditModeButton =
  document.getElementById(
    "furnitureEditModeButton"
  );


let isFurnitureEditMode = false;

const furnitureEditBar =
  document.getElementById(
    "furnitureEditBar"
  );

const furnitureCancelButton =
  document.getElementById(
    "furnitureCancelButton"
  );

const furnitureRotateButton =
  document.getElementById(
    "furnitureRotateButton"
  );

const furnitureConfirmButton =
  document.getElementById(
    "furnitureConfirmButton"
  );

const furnitureStoreButton =
  document.getElementById(
    "furnitureStoreButton"
  );


let selectedFurniture = null;

let furnitureOriginalX = null;
let furnitureOriginalY = null;

let furniturePendingX = null;
let furniturePendingY = null;

/* =========================
   ↻ 家具方向
========================= */

const FURNITURE_DIRECTIONS = [
  "front",
  "right",
  "back",
  "left"
];

let furnitureOriginalDirection = null;
let furniturePendingDirection = null;

/* =========================
   🚶 玩家移動資料
========================= */

let playerX = 50;
let playerY = 72;

let targetX = playerX;
let targetY = playerY;

const MOVE_SPEED = 0.6;

const pressedKeys = new Set();

/* =========================
   🛏️ 家具互動狀態
========================= */

let activeFurnitureInteraction = null;

/* =========================
   🛏️ 床｜四方向人物互動設定
========================= */

const BED_INTERACTION = {
  front: {
  offsetX: 0,
  offsetY: -12,
  rotation: 0
},

  right: {
    offsetX: 4,
    offsetY: -10,
    rotation: 270
  },

  back: {
    offsetX: 0,
    offsetY: -30,
    rotation: 180
  },

  left: {
    offsetX: -5,
    offsetY: -10,
    rotation: 90
  }
};

/* =========================
   🚶 更新玩家位置
========================= */

function updatePlayerPosition() {

  playerCharacter.style.left =
    `${playerX}%`;

  playerCharacter.style.top =
    `${playerY}%`;
}


/* =========================
   ⌨️ 鍵盤控制
========================= */

window.addEventListener(
  "keydown",
  (event) => {

    const key =
      event.key.toLowerCase();

    /* 🛏️ 正在使用家具 → 按移動鍵先離開家具 */
if (
  activeFurnitureInteraction &&
  (
    key === "w" ||
    key === "a" ||
    key === "s" ||
    key === "d" ||
    key.startsWith("arrow")
  )
) {
  activeFurnitureInteraction = null;

  playerCharacter.classList.remove(
    "is-sleeping"
  );

  playerCharacter.style.transform =
    "translate(-50%, -100%)";

  targetX = playerX;
  targetY = playerY;
}

    if (
      key === "w" ||
      key === "a" ||
      key === "s" ||
      key === "d" ||
      key.startsWith("arrow")
    ) {

      event.preventDefault();

      pressedKeys.add(key);
    }
  }
);


window.addEventListener(
  "keyup",
  (event) => {

    pressedKeys.delete(
      event.key.toLowerCase()
    );
  }
);


/* =========================
   🪵 私人房間地板邊界
========================= */

function clampToRoomFloor(x, y) {

  /* 上方往房間內縮、下方保留安全距離 */
  const safeY =
    Math.max(
      38,
      Math.min(100, y)
    );

  /*
    透視梯形：
    後方窄、前方寬。

    Y = 38 → X 約 26～74
    Y = 84 → X 約 7～93
  */

  const progress =
    (safeY - 38) /
    (100 - 38);

  const minX =
    26 -
    (23 * progress);

  const maxX =
    74 +
    (23 * progress);

  const safeX =
    Math.max(
      minX,
      Math.min(maxX, x)
    );

  return {
    x: safeX,
    y: safeY
  };
}


/* =========================
   🖱️ 滑鼠／📱觸控點地移動
========================= */

roomMapLayer.addEventListener(
  "pointerdown",
  (event) => {

    /* 點到門／家具時不要觸發地板移動 */
    if (
      event.target.closest("button") ||
      event.target.closest(".room-furniture")
    ) {
      return;
    }

    /* 🛏️ 真正點到地板 → 離開家具互動 */
    if (activeFurnitureInteraction) {

      activeFurnitureInteraction = null;

      playerCharacter.classList.remove(
        "is-sleeping"
      );

      playerCharacter.style.transform =
        "translate(-50%, -100%)";
    }

    const rect =
  roomMapLayer.getBoundingClientRect();
  
    const clickedX =
      ((event.clientX - rect.left) /
        rect.width) *
      100;

    const clickedY =
      ((event.clientY - rect.top) /
        rect.height) *
      100;

    const safeTarget =
      clampToRoomFloor(
        clickedX,
        clickedY
      );

    targetX =
      safeTarget.x;

    targetY =
      safeTarget.y;
  }
);


/* =========================
   🎮 玩家移動循環
========================= */

function movePlayer() {

  let dx = 0;
  let dy = 0;


  if (
    pressedKeys.has("w") ||
    pressedKeys.has("arrowup")
  ) {
    dy -= MOVE_SPEED;
  }

  if (
    pressedKeys.has("s") ||
    pressedKeys.has("arrowdown")
  ) {
    dy += MOVE_SPEED;
  }

  if (
    pressedKeys.has("a") ||
    pressedKeys.has("arrowleft")
  ) {
    dx -= MOVE_SPEED;
  }

  if (
    pressedKeys.has("d") ||
    pressedKeys.has("arrowright")
  ) {
    dx += MOVE_SPEED;
  }


  /* 鍵盤移動優先 */
  if (
    dx !== 0 ||
    dy !== 0
  ) {

    playerX += dx;
    playerY += dy;

    targetX = playerX;
    targetY = playerY;

  } else {

    /* 點擊／手機觸控後走向目的地 */

    const distanceX =
      targetX - playerX;

    const distanceY =
      targetY - playerY;

    const distance =
      Math.hypot(
        distanceX,
        distanceY
      );

    if (distance > MOVE_SPEED) {

      playerX +=
        (distanceX / distance) *
        MOVE_SPEED;

      playerY +=
        (distanceY / distance) *
        MOVE_SPEED;

    } else {

      playerX = targetX;
      playerY = targetY;
    }
  }


 /* =========================
   🪵 限制角色留在木地板內
========================= */

const safePosition =
  clampToRoomFloor(
    playerX,
    playerY
  );

playerX =
  safePosition.x;

playerY =
  safePosition.y;


  updatePlayerPosition();

  requestAnimationFrame(
    movePlayer
  );
}

/* =========================
   🖼️ Storage 公開網址
========================= */

function getAvatarUrl(path) {

  if (!path) {
    return "";
  }

  const {
    data
  } =
    caibiSupabase.storage
      .from("avatars")
      .getPublicUrl(path);

  return data.publicUrl;
}


/* =========================
   👗 清空目前服飾圖層
========================= */

function clearClothingLayers() {

  const layers = [
    playerSocks,
    playerShoes,
    playerBottom,
    playerTop,
    playerDress,
    playerOuterwear,
    playerHeadwear
  ];

  for (const layer of layers) {
    layer.removeAttribute("src");
    layer.style.display = "none";
  }
}


/* =========================
   👕 套用單件服飾
========================= */

function applyClothingItem(item) {

  if (
    !item ||
    !item.image_path
  ) {
    return;
  }

  const imageUrl =
    getAvatarUrl(
      item.image_path
    );

  let targetLayer = null;

switch (item.category) {

  case "socks":
    targetLayer = playerSocks;
    break;

  case "shoes":
    targetLayer = playerShoes;
    break;

  case "bottom":
    targetLayer = playerBottom;
    break;

  case "top":
    targetLayer = playerTop;
    break;

  case "dress":
    targetLayer = playerDress;
    break;

  case "outerwear":
    targetLayer = playerOuterwear;
    break;

  case "headwear":
    targetLayer = playerHeadwear;
    break;

  default:
    console.warn(
      "尚未支援的服飾分類：",
      item.category
    );
    return;
}

  targetLayer.src = imageUrl;
  targetLayer.style.display = "block";
}


/* =========================
   🔐 檢查會員＋載入分層角色
========================= */

async function checkRoomAccess() {

  const {
    data: { session },
    error
  } =
    await caibiSupabase.auth
      .getSession();


  /* 沒登入 → 回戶外 */

  if (
    error ||
    !session
  ) {

    console.log(
      "🚪 尚未登入，返回戶外"
    );

    window.location.href =
      "../../index.html";

    return;
  }


  /* =========================
   👤 載入玩家自己的 Base
========================= */

const {
  data: profile,
  error: profileError
} =
  await caibiSupabase
    .from("profiles")
    .select("avatar_path")
    .eq(
      "id",
      session.user.id
    )
    .single();

if (
  profileError ||
  !profile ||
  !profile.avatar_path
) {

  console.error(
    "讀取玩家 Base 失敗：",
    profileError
  );

  return;
}

playerBase.src =
  getAvatarUrl(
    profile.avatar_path
  );

  /* =========================
     👗 讀取目前裝備
  ========================= */

  const {
    data: equipment,
    error: equipmentError
  } =
    await caibiSupabase
      .from("player_equipment")
      .select(
        `
        slot,
        clothing_item_id,
        clothing_items (
          name,
          category,
          image_path
        )
        `
      )
      .eq(
        "user_id",
        session.user.id
      );


  if (equipmentError) {

    console.error(
      "讀取玩家裝備失敗：",
      equipmentError
    );

    return;
  }


  clearClothingLayers();


  /* =========================
     👚 套用目前穿著
  ========================= */

  for (
    const equippedItem
    of equipment || []
  ) {

    const item =
      equippedItem.clothing_items;

    applyClothingItem(item);
  }


  /* =========================
     👗 洋裝互斥
  ========================= */

  const wearingDress =
    (equipment || []).some(
      item =>
        item.slot === "dress"
    );

  if (wearingDress) {

    playerTop.style.display =
      "none";

    playerBottom.style.display =
      "none";
  }


  /* =========================
     🧍 顯示完整角色
  ========================= */

  playerCharacter.style.display =
    "block";

  console.log(
    "👗 私人房間分層角色載入完成",
    equipment
  );
}

/* =========================
   🏠 載入已擺放家具
========================= */

async function loadRoomFurniture() {

  const {
    data: { session },
    error: sessionError
  } =
    await caibiSupabase.auth
      .getSession();

  if (
    sessionError ||
    !session
  ) {
    return;
  }


  const {
    data: placedFurniture,
    error: roomFurnitureError
  } =
    await caibiSupabase
      .from("room_furniture")
      .select(`
        id,
        furniture_item_id,
        position_x,
position_y,
direction,
furniture_items (
  id,
  name,
  category,
  image_front,
  image_back,
  image_left,
  image_right
)
      `)
      .eq(
        "user_id",
        session.user.id
      );


  if (roomFurnitureError) {

    console.error(
      "讀取房間家具失敗：",
      roomFurnitureError
    );

    return;
  }


  roomFurnitureLayer.innerHTML = "";


  for (
    const placed
    of placedFurniture || []
  ) {

    const item =
      placed.furniture_items;

    if (!item) {
  continue;
}


    const furniture =
      document.createElement(
        "img"
      );

    furniture.className =
      `room-furniture room-furniture-${item.category}`;

    const direction =
  placed.direction || "front";

const directionImageMap = {
  front: item.image_front,
  right: item.image_right,
  back: item.image_back,
  left: item.image_left
};

const imagePath =
  directionImageMap[direction] ||
  item.image_front;

if (!imagePath) {
  continue;
}

furniture.src =
  getAvatarUrl(imagePath);

    furniture.alt =
      item.name;

    furniture.dataset.roomFurnitureId =
      placed.id;

    furniture.dataset.category =
  item.category;
  
  furniture.dataset.direction =
  direction;

furniture.dataset.imageFront =
  item.image_front || "";

furniture.dataset.imageRight =
  item.image_right || "";

furniture.dataset.imageBack =
  item.image_back || "";

furniture.dataset.imageLeft =
  item.image_left || "";

    furniture.style.left =
      `${placed.position_x}%`;

    furniture.style.top =
      `${placed.position_y}%`;

    enableFurnitureDrag(
    furniture
    );

    roomFurnitureLayer.appendChild(
      furniture
    );
  }
}

/* =========================
   🪑 家具編輯模式
========================= */

function openFurnitureEditBar(
  furniture
) {

  selectedFurniture =
    furniture;

  furnitureEditBar.classList.add(
    "is-open"
  );

  furnitureEditBar.setAttribute(
    "aria-hidden",
    "false"
  );
}


function closeFurnitureEditBar() {

  furnitureEditBar.classList.remove(
    "is-open"
  );

  furnitureEditBar.setAttribute(
    "aria-hidden",
    "true"
  );

  selectedFurniture = null;

  furnitureOriginalX = null;
  furnitureOriginalY = null;

  furniturePendingX = null;
  furniturePendingY = null;

  furnitureOriginalDirection = null;
  furniturePendingDirection = null;
}


/* =========================
   🖱️📱 拖曳家具
========================= */

function enableFurnitureDrag(
  furniture
) {

  furniture.addEventListener(
    "pointerdown",
    (event) => {

      event.preventDefault();
      event.stopPropagation();

      /* 🖱️ 平常模式 → 家具互動 */
if (!isFurnitureEditMode) {

  const category =
    furniture.dataset.category;

  /* 🛏️ 點床 */
if (category === "bed") {

  activeFurnitureInteraction =
    "bed";

  /* 讀取床目前方向 */
  const direction =
    furniture.dataset.direction ||
    "front";

  const interaction =
    BED_INTERACTION[direction] ||
    BED_INTERACTION.front;

  /* 停止目前走路 */
  pressedKeys.clear();

  /* 取得床目前的位置 */
  const bedX =
    parseFloat(
      furniture.style.left
    );

  const bedY =
    parseFloat(
      furniture.style.top
    );

  /* 人物位置跟著床＋該方向偏移 */
  playerX =
    bedX +
    interaction.offsetX;

  playerY =
    bedY +
    interaction.offsetY;

  targetX = playerX;
  targetY = playerY;

  /* 套用睡覺狀態 */
  playerCharacter.classList.add(
    "is-sleeping"
  );

  /* 先由 JS 控制人物角度 */
  playerCharacter.style.transform =
    `translate(-50%, -100%) rotate(${interaction.rotation}deg)`;

  updatePlayerPosition();

  console.log(
    "🛏️ 玩家上床：",
    direction,
    interaction
  );
}

  return;
}

      /* 正在編輯其他家具時，
         不直接切換 */
      if (
        selectedFurniture &&
        selectedFurniture !== furniture
      ) {
        return;
      }


      const currentX =
        parseFloat(
          furniture.style.left
        );

      const currentY =
        parseFloat(
          furniture.style.top
        );


      /* 第一次碰這件家具時，
   記住原本位置＋方向 */
if (
  selectedFurniture !== furniture
) {

  furnitureOriginalX =
    currentX;

  furnitureOriginalY =
    currentY;

  furnitureOriginalDirection =
    furniture.dataset.direction ||
    "front";
}


      furniturePendingX =
        currentX;

      furniturePendingY =
        currentY;

furniturePendingDirection =
  furniture.dataset.direction ||
  "front";

      openFurnitureEditBar(
        furniture
      );


      furniture.setPointerCapture(
        event.pointerId
      );

      furniture.style.cursor =
        "grabbing";


      const moveFurniture =
        (moveEvent) => {

          const rect =
            roomMapLayer
              .getBoundingClientRect();


          let x =
            (
              (
                moveEvent.clientX -
                rect.left
              ) /
              rect.width
            ) * 100;


          let y =
            (
              (
                moveEvent.clientY -
                rect.top
              ) /
              rect.height
            ) * 100;


          const safePosition =
            clampToRoomFloor(
              x,
              y
            );


          x = safePosition.x;
          y = safePosition.y;


          furniturePendingX = x;
          furniturePendingY = y;


          furniture.style.left =
            `${x}%`;

          furniture.style.top =
            `${y}%`;
        };


      const stopDragging =
        () => {

          furniture.removeEventListener(
            "pointermove",
            moveFurniture
          );

          furniture.removeEventListener(
            "pointerup",
            stopDragging
          );

          furniture.removeEventListener(
            "pointercancel",
            stopDragging
          );


          furniture.style.cursor =
            "grab";

          /*
            ⚠️ 放手不儲存。
            等玩家按「確認位置」。
          */
        };


      furniture.addEventListener(
        "pointermove",
        moveFurniture
      );

      furniture.addEventListener(
        "pointerup",
        stopDragging
      );

      furniture.addEventListener(
        "pointercancel",
        stopDragging
      );
    }
  );
}

/* =========================
   ↻ 家具轉向
========================= */

furnitureRotateButton.addEventListener(
  "click",
  () => {

    if (!selectedFurniture) {
      return;
    }

    const currentDirection =
      furniturePendingDirection ||
      selectedFurniture.dataset.direction ||
      "front";

    const currentIndex =
      FURNITURE_DIRECTIONS.indexOf(
        currentDirection
      );

    const nextIndex =
      (currentIndex + 1) %
      FURNITURE_DIRECTIONS.length;

    const nextDirection =
      FURNITURE_DIRECTIONS[nextIndex];

    const imageKey =
      `image${
        nextDirection
          .charAt(0)
          .toUpperCase() +
        nextDirection.slice(1)
      }`;

    const imagePath =
      selectedFurniture.dataset[
        imageKey
      ];

    if (!imagePath) {

      console.warn(
        "這個方向沒有家具圖片：",
        nextDirection
      );

      return;
    }

    selectedFurniture.src =
      getAvatarUrl(
        imagePath
      );

    selectedFurniture.dataset.direction =
      nextDirection;

    furniturePendingDirection =
      nextDirection;

    console.log(
      "↻ 家具轉向：",
      nextDirection
    );
  }
);

/* =========================
   ↩ 取消家具編輯
========================= */

furnitureCancelButton.addEventListener(
  "click",
  () => {

    if (!selectedFurniture) {
      return;
    }


    selectedFurniture.style.left =
      `${furnitureOriginalX}%`;

    selectedFurniture.style.top =
      `${furnitureOriginalY}%`;

if (furnitureOriginalDirection) {

  const originalImageKey =
    `image${
      furnitureOriginalDirection
        .charAt(0)
        .toUpperCase() +
      furnitureOriginalDirection.slice(1)
    }`;

  const originalImagePath =
    selectedFurniture.dataset[
      originalImageKey
    ];

  if (originalImagePath) {

    selectedFurniture.src =
      getAvatarUrl(
        originalImagePath
      );
  }

  selectedFurniture.dataset.direction =
    furnitureOriginalDirection;

  furniturePendingDirection =
    furnitureOriginalDirection;
}

    closeFurnitureEditBar();
  }
);


/* =========================
   ✓ 確認家具位置
========================= */

furnitureConfirmButton.addEventListener(
  "click",
  async () => {

    if (
      !selectedFurniture ||
      furniturePendingX === null ||
      furniturePendingY === null
    ) {
      return;
    }


    furnitureConfirmButton.disabled =
      true;

    furnitureConfirmButton.textContent =
      "儲存中...";


    const roomFurnitureId =
      Number(
        selectedFurniture.dataset
          .roomFurnitureId
      );


    const {
      error: moveError
    } =
     await caibiSupabase.rpc(
  "move_room_furniture",
  {
    p_room_furniture_id:
      roomFurnitureId,

    p_position_x:
      furniturePendingX,

    p_position_y:
      furniturePendingY,

    p_direction:
      furniturePendingDirection ||
      selectedFurniture.dataset.direction ||
      "front"
  }
);


    furnitureConfirmButton.disabled =
      false;

    furnitureConfirmButton.textContent =
      "✓ 確認位置";


    if (moveError) {

      console.error(
        "儲存家具位置失敗：",
        moveError
      );

      alert(
        "家具位置儲存失敗 🥲"
      );


      selectedFurniture.style.left =
        `${furnitureOriginalX}%`;

      selectedFurniture.style.top =
        `${furnitureOriginalY}%`;


      closeFurnitureEditBar();

      return;
    }


    console.log(
      "🪑 家具位置已確認"
    );


    closeFurnitureEditBar();
  }
);


/* =========================
   📦 收回儲物箱
========================= */

furnitureStoreButton.addEventListener(
  "click",
  async () => {

    if (!selectedFurniture) {
      return;
    }


    const roomFurnitureId =
      Number(
        selectedFurniture.dataset
          .roomFurnitureId
      );


    furnitureStoreButton.disabled =
      true;

    furnitureStoreButton.textContent =
      "收回中...";


    const {
      error: storeError
    } =
      await caibiSupabase.rpc(
        "store_room_furniture",
        {
          p_room_furniture_id:
            roomFurnitureId
        }
      );


    furnitureStoreButton.disabled =
      false;

    furnitureStoreButton.textContent =
      "📦 收回";


    if (storeError) {

      console.error(
        "收回家具失敗：",
        storeError
      );

      alert(
        "家具收回失敗 🥲"
      );

      return;
    }


    console.log(
      "📦 家具已收回儲物箱"
    );


    closeFurnitureEditBar();

    await loadRoomFurniture();
  }
);

/* =========================
   🪑 載入玩家家具
========================= */

async function loadStorageFurniture() {

  const {
    data: { session },
    error: sessionError
  } =
    await caibiSupabase.auth
      .getSession();

  if (
    sessionError ||
    !session
  ) {
    return;
  }


  /* 讀取玩家擁有的家具 */
  const {
    data: ownedFurniture,
    error: furnitureError
  } =
    await caibiSupabase
      .from("player_furniture")
      .select(`
        furniture_item_id,
        quantity,
        furniture_items (
          id,
          name,
          category,
          image_front,
          rarity
        )
      `)
      .eq(
        "user_id",
        session.user.id
      );

/* 讀取目前房間裡已擺放的家具 */
const {
  data: placedFurniture,
  error: placedFurnitureError
} =
  await caibiSupabase
    .from("room_furniture")
    .select("furniture_item_id")
    .eq(
      "user_id",
      session.user.id
    );

if (placedFurnitureError) {

  console.error(
    "讀取已擺放家具失敗：",
    placedFurnitureError
  );

  storageFurnitureGrid.innerHTML =
    `
      <div class="storage-empty">
        家具讀取失敗 🥲
      </div>
    `;

  return;
}

  if (furnitureError) {

    console.error(
      "讀取家具失敗：",
      furnitureError
    );

    storageFurnitureGrid.innerHTML =
      `
        <div class="storage-empty">
          家具讀取失敗 🥲
        </div>
      `;

    return;
  }


  /* 目前沒有家具 */
  if (
    !ownedFurniture ||
    ownedFurniture.length === 0
  ) {

    storageFurnitureGrid.innerHTML =
      `
        <div class="storage-empty">
          儲物箱目前空空的 📦
        </div>
      `;

    return;
  }


  /* 清空舊內容 */
  storageFurnitureGrid.innerHTML = "";


  /* 建立家具卡片 */
  for (
    const owned
    of ownedFurniture
  ) {

    const item =
      owned.furniture_items;

    if (!item) {
      continue;
    }


    const card =
      document.createElement(
        "div"
      );

    card.className =
      "storage-furniture-card";


    const image =
      document.createElement(
        "img"
      );

    image.className =
      "storage-furniture-image";

    image.src =
      getAvatarUrl(
        item.image_front
      );

    image.alt =
      item.name;


    const name =
      document.createElement(
        "div"
      );

    name.className =
      "storage-furniture-name";

    name.textContent =
      item.name;


    /* 計算這款家具目前已擺放幾個 */
const placedCount =
  (placedFurniture || [])
    .filter(
      placed =>
        Number(placed.furniture_item_id) ===
        Number(item.id)
    )
    .length;


/* 還可以再擺放幾個 */
const availableCount =
  Math.max(
    0,
    owned.quantity - placedCount
  );


const quantity =
  document.createElement(
    "div"
  );

quantity.className =
  "storage-furniture-quantity";

quantity.textContent =
  `持有 ×${owned.quantity}｜可擺放 ×${availableCount}`;


    const placeButton =
  document.createElement(
    "button"
  );

placeButton.className =
  "storage-place-button";

placeButton.type =
  "button";


/* 沒有剩餘數量 → 禁止再擺 */
if (availableCount <= 0) {

  placeButton.disabled = true;

  placeButton.textContent =
    "已擺放";

} else {

  placeButton.disabled = false;

  placeButton.textContent =
    "擺放";
}

    placeButton.addEventListener(
      "click",
      async () => {

        placeButton.disabled = true;
        placeButton.textContent =
          "擺放中...";

        const {
          data: roomFurnitureId,
          error: placeError
        } =
          await caibiSupabase.rpc(
            "place_room_furniture",
            {
              p_furniture_item_id:
                item.id,

              p_position_x: 50,

              p_position_y: 60
            }
          );


        if (placeError) {

          console.error(
            "擺放家具失敗：",
            placeError
          );

          placeButton.disabled = false;
          placeButton.textContent =
            "擺放";

          alert(
            placeError.message ||
            "家具擺放失敗"
          );

          return;
        }


        console.log(
          "🛏️ 家具擺放成功：",
          roomFurnitureId
        );

        closeStorage();

        await loadRoomFurniture();
      }
    );

    card.append(
      image,
      name,
      quantity,
      placeButton
    );

    storageFurnitureGrid.appendChild(
      card
    );
  }
}

/* =========================
   ✏️ 房間家具編輯模式
========================= */

function startFurnitureEditMode() {

  isFurnitureEditMode = true;

  closeStorage();

    storageButton.innerHTML =
    `
      <span class="room-action-icon">
        ✓
      </span>
      <span>完成編輯</span>
    `;

  document
    .querySelectorAll(
      ".room-furniture"
    )
    .forEach(
      furniture => {

        furniture.style.cursor =
          "grab";
      }
    );

  console.log(
    "✏️ 已進入家具編輯模式"
  );
}


function finishFurnitureEditMode() {

  /* 如果還有一件家具尚未確認，
     先恢復它原本的位置 */
  if (
    selectedFurniture &&
    furnitureOriginalX !== null &&
    furnitureOriginalY !== null
  ) {

    selectedFurniture.style.left =
      `${furnitureOriginalX}%`;

    selectedFurniture.style.top =
      `${furnitureOriginalY}%`;
  }


  closeFurnitureEditBar();

  isFurnitureEditMode = false;

  storageButton.innerHTML =
    `
      <span class="room-action-icon">
        📦
      </span>
      <span>儲物箱</span>
    `;

  document
    .querySelectorAll(
      ".room-furniture"
    )
    .forEach(
      furniture => {

        furniture.style.cursor =
          "default";
      }
    );


  console.log(
    "🔒 已結束家具編輯模式"
  );
}


furnitureEditModeButton.addEventListener(
  "click",
  () => {

    if (isFurnitureEditMode) {

      finishFurnitureEditMode();

      closeStorage();

      return;
    }


    startFurnitureEditMode();
  }
);

/* =========================
   📦 儲物箱開關
========================= */

async function openStorage() {

  storageModal.classList.add(
    "is-open"
  );

  storageModal.setAttribute(
    "aria-hidden",
    "false"
  );

  storageFurnitureGrid.innerHTML =
    `
      <div class="storage-empty">
        家具載入中... 🪑
      </div>
    `;

  await loadStorageFurniture();
}


function closeStorage() {

  storageModal.classList.remove(
    "is-open"
  );

  storageModal.setAttribute(
    "aria-hidden",
    "true"
  );
}


storageButton.addEventListener(
  "click",
  (event) => {

    event.stopPropagation();


    /* 編輯模式 → 這顆變成完成 */
    if (isFurnitureEditMode) {

      finishFurnitureEditMode();

      return;
    }


    /* 平常模式 → 開儲物箱 */
    openStorage();
  }
);


storageCloseButton.addEventListener(
  "click",
  () => {

    closeStorage();
  }
);


/* 點視窗外的暗色區域也可以關閉 */
storageModal.addEventListener(
  "pointerdown",
  (event) => {

    if (
      event.target === storageModal
    ) {

      closeStorage();
    }
  }
);

/* =========================
   🚪 返回 1F 客廳
========================= */

livingRoomEntrance.addEventListener(
  "click",
  () => {

    window.location.href =
      "../index.html";
  }
);


/* =========================
   🚀 啟動私人房間
========================= */

updatePlayerPosition();
movePlayer();

checkRoomAccess();
loadRoomFurniture();