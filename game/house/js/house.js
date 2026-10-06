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
      .select("username, display_name, role, avatar_path")
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
   👤 載入玩家 Base＋目前穿著
========================= */

const playerCharacter =
  document.getElementById("playerCharacter");

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


/* 👤 玩家專屬 Base */

if (!profile.avatar_path) {

  console.error(
    "找不到玩家 avatar_path"
  );

  return;
}

const { data: baseData } =
  caibiSupabase.storage
    .from("avatars")
    .getPublicUrl(
      profile.avatar_path
    );

playerBase.src =
  baseData.publicUrl;


/* 👗 讀取目前裝備 */

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


/* 🧹 先清空全部衣服 */

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


/* 👚 把裝備套到對應圖層 */

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
  "👗 1F 分層角色載入完成",
  equipment
);

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

/* 🪜 私人房間入口 */
const privateRoomEntrance =
  document.getElementById("privateRoomEntrance");

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

/* 🪜 前往 2F 私人房間 */
privateRoomEntrance.addEventListener("click", () => {
  window.location.href = "room/index.html";
});

/* =========================
   📱 菜比手機
========================= */

const gamePhoneButton =
  document.getElementById("gamePhoneButton");

const gamePhonePanel =
  document.getElementById("gamePhonePanel");

const gamePhoneClose =
  document.getElementById("gamePhoneClose");


/* 📱 打開手機 */

gamePhoneButton.addEventListener("click", () => {

  gamePhonePanel.classList.add("is-open");

  gamePhonePanel.setAttribute(
    "aria-hidden",
    "false"
  );

});


/* ✕ 關閉手機 */

gamePhoneClose.addEventListener("click", () => {

  gamePhonePanel.classList.remove("is-open");

  gamePhonePanel.setAttribute(
    "aria-hidden",
    "true"
  );

});


/* 點手機外面的半透明區域也能關閉 */

gamePhonePanel.addEventListener("click", (event) => {

  if (event.target !== gamePhonePanel) {
    return;
  }

  gamePhonePanel.classList.remove("is-open");

  gamePhonePanel.setAttribute(
    "aria-hidden",
    "true"
  );

});

/* =========================
   🎒 菜比手機－背包
========================= */

const gamePhone =
  document.querySelector(".game-phone");

const gamePhoneGrid =
  document.querySelector(".game-phone-grid");

const backpackButton =
  document.querySelector(
    '[data-phone-app="backpack"]'
  );

const backpackPage =
  document.getElementById("backpackPage");

const backpackBackButton =
  document.getElementById("backpackBackButton");

const backpackGoldBeans =
  document.getElementById("backpackGoldBeans");

const backpackDiamonds =
  document.getElementById("backpackDiamonds");

const backpackItems =
  document.getElementById("backpackItems");

const backpackTabs =
  document.querySelectorAll(
    "[data-backpack-tab]"
  );

let backpackInventory = [];
let backpackClothing = [];
let backpackFurniture = [];

let currentBackpackTab = "all";

/* 💰 讀取玩家錢包 */

async function loadBackpackWallet() {

  const {
    data: { session },
    error: sessionError
  } = await caibiSupabase.auth.getSession();

  if (sessionError || !session) {
    console.error(
      "🎒 背包：找不到登入狀態",
      sessionError
    );
    return;
  }


  const {
    data: wallet,
    error: walletError
  } =
    await caibiSupabase
      .from("player_wallet")
      .select("gold_beans, diamonds")
      .eq("user_id", session.user.id)
      .single();


  if (walletError || !wallet) {

    console.error(
      "🎒 背包：讀取錢包失敗",
      walletError
    );

    backpackGoldBeans.textContent = "—";
    backpackDiamonds.textContent = "—";

    return;
  }


  backpackGoldBeans.textContent =
    wallet.gold_beans ?? 0;

  backpackDiamonds.textContent =
    wallet.diamonds ?? 0;
}

/* =========================
   🎒 讀取一般背包物品
========================= */

