// =========================================================
// 1. COUNT-UP ANIMATION FOR THE STATS (2000+, 19+, 3)
// Beginner note: we grab every element with class "stat-number",
// read its target value from the "data-target" attribute,
// then increase a counter from 0 to that number over time.
// =========================================================

function animateCounter(el) {
  const target = parseInt(el.getAttribute("data-target"), 10);
  const suffix = el.getAttribute("data-suffix") || "";
  const duration = 1500; // total animation time in milliseconds
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1); // 0 -> 1

    // easeOutQuad makes the count start fast and settle smoothly
    const eased = 1 - (1 - progress) * (1 - progress);
    const currentValue = Math.floor(eased * target);

    el.textContent = currentValue + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target + suffix; // make sure it lands exactly on target
    }
  }

  requestAnimationFrame(update);
}

// Run the counters once the page has loaded
window.addEventListener("load", () => {
  const counters = document.querySelectorAll(".stat-number");
  counters.forEach((counter) => {
    // small delay so it starts after the stats bar has faded in
    setTimeout(() => animateCounter(counter), 800);
  });
});

// =========================================================
// 1b. STICKY NAVBAR SHADOW
// Adds a shadow to the navbar once the page is scrolled down,
// so it visually separates from the content below it.
// =========================================================

const navbar = document.querySelector(".navbar");

if (navbar) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 10) {
      navbar.classList.add("navbar-scrolled");
    } else {
      navbar.classList.remove("navbar-scrolled");
    }
  });
}

// =========================================================
// 2. MOBILE HAMBURGER MENU
// Toggles a simple "open" class you can style further,
// and switches the nav links to a visible column.
// =========================================================

const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector(".nav-links");

if (hamburger && navLinks) {
  hamburger.addEventListener("click", () => {
    navLinks.classList.toggle("nav-links-open");
    hamburger.classList.toggle("hamburger-active");
  });
}
// =========================================================
// NETWORKING SECTION — ANIMATED NODE BACKGROUND
// Draws small moving dots on a canvas and connects nearby
// dots with faint lines, giving a "network" visual feel.
// =========================================================

const networkCanvas = document.getElementById("networkCanvas");

if (networkCanvas) {
  const ctx = networkCanvas.getContext("2d");
  let nodes = [];

  function resizeCanvas() {
    const rect = networkCanvas.parentElement.getBoundingClientRect();
    networkCanvas.width = rect.width;
    networkCanvas.height = rect.height;
  }

  function createNodes() {
    const count = Math.floor((networkCanvas.width * networkCanvas.height) / 22000);
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * networkCanvas.width,
      y: Math.random() * networkCanvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));
  }

  function drawFrame() {
    ctx.clearRect(0, 0, networkCanvas.width, networkCanvas.height);

    // move + draw each node
    nodes.forEach((node) => {
      node.x += node.vx;
      node.y += node.vy;

      // bounce off the edges
      if (node.x < 0 || node.x > networkCanvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > networkCanvas.height) node.vy *= -1;

      ctx.beginPath();
      ctx.arc(node.x, node.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(232, 134, 46, 0.6)";
      ctx.fill();
    });

    // connect nearby nodes with a faint line
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(232, 134, 46, ${1 - dist / 130})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(drawFrame);
  }

  resizeCanvas();
  createNodes();
  drawFrame();

  window.addEventListener("resize", () => {
    resizeCanvas();
    createNodes();
  });
}

// Reveal-on-scroll for this section (skip this block if you already
// added the same "reveal" observer for an earlier section)
const revealElementsV2 = document.querySelectorAll(".reveal:not(.reveal-visible)");
if (typeof IntersectionObserver !== "undefined" && !window.__revealObserverAdded) {
  window.__revealObserverAdded = true;
  const revealObserverV2 = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-visible");
          revealObserverV2.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserverV2.observe(el));
}

// =========================================================
// OUR SERVICES — CLICK TO SWITCH ACTIVE SERVICE
// Clicking a service button highlights it and updates the
// caption text shown under the video.
// =========================================================

const ourservItems = document.querySelectorAll(".ourserv-item");
const ourservDesc = document.getElementById("ourservDesc");

ourservItems.forEach((item) => {
  item.addEventListener("click", () => {
    ourservItems.forEach((i) => i.classList.remove("active"));
    item.classList.add("active");
    if (ourservDesc) {
      ourservDesc.textContent = item.getAttribute("data-desc");
    }
  });
});


