/* =========================
   🍰 菜比之家｜烘焙房
========================= */

const bakeryRoom =
  document.getElementById("bakeryRoom");

const playerCharacter =
  document.getElementById("playerCharacter");

const backLivingRoom =
  document.getElementById("backLivingRoom");

/* =========================
   🚶 玩家移動資料
========================= */

let playerX = 50;
let playerY = 78;

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

window.addEventListener("keydown", (event) => {

  const key = event.key.toLowerCase();

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

});


window.addEventListener("keyup", (event) => {

  pressedKeys.delete(
    event.key.toLowerCase()
  );

});


/* =========================
   🖱️ 滑鼠／📱觸控點地移動
========================= */

bakeryRoom.addEventListener(
  "pointerdown",
  (event) => {

    /* 點到按鈕時不要移動 */
    if (
      event.target.closest("button")
    ) {
      return;
    }

    const rect =
      bakeryRoom.getBoundingClientRect();

    targetX =
      ((event.clientX - rect.left) /
        rect.width) *
      100;

    targetY =
      ((event.clientY - rect.top) /
        rect.height) *
      100;

    /* 暫時限制在主要木地板 */
    targetX =
      Math.max(
        10,
        Math.min(90, targetX)
      );

    targetY =
      Math.max(
        45,
        Math.min(88, targetY)
      );
  }
);


/* =========================
   🎮 移動循環
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


  /* 鍵盤優先 */
  if (dx !== 0 || dy !== 0) {

    playerX += dx;
    playerY += dy;

    targetX = playerX;
    targetY = playerY;

  } else {

    /* 點擊／觸控後慢慢走向目標 */

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


  /* 暫時限制可走範圍 */

  playerX =
    Math.max(
      10,
      Math.min(90, playerX)
    );

  playerY =
    Math.max(
      45,
      Math.min(88, playerY)
    );


  updatePlayerPosition();

  requestAnimationFrame(
    movePlayer
  );
}


/* 啟動人物位置與移動 */

updatePlayerPosition();
movePlayer();

/* =========================
   🧱 烘焙房家具碰撞區
========================= */

const bakeryObstacles = [
  {
    name: "中央料理工作台",
    left: 32,
    right: 68,
    top: 43,
    bottom: 61
  }
];

function isBakeryBlocked(x, y) {

  return bakeryObstacles.some((obstacle) => {

    return (
      x >= obstacle.left &&
      x <= obstacle.right &&
      y >= obstacle.top &&
      y <= obstacle.bottom
    );

  });
}

/* =========================
   🔐 檢查會員身分
========================= */

async function checkBakeryAccess() {

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
     👕 載入目前穿著
  ========================= */

  const {
    data: equippedOutfit,
    error: outfitError
  } = await caibiSupabase
    .from("player_outfits")
    .select("outfit_name, image_path")
    .eq("user_id", session.user.id)
    .eq("is_equipped", true)
    .maybeSingle();


  if (outfitError) {
    console.error(
      "讀取玩家服裝失敗：",
      outfitError
    );
    return;
  }


  if (equippedOutfit) {

    const { data: imageData } =
      caibiSupabase.storage
        .from("avatars")
        .getPublicUrl(
          equippedOutfit.image_path
        );


    playerCharacter.src =
      imageData.publicUrl;

    playerCharacter.style.display =
      "block";


    console.log(
      "👕 烘焙房角色已載入：",
      equippedOutfit.outfit_name
    );
  }
}


/* =========================
   🚪 返回 1F 客廳
========================= */

backLivingRoom.addEventListener(
  "click",
  () => {

    window.location.href =
      "../index.html";

  }
);


/* =========================
   🚀 啟動烘焙房
========================= */

checkBakeryAccess();