async function loadBackpackInventory() {

  const {
    data: { session },
    error: sessionError
  } = await caibiSupabase.auth.getSession();

  if (sessionError || !session) {
    console.error(
      "🎒 背包：找不到登入狀態",
      sessionError
    );
    return;
  }


  const {
    data,
    error
  } =
    await caibiSupabase
      .from("player_inventory")
      .select(`
        quantity,
        game_items (
          id,
          item_key,
          name,
          category
        )
      `)
      .eq("user_id", session.user.id)
      .gt("quantity", 0);


  if (error) {

    console.error(
      "🎒 背包：讀取物品失敗",
      error
    );

    backpackInventory = [];

    renderBackpackItems();

    return;
  }


  backpackInventory =
    data || [];

  renderBackpackItems();
}

/* =========================
   👗 讀取玩家衣服
========================= */

async function loadBackpackClothing() {

  const {
    data: { session }
  } = await caibiSupabase.auth.getSession();

  if (!session) return;


  const {
    data,
    error
  } = await caibiSupabase
    .from("player_clothing")
    .select(`
      quantity,
      clothing_items (
        id,
        name,
        category,
        image_path
      )
    `)
    .eq("user_id", session.user.id)
    .gt("quantity", 0);


  if (error) {
    console.error(
      "🎒 背包：讀取衣服失敗",
      error
    );

    backpackClothing = [];
    return;
  }


  backpackClothing = data || [];
}


/* =========================
   🪑 讀取玩家家具
========================= */

async function loadBackpackFurniture() {

  const {
    data: { session }
  } = await caibiSupabase.auth.getSession();

  if (!session) return;


  const {
    data,
    error
  } = await caibiSupabase
    .from("player_furniture")
    .select(`
      quantity,
      furniture_items (
        id,
        name,
        category,
        image_front
      )
    `)
    .eq("user_id", session.user.id)
    .gt("quantity", 0);


  if (error) {
    console.error(
      "🎒 背包：讀取家具失敗",
      error
    );

    backpackFurniture = [];
    return;
  }


  backpackFurniture = data || [];
}

/* =========================
   🖼️ 顯示背包物品
========================= */

function renderBackpackItems() {

  backpackItems.innerHTML = "";

  const displayItems = [];


  /* 📦 一般物品 */

  for (const row of backpackInventory) {

    const item = row.game_items;

    if (!item) continue;

    displayItems.push({
      type: item.category,
      key: item.item_key,
      name: item.name,
      quantity: row.quantity,
      imagePath: null
    });
  }


  /* 👗 衣服 */

  for (const row of backpackClothing) {

    const item = row.clothing_items;

    if (!item) continue;

    displayItems.push({
      type: "clothing",
      key: null,
      name: item.name,
      quantity: row.quantity,
      imagePath: item.image_path
    });
  }


  /* 🪑 家具 */

  for (const row of backpackFurniture) {

    const item = row.furniture_items;

    if (!item) continue;

    displayItems.push({
      type: "furniture",
      key: null,
      name: item.name,
      quantity: row.quantity,
      imagePath: item.image_front
    });
  }


  /* 🗂️ 分類 */

  const visibleItems =
    displayItems.filter((item) => {

      if (currentBackpackTab === "all") {
        return true;
      }

      return (
        item.type === currentBackpackTab
      );

    });


  if (visibleItems.length === 0) {

    backpackItems.innerHTML = `
      <div class="backpack-empty">
        這裡目前沒有東西～
      </div>
    `;

    return;
  }


  const itemIcons = {

    wheat: "🌾",
    milk: "🥛",
    egg: "🥚",
    flour: "🥣",
    butter: "🧈",
    cake: "🎂",

    food_waste: "🗑️",
    fertilizer: "🌱",

    wheat_seed: "🌱"

  };


  for (const item of visibleItems) {

    const itemElement =
      document.createElement("div");

    itemElement.className =
      "backpack-item";


    let visual = "📦";


    /* 👗🪑 有圖片就讀 Storage 圖片 */

    if (item.imagePath) {

      const { data } =
        caibiSupabase.storage
          .from("avatars")
          .getPublicUrl(item.imagePath);

      visual = `
        <img
          src="${data.publicUrl}"
          alt="${item.name}"
          class="backpack-item-image"
        >
      `;

    } else {

      visual =
        itemIcons[item.key] || "📦";

    }


    itemElement.innerHTML = `
      <div class="backpack-item-icon">
        ${visual}
      </div>

      <div class="backpack-item-name">
        ${item.name}
      </div>

      <div class="backpack-item-quantity">
        × ${item.quantity}
      </div>
    `;


    backpackItems.appendChild(
      itemElement
    );
  }
}


