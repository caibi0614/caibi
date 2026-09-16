/* =========================
   🏡 菜比之家｜1F
========================= */


/* =========================
   🔐 檢查會員身分
========================= */

async function checkHouseAccess() {

  const {
    data: { session },
    error
  } = await caibiSupabase.auth.getSession();

  /* 沒登入 → 回戶外 */
  if (error || !session) {
    console.log("🚪 尚未登入，返回戶外");

    window.location.href = "../index.html";
    return;
  }


  /* =========================
     👤 讀取玩家資料
  ========================= */

  const { data: profile, error: profileError } =
    await caibiSupabase
      .from("profiles")
      .select("username, display_name, role")
      .eq("id", session.user.id)
      .single();

  if (profileError || !profile) {
    console.error("找不到會員資料：", profileError);

    window.location.href = "../index.html";
    return;
  }


  /* =========================
     🏡 驗證成功
  ========================= */

  /* =========================
   👤 載入目前穿著的角色圖片
========================= */

const { data: equippedOutfit, error: outfitError } =
  await caibiSupabase
    .from("player_outfits")
    .select("outfit_name, image_path")
    .eq("user_id", session.user.id)
    .eq("is_equipped", true)
    .maybeSingle();

if (outfitError) {
  console.error("讀取玩家服裝失敗：", outfitError);
  
}

console.log("👤 目前登入者 ID：", session.user.id);
console.log("👕 查到的穿著資料：", equippedOutfit);

if (equippedOutfit) {

  /* 取得 avatars Storage 公開網址 */
  const { data: imageData } =
    caibiSupabase.storage
      .from("avatars")
      .getPublicUrl(equippedOutfit.image_path);

  const playerCharacter =
    document.getElementById("playerCharacter");

  playerCharacter.src =
    imageData.publicUrl;

  playerCharacter.style.display =
    "block";

  console.log(
    "👕 已載入角色服裝：",
    equippedOutfit.outfit_name
  );
}

  console.log("🏡 進入菜比之家：", profile);

  document.getElementById("welcomeText").textContent =
    `歡迎回家，${profile.display_name}！`;

  document.getElementById("houseContent").style.display =
    "block";
}


/* =========================
   🚪 登出
========================= */

/* 🍰 烘焙房入口 */
const bakeryEntrance =
  document.getElementById("bakeryEntrance");

const logoutButton =
  document.getElementById("logoutButton");

logoutButton.addEventListener("click", async () => {

  const { error } =
    await caibiSupabase.auth.signOut();

  if (error) {
    console.error("登出失敗：", error);
    return;
  }

  console.log("🚪 已登出菜比之家");

  window.location.href = "../index.html";
});

/* =========================
   🍰 前往烘焙房
========================= */

bakeryEntrance.addEventListener("click", () => {
  window.location.href = "bakery/index.html";
});

/* =========================
   🚀 啟動 1F
========================= */

checkHouseAccess();

/* =========================
   🎮 玩家移動
   鍵盤 + 點擊 / 觸控
========================= */

const playerCharacter =
  document.getElementById("playerCharacter");

const livingRoom =
  document.getElementById("livingRoom");


let playerX = 50;
let playerY = 68;

const MOVE_SPEED = 0.6;

/* =========================
   🚧 客廳障礙物
========================= */

const obstacles = [

  /* 🗄️ 左側靠牆櫃 */
{
  left: 8,
  right: 15,
  top: 30,
  bottom: 57
},

  /* 📚 左上書櫃 */
  {
    left: 27,
    right: 38,
    top: 13,
    bottom: 29
  },

  /* 🛋️ 中央長沙發 */
  {
    left: 39,
    right: 58,
    top: 27,
    bottom: 36
  },

  /* ☕ 中央茶几 */
  {
    left: 40,
    right: 55,
    top: 38,
    bottom: 47
  },

  /* 🪑 右側單人椅 */
  {
    left: 57,
    right: 66,
    top: 31,
    bottom: 43
  },

  /* 🔥 壁爐 */
  {
    left: 61,
    right: 72,
    top: 18,
    bottom: 33
  },

  /* 🗄️ 右側靠牆櫃 */
{
  left: 85,
  right: 91,
  top: 30,
  bottom: 57
},

  /* 🗄️ 左下長櫃 */
  {
    left: 8,
    right: 30,
    top: 75,
    bottom: 88
  },

  /* 🪴 左側入口桌 */
  {
    left: 31,
    right: 45,
    top: 79,
    bottom: 94
  },

  /* 🚪 下方大門 */
  {
    left: 46,
    right: 58,
    top: 79,
    bottom: 96
  },

  /* 🪴 右側入口桌 */
  {
    left: 59,
    right: 73,
    top: 79,
    bottom: 94
  },

  /* 🗄️ 右下家具 */
  {
    left: 76,
    right: 89,
    top: 66,
    bottom: 88
  }

];

