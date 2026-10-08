const gachaScene =
      document.getElementById(
        "gachaScene"
      );

    const poolButtons =
      document.querySelectorAll(
        "[data-pool]"
      );

    const comingSoonMessage =
      document.getElementById(
        "comingSoonMessage"
      );

    const singleDrawButton =
      document.getElementById(
        "singleDrawButton"
      );

    const multiDrawButton =
      document.getElementById(
        "multiDrawButton"
      );

/* =========================
   🎰 菜比抽卡動畫
========================= */

const gachaAnimationModal =
  document.getElementById(
    "gachaAnimationModal"
  );

const skipGachaAnimationButton =
  document.getElementById(
    "skipGachaAnimationButton"
  );

const gachaIntroScene =
  document.getElementById(
    "gachaIntroScene"
  );

const gachaWardrobe =
  document.querySelector(".gacha-wardrobe");
  
const gachaMascot =
  document.getElementById(
    "gachaMascot"
  );

const gachaClothingBurst =
  document.getElementById(
    "gachaClothingBurst"
  );

const gachaRevealScene =
  document.getElementById(
    "gachaRevealScene"
  );

const gachaRewardImageArea =
  document.getElementById(
    "gachaRewardImageArea"
  );

const gachaRewardName =
  document.getElementById(
    "gachaRewardName"
  );

const gachaRewardAmount =
  document.getElementById(
    "gachaRewardAmount"
  );

const gachaSummaryScene =
  document.getElementById(
    "gachaSummaryScene"
  );

const gachaSummaryGrid =
  document.getElementById(
    "gachaSummaryGrid"
  );

const closeGachaSummaryButton =
  document.getElementById(
    "closeGachaSummaryButton"
  );


/* 🥦🍪 正式角色素材 */

const GACHA_MASCOTS = [
  {
    name: "小菜雞",
    src: "../chick.png"
  },
  {
    name: "小比乾",
    src: "../kitten.png"
  }
];


/* 抽卡動畫狀態 */

let gachaSkipRequested = false;
let gachaRevealAdvance = null;


function waitGachaAnimation(ms) {

  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );
}

function openGachaAnimation() {

  gachaSkipRequested = false;

  /* 重置三個場景 */

  gachaAnimationModal.hidden = false;

  gachaIntroScene.hidden = false;
  gachaRevealScene.hidden = true;
  gachaSummaryScene.hidden = true;

  gachaClothingBurst.innerHTML = "";
  gachaRewardImageArea.innerHTML = "";
  gachaRewardName.textContent = "";
  gachaRewardAmount.textContent = "";
  gachaSummaryGrid.innerHTML = "";


  /* 🥦🍪 每次隨機抓一隻來犯罪 */

  const mascot =
    GACHA_MASCOTS[
      Math.floor(
        Math.random()
        * GACHA_MASCOTS.length
      )
    ];

  gachaMascot.src =
    mascot.src;

  gachaMascot.alt =
    mascot.name;

  gachaMascot.dataset.mascot =
    mascot.name;
}

async function playGachaIntroAnimation() {

  /* 先讓角色進場 */

  gachaMascot.classList.remove(
    "is-messing",
    "is-finished"
  );

  gachaWardrobe.classList.remove(
  "is-shaking",
  "is-finished"
);

  gachaClothingBurst.innerHTML = "";

  await waitGachaAnimation(500);

  if (gachaSkipRequested) {
    return;
  }


  /* 🥦🍪 開始搞衣櫃 */

  gachaMascot.classList.add(
    "is-messing"
  );

  await waitGachaAnimation(700);

  if (gachaSkipRequested) {
    return;
  }


  /* 🚪 衣櫃開始震 */

  gachaWardrobe.classList.add(
  "is-shaking"
);

  await waitGachaAnimation(650);

  if (gachaSkipRequested) {
    return;
  }


  /* 👗 刷——！衣服炸出來 */

  const burstItems = [
    "👗",
    "👚",
    "👕",
    "👖",
    "👒",
    "👟",
    "🎀"
  ];

  gachaClothingBurst.innerHTML =
  burstItems.map((item, index) => {
    const angle =
      (Math.PI * 2 * index) / burstItems.length;

    const distance = 130 + Math.random() * 110;

    const flyX = Math.cos(angle) * distance;
    const flyY = Math.sin(angle) * distance;

    return `
      <span
        class="gacha-burst-item is-bursting"
        style="
          --fly-x: ${flyX}px;
          --fly-y: ${flyY}px;
          --fly-rotate: ${Math.random() * 180 - 90}deg;
        "
      >${item}</span>
    `;
  }).join("");

await waitGachaAnimation(900);

gachaWardrobe.classList.remove(
  "is-shaking"
);

gachaWardrobe.classList.add(
  "is-finished"
);
}