// =========================================================
// ENQUIRY FORM — VALIDATION + SUBMISSION
// Validates every field before allowing submit, blocks obvious
// bot spam using a honeypot field, then sends the data to
// Formspree so it lands directly in your email inbox.
// =========================================================

const enquiryForm = document.getElementById("enquiryForm");

if (enquiryForm) {
  const fields = {
    name: document.getElementById("enqName"),
    phone: document.getElementById("enqPhone"),
    email: document.getElementById("enqEmail"),
    service: document.getElementById("enqService"),
    message: document.getElementById("enqMessage"),
  };

  const errors = {
    name: document.getElementById("errName"),
    phone: document.getElementById("errPhone"),
    email: document.getElementById("errEmail"),
    service: document.getElementById("errService"),
    message: document.getElementById("errMessage"),
  };

  const submitBtn = document.getElementById("enquirySubmitBtn");
  const statusEl = document.getElementById("enquiryStatus");

  // --- Individual field validators ---
  function validateName() {
    const value = fields.name.value.trim();
    if (value.length < 2) return "Please enter your full name.";
    if (!/^[a-zA-Z\s.'-]+$/.test(value)) return "Name can only contain letters.";
    return "";
  }

  function validatePhone() {
    const value = fields.phone.value.trim();
    // Accepts 10-digit Indian mobile numbers, optionally with +91
    if (!/^(?:\+91)?[6-9]\d{9}$/.test(value.replace(/\s/g, ""))) {
      return "Enter a valid 10-digit mobile number.";
    }
    return "";
  }

  function validateEmail() {
    const value = fields.email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Enter a valid email address.";
    }
    return "";
  }

  function validateService() {
    return fields.service.value ? "" : "Please select a service.";
  }

  function validateMessage() {
    const value = fields.message.value.trim();
    if (value.length < 10) return "Please add a few more details (min 10 characters).";
    return "";
  }

  const validators = {
    name: validateName,
    phone: validatePhone,
    email: validateEmail,
    service: validateService,
    message: validateMessage,
  };

  // Show/hide the error state for one field
  function runFieldValidation(key) {
    const message = validators[key]();
    const wrapper = fields[key].closest(".enquiry-field");
    if (message) {
      wrapper.classList.add("invalid");
      errors[key].textContent = message;
    } else {
      wrapper.classList.remove("invalid");
      errors[key].textContent = "";
    }
    return message === "";
  }

  // Re-validate a field as soon as the user leaves it, so they get
  // feedback early instead of only on submit
  Object.keys(fields).forEach((key) => {
    fields[key].addEventListener("blur", () => runFieldValidation(key));
  });

  enquiryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Validate every field; only proceed if all pass
    const results = Object.keys(fields).map((key) => runFieldValidation(key));
    const allValid = results.every(Boolean);

    if (!allValid) {
      statusEl.textContent = "Please fix the highlighted fields.";
      statusEl.className = "enquiry-status error";
      return;
    }

    // Honeypot check: if this hidden field has any value, a bot
    // filled it in — silently pretend success and stop here
    const honeypot = enquiryForm.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value) {
      statusEl.textContent = "Thank you! Your enquiry has been sent.";
      statusEl.className = "enquiry-status success";
      enquiryForm.reset();
      return;
    }

    // Show loading state on the button
    submitBtn.classList.add("loading");
    submitBtn.disabled = true;
    statusEl.textContent = "";
    statusEl.className = "enquiry-status";

    try {
      const response = await fetch(enquiryForm.action, {
        method: "POST",
        body: new FormData(enquiryForm),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        statusEl.textContent = "Thank you! Your enquiry has been sent — we'll be in touch soon.";
        statusEl.className = "enquiry-status success";
        enquiryForm.reset();
      } else {
        throw new Error("Submission failed");
      }
    } catch (err) {
      statusEl.textContent = "Something went wrong. Please try again or call us directly.";
      statusEl.className = "enquiry-status error";
    } finally {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
    }
  });
}

// =========================================================
// CONTACT POPUP MODAL
// Opens when the navbar "CONTACT US" button is clicked.
// Closes on the X button, clicking the dark background, or
// pressing Escape. Includes the same validation + Formspree
// submission pattern as the main enquiry form.
// =========================================================

const cmodalOverlay = document.getElementById("cmodalOverlay");
const cmodalClose = document.getElementById("cmodalClose");
const openContactModalBtn = document.getElementById("openContactModal");

