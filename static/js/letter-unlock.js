(() => {
  const form = document.getElementById("letter-unlock-form");
  if (!form) return;

  const lockBox = document.getElementById("letter-lock-box");
  const lockIcon = document.getElementById("lock-icon");
  const input = document.getElementById("secret-answer");
  const errorEl = document.getElementById("unlock-error");
  const revealSlot = document.getElementById("letter-reveal-slot");

  function triggerShake(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;

    lockIcon.classList.remove("is-shaking");
    void lockIcon.offsetWidth;
    lockIcon.classList.add("is-shaking");

    input.select();
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const answer = input.value.trim();
    if (!answer) return;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ answer }),
      });

      const contentType = response.headers.get("content-type") || "";
      const result = contentType.includes("application/json")
        ? await response.json()
        : { unlocked: false, error: "Thế thì chịu." };

      if (response.ok && result.unlocked) {
        errorEl.hidden = true;
        lockIcon.classList.remove("is-shaking");
        lockIcon.classList.add("is-unlocked");

        setTimeout(() => {
          lockBox.classList.add("is-fading-out");

          setTimeout(() => {
            lockBox.remove();
            revealSlot.hidden = false;
          }, 420);
        }, 650);
      } else {
        triggerShake(result.error || "Thế thì chịu.");
      }
    } catch (err) {
      triggerShake("Có lỗi kết nối, thử lại nhé.");
    }
  });
})();