/* =========================
   🎁 抽卡結果處理
========================= */

function getGachaCurrencyVisual(result) {

  if (result.currency_type === "gold_beans") {
    return {
      icon: "🫘",
      name: "金豆",
      amount: `×${result.currency_amount}`
    };
  }

  if (result.currency_type === "diamonds") {
    return {
      icon: "💎",
      name: "鑽石",
      amount: `×${result.currency_amount}`
    };
  }

  return {
    icon: "🎁",
    name: "未知獎勵",
    amount: ""
  };
}


async function prepareGachaResults(results) {

  const clothingIds =
    [
      ...new Set(
        results
          .filter(
            (result) =>
              result.reward_type === "clothing"
              && result.clothing_item_id
          )
          .map(
            (result) =>
              Number(result.clothing_item_id)
          )
      )
    ];


  let clothingMap =
    new Map();


  if (clothingIds.length > 0) {

    const {
      data: clothingItems,
      error
    } =
      await caibiSupabase
        .from("clothing_items")
        .select(
          "id, name, image_path"
        )
        .in(
          "id",
          clothingIds
        );


    if (error) {

      console.error(
        "🎰 讀取抽中服裝圖片失敗：",
        error
      );

    } else {

      clothingMap =
        new Map(
          (clothingItems ?? [])
            .map(
              (item) => [
                Number(item.id),
                item
              ]
            )
        );
    }
  }


  const preparedResults = results.map(
  (result) => {

    if (result.reward_type === "clothing") {

      const clothing = clothingMap.get(
        Number(result.clothing_item_id)
      );

      let imageUrl = "";

      if (clothing?.image_path) {
        const { data } = caibiSupabase
          .storage
          .from("avatars")
          .getPublicUrl(clothing.image_path);

        imageUrl = data?.publicUrl ?? "";
      }

      return {
        ...result,
        displayName:
          clothing?.name
          ?? result.reward_name
          ?? "未知服飾",
        displayAmount: "",
        imageUrl,
        icon: "👗"
      };
    }

    const currency = getGachaCurrencyVisual(result);

    return {
      ...result,
      displayName: currency.name,
      displayAmount: currency.amount,
      imageUrl: "",
      icon: currency.icon
    };
  }
);

/* 👗 預先產生抽卡展示縮圖 */

await Promise.all(
  preparedResults.map(async (result) => {

    if (result.imageUrl) {
      result.imageUrl =
        await getGachaClothingThumbnail(
          result.imageUrl
        );
    }

  })
);

return preparedResults;
}

/* =========================
   👗 抽卡服裝縮圖
   只裁切展示圖片，不修改原始素材
========================= */

const gachaThumbnailCache = new Map();

function getGachaClothingThumbnail(url) {
  if (gachaThumbnailCache.has(url)) {
    return gachaThumbnailCache.get(url);
  }

  const task = new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        const ctx = canvas.getContext("2d", {
          willReadFrequently: true
        });

        if (!ctx) {
          resolve(url);
          return;
        }

        ctx.drawImage(image, 0, 0);

        const pixels = ctx.getImageData(
          0, 0, canvas.width, canvas.height
        ).data;

        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = -1;
        let maxY = -1;

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const alpha = pixels[
              (y * canvas.width + x) * 4 + 3
            ];

            if (alpha > 8) {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }

        if (maxX < minX || maxY < minY) {
          resolve(url);
          return;
        }

        const padding = 24;

        const sx = Math.max(0, minX - padding);
        const sy = Math.max(0, minY - padding);

        const sw = Math.min(
          canvas.width - sx,
          maxX - sx + padding + 1
        );

        const sh = Math.min(
          canvas.height - sy,
          maxY - sy + padding + 1
        );

        const thumbnail = document.createElement("canvas");
        thumbnail.width = sw;
        thumbnail.height = sh;

        thumbnail.getContext("2d").drawImage(
          canvas,
          sx, sy, sw, sh,
          0, 0, sw, sh
        );

        resolve(thumbnail.toDataURL("image/png"));

      } catch (error) {
        console.warn("服裝縮圖處理失敗：", error);
        resolve(url);
      }
    };

    image.onerror = () => resolve(url);
    image.src = url;
  });

  gachaThumbnailCache.set(url, task);
  return task;
}