function openContactModal(e) {
  if (e) e.preventDefault(); // stop the button from jumping to #contact
  cmodalOverlay.classList.add("cmodal-open");
  document.body.style.overflow = "hidden";
}

function closeContactModal() {
  cmodalOverlay.classList.remove("cmodal-open");
  document.body.style.overflow = "";
}

if (openContactModalBtn) {
  openContactModalBtn.addEventListener("click", openContactModal);
}

if (cmodalClose) {
  cmodalClose.addEventListener("click", closeContactModal);
}

// Close when clicking the dark background, but not when clicking
// inside the white box itself
if (cmodalOverlay) {
  cmodalOverlay.addEventListener("click", (e) => {
    if (e.target === cmodalOverlay) closeContactModal();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeContactModal();
});

// --- Form validation + submission ---
const cmodalForm = document.getElementById("cmodalForm");

if (cmodalForm) {
  const cSubmitBtn = document.getElementById("cmodalSubmitBtn");
  const cStatusEl = document.getElementById("cmodalStatus");

  const cValidators = {
    firstName: (v) => (v.trim().length < 2 ? "Enter your first name." : ""),
    lastName: (v) => (v.trim().length < 1 ? "Enter your last name." : ""),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Enter a valid email."),
    phone: (v) => (/^(?:\+91)?[6-9]\d{9}$/.test(v.replace(/\s/g, "")) ? "" : "Enter a valid 10-digit number."),
    message: (v) => (v.trim().length < 10 ? "Add a few more details." : ""),
  };

  function runCFieldValidation(input) {
    const key = input.name;
    if (!cValidators[key]) return true;
    const message = cValidators[key](input.value);
    const wrapper = input.closest(".cmodal-field");
    const errorEl = cmodalForm.querySelector(`.cmodal-error[data-for="${key}"]`);
    if (message) {
      wrapper.classList.add("invalid");
      if (errorEl) errorEl.textContent = message;
    } else {
      wrapper.classList.remove("invalid");
      if (errorEl) errorEl.textContent = "";
    }
    return message === "";
  }

  cmodalForm.querySelectorAll("input[name], textarea[name]").forEach((input) => {
    input.addEventListener("blur", () => runCFieldValidation(input));
  });

  cmodalForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const inputs = cmodalForm.querySelectorAll("input[name], textarea[name]");
    let allValid = true;
    inputs.forEach((input) => {
      if (!runCFieldValidation(input)) allValid = false;
    });

    if (!allValid) {
      cStatusEl.textContent = "Please fix the highlighted fields.";
      cStatusEl.className = "cmodal-status error";
      return;
    }

    const honeypot = cmodalForm.querySelector('[name="_gotcha"]');
    if (honeypot && honeypot.value) {
      cStatusEl.textContent = "Thank you! We'll be in touch.";
      cStatusEl.className = "cmodal-status success";
      cmodalForm.reset();
      return;
    }

    cSubmitBtn.classList.add("loading");
    cSubmitBtn.disabled = true;
    cStatusEl.textContent = "";

    try {
      const response = await fetch(cmodalForm.action, {
        method: "POST",
        body: new FormData(cmodalForm),
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        cStatusEl.textContent = "Thank you! Your enquiry has been sent.";
        cStatusEl.className = "cmodal-status success";
        cmodalForm.reset();
        setTimeout(closeContactModal, 1800); // auto-close shortly after success
      } else {
        throw new Error("Submission failed");
      }
    } catch (err) {
      cStatusEl.textContent = "Something went wrong. Please try again.";
      cStatusEl.className = "cmodal-status error";
    } finally {
      cSubmitBtn.classList.remove("loading");
      cSubmitBtn.disabled = false;
    }
  });
}

// =========================================================
// FLOATING CONTACT BUTTONS (FAB widget)
// Clicking the "?" toggles the Call / WhatsApp / Email
// buttons open and closed. Clicking anywhere else on the
// page closes it again.
// =========================================================

const fabWidget = document.getElementById("fabWidget");
const fabMain = document.getElementById("fabMain");

if (fabMain && fabWidget) {
  fabMain.addEventListener("click", (e) => {
    e.stopPropagation();
    fabWidget.classList.toggle("fab-open");
  });

  // Close if the user clicks anywhere outside the widget
  document.addEventListener("click", (e) => {
    if (!fabWidget.contains(e.target)) {
      fabWidget.classList.remove("fab-open");
    }
  });

  // Close with Escape key too
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fabWidget.classList.remove("fab-open");
  });
}