/* =========================
   🗂️ 背包分類
========================= */

for (const tab of backpackTabs) {

  tab.addEventListener(
    "click",
    () => {

      currentBackpackTab =
        tab.dataset.backpackTab;


      for (const otherTab of backpackTabs) {

        otherTab.classList.toggle(
          "is-active",
          otherTab === tab
        );

      }


      renderBackpackItems();

    }
  );

}

/* 🎒 打開背包 */

backpackButton.addEventListener(
  "click",
  async () => {

    gamePhone.classList.add(
      "backpack-open"
    );

    backpackPage.hidden = false;

    await Promise.all([
  loadBackpackWallet(),
  loadBackpackInventory(),
  loadBackpackClothing(),
  loadBackpackFurniture()
]);

renderBackpackItems();

  }
);


/* ← 返回手機首頁 */

backpackBackButton.addEventListener(
  "click",
  () => {

    backpackPage.hidden = true;

    gamePhone.classList.remove(
      "backpack-open"
    );

  }
);

/* =========================
   🛒 菜比手機－商店
========================= */

const shopButton =
  document.querySelector(
    '[data-phone-app="shop"]'
  );

const shopPage =
  document.getElementById("shopPage");

const shopBackButton =
  document.getElementById("shopBackButton");

const shopGoldBeans =
  document.getElementById("shopGoldBeans");


/* 🫘 讀取商店金豆 */

async function loadShopWallet() {

  const {
    data: { session },
    error: sessionError
  } = await caibiSupabase.auth.getSession();


  if (sessionError || !session) {

    console.error(
      "🛒 商店：找不到登入狀態",
      sessionError
    );

    shopGoldBeans.textContent = "—";

    return;
  }


  const {
    data: wallet,
    error: walletError
  } =
    await caibiSupabase
      .from("player_wallet")
      .select("gold_beans")
      .eq("user_id", session.user.id)
      .single();


  if (walletError || !wallet) {

    console.error(
      "🛒 商店：讀取金豆失敗",
      walletError
    );

    shopGoldBeans.textContent = "—";

    return;
  }


  shopGoldBeans.textContent =
    wallet.gold_beans ?? 0;
}


/* 🛒 打開商店 */

shopButton.addEventListener(
  "click",
  async () => {

    gamePhone.classList.add(
      "shop-open"
    );

    shopPage.hidden = false;

    await loadShopWallet();

  }
);


/* ← 返回手機首頁 */

shopBackButton.addEventListener(
  "click",
  () => {

    shopPage.hidden = true;

    gamePhone.classList.remove(
      "shop-open"
    );

  }
);

/* =========================
   🛒 商店－購買商品
========================= */

const shopBuyButtons =
  document.querySelectorAll(
    "[data-buy-item]"
  );