function renderGachaRewardImage(
  result,
  container
) {

  container.innerHTML = "";


  if (result.imageUrl) {

    const image =
      document.createElement("img");

    image.src =
      result.imageUrl;

    image.alt =
      result.displayName;

    container.appendChild(
      image
    );

    return;
  }


  const icon =
    document.createElement("div");

  icon.textContent =
    result.icon;

  icon.style.fontSize =
    "72px";

  icon.setAttribute(
    "aria-hidden",
    "true"
  );

  container.appendChild(
    icon
  );
}


function waitForGachaAdvance() {

  return new Promise(
    (resolve) => {

      gachaRevealAdvance =
        () => {

          gachaRevealAdvance =
            null;

          resolve();
        };
    }
  );
}


async function revealGachaResults(
  results
) {

  gachaIntroScene.hidden =
    true;

  gachaRevealScene.hidden =
    false;

  gachaSummaryScene.hidden =
    true;


  for (
    let index = 0;
    index < results.length;
    index += 1
  ) {

    if (gachaSkipRequested) {
      break;
    }


    const result =
      results[index];


    renderGachaRewardImage(
      result,
      gachaRewardImageArea
    );

    gachaRewardName.textContent =
      result.displayName;

    gachaRewardAmount.textContent =
      result.displayAmount;


    await waitForGachaAdvance();
  }
}


function showGachaSummary(
  results
) {

  gachaIntroScene.hidden =
    true;

  gachaRevealScene.hidden =
    true;

  gachaSummaryScene.hidden =
    false;


  gachaSummaryGrid.innerHTML =
    results
      .map(
        (result) => {

          const visual =
            result.imageUrl
              ? `
                  <img
                    src="${result.imageUrl}"
                    alt=""
                  >
                `
              : `
                  <div
                    style="font-size:42px"
                    aria-hidden="true"
                  >
                    ${result.icon}
                  </div>
                `;


          return `
            <div class="gacha-summary-item">

              <div
                class="gacha-summary-item-image"
              >
                ${visual}
              </div>

              <div
                class="gacha-summary-item-name"
              >
                ${escapeHistoryHtml(
                  result.displayName
                )}
              </div>

              <div
                class="gacha-summary-item-amount"
              >
                ${escapeHistoryHtml(
                  result.displayAmount
                )}
              </div>

            </div>
          `;
        }
      )
      .join("");
}


function closeGachaAnimation() {

  gachaAnimationModal.hidden =
    true;

  gachaIntroScene.hidden =
    false;

  gachaRevealScene.hidden =
    true;

  gachaSummaryScene.hidden =
    true;

  gachaSkipRequested =
    false;

  gachaRevealAdvance =
    null;

  gachaClothingBurst
    .classList
    .remove(
      "is-bursting"
    );
}


/* 點畫面 → 下一張 */

gachaRevealScene.addEventListener(
  "click",
  () => {

    if (gachaRevealAdvance) {
      gachaRevealAdvance();
    }
  }
);


/* SKIP → 直接跳總覽 */

skipGachaAnimationButton
  .addEventListener(
    "click",
    (event) => {

      event.stopPropagation();

      gachaSkipRequested =
        true;

      if (gachaRevealAdvance) {
        gachaRevealAdvance();
      }
    }
  );


/* 收下獎勵 */

closeGachaSummaryButton
  .addEventListener(
    "click",
    () => {

      closeGachaAnimation();
    }
  );

/* =========================
   💎 玩家鑽石
========================= */

const diamondAmount =
  document.getElementById(
    "diamondAmount"
  );


async function loadGachaWallet() {

  const {
    data: { session },
    error: sessionError
  } =
    await caibiSupabase.auth.getSession();


  if (sessionError || !session) {

    console.error(
      "🎰 抽獎：找不到登入狀態",
      sessionError
    );

    diamondAmount.textContent = "—";

    return;
  }


  const {
    data: wallet,
    error: walletError
  } =
    await caibiSupabase
      .from("player_wallet")
      .select("diamonds")
      .eq(
        "user_id",
        session.user.id
      )
      .single();


  if (walletError || !wallet) {

    console.error(
      "🎰 抽獎：讀取鑽石失敗",
      walletError
    );

    diamondAmount.textContent = "—";

    return;
  }


  diamondAmount.textContent =
    wallet.diamonds ?? 0;
}