function isBlocked(x, y) {

  /* 👣 腳底碰撞盒 */
  const feetLeft = x - 2;
  const feetRight = x + 2;

  const feetTop = y;
  const feetBottom = y + 2;

  return obstacles.some((obstacle) => {

    return (
      feetRight >= obstacle.left &&
      feetLeft <= obstacle.right &&
      feetBottom >= obstacle.top &&
      feetTop <= obstacle.bottom
    );

  });
}

/* 點擊移動的目的地 */
let targetX = null;
let targetY = null;

const pressedKeys = new Set();


/* =========================
   ⌨️ WASD / 方向鍵
========================= */

window.addEventListener("keydown", (event) => {

  const key = event.key.toLowerCase();

  const moveKeys = [
    "w",
    "a",
    "s",
    "d",
    "arrowup",
    "arrowdown",
    "arrowleft",
    "arrowright"
  ];

  if (!moveKeys.includes(key)) {
    return;
  }

  event.preventDefault();

  /* 鍵盤操作時取消自動走路 */
  targetX = null;
  targetY = null;

  pressedKeys.add(key);
});


window.addEventListener("keyup", (event) => {
  pressedKeys.delete(event.key.toLowerCase());
});


/* =========================
   🖱️ 點擊 / 📱 觸控移動
========================= */

livingRoom.addEventListener("pointerdown", (event) => {

  /* 點到按鈕時不要移動 */
  if (
    event.target.closest("button") ||
    event.target.closest(".player-info")
  ) {
    return;
  }

  const rect =
    livingRoom.getBoundingClientRect();

  /* 把點擊位置換成百分比座標 */
  targetX =
    ((event.clientX - rect.left) / rect.width) * 100;

  targetY =
    ((event.clientY - rect.top) / rect.height) * 100;


  /* 暫時限制在場景範圍 */
 targetX =
  Math.max(15, Math.min(85, targetX));

targetY =
  Math.max(43, Math.min(86, targetY));
});


/* =========================
   🚶 每幀更新玩家位置
========================= */

function movePlayer() {

  /* ---------- 先記住目前位置 ---------- */

  let nextX = playerX;
  let nextY = playerY;


  /* ---------- ⌨️ 鍵盤 ---------- */

  if (
    pressedKeys.has("w") ||
    pressedKeys.has("arrowup")
  ) {
    nextY -= MOVE_SPEED;
  }

  if (
    pressedKeys.has("s") ||
    pressedKeys.has("arrowdown")
  ) {
    nextY += MOVE_SPEED;
  }

  if (
    pressedKeys.has("a") ||
    pressedKeys.has("arrowleft")
  ) {
    nextX -= MOVE_SPEED;
  }

  if (
    pressedKeys.has("d") ||
    pressedKeys.has("arrowright")
  ) {
    nextX += MOVE_SPEED;
  }


  /* ---------- 🖱️ 點擊 / 📱 觸控自動走路 ---------- */

  if (
    targetX !== null &&
    targetY !== null
  ) {

    const dx = targetX - playerX;
    const dy = targetY - playerY;

    const distance =
      Math.sqrt(dx * dx + dy * dy);

    if (distance < MOVE_SPEED) {

      nextX = targetX;
      nextY = targetY;

      targetX = null;
      targetY = null;

    } else {

      nextX =
        playerX + (dx / distance) * MOVE_SPEED;

      nextY =
        playerY + (dy / distance) * MOVE_SPEED;
    }
  }


  /* ---------- 🪵 客廳外圍邊界 ---------- */

 nextX =
  Math.max(15, Math.min(85, nextX));

  nextY =
    Math.max(43, Math.min(86, nextY));


  /* ---------- 🚧 障礙物碰撞 ---------- */

  if (!isBlocked(nextX, nextY)) {

    playerX = nextX;
    playerY = nextY;

  } else {

    /* 點擊走路撞到障礙物就停止 */
    targetX = null;
    targetY = null;
  }


  /* ---------- 🎮 更新角色位置 ---------- */

  playerCharacter.style.left =
    `${playerX}%`;

  playerCharacter.style.top =
    `${playerY}%`;


  requestAnimationFrame(movePlayer);
}

movePlayer();