for (const button of shopBuyButtons) {

  button.addEventListener(
    "click",
    async () => {

      /* 目前小麥種子在 shop_items 的 ID = 1 */
      const shopItemId = 1;


      /* 防止連續狂點 */
      button.disabled = true;

      const originalText =
        button.textContent;

      button.textContent =
        "購買中…";


      const {
        data,
        error
      } =
        await caibiSupabase.rpc(
          "buy_shop_item",
          {
            p_shop_item_id: shopItemId
          }
        );


      if (error) {

        console.error(
          "🛒 購買失敗：",
          error
        );

        alert(
          "購買失敗，請稍後再試。"
        );

        button.disabled = false;
        button.textContent = originalText;

        return;
      }


      console.log(
        "🛒 購買成功：",
        data
      );


      /* 🫘 重新讀取最新金豆 */
      await loadShopWallet();


      /* 🎒 同步背包資料 */
      await loadBackpackInventory();


      alert(
        "🌱 小麥種子購買成功！"
      );


      button.disabled = false;
      button.textContent = originalText;

    }
  );

}

/* =========================
   🎁 菜比手機－每日簽到
========================= */

const dailyButton =
  document.querySelector(
    '[data-phone-app="daily"]'
  );

const dailyPage =
  document.getElementById("dailyPage");

const dailyBackButton =
  document.getElementById("dailyBackButton");

const dailyCurrentDay =
  document.getElementById("dailyCurrentDay");

const dailyClaimButton =
  document.getElementById("dailyClaimButton");

const dailyRewardCards =
  document.querySelectorAll(
    "[data-daily-day]"
  );


/* =========================
   ✨ 更新每日獎勵卡狀態
========================= */

function renderDailyRewardCards(
  currentDay,
  claimedToday
) {

  for (const card of dailyRewardCards) {

    const cardDay =
      Number(card.dataset.dailyDay);

    card.classList.remove(
      "is-current",
      "is-claimed"
    );

    if (cardDay === currentDay) {

      card.classList.add(
        claimedToday
          ? "is-claimed"
          : "is-current"
      );

    }

  }

}


/* =========================
   📅 讀取每日簽到狀態
========================= */

async function loadDailyCheckin() {

  const {
    data: { session },
    error: sessionError
  } = await caibiSupabase.auth.getSession();


  if (sessionError || !session) {

    console.error(
      "🎁 每日簽到：找不到登入狀態",
      sessionError
    );

    return;
  }


  const {
    data,
    error
  } =
    await caibiSupabase
      .from("player_daily_checkin")
      .select("streak_day, last_claim_date")
      .eq("user_id", session.user.id)
      .maybeSingle();


  if (error) {

    console.error(
      "🎁 每日簽到：讀取失敗",
      error
    );

    return;
  }


  /* 第一次簽到，還沒有紀錄 */

  if (!data) {

    dailyCurrentDay.textContent = "1";

    renderDailyRewardCards(
      1,
      false
    );

    dailyClaimButton.disabled = false;

    dailyClaimButton.textContent =
      "🎁 今日簽到";

    return;
  }


  /* 🇹🇼 取得台灣今天日期 */

  const today =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Taipei",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }
    ).format(new Date());


  /* 今天已經領過 */

  if (data.last_claim_date === today) {

    dailyCurrentDay.textContent =
      data.streak_day;

    renderDailyRewardCards(
      data.streak_day,
      true
    );

    dailyClaimButton.disabled = true;

    dailyClaimButton.textContent =
      "✅ 今日已簽到";

    return;
  }


  /* 尚未領取今天獎勵 */

/* 🇹🇼 算出台灣的昨天日期 */

const yesterdayDate =
  new Date();

yesterdayDate.setDate(
  yesterdayDate.getDate() - 1
);

const yesterday =
  new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).format(yesterdayDate);


/* 🔥 昨天有簽 → 延續；斷簽 → Day 1 */

let nextDailyDay = 1;

if (data.last_claim_date === yesterday) {

  nextDailyDay =
    data.streak_day >= 7
      ? 1
      : data.streak_day + 1;

}


dailyCurrentDay.textContent =
  nextDailyDay;

renderDailyRewardCards(
  nextDailyDay,
  false
);

  dailyClaimButton.disabled = false;

  dailyClaimButton.textContent =
    "🎁 今日簽到";
}


/* =========================
   🎁 領取每日簽到獎勵
========================= */