loadGachaWallet();

/* =========================
   🎰 抽獎結果文字
========================= */

function getGachaResultText(result) {

  if (result.reward_type === "clothing") {
    return `👗 ${result.reward_name}`;
  }

  if (result.currency_type === "gold_beans") {
    return `🫘 金豆 ×${result.currency_amount}`;
  }

  if (result.currency_type === "diamonds") {
    return `💎 鑽石 ×${result.currency_amount}`;
  }

  return "未知獎勵";
}


/* =========================
   🎰 執行抽獎
========================= */

async function runGacha(drawCount) {

  const isMulti =
    drawCount === 11;

  const activeButton =
    isMulti
      ? multiDrawButton
      : singleDrawButton;

  const originalText =
    activeButton.textContent;

  singleDrawButton.disabled = true;
  multiDrawButton.disabled = true;

  activeButton.textContent =
    "抽獎中…";

    /* 🎬 開始菜比抽卡動畫 */

  openGachaAnimation();

  const {
    data,
    error
  } =
    await caibiSupabase.rpc(
      "draw_gacha",
      {
        p_pool_id: 1,
        p_draw_count: drawCount
      }
    );

  if (error) {

    console.error(
      "🎰 抽獎失敗：",
      error
    );

    if (
      error.message?.includes(
        "NOT_ENOUGH_DIAMONDS"
      )
    ) {
      alert("💎 鑽石不足！");
    } else {
      alert(
        `抽獎失敗：${error.message}`
      );
    }

    activeButton.textContent =
      originalText;

    singleDrawButton.disabled = false;
    multiDrawButton.disabled = false;

    return;
  }


  console.log(
    "🎰 抽獎結果：",
    data
  );

  await loadGachaWallet();


      const results =
    data.results ?? [];

  console.log(
    "🎰 等待播放抽卡動畫：",
    results
  );


  const preparedResults =
    await prepareGachaResults(
      results
    );


  await playGachaIntroAnimation();


  if (!gachaSkipRequested) {

    await revealGachaResults(
      preparedResults
    );
  }


  showGachaSummary(
    preparedResults
  );

  activeButton.textContent =
    originalText;

  singleDrawButton.disabled = false;
  multiDrawButton.disabled = false;
}


/* =========================
   🎰 單抽
========================= */

singleDrawButton.addEventListener(
  "click",
  () => {
    runGacha(1);
  }
);


/* =========================
   🎰 10+1抽
========================= */

multiDrawButton.addEventListener(
  "click",
  () => {
    runGacha(11);
  }
);

/* =========================
   📜 抽獎紀錄
========================= */

const drawHistoryButton =
  document.getElementById(
    "drawHistoryButton"
  );

const drawHistoryModal =
  document.getElementById(
    "drawHistoryModal"
  );

const closeHistoryButton =
  document.getElementById(
    "closeHistoryButton"
  );

const drawHistoryList =
  document.getElementById(
    "drawHistoryList"
  );


function escapeHistoryHtml(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function formatHistoryTime(value) {

  const date =
    new Date(value);

  return date.toLocaleString(
    "zh-TW",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }
  );
}


function getHistoryRewardText(result) {

  if (
    result.reward_type === "clothing"
  ) {

    return `👗 ${
      escapeHistoryHtml(
        result.clothing_items?.name
        ?? "未知服飾"
      )
    }`;
  }

  if (
    result.currency_type ===
    "gold_beans"
  ) {

    return `🫘 金豆 ×${
      result.currency_amount
    }`;
  }

  if (
    result.currency_type ===
    "diamonds"
  ) {

    return `💎 鑽石 ×${
      result.currency_amount
    }`;
  }

  return "未知獎勵";
}


