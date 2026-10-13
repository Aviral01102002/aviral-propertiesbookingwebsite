const cards = [...document.querySelectorAll(".property-card")];
const typeFilter = document.getElementById("typeFilter");
const budgetFilter = document.getElementById("budgetFilter");
const locationFilter = document.getElementById("locationFilter");

const noResults = document.getElementById("noResults");
const toast = document.getElementById("toast");
const savedList = document.getElementById("savedList");

const savedIds = new Set();

let activeChip = "all";
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function applyFilters() {
  let visible = 0;

  cards.forEach((card) => {
    const price = Number(card.dataset.price);

    const typeOK =
      (typeFilter.value === "all" ||
        card.dataset.type === typeFilter.value) &&
      (activeChip === "all" ||
        card.dataset.type === activeChip);

    let budgetOK = true;

    if (budgetFilter.value === "50") {
      budgetOK = price < 50;
    }

    if (budgetFilter.value === "100") {
      budgetOK = price >= 50 && price <= 100;
    }

    if (budgetFilter.value === "200") {
      budgetOK = price > 100 && price <= 200;
    }

    if (budgetFilter.value === "201") {
      budgetOK = price > 200;
    }

    const locationOK =
      locationFilter.value === "all" ||
      card.dataset.location === locationFilter.value;

    const shouldShow = typeOK && budgetOK && locationOK;

    card.classList.toggle("d-none", !shouldShow);

    if (shouldShow) {
      visible++;
    }
  });

  noResults.classList.toggle("d-none", visible > 0);

  document.getElementById("resultsCount").textContent =
    `${visible} ${visible === 1 ? "property" : "properties"}`;
}

function updateSaved() {
  document.getElementById("savedMetric").textContent =
    savedIds.size;

  document.getElementById("savedCount").textContent =
    `${savedIds.size} saved`;

  savedList.innerHTML = "";

  if (savedIds.size === 0) {
    savedList.innerHTML = `
      <div class="saved-empty">
        Your saved properties will appear here.
        Tap a heart on any property card to add one.
      </div>
    `;
    return;
  }

  savedIds.forEach((id) => {
    const card = cards.find(
      (item) => item.dataset.id === id
    );

    if (!card) return;

    const title = card.querySelector("h3").textContent;

    const price = card
      .querySelector(".price")
      .childNodes[0].textContent.trim();

    const imageURL = getComputedStyle(
      card.querySelector(".property-photo")
    ).backgroundImage.slice(5, -2);

    const item = document.createElement("div");
    item.className = "saved-item";

    const image = document.createElement("img");
    image.src = imageURL;
    image.alt = title;

    const details = document.createElement("div");

    const heading = document.createElement("strong");
    heading.textContent = title;

    const priceText = document.createElement("small");
    priceText.textContent = price;

    details.append(heading, priceText);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";

    removeButton.addEventListener("click", () => {
      toggleSaved(card);
    });

    item.append(image, details, removeButton);
    savedList.append(item);
  });
}

function toggleSaved(card) {
  const id = card.dataset.id;
  const button = card.querySelector(".favorite");

  if (savedIds.has(id)) {
    savedIds.delete(id);

    button.setAttribute("aria-pressed", "false");
    button.textContent = "♡";

    showToast("Property removed from saved list.");
  } else {
    savedIds.add(id);

    button.setAttribute("aria-pressed", "true");
    button.textContent = "♥";

    showToast("Property added to saved list.");
  }

  updateSaved();
}

document.getElementById("searchBtn").addEventListener("click", () => {
  applyFilters();

  document.getElementById("properties").scrollIntoView({
    behavior: "smooth"
  });
});

[typeFilter, budgetFilter, locationFilter].forEach((control) => {
  control.addEventListener("change", applyFilters);
});

document.querySelectorAll("[data-chip]").forEach((button) => {
  button.addEventListener("click", () => {
    activeChip = button.dataset.chip;

    typeFilter.value = activeChip;

    document.querySelectorAll("[data-chip]").forEach((chip) => {
      chip.classList.toggle("active", chip === button);
    });

    applyFilters();
  });
});

document.querySelectorAll(".favorite").forEach((button) => {
  button.addEventListener("click", () => {
    toggleSaved(button.closest(".property-card"));
  });
});

document.querySelectorAll(".enquiry-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById("message").value =
      `I am interested in ${button.dataset.property}. Please share more details.`;

    document.getElementById("contact").scrollIntoView({
      behavior: "smooth"
    });

    document.getElementById("name").focus({
      preventScroll: true
    });
  });
});

document.getElementById("clearFilters").addEventListener("click", () => {
  typeFilter.value = "all";
  budgetFilter.value = "all";
  locationFilter.value = "all";

  activeChip = "all";

  document.querySelectorAll("[data-chip]").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.chip === "all");
  });

  applyFilters();
});

document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("open");
});

document.querySelectorAll(".side-link[data-page]").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".side-link[data-page]").forEach((item) => {
      item.classList.toggle("active", item === link);
    });

    document.getElementById("currentPage").textContent =
      link.dataset.page;

    document.getElementById("sidebar").classList.remove("open");
  });
});

document.getElementById("helpBtn").addEventListener("click", () => {
  document.getElementById("contact").scrollIntoView({
    behavior: "smooth"
  });

  showToast("Fill the enquiry form to contact the property team.");
});

document.getElementById("notificationBtn").addEventListener("click", () => {
  showToast("You are all caught up. No new notifications.");
});

document.getElementById("contactForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const form = event.currentTarget;

  if (!form.reportValidity()) {
    return;
  }

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const interest = document.getElementById("interest").value;

  const message =
    document.getElementById("message").value.trim() ||
    "No additional details";

  const subject = encodeURIComponent(
    `Aviral Propertys enquiry from ${name}`
  );

  const body = encodeURIComponent(
    `Name: ${name}\nPhone: ${phone}\nInterest: ${interest}\nMessage: ${message}`
  );

  document.getElementById("formStatus").textContent =
    "Opening your email app. Update the demo email address in script.js before publishing.";

  window.location.href =
    `mailto:hello@aviralpropertys.example?subject=${subject}&body=${body}`;
});

document.getElementById("todayLabel").textContent =
  new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short"
  }).format(new Date());

document.getElementById("year").textContent =
  new Date().getFullYear();

document.getElementById("totalMetric").textContent = cards.length;
document.getElementById("sidebarCount").textContent = cards.length;
applyFilters();
updateSaved();