dailyClaimButton.addEventListener(
  "click",
  async () => {

    /* 防止連續狂點 */

    dailyClaimButton.disabled = true;

    dailyClaimButton.textContent =
      "領取中…";


    const {
      data,
      error
    } =
      await caibiSupabase.rpc(
        "claim_daily_reward"
      );


    /* ❌ 領取失敗 */

    if (error) {

      console.error(
        "🎁 每日簽到失敗：",
        error
      );


      /* 今天已經領過 */

      if (
        error.message?.includes(
          "ALREADY_CLAIMED_TODAY"
        )
      ) {

        await loadDailyCheckin();

        alert(
          "🎁 今天已經簽到過囉！"
        );

        return;
      }


      dailyClaimButton.disabled = false;

      dailyClaimButton.textContent =
        "🎁 今日簽到";

      alert(
        "簽到失敗，請稍後再試。"
      );

      return;
    }


    console.log(
      "🎁 每日簽到成功：",
      data
    );


    /* 🎁 顯示本次獎勵 */

    let rewardText = "";

    if (data.gold_beans > 0) {

      rewardText =
        `🫘 金豆 ×${data.gold_beans}`;

    } else if (data.diamonds > 0) {

      rewardText =
        `💎 鑽石 ×${data.diamonds}`;

    } else if (data.fertilizer > 0) {

      rewardText =
        `🌱 肥料 ×${data.fertilizer}`;

    }


    /* 🔄 同步簽到、錢包、背包 */

    await Promise.all([
      loadDailyCheckin(),
      loadBackpackWallet(),
      loadBackpackInventory()
    ]);


    alert(
      `🎁 Day ${data.day} 簽到成功！\n${rewardText}`
    );

  }
);

/* 🎁 打開每日簽到 */

dailyButton.addEventListener(
  "click",
  async () => {

    gamePhone.classList.add(
      "daily-open"
    );

    dailyPage.hidden = false;

     await loadDailyCheckin();
  }
);


/* ← 返回手機首頁 */

dailyBackButton.addEventListener(
  "click",
  () => {

    dailyPage.hidden = true;

    gamePhone.classList.remove(
      "daily-open"
    );

  }
);

/* =========================
   📬 菜比手機－信箱
========================= */

const mailButton =
  document.querySelector(
    '[data-phone-app="mail"]'
  );

const mailPage =
  document.getElementById(
    "mailPage"
  );

const mailBackButton =
  document.getElementById(
    "mailBackButton"
  );

const mailList =
  document.getElementById(
    "mailList"
  );

const mailDetail =
  document.getElementById(
    "mailDetail"
  );

let playerMails = [];
let selectedMailId = null;


/* =========================
   📅 格式化信件日期
========================= */

function formatMailDate(dateString) {

  return new Date(
    dateString
  ).toLocaleDateString(
    "zh-TW",
    {
      timeZone: "Asia/Taipei"
    }
  );

}


/* =========================
   🎁 取得附件文字
========================= */

function getMailAttachmentText(mail) {

  if (
    mail.attachment_type === "currency" &&
    mail.attachment_key === "diamonds"
  ) {
    return `💎 鑽石 ×${mail.attachment_quantity}`;
  }

  if (
    mail.attachment_type === "currency" &&
    mail.attachment_key === "gold_beans"
  ) {
    return `🫘 金豆 ×${mail.attachment_quantity}`;
  }

  return "";
}


/* =========================
   📮 顯示左側信件列表
========================= */