async function loadDrawHistory() {

  drawHistoryList.innerHTML =
    `
      <div class="history-loading">
        讀取中…
      </div>
    `;


  const {
    data: { session },
    error: sessionError
  } =
    await caibiSupabase.auth.getSession();


  if (
    sessionError
    || !session
  ) {

    console.error(
      "🎰 抽獎紀錄：找不到登入狀態",
      sessionError
    );

    drawHistoryList.innerHTML =
      `
        <div class="history-empty">
          找不到登入狀態
        </div>
      `;

    return;
  }


  const {
    data: draws,
    error
  } =
    await caibiSupabase
      .from("gacha_draws")
      .select(`
        id,
        created_at,
        draw_count,
        diamonds_spent,
        gacha_draw_results (
          draw_index,
          reward_type,
          clothing_item_id,
          currency_type,
          currency_amount,
          clothing_items (
            name
          )
        )
      `)
      .eq(
        "user_id",
        session.user.id
      )
      .order(
        "created_at",
        {
          ascending: false
        }
      );


  if (error) {

    console.error(
      "🎰 讀取抽獎紀錄失敗：",
      error
    );

    drawHistoryList.innerHTML =
      `
        <div class="history-empty">
          抽獎紀錄讀取失敗
        </div>
      `;

    return;
  }


  if (
    !draws
    || draws.length === 0
  ) {

    drawHistoryList.innerHTML =
      `
        <div class="history-empty">
          還沒有抽獎紀錄 🎰
        </div>
      `;

    return;
  }


  drawHistoryList.innerHTML =
    draws
      .map(
        (draw) => {

          const results =
            [
              ...(
                draw.gacha_draw_results
                ?? []
              )
            ]
            .sort(
              (a, b) =>
                a.draw_index
                - b.draw_index
            );


          const resultHtml =
            results
              .map(
                (result) =>
                  `
                    <div>
                      ${result.draw_index}.
                      ${getHistoryRewardText(result)}
                    </div>
                  `
              )
              .join("");


          const drawLabel =
            draw.draw_count === 11
              ? "10+1抽"
              : "1抽";


          return `
            <div class="history-card">

              <div
                class="history-card-summary"
              >

                <span
                  class="history-card-time"
                >
                  ${formatHistoryTime(
                    draw.created_at
                  )}
                </span>

                <span>
                  ${drawLabel}
                </span>

                <span
                  class="history-card-cost"
                >
                  💎${draw.diamonds_spent}
                </span>

              </div>

              <div class="history-results">
                ${resultHtml}
              </div>

            </div>
          `;
        }
      )
      .join("");
}


drawHistoryButton.addEventListener(
  "click",
  async () => {

    drawHistoryModal.hidden = false;

    await loadDrawHistory();
  }
);


closeHistoryButton.addEventListener(
  "click",
  () => {

    drawHistoryModal.hidden = true;
  }
);


drawHistoryModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      drawHistoryModal
    ) {

      drawHistoryModal.hidden = true;
    }
  }
);

/* =========================
   📋 卡池內容
========================= */

const poolContentsButton =
  document.getElementById(
    "poolContentsButton"
  );

const poolContentsModal =
  document.getElementById(
    "poolContentsModal"
  );

const closePoolContentsButton =
  document.getElementById(
    "closePoolContentsButton"
  );

const poolContentsList =
  document.getElementById(
    "poolContentsList"
  );


function formatPoolRate(value) {

  const number =
    Number(value ?? 0);

  return `${number.toFixed(5)
    .replace(/0+$/, "")
    .replace(/\.$/, "")}%`;
}


