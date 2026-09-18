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

    /* 點到門時不要觸發移動 */
   if (
  event.target.closest("button") ||
  event.target.closest(".room-furniture")
) {
  return;
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
        furniture_items (
          id,
          name,
          category,
          image_path
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

    if (
      !item ||
      !item.image_path
    ) {
      continue;
    }


    const furniture =
      document.createElement(
        "img"
      );

    furniture.className =
      `room-furniture room-furniture-${item.category}`;

    furniture.src =
      getAvatarUrl(
        item.image_path
      );

    furniture.alt =
      item.name;

    furniture.dataset.roomFurnitureId =
      placed.id;

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
   🪑 家具拖曳＋儲存位置
========================= */

function enableFurnitureDrag(
  furniture
) {

  furniture.addEventListener(
    "pointerdown",
    (event) => {

      event.preventDefault();
      event.stopPropagation();

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


          furniture.style.left =
            `${x}%`;

          furniture.style.top =
            `${y}%`;
        };


      const stopDragging =
        async (upEvent) => {

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


          const rect =
            roomMapLayer
              .getBoundingClientRect();

          let x =
            (
              (
                upEvent.clientX -
                rect.left
              ) /
              rect.width
            ) * 100;

          let y =
            (
              (
                upEvent.clientY -
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


          furniture.style.left =
            `${x}%`;

          furniture.style.top =
            `${y}%`;


          const roomFurnitureId =
            Number(
              furniture.dataset
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
                  x,

                p_position_y:
                  y
              }
            );


          if (moveError) {

            console.error(
              "儲存家具位置失敗：",
              moveError
            );

            alert(
              "家具位置儲存失敗 🥲"
            );

            await loadRoomFurniture();
          }
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
          image_path,
          rarity
        )
      `)
      .eq(
        "user_id",
        session.user.id
      );


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
        item.image_path
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


    const quantity =
      document.createElement(
        "div"
      );

    quantity.className =
      "storage-furniture-quantity";

    quantity.textContent =
      `持有 ×${owned.quantity}`;


    const placeButton =
      document.createElement(
        "button"
      );

    placeButton.className =
      "storage-place-button";

    placeButton.type =
      "button";

    placeButton.textContent =
      "擺放";

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