function renderMailList() {

  mailList.innerHTML = "";

  if (playerMails.length === 0) {

    mailList.innerHTML = `
      <div class="mail-empty">
        📭
        <strong>目前沒有信件</strong>
        <small>有新消息時會出現在這裡。</small>
      </div>
    `;

    return;
  }


  for (const mail of playerMails) {

    const mailElement =
      document.createElement("button");

    mailElement.type = "button";

    mailElement.className =
  mail.is_read
    ? "mail-item is-read"
    : "mail-item";

    if (mail.id === selectedMailId) {
      mailElement.classList.add(
        "is-selected"
      );
    }


    mailElement.innerHTML = `
      <div class="mail-item-title">
        ${mail.is_read ? "✉️" : "🔴"}
        <span>${mail.title}</span>
      </div>

      <div class="mail-item-sender">
        ${mail.sender_name}
      </div>

      <div class="mail-item-date">
        ${formatMailDate(mail.created_at)}
      </div>
    `;


    mailElement.addEventListener(
  "click",
  async () => {

    selectedMailId = mail.id;


    /* 📖 第一次打開 → 標記已讀 */

    if (!mail.is_read) {

      const {
        error
      } =
        await caibiSupabase.rpc(
          "mark_mail_read",
          {
            p_mail_id: mail.id
          }
        );


      if (error) {

        console.error(
          "📬 信件標記已讀失敗：",
          error
        );

      } else {

        mail.is_read = true;

      }

    }


    renderMailList();
    renderMailDetail(mail);

  }
);


    mailList.appendChild(
      mailElement
    );

  }

}


/* =========================
   ✉️ 顯示右側信件內容
========================= */

function renderMailDetail(mail) {

  if (!mail) {

    mailDetail.innerHTML = `
      <div class="mail-detail-empty">
        ✉️
        <strong>選擇一封信件</strong>
        <small>點擊左側信件即可查看內容。</small>
      </div>
    `;

    return;
  }


  /* =========================
     ⏰ 信件期限
  ========================= */

  const now =
    new Date();

  const expiresAt =
    mail.expires_at
      ? new Date(mail.expires_at)
      : null;

  const isExpired =
    expiresAt &&
    now > expiresAt;


  let expirationHtml = "";

  if (expiresAt) {

    const expirationText =
      expiresAt.toLocaleString(
        "zh-TW",
        {
          timeZone: "Asia/Taipei",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        }
      );


    expirationHtml =
      isExpired
        ? `
          <span class="mail-expired">
            ⌛ 已過期
          </span>
        `
        : `
          <span class="mail-expiration">
            ⏰ 有效期限：${expirationText}
          </span>
        `;

  }


  /* =========================
     🎁 附件
  ========================= */

  const attachmentText =
    getMailAttachmentText(mail);


  let claimButtonText =
    "🎁 領取附件";

  let claimButtonDisabled =
    false;


  if (mail.is_claimed) {

    claimButtonText =
      "✅ 已領取";

    claimButtonDisabled =
      true;

  } else if (isExpired) {

    claimButtonText =
      "⌛ 已過期";

    claimButtonDisabled =
      true;

  }


  const attachmentHtml =
    attachmentText
      ? `
        <div class="mail-detail-attachment">

          <strong>🎁 附件</strong>

          <div class="mail-attachment-reward">
            ${attachmentText}
          </div>

          <button
            type="button"
            class="mail-claim-button"
            ${claimButtonDisabled
              ? "disabled"
              : ""}
          >
            ${claimButtonText}
          </button>

        </div>
      `
      : "";


  /* =========================
     ✉️ 信件內容
  ========================= */

  mailDetail.innerHTML = `

    <div class="mail-detail-title">
      ${mail.title}
    </div>

    <div class="mail-detail-meta">

      <span>
        寄件者：${mail.sender_name}
      </span>

      <span>
        ${formatMailDate(mail.created_at)}
      </span>

      ${expirationHtml}

    </div>

    <div class="mail-detail-content">
      ${mail.content}
    </div>

    ${attachmentHtml}

  `;


  /* =========================
     🎁 領取信件附件
  ========================= */

  const claimButton =
    mailDetail.querySelector(
      ".mail-claim-button"
    );


  /*
    沒附件、已領取、已過期
    都不綁定領取事件
  */

  if (
    !claimButton ||
    mail.is_claimed ||
    isExpired
  ) {
    return;
  }


  claimButton.addEventListener(
    "click",
    async () => {

      /* 防止連點 */

      claimButton.disabled = true;

      claimButton.textContent =
        "領取中…";


      const {
        data,
        error
      } =
        await caibiSupabase.rpc(
          "claim_mail_attachment",
          {
            p_mail_id: mail.id
          }
        );


      /* ❌ 領取失敗 */

      if (error) {

        console.error(
          "📬 信件附件領取失敗：",
          error
        );


        if (
          error.message?.includes(
            "MAIL_ALREADY_CLAIMED"
          )
        ) {

          await loadPlayerMail();

          alert(
            "📬 這份附件已經領取過囉！"
          );

          return;
        }


        if (
          error.message?.includes(
            "MAIL_EXPIRED"
          )
        ) {

          await loadPlayerMail();

          alert(
            "📬 這封信的附件已經過期了。"
          );

          return;
        }


        claimButton.disabled = false;

        claimButton.textContent =
          "🎁 領取附件";

        alert(
          "附件領取失敗，請稍後再試。"
        );

        return;
      }


      console.log(
        "📬 信件附件領取成功：",
        data
      );


      /* 本地標記已領取 */

      mail.is_claimed = true;


      /* 🔄 同步錢包＋背包 */

      await Promise.all([
        loadBackpackWallet(),
        loadBackpackInventory(),
        loadBackpackClothing(),
        loadBackpackFurniture()
      ]);


      /* 🔄 更新信件畫面 */

      renderMailList();
      renderMailDetail(mail);


      alert(
        `🎁 附件領取成功！\n${attachmentText}`
      );

    }
  );

}