async function loadPoolContents() {

  poolContentsList.innerHTML =
    `
      <div class="pool-contents-loading">
        讀取卡池內容中…
      </div>
    `;


  const [
    ratesResponse,
    itemsResponse,
    rewardsResponse
  ] =
    await Promise.all([

      caibiSupabase
        .from("gacha_pool_rates")
        .select(
          "clothing_rate, gold_bean_rate, diamond_rate"
        )
        .eq("pool_id", 1)
        .single(),

      caibiSupabase
        .from("gacha_pool_items")
        .select(`
          clothing_item_id,
          clothing_items (
            name
          )
        `)
        .eq("pool_id", 1)
        .eq("is_active", true),

      caibiSupabase
        .from("gacha_currency_rewards")
        .select(
          "currency_type, amount, rate"
        )
        .eq("pool_id", 1)
        .eq("is_active", true)

    ]);


  const error =
    ratesResponse.error
    || itemsResponse.error
    || rewardsResponse.error;


  if (error) {

    console.error(
      "🎰 讀取卡池內容失敗：",
      error
    );

    poolContentsList.innerHTML =
      `
        <div class="pool-contents-empty">
          卡池內容讀取失敗
        </div>
      `;

    return;
  }


  const rates =
    ratesResponse.data;

  const clothes =
    itemsResponse.data ?? [];

  const rewards =
    rewardsResponse.data ?? [];


  const clothingItemRate =
    clothes.length > 0
      ? Number(rates.clothing_rate)
        / clothes.length
      : 0;


  const clothingHtml =
    clothes
      .map(
        (item) =>
          `
            <div class="pool-content-item">

              <span class="pool-content-item-name">
                👗 ${escapeHistoryHtml(
                  item.clothing_items?.name
                  ?? "未知服飾"
                )}
              </span>

              <span class="pool-content-item-rate">
                ${formatPoolRate(
                  clothingItemRate
                )}
              </span>

            </div>
          `
      )
      .join("");


  const goldBeanRewards =
    rewards
      .filter(
        (reward) =>
          reward.currency_type
          === "gold_beans"
      )
      .sort(
        (a, b) =>
          Number(a.amount)
          - Number(b.amount)
      );


  const diamondRewards =
    rewards
      .filter(
        (reward) =>
          reward.currency_type
          === "diamonds"
      )
      .sort(
        (a, b) =>
          Number(a.amount)
          - Number(b.amount)
      );


  const goldBeanHtml =
    goldBeanRewards
      .map(
        (reward) =>
          `
            <div class="pool-content-item">

              <span class="pool-content-item-name">
                🫘 金豆 ×${reward.amount}
              </span>

              <span class="pool-content-item-rate">
                ${formatPoolRate(reward.rate)}
              </span>

            </div>
          `
      )
      .join("");


  const diamondHtml =
    diamondRewards
      .map(
        (reward) =>
          `
            <div class="pool-content-item">

              <span class="pool-content-item-name">
                💎 鑽石 ×${reward.amount}
              </span>

              <span class="pool-content-item-rate">
                ${formatPoolRate(reward.rate)}
              </span>

            </div>
          `
      )
      .join("");


  poolContentsList.innerHTML =
    `
      <div class="pool-rate-summary">

        <div class="pool-rate-box">
          👗 服裝<br>
          ${formatPoolRate(
            rates.clothing_rate
          )}
        </div>

        <div class="pool-rate-box">
          🫘 金豆<br>
          ${formatPoolRate(
            rates.gold_bean_rate
          )}
        </div>

        <div class="pool-rate-box">
          💎 鑽石<br>
          ${formatPoolRate(
            rates.diamond_rate
          )}
        </div>

      </div>


      <section class="pool-content-section">

        <h3 class="pool-content-title">
          👗 服裝
          （共 ${clothes.length} 件）
        </h3>

        <div class="pool-content-grid">
          ${clothingHtml}
        </div>

      </section>


      <section class="pool-content-section">

        <h3 class="pool-content-title">
          🫘 金豆
        </h3>

        <div class="pool-content-grid">
          ${goldBeanHtml}
        </div>

      </section>


      <section class="pool-content-section">

        <h3 class="pool-content-title">
          💎 鑽石
        </h3>

        <div class="pool-content-grid">
          ${diamondHtml}
        </div>

      </section>
    `;
}


poolContentsButton.addEventListener(
  "click",
  async () => {

    poolContentsModal.hidden = false;

    await loadPoolContents();
  }
);


closePoolContentsButton.addEventListener(
  "click",
  () => {

    poolContentsModal.hidden = true;
  }
);


poolContentsModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      poolContentsModal
    ) {

      poolContentsModal.hidden = true;
    }
  }
);

/* =========================
   ♻️ 服裝回收
========================= */

const recycleButton =
  document.getElementById(
    "recycleButton"
  );

const recycleModal =
  document.getElementById(
    "recycleModal"
  );

const closeRecycleButton =
  document.getElementById(
    "closeRecycleButton"
  );

const recycleList =
  document.getElementById(
    "recycleList"
  );


