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