/* =========================
   📮 讀取玩家信件
========================= */

async function loadPlayerMail() {

  mailList.innerHTML = `
    <div class="mail-empty">
      📬
      <strong>信件讀取中…</strong>
    </div>
  `;

  renderMailDetail(null);


  const {
    data: { session },
    error: sessionError
  } =
    await caibiSupabase.auth.getSession();


  if (sessionError || !session) {

    console.error(
      "📬 信箱：找不到登入狀態",
      sessionError
    );

    mailList.innerHTML = `
      <div class="mail-empty">
        ⚠️
        <strong>無法讀取信箱</strong>
      </div>
    `;

    return;
  }


  const {
    data: mails,
    error: mailError
  } =
    await caibiSupabase
      .from("player_mail")
      .select(`
        id,
        title,
        content,
        sender_name,
        is_read,
        is_claimed,
        attachment_type,
        attachment_key,
        attachment_quantity,
        expires_at,
        created_at
      `)
      .eq(
        "user_id",
        session.user.id
      )
      .order(
        "created_at",
        { ascending: false }
      );


  if (mailError) {

    console.error(
      "📬 信箱：讀取信件失敗",
      mailError
    );

    mailList.innerHTML = `
      <div class="mail-empty">
        ⚠️
        <strong>信件讀取失敗</strong>
        <small>請稍後再試。</small>
      </div>
    `;

    return;
  }


  playerMails =
    mails || [];

  selectedMailId = null;

  renderMailList();
  renderMailDetail(null);

}


/* =========================
   📬 打開信箱
========================= */

mailButton.addEventListener(
  "click",
  async () => {

    gamePhone.classList.add(
      "mail-open"
    );

    mailPage.hidden = false;

    await loadPlayerMail();

  }
);


/* =========================
   ← 返回手機首頁
========================= */

mailBackButton.addEventListener(
  "click",
  () => {

    mailPage.hidden = true;

    gamePhone.classList.remove(
      "mail-open"
    );

    selectedMailId = null;

  }
);

/* =========================
   🎟️ 菜比手機－兌換碼
========================= */

const redeemButton =
  document.querySelector(
    '[data-phone-app="redeem"]'
  );

const redeemPage =
  document.getElementById(
    "redeemPage"
  );

const redeemBackButton =
  document.getElementById(
    "redeemBackButton"
  );

const redeemCodeInput =
  document.getElementById(
    "redeemCodeInput"
  );