async function loadRecycleClothing() {

  recycleList.innerHTML =
    `
      <div class="recycle-loading">
        讀取衣櫃中…
      </div>
    `;


  const {
    data: { session },
    error: sessionError
  } =
    await caibiSupabase.auth.getSession();


  if (
    sessionError
    || !session
  ) {

    console.error(
      "♻️ 回收：找不到登入狀態",
      sessionError
    );

    recycleList.innerHTML =
      `
        <div class="recycle-empty">
          找不到登入狀態
        </div>
      `;

    return;
  }


  const {
    data: clothes,
    error
  } =
    await caibiSupabase
      .from("player_clothing")
      .select(`
        clothing_item_id,
        quantity,
        clothing_items (
          name,
          rarity
        )
      `)
      .eq(
        "user_id",
        session.user.id
      )
      .gt(
        "quantity",
        0
      );


  if (error) {

    console.error(
      "♻️ 讀取可回收服裝失敗：",
      error
    );

    recycleList.innerHTML =
      `
        <div class="recycle-empty">
          衣櫃讀取失敗
        </div>
      `;

    return;
  }


  const recyclableClothes =
    (clothes ?? [])
      .filter(
        (item) =>
          item.clothing_items?.rarity
          !== "starter"
      )
      .sort(
        (a, b) =>
          Number(a.clothing_item_id)
          - Number(b.clothing_item_id)
      );


  if (recyclableClothes.length === 0) {

    recycleList.innerHTML =
      `
        <div class="recycle-empty">
          目前沒有可回收的服裝 ♻️
        </div>
      `;

    return;
  }


  recycleList.innerHTML =
    recyclableClothes
      .map(
        (item) => {

          const clothingId =
            Number(
              item.clothing_item_id
            );

          const quantity =
            Number(
              item.quantity ?? 0
            );

          const name =
            escapeHistoryHtml(
              item.clothing_items?.name
              ?? "未知服裝"
            );


          return `
            <div
              class="recycle-item"
              data-clothing-id="${clothingId}"
              data-owned="${quantity}"
            >

              <div class="recycle-item-info">

                <div class="recycle-item-name">
                  👗 ${name}
                </div>

                <div class="recycle-item-owned">
                  持有 ×${quantity}
                </div>

              </div>


              <div class="recycle-item-actions">

                <button
                  class="recycle-quantity-button"
                  type="button"
                  data-action="minus"
                >
                  −
                </button>

                <span
                  class="recycle-quantity"
                  data-quantity
                >
                  1
                </span>

                <button
                  class="recycle-quantity-button"
                  type="button"
                  data-action="plus"
                >
                  ＋
                </button>

                <span
                  class="recycle-reward"
                  data-reward
                >
                  💎1
                </span>

                <button
                  class="recycle-confirm-button"
                  type="button"
                  data-action="confirm"
                >
                  回收
                </button>

              </div>

            </div>
          `;
        }
      )
      .join("");
}

/* =========================
   ✨ 回收成功動畫
========================= */

function waitRecycleAnimation(ms) {
  return new Promise(
    (resolve) => setTimeout(resolve, ms)
  );
}


async function playRecycleAnimation(
  item,
  diamondsEarned
) {

  /* 衣服卡片縮小消失 */

  item.classList.add(
    "is-recycling"
  );

  await waitRecycleAnimation(350);


  /* 中央成功提示 */

  const effect =
    document.createElement("div");

  effect.className =
    "recycle-success-effect";

  effect.innerHTML =
    `
      <div class="recycle-success-icon">
        ♻️
      </div>

      <div class="recycle-success-text">
        回收成功
      </div>

      <div class="recycle-success-diamond">
        💎 +${diamondsEarned}
      </div>
    `;

  recycleModal.appendChild(effect);


  await waitRecycleAnimation(550);


  /* 飛向右上角的鑽石 */

  const flyingDiamond =
    document.createElement("div");

  flyingDiamond.className =
    "recycle-flying-diamond";

  flyingDiamond.textContent =
    `💎 +${diamondsEarned}`;

  document.body.appendChild(
    flyingDiamond
  );


  const effectRect =
    effect.getBoundingClientRect();

  const walletRect =
    diamondAmount
      .closest(".diamond-wallet")
      .getBoundingClientRect();


  flyingDiamond.style.left =
    `${
      effectRect.left
      + effectRect.width / 2
    }px`;

  flyingDiamond.style.top =
    `${
      effectRect.top
      + effectRect.height / 2
    }px`;


  requestAnimationFrame(
    () => {

      flyingDiamond.style.left =
        `${
          walletRect.left
          + walletRect.width / 2
        }px`;

      flyingDiamond.style.top =
        `${
          walletRect.top
          + walletRect.height / 2
        }px`;

      flyingDiamond.classList.add(
        "is-flying"
      );
    }
  );


  await waitRecycleAnimation(700);


  diamondAmount
    .closest(".diamond-wallet")
    .classList.add(
      "is-receiving-diamond"
    );


  await waitRecycleAnimation(250);


  diamondAmount
    .closest(".diamond-wallet")
    .classList.remove(
      "is-receiving-diamond"
    );


  effect.remove();
  flyingDiamond.remove();
}

