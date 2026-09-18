/* =========================
   🌾 菜比之家｜後院農場
========================= */

const backyard =
  document.getElementById("backyard");

const backyardMapLayer =
  document.getElementById("backyardMapLayer");

const playerCharacter =
  document.getElementById("playerCharacter");

const bakeryEntrance =
  document.getElementById("bakeryEntrance");

/* =========================
   🚶 玩家移動資料
========================= */

let playerX = 50;
let playerY = 70;

const MOVE_SPEED = 0.6;

const pressedKeys = new Set();

/* =========================
   🖱️ 點擊／觸控移動資料
========================= */

let targetX = null;
let targetY = null;

const CLICK_MOVE_SPEED = 0.8;

/* =========================
   👆 點擊／觸控設定目的地
========================= */

backyard.addEventListener(
  "pointerdown",
  (event) => {

    /* 點到門時，不觸發人物移動 */
    if (
      event.target.closest(
        ".bakery-entrance"
      )
    ) {
      return;
    }

    const rect =
      backyardMapLayer.getBoundingClientRect();

    /* 點在 16:9 地圖外就不處理 */
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      return;
    }

    const clickedX =
      ((event.clientX - rect.left) /
        rect.width) * 100;

    const clickedY =
      ((event.clientY - rect.top) /
        rect.height) * 100;

    /* 只有可走區才能設定目的地 */
    if (
      !isBackyardWalkable(
        clickedX,
        clickedY
      )
    ) {
      return;
    }

    targetX = clickedX;
    targetY = clickedY;
  }
);

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
    ) 
    
    event.preventDefault();
pressedKeys.add(key);

/* 手動控制時，取消點擊自動移動 */
targetX = null;
targetY = null;

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
   🎮 移動循環
========================= */

/* =========================
   🌿 後院可行走區域
========================= */

const backyardWalkAreas = [

  /* 🌱 中央主要草地 */
  {
    left: 30,
    right: 72,
    top: 24,
    bottom: 73
  },

  /* 🚪 上方｜通往烘焙房 */
  {
    left: 43,
    right: 61,
    top: 19,
    bottom: 35
  },

  /* 🌿 左側草地延伸 */
  {
    left: 36,
    right: 42,
    top: 38,
    bottom: 62
  },

  /* 🌼 下方｜花拱門前 */
  {
    left: 37,
    right: 69,
    top: 61,
    bottom: 76
  },

  /* 🪵 左下木平台 */
  {
    left: 6,
    right: 25,
    top: 60,
    bottom: 77
  },

  /* 🪵 木平台連接草地 */
  {
    left: 20,
    right: 38,
    top: 62,
    bottom: 72
  }
];


function isBackyardWalkable(x, y) {

  return backyardWalkAreas.some(
    (area) => {

      return (
        x >= area.left &&
        x <= area.right &&
        y >= area.top &&
        y <= area.bottom
      );
    }
  );
}

/* =========================
   🎮 玩家移動循環
========================= */

function movePlayer() {

  let dx = 0;
  let dy = 0;

  /* =========================
   🖱️ 點擊／觸控自動移動
========================= */

if (
  targetX !== null &&
  targetY !== null
) {

  const distanceX =
    targetX - playerX;

  const distanceY =
    targetY - playerY;

  const distance =
    Math.hypot(
      distanceX,
      distanceY
    );

  /* 已經走到目的地 */
  if (distance < CLICK_MOVE_SPEED) {

    playerX = targetX;
    playerY = targetY;

    targetX = null;
    targetY = null;

  } else {

    dx =
      (distanceX / distance) *
      CLICK_MOVE_SPEED;

    dy =
      (distanceY / distance) *
      CLICK_MOVE_SPEED;
  }
}

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

 const nextX = playerX + dx;
 const nextY = playerY + dy;

/* ↔️ 左右移動 */
if (
  isBackyardWalkable(nextX, playerY)
) {
  playerX = nextX;
}

/* ↕️ 上下移動 */
if (
  isBackyardWalkable(playerX, nextY)
) {
  playerY = nextY;
}

  updatePlayerPosition();

  requestAnimationFrame(movePlayer);
}

/* =========================
   🚪 返回烘焙房
========================= */

bakeryEntrance.addEventListener(
  "click",
  () => {
    window.location.href = "../bakery/index.html";
  }
);

/* =========================
   🔐 檢查會員身分＋載入角色
========================= */

async function checkBackyardAccess() {

  const {
    data: { session },
    error
  } = await caibiSupabase.auth.getSession();


  /* 沒登入 → 回戶外 */
  if (error || !session) {

    console.log("🚪 尚未登入，返回戶外");

    window.location.href = "../../index.html";
    return;
  }


  /* =========================
     👤 讀取玩家 Base
  ========================= */

  const {
    data: profile,
    error: profileError
  } =
    await caibiSupabase
      .from("profiles")
      .select("avatar_path")
      .eq("id", session.user.id)
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


  /* =========================
     👗 取得角色分層
  ========================= */

  const playerBase =
    document.getElementById("playerBase");

  const playerSocks =
    document.getElementById("playerSocks");

  const playerShoes =
    document.getElementById("playerShoes");

  const playerBottom =
    document.getElementById("playerBottom");

  const playerTop =
    document.getElementById("playerTop");

  const playerDress =
    document.getElementById("playerDress");

  const playerOuterwear =
    document.getElementById("playerOuterwear");

  const playerHeadwear =
    document.getElementById("playerHeadwear");


  /* 👤 顯示玩家 Base */

  const { data: baseData } =
    caibiSupabase.storage
      .from("avatars")
      .getPublicUrl(
        profile.avatar_path
      );

  playerBase.src =
    baseData.publicUrl;


  /* =========================
     👗 讀取目前裝備
  ========================= */

  const {
    data: equipment,
    error: equipmentError
  } =
    await caibiSupabase
      .from("player_equipment")
      .select(`
        slot,
        clothing_item_id,
        clothing_items (
          name,
          category,
          image_path
        )
      `)
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


  /* 🧹 清空全部服裝層 */

  const clothingLayers = [
    playerSocks,
    playerShoes,
    playerBottom,
    playerTop,
    playerDress,
    playerOuterwear,
    playerHeadwear
  ];

  for (const layer of clothingLayers) {

    layer.removeAttribute("src");
    layer.style.display = "none";

  }


  /* 👚 套用目前裝備 */

  for (const equippedItem of equipment || []) {

    const item =
      equippedItem.clothing_items;

    if (
      !item ||
      !item.image_path
    ) {
      continue;
    }


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
    }


    if (!targetLayer) {
      continue;
    }


    const { data: clothingData } =
      caibiSupabase.storage
        .from("avatars")
        .getPublicUrl(
          item.image_path
        );

    targetLayer.src =
      clothingData.publicUrl;

    targetLayer.style.display =
      "block";
  }


  /* 👗 洋裝與上衣＋下身互斥 */

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


  /* 🧍 全部載完才顯示 */

  playerCharacter.style.display =
    "block";


  console.log(
    "👗 後院分層角色載入完成",
    equipment
  );
}

/* =========================
   🚀 啟動後院農場
========================= */

updatePlayerPosition();
movePlayer();

checkBackyardAccess();