const redeemSubmitButton =
  document.getElementById(
    "redeemSubmitButton"
  );

const redeemMessage =
  document.getElementById(
    "redeemMessage"
  );


/* =========================
   🎟️ 打開兌換碼
========================= */

redeemButton.addEventListener(
  "click",
  () => {

    gamePhone.classList.add(
      "redeem-open"
    );

    redeemPage.hidden = false;

    redeemCodeInput.value = "";

    redeemMessage.textContent = "";

    redeemCodeInput.focus();

  }
);


/* =========================
   ← 返回手機首頁
========================= */

redeemBackButton.addEventListener(
  "click",
  () => {

    redeemPage.hidden = true;

    gamePhone.classList.remove(
      "redeem-open"
    );

    redeemCodeInput.value = "";

    redeemMessage.textContent = "";

  }
);


/* =========================
   🎁 送出兌換碼
========================= */

async function submitRedeemCode() {

  const code =
    redeemCodeInput.value.trim();

  if (!code) {

    redeemMessage.textContent =
      "請先輸入兌換碼。";

    return;
  }


  /* 防止連續狂點 */

  redeemSubmitButton.disabled = true;

  redeemSubmitButton.textContent =
    "兌換中…";

  redeemMessage.textContent = "";


  const {
    data,
    error
  } =
    await caibiSupabase.rpc(
      "redeem_code",
      {
        p_code: code
      }
    );


  /* ❌ 兌換失敗 */

  if (error) {

    console.error(
      "🎟️ 兌換碼失敗：",
      error
    );


    if (
      error.message?.includes(
        "已經兌換過"
      )
    ) {

      redeemMessage.textContent =
        "🎟️ 這組兌換碼已經領取過囉！";

    } else if (
      error.message?.includes(
        "已達兌換上限"
      )
    ) {

      redeemMessage.textContent =
        "😢 這組兌換碼已經被領完了。";

    } else if (
      error.message?.includes(
        "無效或已過期"
      )
    ) {

      redeemMessage.textContent =
        "❌ 兌換碼不存在或已經過期。";

    } else {

      redeemMessage.textContent =
        "❌ 兌換失敗，請稍後再試。";

    }


    redeemSubmitButton.disabled = false;

    redeemSubmitButton.textContent =
      "🎟️ 立即兌換";

    return;
  }


  /* =========================
     ✅ 兌換成功
  ========================= */

  console.log(
    "🎟️ 兌換成功：",
    data
  );


  const rewards = [];

  if (data.diamonds > 0) {

    rewards.push(
      `💎 鑽石 ×${data.diamonds}`
    );

  }

  if (data.gold_beans > 0) {

    rewards.push(
      `🫘 金豆 ×${data.gold_beans}`
    );

  }


  redeemMessage.textContent =
    `🎉 ${data.name}兌換成功！`;


  /* 🔄 同步玩家錢包 */

  await loadBackpackWallet();


  alert(
    `🎉 ${data.name}兌換成功！\n\n${rewards.join("\n")}`
  );


  redeemCodeInput.value = "";

  redeemSubmitButton.disabled = false;

  redeemSubmitButton.textContent =
    "🎟️ 立即兌換";

}


/* 🎟️ 點擊兌換 */

redeemSubmitButton.addEventListener(
  "click",
  submitRedeemCode
);


/* ⌨️ 輸入框按 Enter 也能兌換 */

redeemCodeInput.addEventListener(
  "keydown",
  (event) => {

    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();

    submitRedeemCode();

  }
);

/* =========================
   🎰 前往全畫面抽獎
========================= */

const gachaButton =
  document.querySelector(
    '[data-phone-app="gacha"]'
  );

gachaButton.addEventListener(
  "click",
  () => {

    window.location.href =
      "../assets/images/gacha/index.html";

  }
);

/* =========================
   🚀 啟動 1F
========================= */

checkHouseAccess();

/* =========================
   🎮 玩家移動
   鍵盤 + 點擊 / 觸控
========================= */

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