recycleList.addEventListener(
  "click",
  async (event) => {

    const actionButton =
      event.target.closest(
        "[data-action]"
      );

    if (!actionButton) {
      return;
    }


    const item =
      actionButton.closest(
        ".recycle-item"
      );

    if (!item) {
      return;
    }


    const clothingId =
      Number(
        item.dataset.clothingId
      );

    const owned =
      Number(
        item.dataset.owned
      );

    const quantityElement =
      item.querySelector(
        "[data-quantity]"
      );

    const rewardElement =
      item.querySelector(
        "[data-reward]"
      );

    let quantity =
      Number(
        quantityElement.textContent
      );


    const action =
      actionButton.dataset.action;


    /* − 數量 */

    if (action === "minus") {

      quantity =
        Math.max(
          1,
          quantity - 1
        );

      quantityElement.textContent =
        quantity;

      rewardElement.textContent =
        `💎${quantity}`;

      return;
    }


    /* ＋ 數量 */

    if (action === "plus") {

      quantity =
        Math.min(
          owned,
          quantity + 1
        );

      quantityElement.textContent =
        quantity;

      rewardElement.textContent =
        `💎${quantity}`;

      return;
    }


    /* 確認回收 */

    if (action === "confirm") {

      const clothingName =
        item
          .querySelector(
            ".recycle-item-name"
          )
          ?.textContent
          ?.replace("👗", "")
          .trim()
          ?? "這件服裝";


      const confirmed =
        window.confirm(
          `確定要回收「${clothingName}」×${quantity} 嗎？\n\n可獲得 💎${quantity}`
        );


      if (!confirmed) {
        return;
      }


      const buttons =
        item.querySelectorAll(
          "button"
        );

      buttons.forEach(
        (button) => {
          button.disabled = true;
        }
      );


      const {
        data,
        error
      } =
        await caibiSupabase.rpc(
          "recycle_clothing",
          {
            p_clothing_item_id:
              clothingId,

            p_quantity:
              quantity
          }
        );


      if (error) {

        console.error(
          "♻️ 回收失敗：",
          error
        );

        alert(
          `回收失敗：${error.message}`
        );

        buttons.forEach(
          (button) => {
            button.disabled = false;
          }
        );

        return;
      }


      console.log(
        "♻️ 回收成功：",
        data
      );


            /* 播放回收動畫 */

      await playRecycleAnimation(
        item,
        data.diamonds_earned
      );


      /* 更新右上角鑽石 */

      await loadGachaWallet();


      /* 重新讀取回收清單 */

      await loadRecycleClothing();
    }
  }
);


recycleButton.addEventListener(
  "click",
  async () => {

    recycleModal.hidden = false;

    await loadRecycleClothing();
  }
);


closeRecycleButton.addEventListener(
  "click",
  () => {

    recycleModal.hidden = true;
  }
);


recycleModal.addEventListener(
  "click",
  (event) => {

    if (
      event.target ===
      recycleModal
    ) {

      recycleModal.hidden = true;
    }
  }
);

    /* =========================
       ← 返回 1F
    ========================= */

    document
      .getElementById("backButton")
      .addEventListener(
        "click",
        () => {

          window.location.href =
  "../../../house/index.html";

        }
      );


    /* =========================
       🎰 切換卡池
    ========================= */

    for (const button of poolButtons) {

      button.addEventListener(
        "click",
        () => {

          const pool =
            button.dataset.pool;

          const isEvent =
            pool.endsWith("-event");


          /* 選中狀態 */

          for (
            const otherButton
            of poolButtons
          ) {

            otherButton.classList.toggle(
              "is-active",
              otherButton === button
            );

          }


          /* 👗 一般衣服 */

          if (
            pool ===
            "clothing-normal"
          ) {

            gachaScene.style.backgroundImage =
              'url("clothing-normal.webp")';

          }


          /* 🪑 一般家具 */

          if (
            pool ===
            "furniture-normal"
          ) {

            gachaScene.style.backgroundImage =
              'url("furniture-normal.webp")';

          }


          /* 活動池目前沿用同類背景 */

          if (
            pool ===
            "clothing-event"
          ) {

            gachaScene.style.backgroundImage =
              'url("clothing-normal.webp")';

          }

          if (
            pool ===
            "furniture-event"
          ) {

            gachaScene.style.backgroundImage =
              'url("furniture-normal.webp")';

          }


          /* 敬請期待 */

          comingSoonMessage.hidden =
            !isEvent;

          singleDrawButton.disabled =
            isEvent;

          multiDrawButton.disabled =
            isEvent;

        }
      );

    }